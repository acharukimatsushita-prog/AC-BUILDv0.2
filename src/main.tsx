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
  Import,
  Layers,
  ListChecks,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
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
  const [activeView, setActiveView] = React.useState<"device" | "drive" | "edit">("device");
  const [editingDevice, setEditingDevice] = React.useState<Device | null>(null);

  React.useEffect(() => {
    (window as LegacyWindow).goToEditView = (device: Device) => {
      setEditingDevice(device);
      setActiveView("edit");
      switchLegacyView("device");
    };

    return () => {
      delete (window as LegacyWindow).goToEditView;
    };
  }, []);

  function goToView(name: "device" | "drive") {
    setActiveView(name);
    setEditingDevice(null);
    switchLegacyView(name);
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
      <div className="min-h-screen bg-[#f5f7fa] text-[#1b2430]">
        <main className={activeView === "device" ? "px-3 py-4 sm:px-5 sm:py-6 lg:px-7" : "hidden"}>
          <section className="view is-active" id="deviceView" aria-labelledby="deviceTitle">
            <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
              <CardHeader className="gap-4 p-4 sm:flex sm:flex-row sm:items-end sm:justify-between sm:p-5 lg:p-6">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Device Library</p>
                  <CardTitle id="deviceTitle" className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                    {ja("\u88c5\u7f6e\u9078\u629e")}
                  </CardTitle>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {ja("Google Drive\u3067\u7ba1\u7406\u3057\u3066\u3044\u308b\u7d44\u7acb\u6a19\u6e96\u3092\u9078\u629e\u3057\u3001\u95b2\u89a7\u30fb\u53d6\u308a\u8fbc\u307f\u3092\u884c\u3044\u307e\u3059\u3002")}
                  </p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4">
                  <Button id="exportDevicesButton" type="button" variant="outline" className="text-sm">
                    <Upload className="size-4" aria-hidden="true" />
                    {ja("\u66f8\u304d\u51fa\u3057")}
                  </Button>
                  <Button id="importDevicesButton" type="button" variant="outline" className="text-sm">
                    <Import className="size-4" aria-hidden="true" />
                    {ja("\u8aad\u307f\u8fbc\u307f")}
                  </Button>
                  <Button id="openDriveButton" type="button" className="text-sm" onClick={() => goToView("drive")}>
                    <FolderSync className="size-4" aria-hidden="true" />
                    {ja("Drive\u540c\u671f")}
                  </Button>
                  <Button id="manageModeButton" type="button" variant="secondary" aria-pressed="false" className="text-sm">
                    <Settings className="size-4" aria-hidden="true" />
                    {ja("\u7ba1\u7406\u8005\u753b\u9762")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
                <input id="importDevicesInput" type="file" accept=".json,application/json" hidden />
                <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-slate-400">
                  <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="sr-only">{ja("\u691c\u7d22")}</span>
                  <input
                    id="searchInput"
                    type="search"
                    placeholder={ja("\u88c5\u7f6e\u540d\u3067\u691c\u7d22")}
                    className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </label>
                <div className="device-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" id="deviceGrid" />
              </CardContent>
            </Card>
          </section>
        </main>

        <DriveImportView isActive={activeView === "drive"} />
        {activeView === "edit" && editingDevice && (
          <DeviceEditView device={editingDevice} onCancel={() => goToView("device")} onSave={saveEditedDevice} />
        )}
      </div>
    </>
  );
}

function DriveImportView({ isActive }: { isActive: boolean }) {
  return (
    <main className={isActive ? "px-3 py-4 sm:px-5 sm:py-6 lg:px-7" : "hidden"}>
      <section className={isActive ? "view is-active" : "view"} id="driveView" aria-labelledby="driveTitle">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_minmax(320px,1fr)_minmax(380px,1.35fr)]">
          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm lg:col-span-3">
            <CardHeader className="gap-4 p-4 sm:flex sm:flex-row sm:items-end sm:justify-between sm:p-5 lg:p-6">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Drive Import</p>
                <CardTitle id="driveTitle" className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                  {ja("Google Drive\u540c\u671f")}
                </CardTitle>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {ja("Drive\u304b\u3089PDF\u3092\u8aad\u307f\u8fbc\u307f\u3001\u5de5\u7a0b\u30ab\u30fc\u30c9\u3092\u4f5c\u6210\u3057\u307e\u3059\u3002")}
                </p>
              </div>
              <Button className="w-full sm:w-auto" id="syncDriveButton" type="button">
                <FolderSync className="size-4" aria-hidden="true" />
                {ja("\u540c\u671f")}
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-[1fr_auto] sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">{ja("Drive\u30d5\u30a9\u30eb\u30c0URL")}</span>
                <Input id="driveFolderInput" type="url" className="min-h-11 rounded-lg bg-slate-50" placeholder="https://drive.google.com/drive/folders/..." />
              </label>
              <div className="grid gap-2 sm:min-w-40">
                <span className="text-sm font-semibold text-slate-700">{ja("\u72b6\u614b")}</span>
                <div className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500" id="driveStatus">
                  {ja("\u672a\u540c\u671f")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Folder className="size-4 text-slate-500" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-slate-950">{ja("\u5927\u5206\u985e")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div id="categoryList" className="category-list grid max-h-[42vh] gap-2 overflow-auto pr-1 lg:max-h-[58vh]" />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-slate-500" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-slate-950">{ja("\u88c5\u7f6ePDF")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div id="pdfList" className="pdf-list grid max-h-[42vh] gap-2 overflow-auto pr-1 lg:max-h-[58vh]" />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-4 p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-slate-500" aria-hidden="true" />
                    <CardTitle className="text-base font-bold text-slate-950">{ja("\u5206\u5272\u30d7\u30ec\u30d3\u30e5\u30fc")}</CardTitle>
                  </div>
                  <p id="previewDeviceName" className="mt-2 text-sm leading-6 text-slate-600">
                    {ja("PDF\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002")}
                  </p>
                  <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
                    {ja("\u767b\u9332\u30bf\u30a4\u30c8\u30eb")}
                    <Input id="previewDeviceTitleInput" type="text" className="min-h-10 rounded-lg bg-slate-50" placeholder={ja("\u88c5\u7f6e\u4e00\u89a7\u306b\u767b\u9332\u3059\u308b\u30bf\u30a4\u30c8\u30eb")} />
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[320px]">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    {ja("\u5206\u5272")}
                    <select id="splitModeSelect" className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400" defaultValue="normal">
                      <option value="normal">{ja("\u6a19\u6e96")}</option>
                      <option value="fine">{ja("\u7d30\u304b\u304f")}</option>
                      <option value="extra">{ja("\u304b\u306a\u308a\u7d30\u304b\u304f")}</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    {ja("\u307e\u3068\u3081")}
                    <select id="mergeModeSelect" className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400" defaultValue="normal">
                      <option value="weak">{ja("\u5f31")}</option>
                      <option value="normal">{ja("\u6a19\u6e96")}</option>
                      <option value="strong">{ja("\u5f37")}</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button id="openPdfButton" type="button" variant="outline" className="text-sm">
                  <FileText className="size-4" aria-hidden="true" />
                  {ja("PDF\u78ba\u8a8d")}
                </Button>
                <Button id="autoSplitButton" type="button" className="text-sm">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {ja("\u81ea\u52d5\u5206\u5272")}
                </Button>
                <Button id="registerPreviewButton" type="button" variant="secondary" className="text-sm">
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

function DeviceEditView({
  device,
  onCancel,
  onSave,
}: {
  device: Device;
  onCancel: () => void;
  onSave: (device: Device) => void;
}) {
  const [title, setTitle] = React.useState(device.name);
  const [steps, setSteps] = React.useState<Step[]>(
    device.steps.map((step) => ({ ...step, popupEnabled: isPopupEnabled(step), checks: normalizeChecks(step.checks) }))
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
      steps: steps.map((step) => ({ ...step, popupEnabled: isPopupEnabled(step), checks: normalizeChecks(step.checks) })),
    });
  }

  return (
    <main className="px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
      <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="gap-4 p-4 sm:flex sm:flex-row sm:items-end sm:justify-between sm:p-5 lg:p-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Admin Edit</p>
            <CardTitle className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
              {ja("\u7ba1\u7406\u8005\u7de8\u96c6")}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="" onClick={onCancel}>
              {ja("\u623b\u308b")}
            </Button>
            <Button type="button" className="" onClick={handleSave}>
              <Check className="size-4" aria-hidden="true" />
              {ja("\u4fdd\u5b58")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            {ja("\u88c5\u7f6e\u540d")}
            <Input value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 rounded-lg" />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">{ja("\u5de5\u7a0b\u4e00\u89a7")}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {ja("POP\u78ba\u8a8d\u3092ON\u306b\u3059\u308b\u3068\u3001\u95b2\u89a7\u6642\u306b\u6b21\u3078\u9032\u3080\u524d\u306e\u78ba\u8a8d\u753b\u9762\u304c\u8868\u793a\u3055\u308c\u307e\u3059\u3002")}
              </p>
            </div>
            <Button type="button" className="" onClick={addStep} variant="secondary">
              <Layers className="size-4" aria-hidden="true" />
              {ja("\u5de5\u7a0b\u3092\u8ffd\u52a0")}
            </Button>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <section key={`${device.id}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-950">
                    {ja("\u5de5\u7a0b")} {index + 1}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="icon" className="" onClick={() => moveStep(index, -1)} disabled={index === 0} title={ja("\u4e0a\u306b\u79fb\u52d5")}>
                      <ChevronUp className="size-4" aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} title={ja("\u4e0b\u306b\u79fb\u52d5")}>
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="" onClick={() => deleteStep(index)} disabled={steps.length <= 1}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      {ja("\u524a\u9664")}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
                  <div className="grid gap-2">
                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      {ja("\u5de5\u7a0b\u30bf\u30a4\u30c8\u30eb")}
                      <Input
                        value={step.title}
                        onChange={(event) => updateStep(index, { ...step, title: event.target.value })}
                        className="min-h-10 rounded-lg bg-white"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      {ja("\u30e1\u30e2")}
                      <textarea
                        value={step.memo}
                        onChange={(event) => updateStep(index, { ...step, memo: event.target.value })}
                        className="min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      />
                    </label>
                  </div>

                  <div className="grid content-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <label className="flex items-center gap-3 text-sm font-bold text-slate-900">
                      <input
                        type="checkbox"
                        checked={isPopupEnabled(step)}
                        onChange={(event) => updateStep(index, { ...step, popupEnabled: event.target.checked })}
                        className="size-5 accent-amber-600"
                      />
                      {ja("POP\u78ba\u8a8d\u3092\u8868\u793a")}
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      {ja("\u78ba\u8a8d\u9805\u76ee")}
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

          <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" className="" onClick={addStep}>
              <Layers className="size-4" aria-hidden="true" />
              {ja("\u5de5\u7a0b\u3092\u8ffd\u52a0")}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="" onClick={onCancel}>
                {ja("\u623b\u308b")}
              </Button>
              <Button type="button" className="" onClick={handleSave}>
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
