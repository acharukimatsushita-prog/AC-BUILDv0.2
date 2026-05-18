import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const openai = getOpenAIClient();

    if (!openai) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const input = typeof body.input === "string" ? body.input.trim() : "";

    if (!input) {
      return NextResponse.json({ error: "input is required." }, { status: 400 });
    }

    const response = await openai.responses.create({
      model: body.model || process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: body.instructions,
      input,
    });

    return NextResponse.json({
      id: response.id,
      model: response.model,
      text: response.output_text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "OpenAI request failed.",
      },
      { status: 500 },
    );
  }
}
