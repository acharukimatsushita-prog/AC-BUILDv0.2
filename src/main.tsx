import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ExternalLink, FolderSync, Globe, Import, RefreshCw, Search, Settings, Upload } from "lucide-react";
import { DeviceEditView } from "@/components/DeviceEditView";
import { DeviceGrid } from "@/components/device/DeviceGrid";
import { DriveImportView } from "@/components/drive/DriveImportView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Device, LegacyWindow } from "@/types";
import "./styles.css";

function AppTopScreen() {
  const [activeView, setActiveView] = React.useState<"device" | "drive" | "edit" | "browser">("device");
  const [editingDevice, setEditingDevice] = React.useState<Device | null>(null);
  const [browserUrl, setBrowserUrl] = React.useState<string>("https://www.google.com");

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

    (window as any).openInAppBrowser = (url: string) => {
      let targetUrl = url;
      if (targetUrl.includes("drive.google.com") && targetUrl.includes("/view")) {
        targetUrl = targetUrl.replace("/view", "/preview");
      }
      goToView("browser", targetUrl);
    };

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

  function goToView(name: "device" | "drive" | "browser", url?: string) {
    setActiveView(name);
    setEditingDevice(null);
    if (url) setBrowserUrl(url);
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
                <Button id="openBrowserButton" type="button" variant="outline" onClick={() => goToView("browser")}>
                  <Globe className="size-4" aria-hidden="true" />
                  ブラウザ
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
      <SimpleBrowserView isActive={activeView === "browser"} url={browserUrl} setUrl={setBrowserUrl} />
      {activeView === "edit" && editingDevice && (
        <DeviceEditView device={editingDevice} onCancel={() => goToView("device")} onSave={saveEditedDevice} />
      )}
    </div>
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
      target = `https://${target}`;
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
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleRefresh} title="更新">
              <RefreshCw className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => window.open(url, "_blank")}
              title="新規タブで開く"
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
            ※X-Frame-Options制限により表示できないサイトがあります。その場合は右上のアイコンから別タブで開いてください。
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
