import { Minimize2 } from "lucide-react";

export function SlideView() {
  return (
    <main id="slideMain" hidden>
      <section className="view" id="slideView" aria-labelledby="slideDeviceName">
        <button className="fullscreen-exit-button" id="exitFullscreenButton" type="button" aria-label="全画面を解除">
          <Minimize2 className="fullscreen-exit-icon" aria-hidden="true" />
          <span>全画面解除</span>
        </button>

        <div className="slide-head">
          <div>
            <p className="eyebrow" id="slideSource" />
            <h2 id="slideDeviceName" />
          </div>
          <div className="step-counter" id="stepCounter" />
        </div>

        <div className="slide-stage">
          <button className="nav-hit nav-prev" id="prevButton" type="button" aria-label="前の工程">
            ‹
          </button>
          <figure className="step-card">
            <img id="stepImage" alt="" />
            <figcaption>
              <strong id="stepTitle" />
              <span id="stepMemo" />
            </figcaption>
          </figure>
          <button className="nav-hit nav-next" id="nextButton" type="button" aria-label="次の工程">
            ›
          </button>
        </div>

        <div className="bottom-controls">
          <button id="prevControl" type="button">
            前へ
          </button>
          <input id="stepSlider" type="range" min="0" max="0" defaultValue="0" />
          <button id="nextControl" type="button">
            次へ
          </button>
        </div>
        <div className="step-edit-panel">
          <label>
            <span>工程タイトル</span>
            <input id="slideTitleInput" type="text" />
          </label>
          <button id="saveSlideTitleButton" type="button">
            タイトル保存
          </button>
        </div>
      </section>
    </main>
  );
}
