const devices = [
  {
    id: "v-belt-safety",
    name: "Vベルト巻込まれ安全体感装置",
    sourceType: "PDF",
    updatedAt: "2026-05-13",
    drivePath: "Google Drive / AC-BUILDE / sources",
    steps: [
      {
        title: "フレーム準備",
        memo: "自動分割候補 01",
        image: makeStepSvg("01", "フレーム準備", "キャスター・アジャスター取付位置を確認")
      },
      {
        title: "キャスター取付",
        memo: "自動分割候補 02",
        image: makeStepSvg("02", "キャスター取付", "指定部品と取付方向を確認")
      },
      {
        title: "ベアリング組付け",
        memo: "自動分割候補 03",
        image: makeStepSvg("03", "ベアリング組付け", "シャフト・スペーサーを順番通りに配置")
      }
    ]
  },
  {
    id: "sample-jig-a",
    name: "装置A 組立標準",
    sourceType: "Excel",
    updatedAt: "未取り込み",
    drivePath: "Google Drive / AC-BUILDE / sources",
    steps: [
      {
        title: "Excel取り込み待ち",
        memo: "サンプル",
        image: makeStepSvg("01", "Excel取り込み待ち", "DriveからExcelを選択して自動分割")
      }
    ]
  },
  {
    id: "sample-jig-b",
    name: "装置B 組立標準",
    sourceType: "PDF",
    updatedAt: "未取り込み",
    drivePath: "Google Drive / AC-BUILDE / sources",
    steps: [
      {
        title: "PDF取り込み待ち",
        memo: "サンプル",
        image: makeStepSvg("01", "PDF取り込み待ち", "ページ単位または工程番号で分割")
      }
    ]
  }
];

const driveRoot = {
  folderId: "1-2ycWi3ecB0ZCpDWmUjQ27LZV9EUOEJq",
  categories: [
    {
      id: "safety-experience",
      name: "安全体感装置",
      files: [
        {
          id: "pdf-v-belt",
          name: "Vベルト巻込まれ安全体感装置組立図面.pdf",
          modifiedTime: "Driveから取得予定",
          pages: 6
        },
        {
          id: "pdf-roller",
          name: "ローラー巻込まれ安全体感装置組立図面.pdf",
          modifiedTime: "Driveから取得予定",
          pages: 5
        }
      ]
    },
    {
      id: "training-jig",
      name: "教育用治具",
      files: [
        {
          id: "pdf-training-a",
          name: "教育用治具A 組立図面.pdf",
          modifiedTime: "Driveから取得予定",
          pages: 4
        }
      ]
    },
    {
      id: "inspection",
      name: "検査装置",
      files: [
        {
          id: "pdf-inspection-a",
          name: "検査装置A 組立図面.pdf",
          modifiedTime: "Driveから取得予定",
          pages: 7
        }
      ]
    }
  ]
};

const FOLDER_MIME = "application/vnd.google-apps.folder";
const PDF_MIME = "application/pdf";
const SHORTCUT_MIME = "application/vnd.google-apps.shortcut";
const STORAGE_KEY = "ac-builde-drive-settings";
const config = window.AC_BUILDE_CONFIG || {};

const views = {
  device: document.querySelector("#deviceView"),
  slide: document.querySelector("#slideView"),
  import: document.querySelector("#importView"),
  drive: document.querySelector("#driveView")
};

const state = {
  view: "device",
  selectedDevice: devices[0],
  stepIndex: 0,
  selectedCategory: driveRoot.categories[0],
  selectedPdf: null,
  previewSteps: [],
  savedCategoryId: "",
  savedPdfId: ""
};

const deviceGrid = document.querySelector("#deviceGrid");
const searchInput = document.querySelector("#searchInput");
const backButton = document.querySelector("#backButton");
const fullscreenButton = document.querySelector("#fullscreenButton");
const openImportButton = document.querySelector("#openImportButton");
const openDriveButton = document.querySelector("#openDriveButton");
const syncDriveButton = document.querySelector("#syncDriveButton");
const driveFolderInput = document.querySelector("#driveFolderInput");
const driveStatus = document.querySelector("#driveStatus");
const categoryList = document.querySelector("#categoryList");
const pdfList = document.querySelector("#pdfList");
const splitPreviewGrid = document.querySelector("#splitPreviewGrid");
const previewDeviceName = document.querySelector("#previewDeviceName");
const registerPreviewButton = document.querySelector("#registerPreviewButton");
const openPdfButton = document.querySelector("#openPdfButton");
const autoSplitButton = document.querySelector("#autoSplitButton");
const splitModeSelect = document.querySelector("#splitModeSelect");
const mergeModeSelect = document.querySelector("#mergeModeSelect");
const previewModal = document.querySelector("#previewModal");
const previewModalBackdrop = document.querySelector("#previewModalBackdrop");
const closePreviewModal = document.querySelector("#closePreviewModal");
const modalStepImage = document.querySelector("#modalStepImage");
const modalStepTitle = document.querySelector("#modalStepTitle");
const modalStepMemo = document.querySelector("#modalStepMemo");
const slideDeviceName = document.querySelector("#slideDeviceName");
const slideSource = document.querySelector("#slideSource");
const stepCounter = document.querySelector("#stepCounter");
const stepImage = document.querySelector("#stepImage");
const stepTitle = document.querySelector("#stepTitle");
const stepMemo = document.querySelector("#stepMemo");
const stepSlider = document.querySelector("#stepSlider");
const simulateImportButton = document.querySelector("#simulateImportButton");

document.querySelector("#prevButton").addEventListener("click", previousStep);
document.querySelector("#nextButton").addEventListener("click", nextStep);
document.querySelector("#prevControl").addEventListener("click", previousStep);
document.querySelector("#nextControl").addEventListener("click", nextStep);
stepSlider.addEventListener("input", (event) => {
  state.stepIndex = Number(event.target.value);
  renderSlide();
});

searchInput.addEventListener("input", renderDevices);
backButton.addEventListener("click", () => {
  if (state.view === "device") return;
  showView("device");
});

openImportButton.addEventListener("click", () => showView("import"));
openDriveButton.addEventListener("click", () => {
  showView("drive");
  renderDriveImport();
});
syncDriveButton.addEventListener("click", syncDriveFolder);
registerPreviewButton.addEventListener("click", registerPreviewDevice);
openPdfButton.addEventListener("click", openSelectedPdf);
autoSplitButton.addEventListener("click", autoSplitSelectedPdf);
previewModalBackdrop.addEventListener("click", closeStepPreview);
closePreviewModal.addEventListener("click", closeStepPreview);
fullscreenButton.addEventListener("click", toggleFullscreen);
simulateImportButton.addEventListener("click", () => {
  simulateImportButton.textContent = "プレビュー作成済み";
  simulateImportButton.style.background = "var(--green)";
  simulateImportButton.style.borderColor = "var(--green)";
});

document.addEventListener("keydown", (event) => {
  if (state.view !== "slide") return;
  if (event.key === "ArrowRight") nextStep();
  if (event.key === "ArrowLeft") previousStep();
  if (event.key === "Escape") closeStepPreview();
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

renderDevices();
initializeDriveSettings();
renderDriveImport();
showView("device");

function renderDevices() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredDevices = devices.filter((device) => device.name.toLowerCase().includes(query));
  deviceGrid.innerHTML = "";

  filteredDevices.forEach((device) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "device-card";
    card.innerHTML = `
      <div class="device-thumb">${device.sourceType}</div>
      <div class="device-card-body">
        <h3>${device.name}</h3>
        <div class="meta-row">
          <span>${device.steps.length}工程</span>
          <span>更新: ${device.updatedAt}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => openDevice(device));
    deviceGrid.appendChild(card);
  });
}

function openDevice(device) {
  state.selectedDevice = device;
  state.stepIndex = 0;
  showView("slide");
  renderSlide();
}

async function syncDriveFolder() {
  const folderId = extractDriveFolderId(driveFolderInput.value);
  if (!folderId) {
    driveStatus.textContent = "URLを確認";
    driveStatus.style.color = "var(--amber)";
    return;
  }

  driveRoot.folderId = folderId;
  saveDriveSettings();

  if (!config.googleDriveApiKey) {
    driveStatus.textContent = "APIキー未設定";
    driveStatus.style.color = "var(--amber)";
    renderDriveImport();
    return;
  }

  driveStatus.textContent = "同期中...";
  driveStatus.style.color = "var(--muted)";
  syncDriveButton.disabled = true;

  try {
    const categories = await loadDriveCategories(folderId);
    driveRoot.categories = categories;
    restoreDriveSelection(categories);
    driveStatus.textContent = `同期完了 ${countDriveFiles()}件`;
    driveStatus.style.color = "var(--green)";
    renderDriveImport();
    renderSplitPreview();
  } catch (error) {
    driveStatus.textContent = "同期失敗";
    driveStatus.style.color = "var(--amber)";
    splitPreviewGrid.innerHTML = `
      <div class="error-text">
        <strong>同期エラー</strong>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;
    console.error(error);
  } finally {
    syncDriveButton.disabled = false;
  }
}

function renderDriveImport() {
  categoryList.innerHTML = "";
  if (!config.googleDriveApiKey) {
    categoryList.innerHTML = `
      <div class="setup-note">
        <strong>APIキーを設定してください</strong>
        <span>config.js の googleDriveApiKey にGoogle Drive APIキーを入れると、実Driveから同期できます。</span>
      </div>
    `;
  }

  if (driveRoot.categories.length === 0) {
    categoryList.innerHTML = `
      <div class="setup-note">
        <strong>PDFが見つかりません</strong>
        <span>Driveフォルダの共有設定、PDFの階層、ショートカット構成を確認してください。</span>
      </div>
    `;
  }

  driveRoot.categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.classList.toggle("is-selected", category.id === state.selectedCategory.id);
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
        <strong>この分類にPDFがありません</strong>
        <span>大分類フォルダの中にPDFがあるか確認してください。</span>
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
  state.previewSteps = createPreviewSteps(file);
  saveDriveSettings();
  renderDriveImport();
  renderSplitPreview();
}

function renderSplitPreview() {
  splitPreviewGrid.innerHTML = "";
  if (!state.selectedPdf) {
    previewDeviceName.textContent = "PDFを選択してください。";
    openPdfButton.disabled = true;
    autoSplitButton.disabled = true;
    registerPreviewButton.disabled = true;
    return;
  }

  previewDeviceName.textContent = `${state.selectedCategory.name} / ${state.selectedPdf.name}`;
  openPdfButton.disabled = !state.selectedPdf.webViewLink;
  autoSplitButton.disabled = false;
  registerPreviewButton.disabled = state.previewSteps.length === 0;
  state.previewSteps.forEach((step) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "split-preview-card";
    card.innerHTML = `
      <img src="${step.image}" alt="${step.title}">
      <strong>${step.title}</strong>
    `;
    card.addEventListener("click", () => openStepPreview(step));
    splitPreviewGrid.appendChild(card);
  });
}

function openStepPreview(step) {
  modalStepImage.src = step.image;
  modalStepImage.alt = step.title;
  modalStepTitle.textContent = step.title;
  modalStepMemo.textContent = step.memo || "分割プレビュー";
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
}

function closeStepPreview() {
  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
}

function openSelectedPdf() {
  if (!state.selectedPdf?.webViewLink) return;
  window.open(state.selectedPdf.webViewLink, "_blank", "noopener");
}

async function autoSplitSelectedPdf() {
  if (!state.selectedPdf) return;

  if (!window.pdfjsLib) {
    showPreviewError("PDF.jsを読み込めませんでした。インターネット接続を確認してください。");
    return;
  }

  autoSplitButton.disabled = true;
  registerPreviewButton.disabled = true;
  autoSplitButton.textContent = "分割中...";
  splitPreviewGrid.innerHTML = `
    <div class="setup-note">
      <strong>PDFを解析中</strong>
      <span>PDFを画像化して、余白から小工程候補を探しています。</span>
    </div>
  `;

  try {
    const pdfBytes = await fetchDrivePdfBytes(state.selectedPdf.id);
    const steps = await splitPdfIntoSteps(
      pdfBytes,
      state.selectedPdf.name,
      splitModeSelect.value,
      mergeModeSelect.value
    );
    state.previewSteps = steps;
    renderSplitPreview();
  } catch (error) {
    showPreviewError(error.message);
  } finally {
    autoSplitButton.disabled = false;
    autoSplitButton.textContent = "自動分割";
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
  const maxPages = Math.min(pdf.numPages, 12);

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const canvas = await renderPdfPage(page, 1.45);
    const pageSteps = splitCanvasByWhitespace(canvas, pageNumber, fileName, mode, mergeMode);
    steps.push(...pageSteps);
  }

  if (steps.length === 0) {
    throw new Error("小工程候補を検出できませんでした。PDF確認で内容を確認してください。");
  }

  return steps.map((step, index) => ({
    ...step,
    title: `${String(index + 1).padStart(2, "0")} ${step.title}`
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
      steps.push({
        title: `P${pageNumber} 小工程${index + 1}-${partIndex + 1}`,
        memo: `${fileName} / ${settings.label}`,
        image: crop.toDataURL("image/png"),
        pageNumber,
        bounds: {
          x: normalizedBand.x + part.x,
          y: normalizedBand.y + part.y,
          width: part.width,
          height: part.height
        }
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
      label: "余白自動分割",
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
      label: "細分化",
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
      label: "かなり細分化",
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
      image: crop.toDataURL("image/png"),
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

function registerPreviewDevice() {
  if (!state.selectedPdf || state.previewSteps.length === 0) return;

  const name = state.selectedPdf.name.replace(/\.pdf$/i, "");
  const device = {
    id: `drive-${Date.now()}`,
    name,
    sourceType: "Drive PDF",
    updatedAt: "プレビュー作成済み",
    drivePath: `Google Drive / ${state.selectedCategory.name}`,
    steps: state.previewSteps
  };

  devices.unshift(device);
  renderDevices();
  openDevice(device);
}

function createPreviewSteps(file) {
  const baseName = file.name.replace(/\.pdf$/i, "");
  const count = Math.max(1, Math.min(file.pages || 3, 8));
  return Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      title: `${number} ${baseName}`,
      memo: file.webViewLink ? "Drive PDFプレビュー" : "自動分割プレビュー",
      image: file.thumbnailLink || makeStepSvg(number, "分割候補", `${file.name} / ページ・工程境界を検出`)
    };
  });
}

function initializeDriveSettings() {
  const savedSettings = loadDriveSettings();
  const savedUrl = savedSettings.driveFolderUrl || "";
  const defaultUrl = config.driveFolderUrl || "";
  const driveUrl = savedUrl || defaultUrl;

  state.savedCategoryId = savedSettings.selectedCategoryId || "";
  state.savedPdfId = savedSettings.selectedPdfId || "";

  if (driveUrl) {
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
  state.previewSteps = selectedPdf ? createPreviewSteps(selectedPdf) : [];
}

function saveDriveSettings() {
  const settings = {
    driveFolderUrl: driveFolderInput.value.trim(),
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
      const message = data.error?.message || `Google Drive APIの取得に失敗しました。HTTP ${response.status}`;
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

function showView(name) {
  state.view = name;
  Object.entries(views).forEach(([viewName, element]) => {
    element.classList.toggle("is-active", viewName === name);
  });
  backButton.style.visibility = name === "device" ? "hidden" : "visible";
}

function renderSlide() {
  const device = state.selectedDevice;
  const step = device.steps[state.stepIndex];
  slideDeviceName.textContent = device.name;
  slideSource.textContent = `${device.sourceType} / ${device.drivePath}`;
  stepCounter.textContent = `${state.stepIndex + 1} / ${device.steps.length}`;
  stepImage.src = step.image;
  stepImage.alt = `${device.name} ${step.title}`;
  stepTitle.textContent = step.title;
  stepMemo.textContent = step.memo;
  stepSlider.max = String(device.steps.length - 1);
  stepSlider.value = String(state.stepIndex);
}

function previousStep() {
  if (state.stepIndex <= 0) return;
  state.stepIndex -= 1;
  renderSlide();
}

function nextStep() {
  if (state.stepIndex >= state.selectedDevice.steps.length - 1) return;
  state.stepIndex += 1;
  renderSlide();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
    return;
  }
  document.exitFullscreen?.();
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
