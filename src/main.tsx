import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { FolderSync, Import, Search, Settings, Upload } from "lucide-react";
import { DeviceEditView } from "@/components/DeviceEditView";
import { DeviceGrid } from "@/components/device/DeviceGrid";
import { DriveImportView } from "@/components/drive/DriveImportView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Device, LegacyWindow } from "@/types";
import "./styles.css";

function AppTopScreen() {
  const [activeView, setActiveView] = React.useState<"device" | "drive" | "edit">("device");
  const [editingDevice, setEditingDevice] = React.useState<Device | null>(null);

  React.useEffect(() => {
    const backBtn = document.getElementById("backButton");
    const handleBack = () => {
      if (activeView !== "device") {
        setActiveView("device");
        setEditingDevice(null);
        (window as LegacyWindow).renderDevices?.();
      }
    };
    backBtn?.addEventListener("click", handleBack);

    (window as any).goToEditView = (device: Device) => {
      setEditingDevice(device);
      setActiveView("edit");
      if (typeof (window as any).showView === "function") {
        (window as any).showView("device");
      } else {
        switchLegacyView("device");
      }
    };

    (window as any).autoSyncDriveFolder?.();

    return () => {
      backBtn?.removeEventListener("click", handleBack);
      delete (window as any).goToEditView;
    };
  }, [activeView]);

  function goToView(name: "device" | "drive") {
    setActiveView(name);
    setEditingDevice(null);
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

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-[#1a2535]">
      <main className={activeView === "device" ? "px-4 py-5 sm:px-6 sm:py-6 lg:px-8" : "hidden"}>
        <section className="view is-active" id="deviceView" aria-labelledby="deviceTitle">
          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
            <CardHeader className="gap-4 p-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-[#56687a]">Device Library</p>
                <CardTitle id="deviceTitle" className="mt-1 text-2xl font-bold text-[#1a2535] sm:text-3xl">
                  装置選択
                </CardTitle>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#56687a]">
                  Google Driveで管理している組立標準を選択し、閲覧・取り込みを行います。
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button id="exportDevicesButton" type="button" variant="outline">
                  <Upload className="size-4" aria-hidden="true" />
                  書き出し
                </Button>
                <Button id="importDevicesButton" type="button" variant="outline">
                  <Import className="size-4" aria-hidden="true" />
                  読み込み
                </Button>
                <Button id="manageModeButton" type="button" variant="secondary" aria-pressed="false">
                  <Settings className="size-4" aria-hidden="true" />
                  管理者画面
                </Button>
                <Button id="openDriveButton" type="button" onClick={() => goToView("drive")}>
                  <FolderSync className="size-4" aria-hidden="true" />
                  Drive同期
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 pt-0 sm:p-6 sm:pt-0">
              <input id="importDevicesInput" type="file" accept=".json,application/json" hidden />
              <label className="flex min-h-[52px] items-center gap-3 rounded-lg border border-[#c8d4e0] bg-[#f8fafc] px-4 focus-within:border-[#1568c8] focus-within:ring-2 focus-within:ring-[#1568c8]/20">
                <Search className="size-5 shrink-0 text-[#56687a]" aria-hidden="true" />
                <span className="sr-only">検索</span>
                <input
                  id="searchInput"
                  type="search"
                  placeholder="装置名で検索"
                  className="min-h-[48px] w-full bg-transparent text-base outline-none placeholder:text-[#9ab0c8]"
                />
              </label>
              <DeviceGrid />
            </CardContent>
          </Card>
        </section>
      </main>

      <DriveImportView isActive={activeView === "drive"} />
      {activeView === "edit" && editingDevice && (
        <DeviceEditView device={editingDevice} onCancel={() => goToView("device")} onSave={saveEditedDevice} />
      )}
    </div>
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

const legacyBasePath =
  window.location.protocol === "file:" && window.location.pathname.replaceAll("\\", "/").includes("/dist/")
    ? "../"
    : "";

loadLegacyScript(`${legacyBasePath}config.js`, () => {
  loadLegacyScript(`${legacyBasePath}app.js`);
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
