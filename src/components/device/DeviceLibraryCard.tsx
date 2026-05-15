import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FolderOpen, Import, Search, Settings, Upload } from "lucide-react";

type Props = {
  onOpenDrive: () => void;
};

export function DeviceLibraryCard({ onOpenDrive }: Props) {
  return (
    <Card className="rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.35)]">
      <CardHeader className="gap-4 p-6 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Device Library</p>
          <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            装置ライブラリ
          </CardTitle>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Google Driveで管理している組立標準を選択し、閲覧・取り込み作業を進めます。
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button id="exportDevicesButton" type="button" variant="outline" className="text-sm">
            <Upload className="size-4" aria-hidden="true" />
            書き出し
          </Button>
          <Button id="importDevicesButton" type="button" variant="outline" className="text-sm">
            <Import className="size-4" aria-hidden="true" />
            読み込み
          </Button>
          <Button id="openDriveButton" type="button" className="text-sm" onClick={onOpenDrive}>
            <FolderOpen className="size-4" aria-hidden="true" />
            Drive同期
          </Button>
          <Button id="manageModeButton" type="button" variant="secondary" className="text-sm">
            <Settings className="size-4" aria-hidden="true" />
            管理者画面
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 p-6 pt-0">
        <input id="importDevicesInput" type="file" accept=".json,application/json" hidden />
        <label className="flex min-h-[3rem] items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 focus-within:border-slate-400">
          <Search className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            id="searchInput"
            type="search"
            placeholder="装置名で検索"
            className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
          />
        </label>
        <div id="deviceGrid" className="device-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3" />
      </CardContent>
    </Card>
  );
}
