import { X } from "lucide-react";

export function PreviewModal() {
  return (
    <div className="preview-modal" id="previewModal" aria-hidden="true">
      <div className="preview-modal-backdrop" id="previewModalBackdrop" />
      <div className="preview-modal-body" role="dialog" aria-modal="true" aria-labelledby="modalStepTitle">
        <header className="preview-modal-head">
          <div>
            <p className="eyebrow" id="modalStepMemo" />
            <h2 id="modalStepTitle">分割プレビュー</h2>
          </div>
          <button className="icon-button" id="closePreviewModal" type="button" aria-label="閉じる" title="閉じる">
            <X className="mx-auto size-5" aria-hidden="true" />
          </button>
        </header>
        <img id="modalStepImage" alt="" />
      </div>
    </div>
  );
}
