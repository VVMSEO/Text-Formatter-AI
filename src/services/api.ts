import { FormattingMode, OutputStyle, FormattingOptions } from "@/src/types";

const PROMPT_TEMPLATE = `You are a professional editor and content architect. 
Your task is to reformat the provided text to improve its readability, structure, and visual rhythm without changing its meaning, facts, tone, or intent.

REFORMATTING RULES:
1. PRESERVE MEANING: Do not invent any new facts or remove existing details.
2. STRUCTURE: Break the "wall of text" into logical, semantic sections.
3. HEADINGS: Add clear, descriptive headings and subheadings (using Markdown ### or ####).
4. LISTS: Convert suitable lists of items or features into bullet points.
5. PARAGRAPHS: Optimize paragraph length for readability (shorter is usually better for web).
6. LANGUAGE: Maintain the original language of the input (Russian or English).
7. STYLE: Adapt the output structure to the requested style: {STYLE}.
8. MODE: Apply the requested formatting depth: {MODE}.
   - Light: Minimal changes, mostly paragraph breaks and simple headers.
   - Standard: Balanced structure, clear headings, bullet points where obvious.
   - Deep: Full editorial overhaul of structure, semantic grouping, hierarchy optimization.

OPTIONAL CONSTRAINTS:
- Preserve wording as much as possible: {PRESERVE_WORDING}
- Make it more web-readable: {WEB_READABLE}
- Generate headings only when needed: {AUTO_HEADINGS}

Output ONLY the final formatted text in Markdown format.

TEXT TO FORMAT:
{TEXT}`;

export const aiService = {
  async formatText(
    text: string, 
    mode: FormattingMode, 
    style: OutputStyle, 
    options: FormattingOptions
  ): Promise<string> {
    const apiKey = localStorage.getItem('ai_api_key');
    
    if (!apiKey) {
      throw new Error("API ключ не установлен. Пожалуйста, добавьте ключ в настройках (иконка ключа вверху).");
    }

    const prompt = PROMPT_TEMPLATE
      .replace("{TEXT}", text)
      .replace("{MODE}", mode || "standard")
      .replace("{STYLE}", style || "neutral")
      .replace("{PRESERVE_WORDING}", options?.preserveWording ? "Yes, keep original sentences intact." : "No, allow minor flow improvements.")
      .replace("{WEB_READABLE}", options?.webReadable ? "Yes, optimize for digital screens." : "Standard readability.")
      .replace("{AUTO_HEADINGS}", options?.autoHeadings ? "Strictly only when a new topic starts." : "Encouraged for better scannability.");

    const response = await fetch("https://routerai.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.6",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Ошибка при обращении к API. Проверьте ваш ключ или баланс.");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};
