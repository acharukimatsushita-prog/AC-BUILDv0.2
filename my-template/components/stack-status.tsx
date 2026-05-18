import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApiHealth, fetchDbHealth } from "@/lib/api";
import { CheckCircle2, Database, Server, XCircle } from "lucide-react";

const stackItems = [
  { name: "Next.js", detail: "App Router + React 19" },
  { name: "React", detail: "UI components" },
  { name: "TypeScript", detail: "Strict typing" },
  { name: "Tailwind CSS", detail: "Utility-first styling" },
  { name: "shadcn/ui", detail: "Button, Card, Badge" },
  { name: "FastAPI", detail: "Python API backend" },
  { name: "PostgreSQL", detail: "Relational database" },
  { name: "Docker", detail: "Compose orchestration" },
];

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
  ) : (
    <XCircle className="size-5 text-red-500" aria-hidden="true" />
  );
}

export async function StackStatus() {
  let apiHealth: { ok?: boolean; service?: string } = {};
  let dbHealth: { ok?: boolean; now?: string; detail?: string } = {};
  let apiError = "";
  let dbError = "";

  try {
    apiHealth = await fetchApiHealth(true);
  } catch (error) {
    apiError = error instanceof Error ? error.message : "API unreachable";
  }

  try {
    dbHealth = await fetchDbHealth(true);
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Database unreachable";
  }

  const apiOk = Boolean(apiHealth.ok);
  const dbOk = Boolean(dbHealth.ok);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">AC-BUILDE Stack</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">フルスタック環境</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Next.js / React / TypeScript / Tailwind / shadcn/ui / FastAPI / PostgreSQL / Docker
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="size-5" aria-hidden="true" />
                FastAPI
              </CardTitle>
              <CardDescription>バックエンド API</CardDescription>
            </div>
            <StatusIcon ok={apiOk} />
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {apiOk ? (
              <p>稼働中 ({apiHealth.service ?? "fastapi"})</p>
            ) : (
              <p className="text-red-600">{apiError || "API に接続できません"}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="size-5" aria-hidden="true" />
                PostgreSQL
              </CardTitle>
              <CardDescription>データベース</CardDescription>
            </div>
            <StatusIcon ok={dbOk} />
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {dbOk ? (
              <p>接続 OK {dbHealth.now ? `(${dbHealth.now})` : ""}</p>
            ) : (
              <p className="text-red-600">{dbError || dbHealth.detail || "DB に接続できません"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>導入済みスタック</CardTitle>
          <CardDescription>my-template フロントエンド + backend API</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {stackItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <Badge variant="secondary">OK</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
