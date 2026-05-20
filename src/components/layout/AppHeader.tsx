import { ArrowLeft, FileText, Maximize2 } from "lucide-react";

export function AppHeader() {
  return (
    <header className="topbar">
      <div className="brand-badge" aria-hidden="true">
        <FileText className="size-7" strokeWidth={2.5} />
      </div>
      <div>
        <p className="eyebrow">Assembly Standard Viewer</p>
        <h1>AC-BUILD</h1>
      </div>
      <div className="topbar-controls">
        <button className="icon-button" id="backButton" type="button" aria-label="戻る" title="戻る">
          <ArrowLeft className="mx-auto size-5" aria-hidden="true" />
        </button>
        <button className="icon-button" id="fullscreenButton" type="button" aria-label="全画面" title="全画面">
          <Maximize2 className="mx-auto size-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
