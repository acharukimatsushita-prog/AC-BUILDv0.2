const devices = [];

const driveRoot = {
  folderId: "1-2ycWi3ecB0ZCpDWmUjQ27LZV9EUOEJq",
  categories: []
};

const FOLDER_MIME = "application/vnd.google-apps.folder";
const PDF_MIME = "application/pdf";
const SHORTCUT_MIME = "application/vnd.google-apps.shortcut";
const STORAGE_KEY = "ac-builde-drive-settings";
const SAVED_DEVICES_KEY = "ac-builde-saved-devices";
const DB_NAME = "AC_BUILDE_DB";
const DB_VERSION = 1;
const STORE_NAME = "devices";
const STEP_IMAGE_MAX_SIZE = 1600;
const STEP_IMAGE_QUALITY = 0.86;

const config = window.AC_BUILDE_CONFIG || {};
const ja = (value) => value;
const defaultDeviceIds = new Set(devices.map((device) => device.id));

/** IndexedDB helper */
function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}
const state = {
  view: "device",
  selectedDevice: devices[0],
  stepIndex: 0,
  selectedCategory: driveRoot.categories[0] || { id: "", name: "", files: [] },
  selectedPdf: null,
  previewSteps: [],
  savedCategoryId: "",
  savedPdfId: "",
  manageMode: false,
  confirmedCheckKeys: new Set(),
  driveSyncInProgress: false,
  driveAutoSynced: false
};

function getView(name) {
  return document.getElementById(`${name}View`);
}

function showView(name) {
  state.view = name;
  ["device", "slide", "drive"].forEach((viewName) => {
    const el = getView(viewName);
    if (el) {
      const isActive = viewName === name;
      el.classList.toggle("is-active", isActive);
      if (el.parentElement?.tagName === "MAIN") {
        el.parentElement.hidden = !isActive;
      }
    }
  });
  window.scrollTo({ top: 0, left: 0 });
  
  const backBtn = document.getElementById("backButton");
  if (backBtn) {
    backBtn.style.visibility = (name === "device") ? "hidden" : "visible";
  }
  
  const fullscreenBtn = document.getElementById("fullscreenButton");
  if (fullscreenBtn) {
    fullscreenBtn.style.visibility = name === "slide" ? "visible" : "hidden";
  }
}

function attachListeners() {
  const safeAddListener = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
    else console.warn(`Element #${id} not found for ${event} listener`);
  };

  safeAddListener("prevButton", "click", previousStep);
  safeAddListener("nextButton", "click", nextStep);
  safeAddListener("prevControl", "click", previousStep);
  safeAddListener("nextControl", "click", nextStep);
  
  const stepSlider = document.getElementById("stepSlider");
  if (stepSlider) {
    stepSlider.addEventListener("input", (event) => {
      requestStepChange(Number(event.target.value));
    });
  }

  safeAddListener("searchInput", "input", renderDevices);
  safeAddListener("exportDevicesButton", "click", exportDevices);
  
  const importBtn = document.getElementById("importDevicesButton");
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      document.getElementById("importDevicesInput")?.click();
    });
  }
  
  safeAddListener("importDevicesInput", "change", importDevices);
  
  const backBtn = document.getElementById("backButton");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (state.view === "device") return;
      showView("device");
    });
  }

  safeAddListener("openDriveButton", "click", () => {
    showView("drive");
    renderDriveImport();
  });
  
  safeAddListener("manageModeButton", "click", toggleManageMode);
  safeAddListener("syncDriveButton", "click", syncDriveFolder);
  safeAddListener("registerPreviewButton", "click", registerPreviewDevice);
  safeAddListener("autoSplitButton", "click", autoSplitSelectedPdf);
  safeAddListener("previewModalBackdrop", "click", closeStepPreview);
  safeAddListener("closePreviewModal", "click", closeStepPreview);
  safeAddListener("fullscreenButton", "click", toggleFullscreen);
  safeAddListener("saveSlideTitleButton", "click", saveCurrentSlideTitle);
  
  const slideTitleInput = document.getElementById("slideTitleInput");
  if (slideTitleInput) {
    slideTitleInput.addEventListener("input", () => {
      const btn = document.getElementById("saveSlideTitleButton");
      if (btn) btn.disabled = false;
    });
  }
}

attachListeners();

document.addEventListener("keydown", (event) => {
  if (state.view !== "slide") return;
  if (event.key === "ArrowRight") nextStep();
  if (event.key === "ArrowLeft") previousStep();
  if (event.key === "Escape") {
    closeStepPreview();
    closeCheckModal();
  }
});

let touchStartX = 0;
document.querySelector("#slideView").addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

document.querySelector("#slideView").addEventListener("touchend", (event) => {
  const touchEndX = event.changedTouches[0].screenX;
  const distance = touchEndX - touchStartX;
  if (Math.abs(distance) < 40) return;
  if (distance < 0) nextStep();
  if (distance > 0) previousStep();
}, { passive: true });

// initializeDriveSettings();
// loadSavedDevices();
// updateManageModeButton();
// renderDevices();
// renderDriveImport();
// showView("device");
// updateAppStatus("idle", "待機中");
// autoSyncDriveFolder();

/** Initialize App */
async function init() {
  try {
    initializeDriveSettings();
    await loadSavedDevices();
    updateManageModeButton();
    renderDevices();
    renderDriveImport();
    showView("device");
    updateAppStatus("idle", "待機中");
    
    // 遅延させて同期を実行
    setTimeout(() => {
      autoSyncDriveFolder();
    }, 500);
  } catch (error) {
    console.error("Initialization error:", error);
    updateAppStatus("error", "初期化エラー");
  }
}

init();

function renderDevices() {
  if (typeof window.__reactDeviceGridRefresh === "function") {
    window.__reactDeviceGridRefresh();
    return;
  }

  const grid = document.querySelector("#deviceGrid");
  if (!grid) {
    // Reactのレンダリング完了を待つために再試行
    if (!window._renderRetryCount) window._renderRetryCount = 0;
    if (window._renderRetryCount < 10) {
      window._renderRetryCount++;
      setTimeout(renderDevices, 100);
    }
    return;
  }
  window._renderRetryCount = 0;
  const searchInput = document.getElementById("searchInput");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const filteredDevices = devices.filter((device) => device.name.toLowerCase().includes(query));
  grid.innerHTML = "";

  filteredDevices.forEach((device) => {
    const card = document.createElement("article");
    card.className = "device-card";
    const canDelete = state.manageMode && !defaultDeviceIds.has(device.id);
    const canEdit = state.manageMode && !defaultDeviceIds.has(device.id);
    card.innerHTML = `
      <div class="device-card-header">
        <span class="device-update-date">${device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : ja("更新情報なし")}</span>
      </div>
      <div class="device-card-body">
        <div class="device-title-row">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="device-type-icon">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          <h3>${device.name}</h3>
        </div>
        <div class="device-meta">
          <span class="badge badge-neutral">${device.steps.length}${ja("工程")}</span>
        </div>
      </div>
      <div class="device-card-actions">
        <button class="open-device-button ${canEdit || canDelete ? "has-siblings" : "w-full"}" type="button">${ja("表示")}</button>
        ${
          canEdit || canDelete
            ? `
          <div class="admin-buttons">
            ${canEdit ? `<button class="edit-device-button mini-button" type="button">${ja("編集")}</button>` : ""}
            ${canDelete ? `<button class="delete-device-button danger-button mini-button" type="button">${ja("削除")}</button>` : ""}
          </div>
        `
            : ""
        }
      </div>
    `;
    card.querySelector(".open-device-button").addEventListener("click", () => openDevice(device));
    card.querySelector(".edit-device-button")?.addEventListener("click", () => editDevice(device));
    card.querySelector(".delete-device-button")?.addEventListener("click", () => deleteDevice(device.id));
    grid.appendChild(card);
  });
}

function openDevice(device) {
  state.selectedDevice = device;
  state.stepIndex = 0;
  state.confirmedCheckKeys.clear();
  showView("slide");
  renderSlide();
}

function editDevice(device) {
  window.goToEditView?.(device);
}

async function deleteDevice(deviceId) {
  const index = devices.findIndex((device) => device.id === deviceId);
  if (index === -1 || defaultDeviceIds.has(deviceId)) return;

  const device = devices[index];
  const ok = window.confirm(`${device.name}を削除しますか？`);
  if (!ok) return;

  devices.splice(index, 1);
  await saveDevices();
  renderDevices();
  if (state.selectedDevice?.id === deviceId) {
    showView("device");
  }
}

async function syncDriveFolder() {
  if (state.driveSyncInProgress) return;

  const driveFolderInput = document.getElementById("driveFolderInput");
  const driveStatus = document.getElementById("driveStatus");
  const syncDriveButton = document.getElementById("syncDriveButton");

  const folderId = extractDriveFolderId(driveFolderInput?.value || "");
  if (!folderId) {
    if (driveStatus) {
      driveStatus.textContent = "URLを確認";
      driveStatus.style.color = "var(--amber)";
    }
    updateAppStatus("warning", "Drive URLを確認");
    return;
  }

  driveRoot.folderId = folderId;
  saveDriveSettings();

  if (!config.googleDriveApiKey) {
    driveStatus.textContent = "APIキー未設定";
    driveStatus.style.color = "var(--amber)";
    updateAppStatus("warning", "Drive APIキー未設定");
    renderDriveImport();
    return;
  }

  driveStatus.textContent = "同期中...";
  driveStatus.style.color = "var(--muted)";
  updateAppStatus("syncing", "Drive同期中...");
  syncDriveButton.disabled = true;
  state.driveSyncInProgress = true;

  try {
    const categories = await loadDriveCategories(folderId);
    driveRoot.categories = categories;
    restoreDriveSelection(categories);
    driveStatus.textContent = `同期完了 ${countDriveFiles()}件`;
    driveStatus.style.color = "var(--green)";
    updateAppStatus("success", `Drive同期完了 ${countDriveFiles()}件`);
    renderDriveImport();
    renderSplitPreview();
  } catch (error) {
    driveStatus.textContent = "同期失敗";
    driveStatus.style.color = "var(--amber)";
    updateAppStatus("error", "Drive同期失敗");
    splitPreviewGrid.innerHTML = `
      <div class="error-text">
        <strong>同期エラー</strong>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;
    console.error(error);
  } finally {
    syncDriveButton.disabled = false;
    state.driveSyncInProgress = false;
  }
}

function updateAppStatus(status, text) {
  const appStatus = document.getElementById("appStatus");
  const appStatusText = document.getElementById("appStatusText");
  if (!appStatus || !appStatusText) return;
  appStatus.dataset.status = status;
  appStatusText.textContent = text;
}

function autoSyncDriveFolder() {
  if (state.driveAutoSynced) return;
  if (!config.googleDriveApiKey) return;
  
  const driveFolderInput = document.getElementById("driveFolderInput");
  if (!driveFolderInput || !extractDriveFolderId(driveFolderInput.value)) return;

  state.driveAutoSynced = true;
  window.setTimeout(() => {
    syncDriveFolder();
  }, 0);
}

function renderDriveImport() {
  if (!state.selectedCategory) {
    state.selectedCategory = driveRoot.categories[0] || { id: "", name: "", files: [] };
  }

  const categoryList = document.getElementById("categoryList");
  const pdfList = document.getElementById("pdfList");
  if (!categoryList || !pdfList) return;

  categoryList.innerHTML = "";
  if (!config.googleDriveApiKey) {
    categoryList.innerHTML = `
      <div class="setup-note">
        <strong>APIキーを設定してください</strong>
        <span>config.js の googleDriveApiKey に Google Drive APIキーを設定すると、Drive同期が行えます。</span>
      </div>
    `;
  }

  if (driveRoot.categories.length === 0) {
    categoryList.innerHTML = `
      <div class="setup-note">
        <strong>PDFが見つかりません</strong>
        <span>Driveフォルダ内にPDFがありません。フォルダURLを確認してから同期してください。</span>
      </div>
    `;
  }

  driveRoot.categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.classList.toggle("is-selected", category.id === state.selectedCategory?.id);
    button.textContent = `${category.name} (${category.files.length})`;
    button.addEventListener("click", () => {
      state.selectedCategory = category;
      state.selectedPdf = null;
      state.previewSteps = [];
      renderDriveImport();
      renderSplitPreview();
    });
    categoryList.appendChild(button);
  });

  pdfList.innerHTML = "";
  if (!state.selectedCategory.files || state.selectedCategory.files.length === 0) {
    pdfList.innerHTML = `
      <div class="setup-note">
        <strong>PDFが見つかりません</strong>
        <span>選択したカテゴリにPDFがありません。Drive同期後にPDFを選択してください。</span>
      </div>
    `;
  }

  state.selectedCategory.files.forEach((file) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pdf-button";
    button.classList.toggle("is-selected", state.selectedPdf?.id === file.id);
    button.innerHTML = `
      ${file.name}
      <small>${file.pages}ページ / ${file.modifiedTime}</small>
    `;
    button.addEventListener("click", () => selectDrivePdf(file));
    pdfList.appendChild(button);
  });
}

function selectDrivePdf(file) {
  state.selectedPdf = file;
  state.previewSteps = [];
  updatePreviewDeviceTitle(file.name.replace(/\.pdf$/i, ""));
  saveDriveSettings();
  renderDriveImport();
  renderSplitPreview();
}

function toggleManageMode() {
  state.manageMode = !state.manageMode;
  updateManageModeButton();
  renderDevices();
}

function updateManageModeButton() {
  manageModeButton.classList.toggle("is-active", state.manageMode);
  manageModeButton.setAttribute("aria-pressed", String(state.manageMode));
  manageModeButton.textContent = state.manageMode ? "管理者画面ON" : "管理者画面";
}

window.toggleManageMode = toggleManageMode;
window.renderDevices = renderDevices;
window.devices = devices;
window.saveDevices = saveDevices;
window.autoSyncDriveFolder = autoSyncDriveFolder;
window.showView = showView;
window.canManageDevice = (deviceId) => state.manageMode && !defaultDeviceIds.has(deviceId);
window.openDevice = openDevice;
window.deleteDeviceById = deleteDevice;

function renderSplitPreview() {
  const splitPreviewGrid = document.getElementById("splitPreviewGrid");
  const previewDeviceName = document.getElementById("previewDeviceName");
  const autoSplitButton = document.getElementById("autoSplitButton");
  const registerPreviewButton = document.getElementById("registerPreviewButton");

  if (!splitPreviewGrid) return;
  splitPreviewGrid.innerHTML = "";

  if (!state.selectedPdf) {
    if (previewDeviceName) previewDeviceName.textContent = "PDFを選択してください。";
    if (autoSplitButton) autoSplitButton.disabled = true;
    if (registerPreviewButton) registerPreviewButton.disabled = true;
    return;
  }

  previewDeviceName.textContent = `${state.selectedCategory.name} / ${state.selectedPdf.name}`;
  autoSplitButton.disabled = false;
  registerPreviewButton.disabled = state.previewSteps.length === 0;
  if (state.previewSteps.length === 0) {
    splitPreviewGrid.innerHTML = `
      <div class="setup-note">
        <strong>自動分割結果がありません</strong>
        <span>PDFを選択して「自動分割」を実行してください。</span>
      </div>
    `;
    return;
  }
  state.previewSteps.forEach((step, index) => {
    const card = document.createElement("article");
    card.className = "split-preview-card";
    card.innerHTML = `
      <img src="${step.image}" alt="${step.title}">
      <strong>${step.title}</strong>
      <input class="split-title-input" type="text" value="${escapeHtml(step.title)}" aria-label="工程タイトル">
      <div class="split-popup-panel">
        <label class="split-popup-toggle">
          <input class="split-popup-enabled" type="checkbox" ${isStepPopupEnabled(step) ? "checked" : ""}>
          <span>POP確認を表示</span>
        </label>
        <label class="split-check-field">
          <span>確認項目（1行1項目）</span>
          <textarea class="split-check-input" rows="3" placeholder="例: ネジの締め忘れがないか確認した" ${isStepPopupEnabled(step) ? "" : "disabled"}>${escapeHtml(formatStepChecks(step.checks))}</textarea>
        </label>
      </div>
      <div class="step-card-actions">
        <button type="button" class="mini-button move-up-button" ${index === 0 ? "disabled" : ""}>上へ移動</button>
        <button type="button" class="mini-button move-down-button" ${index === state.previewSteps.length - 1 ? "disabled" : ""}>下へ移動</button>
        <button type="button" class="mini-button resplit-step-button">再分割</button>
        <button type="button" class="mini-button merge-prev-button" ${index === 0 ? "disabled" : ""}>前と結合</button>
        <button type="button" class="mini-button merge-next-button" ${index === state.previewSteps.length - 1 ? "disabled" : ""}>次と結合</button>
        <button type="button" class="mini-button danger-button delete-step-button">削除</button>
      </div>
    `;
    card.addEventListener("click", () => openStepPreview(step));
    const titleInput = card.querySelector(".split-title-input");
    titleInput.addEventListener("click", (event) => event.stopPropagation());
    titleInput.addEventListener("input", (event) => {
      step.title = event.target.value.trim() || "工程";
      card.querySelector("strong").textContent = step.title;
    });
    const checkInput = card.querySelector(".split-check-input");
    const popupInput = card.querySelector(".split-popup-enabled");
    card.querySelector(".split-popup-panel").addEventListener("click", (event) => event.stopPropagation());
    popupInput.addEventListener("change", (event) => {
      step.popupEnabled = event.target.checked;
      checkInput.disabled = !event.target.checked;
    });
    checkInput.addEventListener("click", (event) => event.stopPropagation());
    checkInput.addEventListener("input", (event) => {
      step.checks = parseStepChecks(event.target.value);
      if (step.checks.length > 0) {
        step.popupEnabled = true;
        popupInput.checked = true;
        checkInput.disabled = false;
      }
    });
    card.querySelector(".move-up-button").addEventListener("click", (event) => {
      event.stopPropagation();
      movePreviewStep(index, -1);
    });
    card.querySelector(".move-down-button").addEventListener("click", (event) => {
      event.stopPropagation();
      movePreviewStep(index, 1);
    });
    card.querySelector(".resplit-step-button").addEventListener("click", async (event) => {
      event.stopPropagation();
      await resplitPreviewStep(index);
    });
    card.querySelector(".merge-prev-button").addEventListener("click", async (event) => {
      event.stopPropagation();
      await mergePreviewSteps(index - 1, index);
    });
    card.querySelector(".merge-next-button").addEventListener("click", async (event) => {
      event.stopPropagation();
      await mergePreviewSteps(index, index + 1);
    });
    card.querySelector(".delete-step-button").addEventListener("click", (event) => {
      event.stopPropagation();
      deletePreviewStep(index);
    });
    splitPreviewGrid.appendChild(card);
  });
}

function parseStepChecks(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `check-${Date.now()}-${index}`,
      text,
      required: true
    }));
}

function formatStepChecks(checks) {
  return normalizeStepChecks(checks).map((check) => check.text).join("\n");
}

function normalizeStepChecks(checks) {
  if (!Array.isArray(checks)) return [];
  return checks
    .map((check, index) => {
      if (typeof check === "string") {
        return { id: `check-${index}`, text: check.trim(), required: true };
      }
      const text = typeof check?.text === "string" ? check.text.trim() : "";
      if (!text) return null;
      return {
        id: typeof check.id === "string" && check.id ? check.id : `check-${index}`,
        text,
        required: check.required !== false
      };
    })
    .filter(Boolean);
}

function isStepPopupEnabled(step) {
  const checks = normalizeStepChecks(step?.checks);
  if (step?.popupEnabled === true) return true;
  if (checks.length === 0) return false;
  return step?.popupEnabled !== false;
}

function openCheckModal({ title, checks, onConfirm }) {
  const modal = getCheckModal();
  const list = modal.querySelector(".check-modal-list");
  const titleElement = modal.querySelector(".check-modal-title");
  const confirmButton = modal.querySelector(".check-modal-confirm");

  titleElement.textContent = `${title} の確認`;
  list.innerHTML = "";

  checks.forEach((check) => {
    const label = document.createElement("label");
    label.className = "check-modal-item";
    label.innerHTML = `
      <input type="checkbox">
      <span>${escapeHtml(check.text)}</span>
    `;
    list.appendChild(label);
  });

  const updateConfirmState = () => {
    const inputs = [...list.querySelectorAll("input")];
    confirmButton.disabled = inputs.some((input) => !input.checked);
  };

  list.onchange = updateConfirmState;
  confirmButton.onclick = () => {
    closeCheckModal();
    onConfirm();
  };
  modal.querySelector(".check-modal-cancel").onclick = closeCheckModal;
  modal.querySelector(".check-modal-backdrop").onclick = closeCheckModal;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  updateConfirmState();
}

function closeCheckModal() {
  const modal = document.querySelector("#stepCheckModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function getCheckModal() {
  let modal = document.querySelector("#stepCheckModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "stepCheckModal";
  modal.className = "check-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="check-modal-backdrop"></div>
    <div class="check-modal-body" role="dialog" aria-modal="true" aria-labelledby="stepCheckModalTitle">
      <h2 class="check-modal-title" id="stepCheckModalTitle">確認</h2>
      <p>次の工程へ進む前に確認してください。</p>
      <div class="check-modal-list"></div>
      <div class="check-modal-actions">
        <button type="button" class="check-modal-cancel">キャンセル</button>
        <button type="button" class="primary-button check-modal-confirm">確認して次へ</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function movePreviewStep(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= state.previewSteps.length) return;
  const [step] = state.previewSteps.splice(index, 1);
  state.previewSteps.splice(nextIndex, 0, step);
  renderSplitPreview();
}

function deletePreviewStep(index) {
  state.previewSteps.splice(index, 1);
  renderSplitPreview();
}

async function resplitPreviewStep(index) {
  const step = state.previewSteps[index];
  if (!step) return;

  try {
    const image = await loadImage(step.image);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    const splitSteps = splitCanvasByWhitespace(
      canvas,
      step.pageNumber || 1,
      state.selectedPdf?.name || state.selectedDevice?.name || "工程画像",
      "micro",
      "weak"
    );

    const fallbackSteps = splitSteps.length <= 1
      ? splitCanvasByGrid(canvas, step)
      : splitSteps;

    if (fallbackSteps.length <= 1) {
      window.alert("これ以上分割できる候補が見つかりませんでした。");
      return;
    }

    const renamedSteps = fallbackSteps.map((splitStep, splitIndex) => ({
      ...splitStep,
      title: `${step.title}-${splitIndex + 1}`
    }));

    state.previewSteps.splice(index, 1, ...renamedSteps);
    renderSplitPreview();
  } catch (error) {
    window.alert(error.message || "再分割に失敗しました。");
  }
}

async function mergePreviewSteps(firstIndex, secondIndex) {
  if (firstIndex < 0 || secondIndex >= state.previewSteps.length) return;

  const first = state.previewSteps[firstIndex];
  const second = state.previewSteps[secondIndex];
  const image = await combineStepImages(first.image, second.image);
  const mergedStep = {
    title: first.title,
    memo: `${first.memo || ""} / ${second.title}を結合`.trim(),
    image,
    popupEnabled: isStepPopupEnabled(first) || isStepPopupEnabled(second),
    checks: [
      ...normalizeStepChecks(first.checks),
      ...normalizeStepChecks(second.checks)
    ]
  };

  state.previewSteps.splice(firstIndex, 2, mergedStep);
  renderSplitPreview();
}

function combineStepImages(firstSrc, secondSrc) {
  return Promise.all([loadImage(firstSrc), loadImage(secondSrc)]).then(([first, second]) => {
    const width = Math.max(first.naturalWidth, second.naturalWidth);
    const gap = 18;
    const margin = 16;
    const canvas = document.createElement("canvas");
    canvas.width = width + margin * 2;
    canvas.height = first.naturalHeight + second.naturalHeight + gap + margin * 2;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(first, margin, margin);
    context.fillStyle = "#dbe2ea";
    context.fillRect(margin, margin + first.naturalHeight + Math.floor(gap / 2), width, 2);
    context.drawImage(second, margin, margin + first.naturalHeight + gap);
    return canvasToStepImage(canvas);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("画像の結合に失敗しました。"));
    image.src = src;
  });
}

function openStepPreview(step) {
  const img = document.getElementById("modalStepImage");
  const title = document.getElementById("modalStepTitle");
  const memo = document.getElementById("modalStepMemo");
  const modal = document.getElementById("previewModal");

  if (img) {
    img.src = step.image;
    img.alt = step.title;
  }
  if (title) title.textContent = step.title;
  if (memo) memo.textContent = step.memo || "工程メモはありません";
  
  if (modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
}

function closeStepPreview() {
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
}

async function autoSplitSelectedPdf() {
  if (!state.selectedPdf) return;

  if (!window.pdfjsLib) {
    showPreviewError("PDF.jsを読み込めませんでした。インターネット接続を確認してください。");
    return;
  }

  const autoSplitBtn = document.getElementById("autoSplitButton");
  const regBtn = document.getElementById("registerPreviewButton");
  const splitGrid = document.getElementById("splitPreviewGrid");

  if (autoSplitBtn) {
    autoSplitBtn.disabled = true;
    autoSplitBtn.textContent = "分割中...";
  }
  if (regBtn) regBtn.disabled = true;

  if (splitGrid) {
    splitGrid.innerHTML = `
      <div class="setup-note">
        <strong>PDFを読み込んでいます</strong>
        <span>PDFの解析を開始しています。しばらくお待ちください。</span>
      </div>
    `;
  }

  try {
    const pdfBytes = await fetchDrivePdfBytes(state.selectedPdf.id);
    const steps = await splitPdfIntoSteps(
      pdfBytes,
      state.selectedPdf.name,
      document.getElementById("splitModeSelect")?.value || "normal",
      document.getElementById("mergeModeSelect")?.value || "normal"
    );
    state.previewSteps = steps;
    renderSplitPreview();
  } catch (error) {
    showPreviewError(error.message);
  } finally {
    if (autoSplitBtn) {
      autoSplitBtn.disabled = false;
      autoSplitBtn.textContent = "自動分割";
    }
  }
}

async function fetchDrivePdfBytes(fileId) {
  const params = new URLSearchParams({
    key: config.googleDriveApiKey,
    alt: "media"
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`);

  if (!response.ok) {
    let message = `PDFの取得に失敗しました。HTTP ${response.status}`;
    try {
      const data = await response.json();
      message = data.error?.message || message;
    } catch {
      // Keep the HTTP status message.
    }
    throw new Error(message);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function splitPdfIntoSteps(pdfBytes, fileName, mode = "normal", mergeMode = "normal") {
  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
  const steps = [];
  const maxPages = Math.min(pdf.numPages, 10);

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const scale = 1.45;
    const canvas = await renderPdfPage(page, scale);
    const pageSteps = splitCanvasByWhitespace(canvas, pageNumber, fileName, mode, mergeMode);
    steps.push(...pageSteps);
  }

  if (steps.length === 0) {
    throw new Error("工程候補を検出できませんでした。PDFの内容を確認してください。");
  }

  return steps.map((step, index) => ({
    ...step,
    title: `工程${index + 1}`
  }));
}

async function renderPdfPage(page, scale) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

function splitCanvasByWhitespace(canvas, pageNumber, fileName, mode, mergeMode) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const settings = getSplitSettings(mode, mergeMode);
  const horizontalBands = findContentBands(imageData, canvas.width, canvas.height, "horizontal", settings);
  const usableBands = horizontalBands.filter((band) => band.end - band.start > settings.minBandSize);
  const bands = usableBands.length > 0 ? usableBands : [{ top: 0, bottom: canvas.height }];
  const steps = [];

  bands.forEach((band, index) => {
    const normalizedBand = normalizeBand(band, "horizontal", canvas.width, canvas.height);
    const bandCanvas = cropCanvas(
      canvas,
      normalizedBand.x,
      normalizedBand.y,
      normalizedBand.width,
      normalizedBand.height
    );
    const verticalParts = splitBandVertically(bandCanvas, settings);
    const parts = settings.useVerticalSplit && verticalParts.length > 1 ? verticalParts : [
      { x: 0, y: 0, width: bandCanvas.width, height: bandCanvas.height }
    ];

    parts.forEach((part, partIndex) => {
      const crop = cropCanvas(bandCanvas, part.x, part.y, part.width, part.height);
      const bounds = {
        x: normalizedBand.x + part.x,
        y: normalizedBand.y + part.y,
        width: part.width,
        height: part.height
      };
      steps.push({
        title: `P${pageNumber} 工程${index + 1}-${partIndex + 1}`,
        memo: `${fileName} / ${settings.label}`,
        image: canvasToStepImage(crop),
        pageNumber,
        bounds
      });
    });
  });

  return consolidateSteps(steps, canvas, settings);
}

function splitBandVertically(canvas, settings) {
  if (!settings.useVerticalSplit || canvas.width < 420) return [];

  const context = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const bands = findContentBands(imageData, canvas.width, canvas.height, "vertical", settings)
    .filter((band) => band.end - band.start > settings.minVerticalSize)
    .map((band) => normalizeBand(band, "vertical", canvas.width, canvas.height));

  return bands.length > 1 ? bands : [];
}

function findContentBands(imageData, width, height, direction, settings) {
  const rows = [];
  const whiteThreshold = 246;
  const inkRatioThreshold = direction === "horizontal"
    ? settings.horizontalInkRatio
    : settings.verticalInkRatio;
  const scanLength = direction === "horizontal" ? height : width;
  const crossLength = direction === "horizontal" ? width : height;
  const crossStep = direction === "horizontal" ? 4 : 3;

  for (let i = 0; i < scanLength; i += 1) {
    let ink = 0;
    for (let j = 0; j < crossLength; j += crossStep) {
      const x = direction === "horizontal" ? j : i;
      const y = direction === "horizontal" ? i : j;
      const offset = (y * width + x) * 4;
      const r = imageData.data[offset];
      const g = imageData.data[offset + 1];
      const b = imageData.data[offset + 2];
      if (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold) {
        ink += 1;
      }
    }
    rows.push(ink / Math.ceil(crossLength / crossStep) > inkRatioThreshold);
  }

  return mergeContentRows(rows, scanLength, settings);
}

function mergeContentRows(rows, length, settings) {
  const bands = [];
  const margin = settings.margin;
  const minGap = settings.minGap;
  let start = -1;
  let lastInk = -1;

  rows.forEach((hasInk, y) => {
    if (hasInk) {
      if (start === -1) start = y;
      lastInk = y;
    }

    if (start !== -1 && !hasInk && y - lastInk > minGap) {
      bands.push({
        start: Math.max(0, start - margin),
        end: Math.min(length, lastInk + margin)
      });
      start = -1;
      lastInk = -1;
    }
  });

  if (start !== -1) {
    bands.push({
      start: Math.max(0, start - margin),
      end: Math.min(length, lastInk + margin)
    });
  }

  return mergeNearbyBands(bands, settings);
}

function mergeNearbyBands(bands, settings) {
  const merged = [];

  bands.forEach((band) => {
    const previous = merged[merged.length - 1];
    if (previous && band.start - previous.end < settings.joinGap) {
      previous.end = band.end;
      return;
    }

    if (band.end - band.start >= settings.minBandSize) {
      merged.push({ ...band });
    }
  });

  return merged;
}

function normalizeBand(band, direction, width, height) {
  if (band.top !== undefined) return { x: 0, y: band.top, width, height: band.bottom - band.top };

  if (direction === "vertical") {
    return { x: band.start, y: 0, width: band.end - band.start, height };
  }

  return { x: 0, y: band.start, width, height: band.end - band.start };
}

function getSplitSettings(mode, mergeMode = "normal") {
  const settings = {
    normal: {
      label: "標準分割",
      minGap: 34,
      joinGap: 26,
      margin: 16,
      minBandSize: 80,
      minVerticalSize: 160,
      horizontalInkRatio: 0.006,
      verticalInkRatio: 0.01,
      useVerticalSplit: false,
      groupGap: 36,
      absorbGap: 90,
      absorbHeight: 120,
      absorbWidth: 180,
      groupMargin: 14
    },
    fine: {
      label: "細かく分割",
      minGap: 24,
      joinGap: 14,
      margin: 12,
      minBandSize: 56,
      minVerticalSize: 130,
      horizontalInkRatio: 0.004,
      verticalInkRatio: 0.008,
      useVerticalSplit: true,
      groupGap: 28,
      absorbGap: 72,
      absorbHeight: 96,
      absorbWidth: 150,
      groupMargin: 10
    },
    extra: {
      label: "かなり細かく分割",
      minGap: 16,
      joinGap: 8,
      margin: 8,
      minBandSize: 38,
      minVerticalSize: 96,
      horizontalInkRatio: 0.003,
      verticalInkRatio: 0.006,
      useVerticalSplit: true,
      groupGap: 18,
      absorbGap: 48,
      absorbHeight: 70,
      absorbWidth: 120,
      groupMargin: 8
    },
    micro: {
      label: "極細分割",
      minGap: 8,
      joinGap: 2,
      margin: 4,
      minBandSize: 24,
      minVerticalSize: 64,
      horizontalInkRatio: 0.0018,
      verticalInkRatio: 0.003,
      useVerticalSplit: true,
      groupGap: 4,
      absorbGap: 10,
      absorbHeight: 32,
      absorbWidth: 72,
      groupMargin: 4
    }
  };

  return applyMergeMode(settings[mode] || settings.normal, mergeMode);
}

function applyMergeMode(settings, mergeMode) {
  const mergeSettings = {
    weak: {
      groupGap: 0.55,
      absorbGap: 0.55,
      absorbHeight: 0.75,
      absorbWidth: 0.75,
      groupMargin: 0.75,
      label: "まとめ弱"
    },
    normal: {
      groupGap: 1,
      absorbGap: 1,
      absorbHeight: 1,
      absorbWidth: 1,
      groupMargin: 1,
      label: "まとめ標準"
    },
    strong: {
      groupGap: 1.75,
      absorbGap: 1.75,
      absorbHeight: 1.35,
      absorbWidth: 1.35,
      groupMargin: 1.35,
      label: "まとめ強"
    }
  };
  const factor = mergeSettings[mergeMode] || mergeSettings.normal;

  return {
    ...settings,
    label: `${settings.label} / ${factor.label}`,
    groupGap: Math.round(settings.groupGap * factor.groupGap),
    absorbGap: Math.round(settings.absorbGap * factor.absorbGap),
    absorbHeight: Math.round(settings.absorbHeight * factor.absorbHeight),
    absorbWidth: Math.round(settings.absorbWidth * factor.absorbWidth),
    groupMargin: Math.round(settings.groupMargin * factor.groupMargin)
  };
}

function cropCanvas(source, x, y, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(source, x, y, width, height, 0, 0, width, height);
  return canvas;
}

function canvasToStepImage(source) {
  const largestSide = Math.max(source.width, source.height);
  const ratio = largestSide > STEP_IMAGE_MAX_SIZE ? STEP_IMAGE_MAX_SIZE / largestSide : 1;
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter = "contrast(1.08) brightness(0.99) saturate(1.03)";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  context.filter = "none";

  return canvas.toDataURL("image/jpeg", STEP_IMAGE_QUALITY);
}

function splitCanvasByGrid(canvas, sourceStep) {
  const parts = [];
  const isWide = canvas.width / canvas.height > 1.25;
  const cols = isWide ? 2 : 1;
  const rows = canvas.height > 720 ? 3 : 2;
  const minPartHeight = 160;
  const minPartWidth = 180;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = Math.round((canvas.width / cols) * col);
      const y = Math.round((canvas.height / rows) * row);
      const right = Math.round((canvas.width / cols) * (col + 1));
      const bottom = Math.round((canvas.height / rows) * (row + 1));
      const width = right - x;
      const height = bottom - y;
      if (width < minPartWidth || height < minPartHeight) continue;

      const crop = cropCanvas(canvas, x, y, width, height);
      parts.push({
        title: sourceStep.title,
        memo: `${sourceStep.memo || ""} / 再分割`.trim(),
        image: canvasToStepImage(crop),
        pageNumber: sourceStep.pageNumber || 1,
        bounds: { x, y, width, height }
      });
    }
  }

  return parts;
}

function consolidateSteps(steps, sourceCanvas, settings) {
  if (steps.length <= 1) return steps;

  const sorted = steps
    .filter((step) => step.bounds && step.bounds.width > 0 && step.bounds.height > 0)
    .sort((a, b) => a.bounds.y - b.bounds.y || a.bounds.x - b.bounds.x);
  const groups = [];

  sorted.forEach((step) => {
    const current = groups[groups.length - 1];
    if (!current) {
      groups.push([step]);
      return;
    }

    const currentBounds = unionBounds(current.map((item) => item.bounds));
    const gapY = step.bounds.y - (currentBounds.y + currentBounds.height);
    const overlapsX = rangesOverlap(
      currentBounds.x,
      currentBounds.x + currentBounds.width,
      step.bounds.x,
      step.bounds.x + step.bounds.width
    );
    const tiny = step.bounds.height < settings.absorbHeight || step.bounds.width < settings.absorbWidth;

    if ((tiny && gapY < settings.absorbGap) || (overlapsX && gapY >= 0 && gapY < settings.groupGap)) {
      current.push(step);
      return;
    }

    groups.push([step]);
  });

  return groups.map((group, index) => {
    if (group.length === 1) return group[0];

    const bounds = expandBounds(
      unionBounds(group.map((item) => item.bounds)),
      sourceCanvas.width,
      sourceCanvas.height,
      settings.groupMargin
    );
    const crop = cropCanvas(sourceCanvas, bounds.x, bounds.y, bounds.width, bounds.height);
    return {
      title: group[0].title.replace(/-\d+$/, `-${index + 1}`),
      memo: `${group[0].memo} / 関連断片を統合`,
      image: canvasToStepImage(crop),
      pageNumber: group[0].pageNumber,
      bounds
    };
  });
}

function unionBounds(boundsList) {
  const left = Math.min(...boundsList.map((bounds) => bounds.x));
  const top = Math.min(...boundsList.map((bounds) => bounds.y));
  const right = Math.max(...boundsList.map((bounds) => bounds.x + bounds.width));
  const bottom = Math.max(...boundsList.map((bounds) => bounds.y + bounds.height));
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}

function expandBounds(bounds, maxWidth, maxHeight, margin) {
  const x = Math.max(0, bounds.x - margin);
  const y = Math.max(0, bounds.y - margin);
  const right = Math.min(maxWidth, bounds.x + bounds.width + margin);
  const bottom = Math.min(maxHeight, bounds.y + bounds.height + margin);
  return {
    x,
    y,
    width: right - x,
    height: bottom - y
  };
}

function rangesOverlap(leftA, rightA, leftB, rightB) {
  return Math.max(leftA, leftB) < Math.min(rightA, rightB);
}

function showPreviewError(message) {
  splitPreviewGrid.innerHTML = `
    <div class="error-text">
      <strong>自動分割エラー</strong>
      <span>${escapeHtml(message)}</span>
    </div>
  `;
}

async function registerPreviewDevice() {
  if (!state.selectedPdf) {
    alert("PDFを選択してください。");
    return;
  }
  if (state.previewSteps.length === 0) {
    alert("「自動分割」を実行して工程を作成してから追加してください。");
    return;
  }

  const btn = document.querySelector("#registerPreviewButton");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "登録中...";
  }

  const titleInput = document.getElementById("previewDeviceTitleInput");
  const fallbackName = state.selectedPdf.name.replace(/\.pdf$/i, "");
  const name = titleInput?.value.trim() || fallbackName;
  const device = {
    id: `drive-${Date.now()}`,
    name,
    sourceType: "Drive PDF",
    updatedAt: new Date().toISOString(),
    drivePath: `Google Drive / ${state.selectedCategory.name}`,
    steps: state.previewSteps.map((step) => ({
      ...step,
      popupEnabled: isStepPopupEnabled(step),
      checks: normalizeStepChecks(step.checks)
    }))
  };

  devices.unshift(device);
  try {
    await saveDevices();
    updateAppStatus("success", `${name} を登録しました`);
    renderDevices();
    openDevice(device);
  } catch (error) {
    devices.shift();
    console.error("Registration error:", error);
    showPreviewError(`登録に失敗しました: ${error.message}`);
  } finally {
    const btn = document.querySelector("#registerPreviewButton");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "一覧へ追加";
    }
  }
}

function updatePreviewDeviceTitle(value) {
  if (!previewDeviceTitleInput) return;
  previewDeviceTitleInput.value = value;
}

async function saveDevices() {
  const savedDevices = devices.filter((device) => !defaultDeviceIds.has(device.id));
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // IndexedDBを同期（全件入れ替え）
    await new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = resolve;
      req.onerror = reject;
    });

    for (const device of savedDevices) {
      store.add(device);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.error("Failed to save devices to IndexedDB", e);
    // QuotaExceededErrorなどの場合
    if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
      alert("【警告】ストレージ容量がいっぱいです。不要な装置を削除してください。");
    } else {
      alert(`保存エラー: ${e.message}`);
    }
    throw e;
  }
}

async function loadSavedDevices() {
  // まずIndexedDBから読み込み
  const dbDevices = await loadFromIndexedDB();
  
  // IndexedDBが空でLocalStorageにデータがある場合、移行を行う
  if (dbDevices.length === 0) {
    const legacyData = loadFromLocalStorage();
    if (legacyData.length > 0) {
      console.log("LocalStorageからIndexedDBへデータを移行します...");
      legacyData.forEach(d => devices.unshift(d));
      await saveDevices();
      return;
    }
  }

  dbDevices.reverse().forEach((device) => {
    if (!devices.some((item) => item.id === device.id)) {
      devices.unshift(device);
    }
  });
}

async function loadFromIndexedDB() {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    const results = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return (results || [])
      .map((device) => (isValidSavedDevice(device) ? sanitizeSavedDevice(device) : null))
      .filter(Boolean);
  } catch (e) {
    console.error("IndexedDB Load Error", e);
    return [];
  }
}

function loadFromLocalStorage() {
  try {
    const savedDevices = JSON.parse(localStorage.getItem(SAVED_DEVICES_KEY) || "[]");
    if (!Array.isArray(savedDevices)) return [];
    return savedDevices
      .map((device) => (isValidSavedDevice(device) ? sanitizeSavedDevice(device) : null))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function sanitizeSavedDevice(device) {
  const sanitized = { ...device };
  sanitized.name = repairMojibakeText(typeof sanitized.name === "string" ? sanitized.name : "");
  sanitized.sourceType = repairMojibakeText(typeof sanitized.sourceType === "string" ? sanitized.sourceType : "");
  sanitized.drivePath = repairMojibakeText(typeof sanitized.drivePath === "string" ? sanitized.drivePath : "");
  if (typeof sanitized.updatedAt !== "string" || sanitized.updatedAt.trim() === "" || /[\ufffd繝蜷縺]/.test(sanitized.updatedAt)) {
    sanitized.updatedAt = "更新情報なし";
  } else {
    sanitized.updatedAt = repairMojibakeText(sanitized.updatedAt);
  }
  sanitized.steps = sanitized.steps.map((step) => {
    const checks = normalizeStepChecks(step.checks);
    return {
      ...step,
      title: repairMojibakeText(typeof step.title === "string" ? step.title : ""),
      memo: repairMojibakeText(typeof step.memo === "string" ? step.memo : ""),
      popupEnabled: step.popupEnabled === false ? false : checks.length > 0,
      checks: checks.map((check) => ({
        ...check,
        text: repairMojibakeText(check.text)
      }))
    };
  });
  return sanitized;
}

function repairMojibakeText(value) {
  if (typeof value !== "string" || !/[\ufffd繝蜷縺謌讓呎邱髯螟譁陬]/.test(value)) {
    return value;
  }

  const replacements = new Map([
    ["繝｡繝｢", "メモ"],
    ["蟾･遞九Γ繝｢", "工程メモ"],
    ["蟾･遞・", "工程"],
    ["陬・ｽｮ", "装置"],
    ["讓呎ｺ・", "標準"],
    ["邏ｰ縺九￥", "細かく"],
    ["縺九↑繧顔ｴｰ縺九￥", "かなり細かく"],
    ["蜷梧悄", "同期"],
    ["繝壹・繧ｸ", "ページ"],
    ["蜀榊・蜑ｲ", "再分割"],
    ["蜀咏悄縺ｮ邨仙粋", "画像の結合"],
    ["髢｢騾｣譁ｭ迚・ｒ邱ｱ蜷・", "関連断片を統合"],
    ["蜷医ｒ邨仙粋", "を結合"],
    ["譁ｰ縺励＞蟾･遞・", "新しい工程"],
    ["譖ｴ譁ｰ諠・ｱ縺ｪ縺・", "更新情報なし"]
  ]);

  let repaired = value;
  replacements.forEach((replacement, broken) => {
    repaired = repaired.split(broken).join(replacement);
  });

  return repaired;
}

function exportDevices() {
  const savedDevices = devices.filter((device) => !defaultDeviceIds.has(device.id));
  const payload = {
    app: "AC-BUILDE",
    version: 1,
    exportedAt: new Date().toISOString(),
    devices: savedDevices
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  link.href = url;
  link.download = `ac-builde-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importDevices(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const importedDevices = Array.isArray(payload) ? payload : payload.devices;
    if (!Array.isArray(importedDevices)) {
      throw new Error("AC-BUILDEの保存データではありません。");
    }

    let importedCount = 0;
    importedDevices.forEach((device) => {
      if (!isValidSavedDevice(device)) return;
      const safeDevice = sanitizeSavedDevice({
        ...device,
        id: defaultDeviceIds.has(device.id) ? `drive-${Date.now()}-${importedCount}` : device.id
      });
      const existingIndex = devices.findIndex((item) => item.id === safeDevice.id);
      if (existingIndex >= 0 && !defaultDeviceIds.has(safeDevice.id)) {
        devices[existingIndex] = safeDevice;
      } else if (!devices.some((item) => item.id === safeDevice.id)) {
        devices.unshift(safeDevice);
      }
      importedCount += 1;
    });

    await saveDevices();
    renderDevices();
    window.alert(`${importedCount}件の装置を読み込みました。`);
  } catch (error) {
    window.alert(error.message || "読み込みに失敗しました。");
  } finally {
    const input = document.getElementById("importDevicesInput");
    if (input) input.value = "";
  }
}

function isValidSavedDevice(device) {
  return device
    && typeof device.id === "string"
    && typeof device.name === "string"
    && Array.isArray(device.steps)
    && device.steps.every((step) => typeof step.title === "string" && typeof step.image === "string");
}

function initializeDriveSettings() {
  const savedSettings = loadDriveSettings();
  const savedUrl = savedSettings.driveFolderUrl || "";
  const defaultUrl = config.driveFolderUrl || "";
  const driveUrl = savedUrl || defaultUrl;

  state.savedCategoryId = savedSettings.selectedCategoryId || "";
  state.savedPdfId = savedSettings.selectedPdfId || "";

  const driveFolderInput = document.getElementById("driveFolderInput");
  if (driveUrl && driveFolderInput) {
    driveFolderInput.value = driveUrl;
    const folderId = extractDriveFolderId(driveUrl);
    if (folderId) driveRoot.folderId = folderId;
  }
}

function restoreDriveSelection(categories) {
  const firstCategory = categories[0] || { id: "empty", name: "PDFなし", files: [] };
  const selectedCategory = categories.find((category) => category.id === state.savedCategoryId) || firstCategory;
  const selectedPdf = selectedCategory.files.find((file) => file.id === state.savedPdfId) || null;

  state.selectedCategory = selectedCategory;
  state.selectedPdf = selectedPdf;
  state.previewSteps = [];
}

function saveDriveSettings() {
  const driveFolderInput = document.getElementById("driveFolderInput");
  const settings = {
    driveFolderUrl: driveFolderInput ? driveFolderInput.value.trim() : "",
    selectedCategoryId: state.selectedCategory?.id || "",
    selectedPdfId: state.selectedPdf?.id || ""
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadDriveSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

async function loadDriveCategories(rootFolderId) {
  const rootChildren = await listDriveChildren(rootFolderId);
  const folders = rootChildren.filter(isFolderLike);
  const rootPdfs = rootChildren.filter(isPdfLike);
  const categories = [];

  for (const folder of folders) {
    const folderId = getDriveItemTargetId(folder);
    const pdfs = await collectPdfsRecursive(folderId);

    categories.push({
      id: folderId,
      name: folder.name,
      files: pdfs
    });
  }

  if (rootPdfs.length > 0) {
    categories.unshift({
      id: `${rootFolderId}-root`,
      name: "未分類",
      files: rootPdfs.map(toPdfFile)
    });
  }

  return categories.filter((category) => category.files.length > 0);
}

async function collectPdfsRecursive(folderId, depth = 0) {
  if (depth > 4) return [];

  const children = await listDriveChildren(folderId);
  const pdfs = children.filter(isPdfLike).map(toPdfFile);
  const folders = children.filter(isFolderLike);

  for (const folder of folders) {
    const nestedFolderId = getDriveItemTargetId(folder);
    const nestedPdfs = await collectPdfsRecursive(nestedFolderId, depth + 1);
    pdfs.push(...nestedPdfs.map((pdf) => ({
      ...pdf,
      name: `${folder.name} / ${pdf.name}`
    })));
  }

  return pdfs;
}

async function listDriveChildren(folderId) {
  try {
    return await requestDriveChildren(folderId, true);
  } catch (error) {
    console.warn("Retry Google Drive request without allDrives options.", error);
    return requestDriveChildren(folderId, false);
  }
}

async function requestDriveChildren(folderId, useAllDrives) {
  const files = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      key: config.googleDriveApiKey,
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size, thumbnailLink, webViewLink, shortcutDetails)",
      pageSize: "100"
    });

    if (useAllDrives) {
      params.set("orderBy", "folder,name_natural");
      params.set("corpora", "allDrives");
      params.set("includeItemsFromAllDrives", "true");
      params.set("supportsAllDrives", "true");
    }

    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`);
    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const message = data.error?.message || `Google Drive APIの接続に失敗しました。HTTP ${response.status}`;
      throw new Error(message);
    }

    files.push(...(data.files || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return files;
}

function toPdfFile(file) {
  const targetId = getDriveItemTargetId(file);
  return {
    id: targetId,
    name: file.name,
    modifiedTime: formatDriveDate(file.modifiedTime),
    pages: 3,
    thumbnailLink: file.thumbnailLink || "",
    webViewLink: file.webViewLink || "",
    size: file.size || ""
  };
}

function isFolderLike(item) {
  return item.mimeType === FOLDER_MIME
    || (item.mimeType === SHORTCUT_MIME && item.shortcutDetails?.targetMimeType === FOLDER_MIME);
}

function isPdfLike(item) {
  return item.mimeType === PDF_MIME
    || (item.mimeType === SHORTCUT_MIME && item.shortcutDetails?.targetMimeType === PDF_MIME);
}

function getDriveItemTargetId(item) {
  return item.shortcutDetails?.targetId || item.id;
}

function formatDriveDate(value) {
  if (!value) return "更新日不明";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function extractDriveFolderId(value) {
  const match = value.match(/\/folders\/([^/?]+)/);
  if (match) return match[1];
  const idParam = value.match(/[?&]id=([^&]+)/);
  if (idParam) return idParam[1];
  return value.trim().length > 10 ? value.trim() : "";
}

function countDriveFiles() {
  return driveRoot.categories.reduce((total, category) => total + category.files.length, 0);
}

// function showView(name) {
//   state.view = name;
//   Object.entries(views).forEach(([viewName, element]) => {
//     if (element) {
//       element.classList.toggle("is-active", viewName === name);
//     }
//   });
//   const reactRoot = document.querySelector("#react-root");
//   if (reactRoot) {
//     reactRoot.hidden = name === "slide";
//   }
//   window.scrollTo({ top: 0, left: 0 });
//   backButton.style.visibility = (name === "device") ? "hidden" : "visible";
//   fullscreenButton.style.visibility = name === "slide" ? "visible" : "hidden";
// }

function renderSlide() {
  const device = state.selectedDevice;
  const step = device?.steps[state.stepIndex];
  if (!step) {
    showView("device");
    return;
  }
  
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  
  setEl("slideDeviceName", device.name);
  setEl("slideSource", `${device.sourceType} / ${device.drivePath}`);
  setEl("stepCounter", `${state.stepIndex + 1} / ${device.steps.length}`);
  
  const stepImg = document.getElementById("stepImage");
  if (stepImg) {
    stepImg.src = step.image;
    stepImg.alt = `${device.name} ${step.title}`;
  }
  
  setEl("stepTitle", step.title);
  setEl("stepMemo", step.memo);
  
  const slider = document.getElementById("stepSlider");
  if (slider) {
    slider.max = String(device.steps.length - 1);
    slider.value = String(state.stepIndex);
  }
  
  const titleInput = document.getElementById("slideTitleInput");
  if (titleInput) titleInput.value = step.title;
  
  const saveBtn = document.getElementById("saveSlideTitleButton");
  if (saveBtn) saveBtn.disabled = true;
}

function saveCurrentSlideTitle() {
  const device = state.selectedDevice;
  const step = device?.steps[state.stepIndex];
  if (!step) return;

  const titleInput = document.getElementById("slideTitleInput");
  const stepTitle = document.getElementById("stepTitle");
  const stepImage = document.getElementById("stepImage");
  const saveBtn = document.getElementById("saveSlideTitleButton");

  const newTitle = titleInput?.value.trim() || `工程${state.stepIndex + 1}`;
  step.title = newTitle;
  
  if (stepTitle) stepTitle.textContent = step.title;
  if (stepImage) stepImage.alt = `${device.name} ${step.title}`;
  if (saveBtn) saveBtn.disabled = true;

  if (!defaultDeviceIds.has(device.id)) {
    saveDevices().then(() => {
      renderDevices();
    });
  }
}

function previousStep() {
  requestStepChange(state.stepIndex - 1);
}

function nextStep() {
  requestStepChange(state.stepIndex + 1);
}

function requestStepChange(targetIndex) {
  if (!state.selectedDevice) return;
  if (targetIndex < 0 || targetIndex >= state.selectedDevice.steps.length) {
    const slider = document.getElementById("stepSlider");
    if (slider) slider.value = String(state.stepIndex);
    return;
  }

  if (targetIndex <= state.stepIndex) {
    applyStepChange(targetIndex);
    return;
  }

  const currentStep = state.selectedDevice.steps[state.stepIndex];
  const checks = normalizeStepChecks(currentStep?.checks);
  const checkKey = `${state.selectedDevice.id}:${state.stepIndex}`;
  if (!isStepPopupEnabled(currentStep) || checks.length === 0 || state.confirmedCheckKeys.has(checkKey)) {
    applyStepChange(targetIndex);
    return;
  }

  const slider = document.getElementById("stepSlider");
  if (slider) slider.value = String(state.stepIndex);

  openCheckModal({
    title: currentStep.title || `工程${state.stepIndex + 1}`,
    checks,
    onConfirm: () => {
      state.confirmedCheckKeys.add(checkKey);
      applyStepChange(targetIndex);
    }
  });
}

function applyStepChange(targetIndex) {
  state.stepIndex = targetIndex;
  renderSlide();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    const target = document.getElementById("slideMain")
      || document.getElementById("slideView")
      || document.documentElement;
    requestElementFullscreen(target);
    return;
  }
  document.exitFullscreen?.();
}

function requestElementFullscreen(element) {
  const request =
    element.requestFullscreen
    || element.webkitRequestFullscreen
    || element.msRequestFullscreen;

  if (!request) {
    console.warn("Fullscreen API is not available in this browser.");
    return;
  }

  const result = request.call(element);
  if (result?.catch) {
    result.catch((error) => console.warn("Fullscreen request failed.", error));
  }
}

function makeStepSvg(number, title, detail) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
      <rect width="1400" height="900" fill="#f8fafc"/>
      <rect x="70" y="70" width="1260" height="760" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
      <rect x="110" y="120" width="260" height="120" rx="12" fill="#1368b8"/>
      <text x="240" y="198" font-family="Meiryo, sans-serif" font-size="54" fill="#ffffff" text-anchor="middle" font-weight="700">${number}</text>
      <text x="420" y="182" font-family="Meiryo, sans-serif" font-size="54" fill="#1b2430" font-weight="700">${escapeSvg(title)}</text>
      <line x1="110" y1="300" x2="1290" y2="300" stroke="#dbe2ea" stroke-width="4"/>
      <rect x="140" y="360" width="560" height="330" rx="12" fill="#eef3f7" stroke="#cbd5e1" stroke-width="3"/>
      <path d="M220 610 L360 430 L500 585 L600 500 L660 610 Z" fill="#9fb7cc"/>
      <circle cx="560" cy="445" r="48" fill="#e2b65c"/>
      <rect x="760" y="370" width="470" height="56" rx="8" fill="#eaf2f9"/>
      <rect x="760" y="460" width="390" height="42" rx="8" fill="#e2e8f0"/>
      <rect x="760" y="532" width="430" height="42" rx="8" fill="#e2e8f0"/>
      <rect x="760" y="604" width="330" height="42" rx="8" fill="#e2e8f0"/>
      <text x="760" y="765" font-family="Meiryo, sans-serif" font-size="34" fill="#627084">${escapeSvg(detail)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

