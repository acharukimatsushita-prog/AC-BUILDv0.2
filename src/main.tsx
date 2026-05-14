import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { ColumnDef } from "@tanstack/react-table";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import "./styles.css";

type TableProbeRow = {
  id: string;
  name: string;
};

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

const tableProbeColumns: ColumnDef<TableProbeRow>[] = [];

function AppTopScreen() {
  const [activeView, setActiveView] = React.useState<"device" | "drive" | "edit">("device");
  const [editingDevice, setEditingDevice] = React.useState<Device | null>(null);
  void tableProbeColumns;
  void Select;

  React.useEffect(() => {
    const handlers = [
      bindClick("backButton", () => {
        if (activeView === "edit") {
          goToView("device");
        } else {
          goToView("device");
        }
      }),
      bindClick("openDriveButton", () => goToView("drive")),
      bindClick("fullscreenButton", toggleBrowserFullscreen),
      bindClick("exportDevicesButton", () => callLegacy("exportDevices")),
      bindClick("importDevicesButton", () => {
        document.querySelector<HTMLInputElement>("#react-root #importDevicesInput")?.click();
      }),
    ];

    // Expose edit view function to legacy code
    (window as unknown as Record<string, unknown>).goToEditView = (device: Device) => {
      setEditingDevice(device);
      setActiveView("edit");
    };

    return () => {
      handlers.forEach((dispose) => dispose());
      delete (window as unknown as Record<string, unknown>).goToEditView;
    };
  }, [activeView]);

  function goToView(name: "device" | "drive" | "edit", device?: Device) {
    if (activeView === name && name !== "edit") return;
    setActiveView(name);
    if (name === "edit" && device) {
      setEditingDevice(device);
    } else if (name !== "edit") {
      setEditingDevice(null);
    }
    switchLegacyView(name === "edit" ? "device" : name);

    if (name === "device") {
      const legacyRenderDevices = (window as unknown as { renderDevices?: () => void }).renderDevices;
      legacyRenderDevices?.();
    }
  }

  return (
    <>
      <style>
        {`
          .app-shell > .topbar,
          .app-shell > main > #deviceView,
          .app-shell > main > #driveView {
            display: none !important;
          }
        `}
      </style>
      <div className="bg-[#f5f7fa] text-[#1b2430]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-5 lg:px-7">
          <div className="grid grid-cols-[44px_1fr_44px] items-center gap-3 sm:grid-cols-[52px_1fr_52px]">
            <Button
              id="backButton"
              type="button"
              variant="outline"
              size="icon"
              aria-label="戻る"
              title="戻る"
              className="size-11 rounded-lg sm:size-[52px]"
              onClick={() => {
                if (activeView === "edit") {
                  goToView("device");
                } else {
                  goToView("device");
                }
              }}
              style={{ visibility: activeView === "device" ? "hidden" : "visible" }}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Assembly Standard Viewer
              </p>
              <h1 className="truncate text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                AC-BUILD
              </h1>
              <p className="mt-1 text-xs font-bold text-emerald-700 sm:text-sm">
                試作 v0.1 / Google Drive運用モデル
              </p>
            </div>
            <Button
              id="fullscreenButton"
              type="button"
              variant="outline"
              size="icon"
              aria-label="全画面"
              title="全画面"
              className="size-11 rounded-lg sm:size-[52px]"
            >
              <Expand className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <main
          data-react-top-main
          className={activeView === "device" ? "px-3 py-4 sm:px-5 sm:py-6 lg:px-7" : "hidden"}
        >
          <section
            className="view is-active"
            id="deviceView"
            aria-labelledby="deviceTitle"
          >
            <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
              <CardHeader className="gap-4 p-4 sm:flex sm:flex-row sm:items-end sm:justify-between sm:p-5 lg:p-6">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    Device Library
                  </p>
                  <CardTitle
                    id="deviceTitle"
                    className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl"
                  >
                    装置選択
                  </CardTitle>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Google Driveで管理している組立標準を選択し、閲覧・取り込みを行います。
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                  <Button id="exportDevicesButton" type="button" variant="outline" className="text-sm">
                    <Upload className="size-4" aria-hidden="true" />
                    書き出し
                  </Button>
                  <Button id="importDevicesButton" type="button" variant="outline" className="text-sm">
                    <Import className="size-4" aria-hidden="true" />
                    読み込み
                  </Button>
                  <Button
                    id="openDriveButton"
                    type="button"
                    onClick={() => goToView("drive")}
                    className="text-sm"
                  >
                    <FolderSync className="size-4" aria-hidden="true" />
                    Drive同期
                  </Button>
                  <Button
                    id="manageModeButton"
                    type="button"
                    variant="secondary"
                    aria-pressed="false"
                    className="text-sm"
                  >
                    <Settings className="size-4" aria-hidden="true" />
                    管理者画面
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
                <input
                  id="importDevicesInput"
                  type="file"
                  accept=".json,application/json"
                  hidden
                />

                <label className="mb-4 flex min-h-12 w-full max-w-2xl items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-slate-400 focus-within:bg-white">
                  <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <span className="sr-only">検索</span>
                  <input
                    id="searchInput"
                    type="search"
                    placeholder="装置名で検索"
                    className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </label>

                <div
                  className="device-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                  id="deviceGrid"
                />
              </CardContent>
            </Card>
          </section>
        </main>
        <DriveImportView isActive={activeView === "drive"} />
        {activeView === "edit" && editingDevice && <DeviceEditView device={editingDevice} onCancel={() => {
          goToView("device");
        }} onSave={(updated) => {
          const legacyDevices = (window as unknown as { devices?: Device[] }).devices;
          if (legacyDevices) {
            const index = legacyDevices.findIndex(d => d.id === updated.id);
            if (index !== -1) {
              legacyDevices[index] = updated;
              const saveDevices = (window as unknown as { saveDevices?: () => void }).saveDevices;
              saveDevices?.();
            }
          }
          goToView("device");
        }} />}
      </div>
    </>
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
  return normalizeChecks(checks).map((check) => check.text).join("\n");
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
    device.steps.map((step) => ({
      ...step,
      popupEnabled: isPopupEnabled(step),
      checks: normalizeChecks(step.checks),
    }))
  );

  const addStep = () => {
    const newStep: Step = { title: "新しい工程", memo: "", image: "", popupEnabled: false, checks: [] };
    setSteps([...steps, newStep]);
  };

  const deleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const updatePopupEnabled = (index: number, enabled: boolean) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], popupEnabled: enabled };
    setSteps(newSteps);
  };

  const updateStepChecks = (index: number, value: string) => {
    const checks = textToChecks(value);
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      checks,
      popupEnabled: checks.length > 0 ? true : newSteps[index].popupEnabled,
    };
    setSteps(newSteps);
  };

  const handleSave = () => {
    onSave({
      ...device,
      name: title,
      steps: steps.map((step) => ({
        ...step,
        popupEnabled: isPopupEnabled(step),
        checks: normalizeChecks(step.checks),
      })),
    });
  };

  return (
    <main className="px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
      <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="gap-4 p-4 sm:flex sm:flex-row sm:items-end sm:justify-between sm:p-5 lg:p-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Admin Edit</p>
            <CardTitle className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
              管理者画面
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              工程タイトル、説明、閲覧時に表示するPOP確認を編集します。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
            <Button type="button" onClick={handleSave}>
              <Check className="size-4" aria-hidden="true" />
              保存
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            装置名
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-11 rounded-lg" />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">工程一覧</h3>
              <p className="mt-1 text-sm text-slate-600">POP確認をONにすると、閲覧時に次へ進む前の確認画面が表示されます。</p>
            </div>
            <Button type="button" onClick={addStep} variant="secondary">
              <Layers className="size-4" aria-hidden="true" />
              工程を追加
            </Button>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => {
              const popupEnabled = isPopupEnabled(step);
              return (
                <section key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)_minmax(280px,0.9fr)]">
                    <div className="grid content-start gap-2">
                      <div className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-bold text-white">
                        工程 {index + 1}
                      </div>
                      <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                        <Button type="button" variant="outline" size="icon" onClick={() => moveStep(index, -1)} disabled={index === 0} title="上に移動">
                          <ChevronUp className="size-4" aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} title="下に移動">
                          <ChevronDown className="size-4" aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={() => deleteStep(index)} className="text-red-600 hover:bg-red-50" title="削除">
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <label className="grid gap-1 text-sm font-semibold text-slate-700">
                        タイトル
                        <Input value={step.title} onChange={(e) => updateStep(index, "title", e.target.value)} className="min-h-10 rounded-lg bg-white" />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-slate-700">
                        説明
                        <textarea
                          value={step.memo}
                          onChange={(e) => updateStep(index, "memo", e.target.value)}
                          className="min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                        />
                      </label>
                    </div>

                    <div className="grid content-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <label className="flex items-center gap-3 text-sm font-bold text-slate-900">
                        <input
                          type="checkbox"
                          checked={popupEnabled}
                          onChange={(e) => updatePopupEnabled(index, e.target.checked)}
                          className="size-5 accent-amber-600"
                        />
                        POP確認を表示
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-slate-700">
                        確認項目（1行1項目）
                        <textarea
                          value={checksToText(step.checks)}
                          onChange={(e) => updateStepChecks(index, e.target.value)}
                          disabled={!popupEnabled}
                          placeholder="例: ネジの締め忘れがないか確認した"
                          className="min-h-28 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </label>
                      <p className="text-xs leading-5 text-slate-600">閲覧時に次の工程へ進む前、ここに入力した項目をチェックするPOPが表示されます。</p>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={addStep}>
              <Layers className="size-4" aria-hidden="true" />
              工程を追加
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
              <Button type="button" onClick={handleSave}>
                <Check className="size-4" aria-hidden="true" />
                保存
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
function DriveImportView({ isActive }: { isActive: boolean }) {
  return (
    <main
      data-react-drive-main
      className={isActive ? "px-3 py-4 sm:px-5 sm:py-6 lg:px-7" : "hidden"}
    >
      <section
        className={isActive ? "view is-active" : "view"}
        id="driveView"
        aria-labelledby="driveTitle"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_minmax(320px,1fr)_minmax(380px,1.35fr)]">
          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm lg:col-span-3">
            <CardHeader className="gap-4 p-4 sm:flex sm:flex-row sm:items-end sm:justify-between sm:p-5 lg:p-6">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Drive Import
                </p>
                <CardTitle
                  id="driveTitle"
                  className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl"
                >
                  Google Drive同期
                </CardTitle>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Driveフォルダから装置PDFを読み込み、分割候補を確認して工程カードを作成します。
                </p>
              </div>
              <Button className="w-full sm:w-auto" id="syncDriveButton" type="button">
                <FolderSync className="size-4" aria-hidden="true" />
                同期
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-[1fr_auto] sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  DriveフォルダURL
                </span>
                <Input
                  id="driveFolderInput"
                  type="url"
                  className="min-h-11 rounded-lg bg-slate-50"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </label>
              <div className="grid gap-2 sm:min-w-40">
                <span className="text-sm font-semibold text-slate-700">
                  迥ｶ諷・                </span>
                <div
                  className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500"
                  id="driveStatus"
                >
                  未同期
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Folder className="size-4 text-slate-500" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-slate-950">
                  大分類
                </CardTitle>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                同期したフォルダ分類を選択します。
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div
                id="categoryList"
                className="category-list grid max-h-[42vh] gap-2 overflow-auto pr-1 lg:max-h-[58vh]"
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-slate-500" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-slate-950">
                  装置PDF
                </CardTitle>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                分割したいPDFを選択します。
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div
                id="pdfList"
                className="pdf-list grid max-h-[42vh] gap-2 overflow-auto pr-1 lg:max-h-[58vh]"
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
            <CardHeader className="gap-4 p-4 sm:p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-slate-500" aria-hidden="true" />
                    <CardTitle className="text-base font-bold text-slate-950">
                      分割プレビュー
                    </CardTitle>
                  </div>
                  <p
                    id="previewDeviceName"
                    className="mt-2 text-sm leading-6 text-slate-600"
                  >
                    PDFを選択してください。
                  </p>
                  <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
                    登録タイトル
                    <Input
                      id="previewDeviceTitleInput"
                      type="text"
                      className="min-h-10 rounded-lg bg-slate-50"
                      placeholder="装置一覧に登録するタイトル"
                    />
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[320px]">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    分割
                    <select
                      id="splitModeSelect"
                      className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      defaultValue="normal"
                    >
                      <option value="normal">標準</option>
                      <option value="fine">細かく</option>
                      <option value="extra">かなり細かく</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    まとめ
                    <select
                      id="mergeModeSelect"
                      className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      defaultValue="normal"
                    >
                      <option value="weak">弱</option>
                      <option value="normal">標準</option>
                      <option value="strong">強</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button id="openPdfButton" type="button" variant="outline" className="text-sm">
                  <FileText className="size-4" aria-hidden="true" />
                  PDF確認
                </Button>
                <Button id="autoSplitButton" type="button" className="text-sm">
                  <Sparkles className="size-4" aria-hidden="true" />
                  閾ｪ蜍募・蜑ｲ
                </Button>
                <Button id="registerPreviewButton" type="button" variant="secondary" className="text-sm">
                  <ListChecks className="size-4" aria-hidden="true" />
                  一覧へ追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div
                className="setup-note preview-notice mb-3"
                id="previewNotice"
              >
                <strong>タイトルとPOP確認は手動編集できます</strong>
                <span>
                  自動分割後、各カードで工程タイトルと閲覧時のPOP確認を編集してください。
                </span>
              </div>
              <div
                id="splitPreviewGrid"
                className="split-preview-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
              />
            </CardContent>
          </Card>
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
  document
    .querySelectorAll<HTMLElement>(".app-shell .view")
    .forEach((view) => {
      view.classList.toggle("is-active", view.id === `${name}View`);
    });
}

function bindClick(id: string, handler: () => void) {
  const element = document.querySelector<HTMLElement>(`#react-root #${id}`);
  if (!element) return () => undefined;

  const listener = (event: MouseEvent) => {
    event.preventDefault();
    handler();
  };

  element.addEventListener("click", listener);
  return () => element.removeEventListener("click", listener);
}

function callLegacy(name: string) {
  const action = (window as unknown as Record<string, unknown>)[name];
  if (typeof action === "function") {
    action();
  }
}

function toggleBrowserFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }

  void document.documentElement.requestFullscreen?.();
}
