import React from "react";
import { createRoot } from "react-dom/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "./styles.css";

type TableProbeRow = {
  id: string;
  name: string;
};

const tableProbeColumns: ColumnDef<TableProbeRow>[] = [];

function ReactBridge() {
  void Button;
  void Card;
  void tableProbeColumns;
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
