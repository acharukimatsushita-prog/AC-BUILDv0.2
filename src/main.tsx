import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
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

const tableProbeColumns: ColumnDef<TableProbeRow>[] = [];

function AppTopScreen() {
  const [activeView, setActiveView] = React.useState<"device" | "drive">("device");
  void tableProbeColumns;
  void Select;

  React.useEffect(() => {
    const handlers = [
      bindClick("backButton", () => goToView("device")),
      bindClick("openDriveButton", () => goToView("drive")),
      bindClick("fullscreenButton", toggleBrowserFullscreen),
      bindClick("exportDevicesButton", () => callLegacy("exportDevices")),
      bindClick("importDevicesButton", () => {
        document.querySelector<HTMLInputElement>("#react-root #importDevicesInput")?.click();
      }),
      bindClick("manageModeButton", () => callLegacy("toggleManageMode")),
    ];

    return () => {
      handlers.forEach((dispose) => dispose());
    };
  });

  function goToView(name: "device" | "drive") {
    setActiveView(name);
    switchLegacyView(name);
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
              onClick={() => goToView("device")}
              style={{ visibility: activeView === "device" ? "hidden" : "visible" }}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Assembly Standard Viewer
              </p>
              <h1 className="truncate text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                AC-BUILDE
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
                  <Button id="exportDevicesButton" type="button" variant="outline">
                    <Upload className="size-4" aria-hidden="true" />
                    書き出し
                  </Button>
                  <Button id="importDevicesButton" type="button" variant="outline">
                    <Import className="size-4" aria-hidden="true" />
                    読み込み
                  </Button>
                  <Button
                    id="openDriveButton"
                    type="button"
                    onClick={() => goToView("drive")}
                  >
                    <FolderSync className="size-4" aria-hidden="true" />
                    Drive同期
                  </Button>
                  <Button
                    id="manageModeButton"
                    type="button"
                    variant="secondary"
                    aria-pressed="false"
                  >
                    <Settings className="size-4" aria-hidden="true" />
                    Manage
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
      </div>
    </>
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
                  状態
                </span>
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
                <Button id="openPdfButton" type="button" variant="outline">
                  <FileText className="size-4" aria-hidden="true" />
                  PDF確認
                </Button>
                <Button id="autoSplitButton" type="button">
                  <Sparkles className="size-4" aria-hidden="true" />
                  自動分割
                </Button>
                <Button id="registerPreviewButton" type="button" variant="secondary">
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
                <strong>タイトルは手動編集できます</strong>
                <span>
                  自動分割後、各カードの入力欄で工程タイトルを編集してください。
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
    event.stopImmediatePropagation();
    handler();
  };

  element.addEventListener("click", listener, { capture: true });
  return () => element.removeEventListener("click", listener, { capture: true });
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
