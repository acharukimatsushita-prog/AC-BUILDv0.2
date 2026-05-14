export async function createOpenAIResponse(input, options = {}) {
  const response = await fetch("/api/openai/respond", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input,
      instructions: options.instructions,
      model: options.model
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "OpenAI API request failed.");
  }

  return result;
}
