import { FolderSync, Import, Search, Settings, Upload } from "lucide-react";
import { DeviceGrid } from "@/components/device/DeviceGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  isActive: boolean;
  onOpenDrive: () => void;
};

export function DeviceLibraryView({ isActive, onOpenDrive }: Props) {
  return (
    <main className={isActive ? "px-4 py-5 sm:px-6 sm:py-6 lg:px-8" : "hidden"}>
      <section className="view is-active" id="deviceView" aria-labelledby="deviceTitle">
        <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
          <CardHeader className="gap-4 p-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-[#56687a]">Device Library</p>
              <CardTitle id="deviceTitle" className="mt-1 text-2xl font-bold text-[#1a2535] sm:text-3xl">
                装置選択
              </CardTitle>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#56687a]">
                Google Driveで管理している組立標準を選択し、閲覧・取り込み作業を行います。
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
              <Button id="openDriveButton" type="button" onClick={onOpenDrive}>
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
  );
}
