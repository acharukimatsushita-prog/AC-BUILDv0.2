import * as React from "react";
import type { Device, LegacyWindow } from "@/types";

type AcBuildeWindow = LegacyWindow & {
  __reactDeviceGridRefresh?: () => void;
  canManageDevice?: (deviceId: string) => boolean;
  openDevice?: (device: Device) => void;
  deleteDeviceById?: (deviceId: string) => void | Promise<void>;
};

function getQuery() {
  const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
  return searchInput?.value.trim().toLowerCase() ?? "";
}

export function DeviceGrid() {
  const [revision, setRevision] = React.useState(0);

  React.useEffect(() => {
    const win = window as AcBuildeWindow;
    win.__reactDeviceGridRefresh = () => setRevision((value) => value + 1);
    win.renderDevices?.();

    return () => {
      delete win.__reactDeviceGridRefresh;
    };
  }, []);

  const win = window as AcBuildeWindow;
  const devices = win.devices ?? [];
  const query = getQuery();
  const filtered = devices.filter((device) => device.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    return (
      <div id="deviceGrid" className="device-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <p className="col-span-full rounded-lg border border-dashed border-[#c8d4e0] bg-[#f8fafc] px-4 py-8 text-center text-sm text-[#56687a]">
          表示できる装置がありません。
        </p>
      </div>
    );
  }

  return (
    <div id="deviceGrid" className="device-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((device) => {
        const canManage = win.canManageDevice?.(device.id) ?? false;
        return (
          <article key={device.id} className="device-card">
            <div className="device-card-header">
              <span className="device-update-date">
                {device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : "更新情報なし"}
              </span>
            </div>
            <div className="device-card-body">
              <div className="device-title-row">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="device-type-icon"
                  aria-hidden="true"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <h3>{device.name}</h3>
              </div>
              <div className="device-meta">
                <span className="badge badge-neutral">{device.steps.length}工程</span>
              </div>
            </div>
            <div className="device-card-actions">
              <button
                className={`open-device-button ${canManage ? "has-siblings" : "w-full"}`}
                type="button"
                onClick={() => win.openDevice?.(device)}
              >
                表示
              </button>
              {canManage ? (
                <div className="admin-buttons">
                  <button
                    className="edit-device-button mini-button"
                    type="button"
                    onClick={() => win.goToEditView?.(device)}
                  >
                    編集
                  </button>
                  <button
                    className="delete-device-button danger-button mini-button"
                    type="button"
                    onClick={() => void win.deleteDeviceById?.(device.id)}
                  >
                    削除
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
