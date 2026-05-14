import React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "./styles.css";

function ReactBridge() {
  void Button;
  void Card;
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
