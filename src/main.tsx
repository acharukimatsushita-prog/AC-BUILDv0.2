import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { App } from "@/App";
import "./styles.css";
import "../styles.css";

const root = document.getElementById("react-root");

if (root) {
  const app = createRoot(root);
  flushSync(() => {
    app.render(
      <React.StrictMode>
        <App />
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
