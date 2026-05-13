import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function ReactBridge() {
  return null;
}

const root = document.getElementById("react-root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <ReactBridge />
    </React.StrictMode>
  );
}
