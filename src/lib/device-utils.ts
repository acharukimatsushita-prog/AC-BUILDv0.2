import { Step, StepCheck } from "@/types";

export function normalizeChecks(checks?: Step["checks"]): StepCheck[] {
  if (!Array.isArray(checks)) return [];

  return checks
    .map((check, index) => ({
      id: check.id || `check-${index}`,
      text: check.text.trim(),
      required: check.required !== false,
    }))
    .filter((check) => check.text.length > 0);
}

export function checksToText(checks?: Step["checks"]): string {
  return normalizeChecks(checks)
    .map((check) => check.text)
    .join("\n");
}

export function textToChecks(value: string): StepCheck[] {
  return value
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `check-${Date.now()}-${index}`,
      text,
      required: true,
    }));
}

export function isPopupEnabled(step: Step) {
  if (step.popupEnabled === true) return true;
  return normalizeChecks(step.checks).length > 0 && step.popupEnabled !== false;
}

export function repairMojibakeText(value: string) {
  if (!/[\ufffd繝蜷縺謌讓呎邱髯螟譁陬]/.test(value)) {
    return value;
  }

  const replacements: Array<[string, string]> = [
    ["繝｡繝｢", "メモ"],
    ["蟾･遞九Γ繝｢", "工程メモ"],
    ["蟾･遞・", "工程"],
    ["陬・ｽｮ", "装置"],
    ["讓呎ｺ・", "標準"],
    ["邏ｰ縺九￥", "細かく"],
    ["縺九↑繧顔ｴｰ縺九￥", "かなり細かく"],
    ["蜷梧悄", "同期"],
    ["繝壹・繧ｸ", "ページ"],
    ["蜀榊・蜑ｲ", "再分割"],
    ["蜀咏悄縺ｮ邨仙粋", "画像の結合"],
    ["髢｢騾｣譁ｭ迚・ｒ邱ｱ蜷・", "関連断片を統合"],
    ["蜷医ｒ邨仙粋", "を結合"],
    ["譁ｰ縺励＞蟾･遞・", "新しい工程"],
    ["譖ｴ譁ｰ諠・ｱ縺ｪ縺・", "更新情報なし"],
  ];

  return replacements.reduce((text, [broken, replacement]) => text.split(broken).join(replacement), value);
}

export function repairStepText(step: Step): Step {
  return {
    ...step,
    title: repairMojibakeText(step.title),
    memo: repairMojibakeText(step.memo),
    checks: normalizeChecks(step.checks).map((check) => ({
      ...check,
      text: repairMojibakeText(check.text),
    })),
  };
}
