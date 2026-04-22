import { FormattingMode, OutputStyle, FormattingOptions } from "@/src/types";

export const aiService = {
  async formatText(
    text: string, 
    mode: FormattingMode, 
    style: OutputStyle, 
    options: FormattingOptions
  ): Promise<string> {
    const response = await fetch("/api/format", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, mode, style, options }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to format text");
    }

    const data = await response.json();
    return data.formattedText;
  }
};
