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

const views = {
  device: document.querySelector("#deviceView"),
  slide: document.querySelector("#slideView"),
  import: document.querySelector("#importView")
};

const state = {
  view: "device",
  selectedDevice: devices[0],
  stepIndex: 0
};

const deviceGrid = document.querySelector("#deviceGrid");
const searchInput = document.querySelector("#searchInput");
const backButton = document.querySelector("#backButton");
const fullscreenButton = document.querySelector("#fullscreenButton");
const openImportButton = document.querySelector("#openImportButton");
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
