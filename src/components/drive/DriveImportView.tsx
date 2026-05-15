import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DocumentText, FolderSearch, Folder, Layers, ListChecks, Sparkles } from "lucide-react";

export function DriveImportView({ isActive, onBack }: { isActive: boolean; onBack: () => void }) {
  return (
    <main className={isActive ? "px-3 py-4 sm:px-5 sm:py-6 lg:px-7" : "hidden"}>
      <section className={isActive ? "view is-active" : "view"} id="driveView" aria-labelledby="driveTitle">
        <div className="grid gap-4 lg:grid-cols-[minmax(300px,0.95fr)_minmax(340px,1fr)]">
          <Card className="rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.35)] lg:col-span-2">
            <CardHeader className="gap-4 p-6 sm:flex sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Drive Import</p>
                <CardTitle id="driveTitle" className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Google Drive同期
                </CardTitle>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  Driveから資料を読み込み、装置一覧に登録するための準備画面です。
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button variant="outline" className="w-full sm:w-auto text-sm" onClick={onBack}>
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  戻る
                </Button>
                <Button className="w-full sm:w-auto text-sm" id="syncDriveButton" type="button">
                  <FolderSearch className="size-4" aria-hidden="true" />
                  同期
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 pt-0 lg:grid-cols-[1fr_auto]">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">DriveフォルダURL</span>
                <Input id="driveFolderInput" type="url" className="min-h-11 rounded-2xl bg-slate-50" placeholder="https://drive.google.com/drive/folders/..." />
              </label>
              <div className="grid gap-2 sm:min-w-[10rem]">
                <span className="text-sm font-semibold text-slate-700">状態</span>
                <div className="flex min-h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600" id="driveStatus">
                  未同期
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.22)]">
              <CardHeader className="gap-2 p-5">
                <div className="flex items-center gap-2">
                  <Folder className="size-4 text-slate-500" aria-hidden="true" />
                  <CardTitle className="text-base font-semibold text-slate-950">大分類</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div id="categoryList" className="category-list grid max-h-[44vh] gap-3 overflow-auto pr-1" />
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.22)]">
              <CardHeader className="gap-2 p-5">
                <div className="flex items-center gap-2">
                  <DocumentText className="size-4 text-slate-500" aria-hidden="true" />
                  <CardTitle className="text-base font-semibold text-slate-950">資料</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div id="pdfList" className="pdf-list grid max-h-[44vh] gap-3 overflow-auto pr-1" />
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.22)] lg:col-span-2">
            <CardHeader className="gap-4 p-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-slate-500" aria-hidden="true" />
                    <CardTitle className="text-base font-semibold text-slate-950">分割プレビュー</CardTitle>
                  </div>
                  <p id="previewDeviceName" className="mt-2 text-sm leading-6 text-slate-600">
                    PDFを選択してください。
                  </p>
                  <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
                    登録タイトル
                    <Input id="previewDeviceTitleInput" type="text" className="min-h-10 rounded-2xl bg-slate-50" placeholder="装置一覧に登録するタイトル" />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[340px]">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    分割
                    <select id="splitModeSelect" className="min-h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400" defaultValue="normal">
                      <option value="normal">標準</option>
                      <option value="fine">細かく</option>
                      <option value="extra">かなり細かく</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    まとめ
                    <select id="mergeModeSelect" className="min-h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400" defaultValue="normal">
                      <option value="weak">弱</option>
                      <option value="normal">標準</option>
                      <option value="strong">強</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button id="openPdfButton" type="button" variant="outline" className="text-sm">
                  <DocumentText className="size-4" aria-hidden="true" />
                  PDF確認
                </Button>
                <Button id="autoSplitButton" type="button" className="text-sm">
                  <Sparkles className="size-4" aria-hidden="true" />
                  自動分割
                </Button>
                <Button id="registerPreviewButton" type="button" variant="secondary" className="text-sm">
                  <ListChecks className="size-4" aria-hidden="true" />
                  一覧へ追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <strong className="block font-semibold text-slate-900">タイトルとPOP確認を編集できます。</strong>
                <span>自動分割後、各カードで設定してください。</span>
              </div>
              <div id="splitPreviewGrid" className="split-preview-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
