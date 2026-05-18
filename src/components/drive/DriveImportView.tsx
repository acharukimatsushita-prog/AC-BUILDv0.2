import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Folder, FolderSync, Globe, Layers, ListChecks, Sparkles } from "lucide-react";

export function DriveImportView({ isActive }: { isActive: boolean }) {
  return (
    <main className={isActive ? "px-4 py-5 sm:px-6 sm:py-6 lg:px-8" : "hidden"}>
      <section className={isActive ? "view is-active" : "view"} id="driveView" aria-labelledby="driveTitle">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_minmax(320px,1fr)_minmax(380px,1.35fr)]">
          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow lg:col-span-3">
            <CardHeader className="gap-4 p-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-[#56687a]">Drive Import</p>
                <CardTitle id="driveTitle" className="mt-1 text-2xl font-bold text-[#1a2535] sm:text-3xl">
                  Google Drive同期
                </CardTitle>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#56687a]">
                  DriveからPDFを読み込み、工程カードを作成します。
                </p>
              </div>
              <Button className="w-full sm:w-auto" id="syncDriveButton" type="button" size="lg">
                <FolderSync className="size-5" aria-hidden="true" />
                同期
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-0 sm:grid-cols-[1fr_auto] sm:p-6 sm:pt-0">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#1a2535]">DriveフォルダURL</span>
                <Input
                  id="driveFolderInput"
                  type="url"
                  className="min-h-[44px] rounded-lg bg-[#f8fafc] text-base"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </label>
              <div className="grid gap-2 sm:min-w-40">
                <span className="text-sm font-bold text-[#1a2535]">状態</span>
                <div
                  className="flex min-h-[44px] items-center rounded-lg border border-[#c8d4e0] bg-[#f8fafc] px-3 text-sm font-bold text-[#56687a]"
                  id="driveStatus"
                >
                  未同期
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Folder className="size-5 text-[#1a3660]" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-[#1a2535]">大分類</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <div
                id="categoryList"
                className="category-list grid max-h-[42vh] gap-2 overflow-auto pr-1 lg:max-h-[58vh]"
              />
            </CardContent>
          </Card>

          <Card className="rounded-lg border-[#c8d4e0] bg-white py-0 shadow">
            <CardHeader className="gap-2 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#1a3660]" aria-hidden="true" />
                <CardTitle className="text-base font-bold text-[#1a2535]">装置PDF</CardTitle>
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
                    <CardTitle className="text-base font-bold text-[#1a2535]">分割プレビュー</CardTitle>
                  </div>
                  <p id="previewDeviceName" className="mt-2 text-sm leading-6 text-[#56687a]">
                    PDFを選択してください。
                  </p>
                  <label className="mt-3 grid gap-1 text-sm font-bold text-[#1a2535]">
                    登録タイトル
                    <Input
                      id="previewDeviceTitleInput"
                      type="text"
                      className="min-h-[42px] rounded-lg bg-[#f8fafc] text-base"
                      placeholder="装置一覧に登録するタイトル"
                    />
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[320px]">
                  <label className="grid gap-1 text-sm font-bold text-[#1a2535]">
                    分割
                    <select
                      id="splitModeSelect"
                      className="min-h-[42px] rounded-md border border-[#c8d4e0] bg-white px-3 text-sm outline-none focus:border-[#1568c8]"
                      defaultValue="normal"
                    >
                      <option value="normal">標準</option>
                      <option value="fine">細かく</option>
                      <option value="extra">かなり細かく</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-[#1a2535]">
                    まとめ
                    <select
                      id="mergeModeSelect"
                      className="min-h-[42px] rounded-md border border-[#c8d4e0] bg-white px-3 text-sm outline-none focus:border-[#1568c8]"
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
                  <Globe className="size-4" aria-hidden="true" />
                  ブラウザで開く
                </Button>
                <Button id="autoSplitButton" type="button" size="lg">
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
              <div className="setup-note preview-notice mb-3" id="previewNotice">
                <strong>タイトルとPOP確認を編集できます。</strong>
                <span>自動分割後、各カードで設定してください。</span>
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
