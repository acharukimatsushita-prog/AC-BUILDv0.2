import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Expand,
  FileText,
  Folder,
  FolderSync,
  Globe,
  Import,
  Layers,
  ListChecks,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import "./styles.css";

type StepCheck = {
  id: string;
  text: string;
  required?: boolean;
};

type Step = {
  title: string;
  memo: string;
  image: string;
  popupEnabled?: boolean;
  checks?: StepCheck[];
};

type Device = {
  id: string;
  name: string;
  sourceType: string;
  drivePath: string;
  steps: Step[];
  updatedAt: string;
};

type LegacyWindow = Window & {
  devices?: Device[];
  saveDevices?: () => void;
  renderDevices?: () => void;
  goToEditView?: (device: Device) => void;
};

function ja(value: string) {
  return value;
}

function AppTopScreen() {
  const [activeView, setActiveView] = React.useState<"device" | "drive" | "edit" | "browser">("device");
  const [editingDevice, setEditingDevice] = React.useState<Device | null>(null);
  const [browserUrl, setBrowserUrl] = React.useState<string>("https://www.google.com");

  React.useEffect(() => {
    // Legacy側の「戻る」ボタンクリックをReactの状態にも反映させる
    const backBtn = document.getElementById("backButton");
    const handleBack = () => {
      // 現在React管理下の画面（Drive同期や編集画面）にいる場合、装置一覧に戻す
      if (activeView !== "device") {
        setActiveView("device");
        setEditingDevice(null);
        // renderDevicesを呼び出して一覧を再描画
        (window as LegacyWindow).renderDevices?.();
      }
    };
    (window as any).openInAppBrowser = (url: string) => {
      // Google DriveのURLをiframe用に変換 (/view -> /preview)
      let targetUrl = url;
      if (targetUrl.includes("drive.google.com") && targetUrl.includes("/view")) {
        targetUrl = targetUrl.replace("/view", "/preview");
      }
      goToView("browser", targetUrl);
    };

    (window as any).goToEditView = (device: Device) => {
      setEditingDevice(device);
      setActiveView("edit");
      // 編集画面自体はReactだが、Legacy側ではdeviceViewをベースに表示を整える
      if (typeof (window as any).showView === "function") {
        (window as any).showView("device");
      } else {
        switchLegacyView("device");
      }
    };

    return () => {
      backBtn?.removeEventListener("click", handleBack);
      delete (window as any).goToEditView;
    };
  }, [activeView]);

  function goToView(name: "device" | "drive" | "browser", url?: string) {
    setActiveView(name);
    setEditingDevice(null);
    if (url) setBrowserUrl(url);
    
    // Legacy側の表示状態と同期
    if (typeof (window as any).showView === "function") {
      (window as any).showView(name);
    } else {
      switchLegacyView(name);
    }

    if (name === "device") {
      (window as LegacyWindow).renderDevices?.();
    }
  }

  function saveEditedDevice(updated: Device) {
    const legacyWindow = window as LegacyWindow;
    const index = legacyWindow.devices?.findIndex((device) => device.id === updated.id) ?? -1;
    if (legacyWindow.devices && index !== -1) {
      legacyWindow.devices[index] = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      legacyWindow.saveDevices?.();
      legacyWindow.renderDevices?.();
    }
    goToView("device");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      return;
    }
    document.exitFullscreen?.();
  }

  return (
    <>
      <div className="min-h-screen bg-[#f0f4f8] text-[#1a2535]">
        <main className={activeView === "device" ? "px-4 py-5 sm:px-6 sm:py-6 lg:px-8" : "hidden"}>
          <section className="view is-active" id="deviceView" aria-labelledby="deviceTitle">
            <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
              <CardHeader className="gap-4 p-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#56687a]">Device Library</p>
                  <CardTitle id="deviceTitle" className="mt-1 text-2xl font-bold text-[#1a2535] sm:text-3xl">
                    {ja("\u88c5\u7f6e\u9078\u629e")}
                  </CardTitle>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#56687a]">
                    {ja("Google Drive\u3067\u7ba1\u7406\u3057\u3066\u3044\u308b\u7d44\u7acb\u6a19\u6e96\u3092\u9078\u629e\u3057\u3001\u95b2\u89a7\u30fb\u53d6\u308a\u8fbc\u307f\u3092\u884c\u3044\u307e\u3059\u3002")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button id="exportDevicesButton" type="button" variant="outline">
                    <Upload className="size-4" aria-hidden="true" />
                    {ja("\u66f8\u304d\u51fa\u3057")}
                  </Button>
                  <Button id="importDevicesButton" type="button" variant="outline">
                    <Import className="size-4" aria-hidden="true" />
                    {ja("\u8aad\u307f\u8fbc\u307f")}
                  </Button>
                  <Button id="manageModeButton" type="button" variant="secondary" aria-pressed="false">
                    <Settings className="size-4" aria-hidden="true" />
                    {ja("\u7ba1\u7406\u8005\u753b\u9762")}
                  </Button>
                  <Button id="openBrowserButton" type="button" variant="outline" onClick={() => goToView("browser")}>
                    <Globe className="size-4" aria-hidden="true" />
                    {ja("\u30d6\u30e9\u30a6\u30b6")}
                  </Button>
                  <Button id="openDriveButton" type="button" onClick={() => goToView("drive")}>
                    <FolderSync className="size-4" aria-hidden="true" />
                    {ja("Drive\u540c\u671f")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 pt-0 sm:p-6 sm:pt-0">
                <input id="importDevicesInput" type="file" accept=".json,application/json" hidden />
                <label className="flex min-h-[52px] items-center gap-3 rounded-lg border border-[#c8d4e0] bg-[#f8fafc] px-4 focus-within:border-[#1568c8] focus-within:ring-2 focus-within:ring-[#1568c8]/20">
                  <Search className="size-5 shrink-0 text-[#56687a]" aria-hidden="true" />
                  <span className="sr-only">{ja("\u691c\u7d22")}</span>
                  <input
                    id="searchInput"
                    type="search"
                    placeholder={ja("\u88c5\u7f6e\u540d\u3067\u691c\u7d22")}
                    className="min-h-[48px] w-full bg-transparent text-base outline-none placeholder:text-[#9ab0c8]"
                  />
                </label>
                <div className="device-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" id="deviceGrid" />
              </CardContent>
            </Card>
          </section>
        </main>

        <DriveImportView isActive={activeView === "drive"} onOpenInBrowser={(url) => goToView("browser", url)} />
        <SimpleBrowserView isActive={activeView === "browser"} url={browserUrl} setUrl={setBrowserUrl} />
        {activeView === "edit" && editingDevice && (
          <DeviceEditView device={editingDevice} onCancel={() => goToView("device")} onSave={saveEditedDevice} />
        )}
      </div>
    </>
  );
}

function DriveImportView({ isActive, onOpenInBrowser }: { isActive: boolean; onOpenInBrowser?: (url: string) => void }) {
  return (
    <main className={isActive ? "px-4 py-5 sm:px-6 sm:py-6 lg:px-8" : "hidden"}>
      <section className={isActive ? "view is-active" : "view"} id="driveView" aria-labelledby="driveTitle">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_minmax(320px,1fr)_minmax(380px,1.35fr)]">
          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow lg:col-span-3">
            <CardHeader className="gap-4 p-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-[#56687a]">Drive Import</p>
                <CardTitle id="driveTitle" className="mt-1 text-2xl font-bold text-[#1a2535] sm:text-3xl">
                  {ja("Google Drive\u540c\u671f")}
                </CardTitle>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#56687a]">
                  {ja("Drive\u304b\u3089PDF\u3092\u8aad\u307f\u8fbc\u307f\u3001\u5de5\u7a0b\u30ab\u30fc\u30c9\u3092\u4f5c\u6210\u3057\u307e\u3059\u3002")}
                </p>
              </div>
              <Button className="w-full sm:w-auto" id="syncDriveButton" type="button" size="lg">
                <FolderSync className="size-5" aria-hidden="true" />
                {ja("\u540c\u671f")}
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-0 sm:grid-cols-[1fr_auto] sm:p-6 sm:pt-0">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#1a2535]">{ja("Drive\u30d5\u30a9\u30eb\u30c0URL")}</span>
                <Input id="driveFolderInput" type="url" className="min-h-[44px] rounded-lg bg-[#f8fafc] text-base" placeholder="https://drive.google.com/drive/folders/..." />
              </label>
              <div className="grid gap-2 sm:min-w-40">
                <span className="text-sm font-bold text-[#1a2535]">{ja("\u72b6\u614b")}</span>
                <div className="flex min-h-[44px] items-center rounded-lg border border-[#c8d4e0] bg-[#f8fafc] px-3 text-sm font-bold text-[#56687a]" id="driveStatus">
                  {ja("\u672a\u540c\u671f")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Folder className="size-5 text-[#1a3660]" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-[#1a2535]">{ja("\u5927\u5206\u985e")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div id="categoryList" className="category-list grid max-h-[42vh] gap-2 overflow-auto pr-1 lg:max-h-[58vh]" />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#1a3660]" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-[#1a2535]">{ja("\u88c5\u7f6ePDF")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div id="pdfList" className="pdf-list grid max-h-[42vh] gap-2 overflow-auto pr-1 lg:max-h-[58vh]" />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
            <CardHeader className="gap-4 p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Layers className="size-5 text-[#1a3660]" aria-hidden="true" />
                    <CardTitle className="text-base font-bold text-[#1a2535]">{ja("\u5206\u5272\u30d7\u30ec\u30d3\u30e5\u30fc")}</CardTitle>
                  </div>
                  <p id="previewDeviceName" className="mt-2 text-sm leading-6 text-[#56687a]">
                    {ja("PDF\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002")}
                  </p>
                  <label className="mt-3 grid gap-1 text-sm font-bold text-[#1a2535]">
                    {ja("\u767b\u9332\u30bf\u30a4\u30c8\u30eb")}
                    <Input id="previewDeviceTitleInput" type="text" className="min-h-[42px] rounded-lg bg-[#f8fafc] text-base" placeholder={ja("\u88c5\u7f6e\u4e00\u89a7\u306b\u767b\u9332\u3059\u308b\u30bf\u30a4\u30c8\u30eb")} />
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[320px]">
                  <label className="grid gap-1 text-sm font-bold text-[#1a2535]">
                    {ja("\u5206\u5272")}
                    <select id="splitModeSelect" className="min-h-[42px] rounded-md border border-[#c8d4e0] bg-white px-3 text-sm outline-none focus:border-[#1568c8]" defaultValue="normal">
                      <option value="normal">{ja("\u6a19\u6e96")}</option>
                      <option value="fine">{ja("\u7d30\u304b\u304f")}</option>
                      <option value="extra">{ja("\u304b\u306a\u308a\u7d30\u304b\u304f")}</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-[#1a2535]">
                    {ja("\u307e\u3068\u3081")}
                    <select id="mergeModeSelect" className="min-h-[42px] rounded-md border border-[#c8d4e0] bg-white px-3 text-sm outline-none focus:border-[#1568c8]" defaultValue="normal">
                      <option value="weak">{ja("\u5f31")}</option>
                      <option value="normal">{ja("\u6a19\u6e96")}</option>
                      <option value="strong">{ja("\u5f37")}</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button id="openPdfButton" type="button" variant="outline" onClick={() => {
                  const urlInput = document.getElementById("driveFolderInput") as HTMLInputElement;
                  if (onOpenInBrowser && urlInput?.value) {
                    onOpenInBrowser(urlInput.value);
                  }
                }}>
                  <Globe className="size-4" aria-hidden="true" />
                  {ja("\u30d6\u30e9\u30a6\u30b6\u3067\u958b\u304f")}
                </Button>
                <Button id="autoSplitButton" type="button" size="lg">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {ja("\u81ea\u52d5\u5206\u5272")}
                </Button>
                <Button id="registerPreviewButton" type="button" variant="secondary">
                  <ListChecks className="size-4" aria-hidden="true" />
                  {ja("\u4e00\u89a7\u3078\u8ffd\u52a0")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div className="setup-note preview-notice mb-3" id="previewNotice">
                <strong>{ja("\u30bf\u30a4\u30c8\u30eb\u3068POP\u78ba\u8a8d\u3092\u7de8\u96c6\u3067\u304d\u307e\u3059\u3002")}</strong>
                <span>{ja("\u81ea\u52d5\u5206\u5272\u5f8c\u3001\u5404\u30ab\u30fc\u30c9\u3067\u8a2d\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044\u3002")}</span>
              </div>
              <div id="splitPreviewGrid" className="split-preview-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function normalizeChecks(checks: Step["checks"]): StepCheck[] {
  if (!Array.isArray(checks)) return [];
  return checks
    .map((check, index) => ({
      id: check.id || `check-${index}`,
      text: check.text.trim(),
      required: check.required !== false,
    }))
    .filter((check) => check.text.length > 0);
}

function checksToText(checks: Step["checks"]) {
  return normalizeChecks(checks)
    .map((check) => check.text)
    .join("\n");
}

function textToChecks(value: string): StepCheck[] {
  return value
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `check-${Date.now()}-${index}`,
      text,
      required: true,
    }));
}

function isPopupEnabled(step: Step) {
  if (step.popupEnabled === true) return true;
  return normalizeChecks(step.checks).length > 0 && step.popupEnabled !== false;
}

function repairMojibakeText(value: string) {
  if (!/[\ufffd繝蜷縺謌讓呎邱髯螟譁陬]/.test(value)) {
    return value;
  }

  const replacements: Array<[string, string]> = [
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
    ["譖ｴ譁ｰ諠・ｱ縺ｪ縺・", "更新情報なし"],
  ];

  return replacements.reduce((text, [broken, replacement]) => text.split(broken).join(replacement), value);
}

function repairStepText(step: Step): Step {
  return {
    ...step,
    title: repairMojibakeText(step.title),
    memo: repairMojibakeText(step.memo),
    checks: normalizeChecks(step.checks).map((check) => ({
      ...check,
      text: repairMojibakeText(check.text),
    })),
  };
}

function DeviceEditView({
  device,
  onCancel,
  onSave,
}: {
  device: Device;
  onCancel: () => void;
  onSave: (device: Device) => void;
}) {
  const [title, setTitle] = React.useState(repairMojibakeText(device.name));
  const [steps, setSteps] = React.useState<Step[]>(
    device.steps.map((step) => {
      const repairedStep = repairStepText(step);
      return { ...repairedStep, popupEnabled: isPopupEnabled(repairedStep), checks: normalizeChecks(repairedStep.checks) };
    })
  );

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        title: ja("\u65b0\u3057\u3044\u5de5\u7a0b"),
        memo: "",
        image: "",
        popupEnabled: false,
        checks: [],
      },
    ]);
  }

  function deleteStep(index: number) {
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
  }

  function moveStep(index: number, direction: number) {
    setSteps((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function updateStep(index: number, nextStep: Step) {
    setSteps((current) => current.map((step, stepIndex) => (stepIndex === index ? nextStep : step)));
  }

  function handleSave() {
    onSave({
      ...device,
      name: title.trim() || device.name,
      steps: steps.map((step) => {
        const repairedStep = repairStepText(step);
        return { ...repairedStep, popupEnabled: isPopupEnabled(repairedStep), checks: normalizeChecks(repairedStep.checks) };
      }),
    });
  }

  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
        <CardHeader className="gap-4 p-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[#56687a]">Admin Edit</p>
            <CardTitle className="mt-1 text-2xl font-bold text-[#1a2535] sm:text-3xl">
              {ja("\u7ba1\u7406\u8005\u7de8\u96c6")}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {ja("\u623b\u308b")}
            </Button>
            <Button type="button" size="lg" onClick={handleSave}>
              <Check className="size-4" aria-hidden="true" />
              {ja("\u4fdd\u5b58")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 pt-0 sm:p-6 sm:pt-0">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-[#1a2535]">
              {ja("\u88c5\u7f6e\u540d")}
              <span className="required-badge">必須</span>
            </span>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-[44px] rounded-lg text-base" />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#c8d4e0] bg-[#f0f4f8] px-4 py-3">
            <div>
              <h3 className="text-base font-bold text-[#1a2535]">{ja("\u5de5\u7a0b\u4e00\u89a7")}</h3>
              <p className="mt-1 text-sm text-[#56687a]">
                {ja("POP\u78ba\u8a8d\u3092ON\u306b\u3059\u308b\u3068\u3001\u95b2\u89a7\u6642\u306b\u6b21\u3078\u9032\u3080\u524d\u306e\u78ba\u8a8d\u753b\u9762\u304c\u8868\u793a\u3055\u308c\u307e\u3059\u3002")}
              </p>
            </div>
            <Button type="button" onClick={addStep} variant="secondary">
              <Layers className="size-4" aria-hidden="true" />
              {ja("\u5de5\u7a0b\u3092\u8ffd\u52a0")}
            </Button>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <section key={`${device.id}-${index}`} className="rounded-lg border border-[#c8d4e0] bg-[#f8fafc] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#1a3660] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="text-base font-bold text-[#1a2535]">
                      {ja("\u5de5\u7a0b")}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => moveStep(index, -1)} disabled={index === 0} title={ja("\u4e0a\u306b\u79fb\u52d5")}>
                      <ChevronUp className="size-4" aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} title={ja("\u4e0b\u306b\u79fb\u52d5")}>
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteStep(index)} disabled={steps.length <= 1}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      {ja("\u524a\u9664")}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
                  <div className="grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm font-bold text-[#1a2535]">{ja("\u5de5\u7a0b\u30bf\u30a4\u30c8\u30eb")}</span>
                      <Input
                        value={step.title}
                        onChange={(event) => updateStep(index, { ...step, title: event.target.value })}
                        className="min-h-[42px] rounded-lg bg-white text-base"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm font-bold text-[#1a2535]">{ja("\u30e1\u30e2")}</span>
                      <textarea
                        value={step.memo}
                        onChange={(event) => updateStep(index, { ...step, memo: event.target.value })}
                        className="min-h-24 rounded-lg border border-[#c8d4e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1568c8] focus:ring-2 focus:ring-[#1568c8]/20"
                      />
                    </label>
                  </div>

                  <div className="grid content-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
                    <label className="flex items-center gap-3 text-sm font-bold text-[#1a2535]">
                      <input
                        type="checkbox"
                        checked={isPopupEnabled(step)}
                        onChange={(event) => updateStep(index, { ...step, popupEnabled: event.target.checked })}
                        className="size-5 accent-amber-600"
                      />
                      {ja("POP\u78ba\u8a8d\u3092\u8868\u793a")}
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm font-bold text-[#56687a]">{ja("\u78ba\u8a8d\u9805\u76ee")}</span>
                      <textarea
                        value={checksToText(step.checks)}
                        onChange={(event) => {
                          const checks = textToChecks(event.target.value);
                          updateStep(index, { ...step, checks, popupEnabled: checks.length > 0 || step.popupEnabled });
                        }}
                        placeholder={ja("\u4f8b: \u30cd\u30b8\u306e\u7de0\u3081\u4ed8\u3051\u3092\u78ba\u8a8d\u3057\u305f")}
                        className="min-h-28 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                      />
                    </label>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="flex flex-wrap justify-between gap-3 border-t border-[#c8d4e0] pt-5">
            <Button type="button" variant="secondary" onClick={addStep}>
              <Layers className="size-4" aria-hidden="true" />
              {ja("\u5de5\u7a0b\u3092\u8ffd\u52a0")}
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                {ja("\u623b\u308b")}
              </Button>
              <Button type="button" size="lg" onClick={handleSave}>
                <Check className="size-4" aria-hidden="true" />
                {ja("\u4fdd\u5b58")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function SimpleBrowserView({ isActive, url, setUrl }: { isActive: boolean; url: string; setUrl: (url: string) => void }) {
  const [inputUrl, setInputUrl] = React.useState(url);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    setInputUrl(url);
  }, [url]);

  const handleGo = (e?: React.FormEvent) => {
    e?.preventDefault();
    let target = inputUrl.trim();
    if (target && !target.startsWith("http")) {
      target = "https://" + target;
    }
    setUrl(target);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = currentSrc;
      }, 10);
    }
  };

  return (
    <main className={isActive ? "flex h-[calc(100vh-64px)] flex-col bg-white" : "hidden"}>
      <section className={isActive ? "view is-active flex h-full flex-col" : "view"} id="browserView">
        <div className="flex items-center gap-2 border-b border-[#c8d4e0] bg-[#f0f4f8] p-2 sm:p-3">
          <form onSubmit={handleGo} className="flex flex-1 items-center gap-2">
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="h-10 flex-1 rounded-md border-[#c8d4e0] bg-white text-sm"
              placeholder="https://..."
            />
            <Button type="submit" size="sm" className="h-10 px-4">
              Go
            </Button>
          </form>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleRefresh} title={ja("\u66f4\u65b0")}>
              <RefreshCw className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => window.open(url, "_blank")}
              title={ja("\u65b0\u898f\u30bf\u30d6\u3067\u958b\u304f")}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>
        </div>
        <div className="relative flex-1 bg-slate-100">
          <iframe
            ref={iframeRef}
            src={url}
            className="h-full w-full border-none"
            title="Simple Browser"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
          <div className="absolute bottom-4 right-4 max-w-xs rounded-md bg-black/60 p-2 text-[10px] text-white backdrop-blur-sm">
            {ja("\u203bX-Frame-Options\u5236\u9650\u306b\u3088\u308a\u8868\u793a\u3067\u304d\u306a\u3044\u30b5\u30a4\u30c8\u304c\u3042\u308a\u307e\u3059\u3002\u305d\u306e\u5834\u5408\u306f\u53f3\u4e0a\u306e\u30a2\u30a4\u30b3\u30f3\u304b\u3089\u5225\u30bf\u30d6\u3067\u958b\u3044\u3066\u304f\u3060\u3055\u3044\u3002")}
          </div>
        </div>
      </section>
    </main>
  );
}

const root = document.getElementById("react-root");

if (root) {
  const app = createRoot(root);
  flushSync(() => {
    app.render(
      <React.StrictMode>
        <AppTopScreen />
      </React.StrictMode>
    );
  });
}

loadLegacyScript("config.js", () => {
  loadLegacyScript("app.js");
});

function loadLegacyScript(src: string, onload?: () => void) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = () => onload?.();
  document.body.appendChild(script);
}

function switchLegacyView(name: "device" | "drive" | "slide") {
  document.querySelectorAll<HTMLElement>(".app-shell .view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `${name}View`);
  });
}
