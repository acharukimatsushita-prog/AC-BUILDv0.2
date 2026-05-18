import { NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

type HealthRow = {
  now: Date;
};

export async function GET() {
  try {
    const result = await queryDb<HealthRow>("select now() as now");

    return NextResponse.json({
      ok: true,
      now: result.rows[0]?.now,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Database health check failed.",
      },
      { status: 500 },
    );
  }
}
