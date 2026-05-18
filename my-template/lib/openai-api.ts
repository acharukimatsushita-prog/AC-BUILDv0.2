import { getApiBase } from "@/lib/api";

export async function createOpenAIResponse(
  input: string,
  options: {
    instructions?: string;
    model?: string;
    useFastApi?: boolean;
  } = {},
) {
  const useFastApi = options.useFastApi ?? true;
  const endpoint = useFastApi ? `${getApiBase()}/openai/respond` : "/api/openai/respond";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      instructions: options.instructions,
      model: options.model,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof result.detail === "string"
        ? result.detail
        : result.error || "OpenAI API request failed.";
    throw new Error(message);
  }

  return result as {
    id: string;
    model: string;
    text: string;
  };
}
