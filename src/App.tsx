import * as React from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DeviceLibraryView } from "@/components/device/DeviceLibraryView";
import { DriveImportView } from "@/components/drive/DriveImportView";
import { DeviceEditView } from "@/components/DeviceEditView";
import { PreviewModal } from "@/components/slide/PreviewModal";
import { SlideView } from "@/components/slide/SlideView";
import type { Device, LegacyWindow } from "@/types";

export function App() {
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

    (window as LegacyWindow).goToEditView = (device: Device) => {
      setEditingDevice(device);
      setActiveView("edit");
      switchLegacyView("device");
    };

    (window as LegacyWindow).autoSyncDriveFolder?.();

    return () => {
      backBtn?.removeEventListener("click", handleBack);
      delete (window as LegacyWindow).goToEditView;
    };
  }, [activeView]);

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

  return (
    <div className="app-shell min-h-screen bg-[#f0f4f8] text-[#1a2535]">
      <AppHeader />
      <DeviceLibraryView isActive={activeView === "device"} onOpenDrive={() => goToView("drive")} />
      <DriveImportView isActive={activeView === "drive"} />
      {activeView === "edit" && editingDevice ? (
        <DeviceEditView device={editingDevice} onCancel={() => goToView("device")} onSave={saveEditedDevice} />
      ) : null}
      <SlideView />
      <PreviewModal />
    </div>
  );
}

function switchLegacyView(name: "device" | "drive" | "slide") {
  if (typeof (window as LegacyWindow).showView === "function") {
    (window as LegacyWindow).showView?.(name);
    return;
  }

  document.querySelectorAll<HTMLElement>(".app-shell .view").forEach((view) => {
    const isActive = view.id === `${name}View`;
    view.classList.toggle("is-active", isActive);
    if (view.parentElement?.tagName === "MAIN") {
      view.parentElement.hidden = !isActive;
    }
  });
}
