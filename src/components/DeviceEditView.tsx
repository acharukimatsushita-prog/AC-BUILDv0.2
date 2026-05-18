import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Check, Layers, Trash2 } from "lucide-react";
import type { Device, Step } from "@/types";
import { checksToText, isPopupEnabled, normalizeChecks, repairMojibakeText, repairStepText, textToChecks } from "@/lib/device-utils";

export function DeviceEditView({
  device,
  onCancel,
  onSave,
}: {
  device: Device;
  onCancel: () => void;
  onSave: (device: Device) => void;
}) {
  const [title, setTitle] = React.useState(repairMojibakeText(device.name));
  const [steps, setSteps] = React.useState<Step[]>(
    device.steps.map((step) => {
      const repairedStep = repairStepText(step);
      return { ...repairedStep, popupEnabled: isPopupEnabled(repairedStep), checks: normalizeChecks(repairedStep.checks) };
    })
  );

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        title: "新しい工程",
        memo: "",
        image: "",
        popupEnabled: false,
        checks: [],
      },
    ]);
  }

  function deleteStep(index: number) {
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
  }

  function moveStep(index: number, direction: number) {
    setSteps((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function updateStep(index: number, nextStep: Step) {
    setSteps((current) => current.map((step, stepIndex) => (stepIndex === index ? nextStep : step)));
  }

  function handleSave() {
    onSave({
      ...device,
      name: title.trim() || device.name,
      steps: steps.map((step) => {
        const repairedStep = repairStepText(step);
        return { ...repairedStep, popupEnabled: isPopupEnabled(repairedStep), checks: normalizeChecks(repairedStep.checks) };
      }),
    });
  }

  return (
    <main className="px-3 py-4 sm:px-5 sm:py-6 lg:px-7">
      <Card className="rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.35)]">
        <CardHeader className="gap-4 p-6 sm:flex sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Admin Edit</p>
            <CardTitle className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              管理者編集
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              戻る
            </Button>
            <Button type="button" onClick={handleSave}>
              <Check className="size-4" aria-hidden="true" />
              保存
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 p-6 pt-0">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            装置名
            <Input value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 rounded-2xl" />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">工程一覧</h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                POP確認をONにすると閲覧時に確認画面が表示されます。
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={addStep}>
              <Layers className="size-4" aria-hidden="true" />
              工程を追加
            </Button>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <section key={`${device.id}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-950">工程 {index + 1}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => moveStep(index, -1)} disabled={index === 0} title="上に移動">
                      <ChevronUp className="size-4" aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} title="下に移動">
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => deleteStep(index)} disabled={steps.length <= 1}>
                      <Trash2 className="size-4" aria-hidden="true" />
                      削除
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                  <div className="grid gap-4">
                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      工程タイトル
                      <Input
                        value={step.title}
                        onChange={(event) => updateStep(index, { ...step, title: event.target.value })}
                        className="min-h-10 rounded-2xl bg-white"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      メモ
                      <textarea
                        value={step.memo}
                        onChange={(event) => updateStep(index, { ...step, memo: event.target.value })}
                        className="min-h-[7rem] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                      />
                    </label>
                  </div>

                  <div className="grid content-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                      <input
                        type="checkbox"
                        checked={isPopupEnabled(step)}
                        onChange={(event) => updateStep(index, { ...step, popupEnabled: event.target.checked })}
                        className="h-5 w-5 accent-amber-600"
                      />
                      POP確認を表示
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      確認項目
                      <textarea
                        value={checksToText(step.checks)}
                        onChange={(event) => {
                          const checks = textToChecks(event.target.value);
                          updateStep(index, { ...step, checks, popupEnabled: checks.length > 0 || step.popupEnabled });
                        }}
                        placeholder="例: ネジの締め付けを確認した"
                        className="min-h-[9rem] rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400"
                      />
                    </label>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={addStep}>
              <Layers className="size-4" aria-hidden="true" />
              工程を追加
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                戻る
              </Button>
              <Button type="button" onClick={handleSave}>
                <Check className="size-4" aria-hidden="true" />
                保存
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
