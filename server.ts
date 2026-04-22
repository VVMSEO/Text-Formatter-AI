import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Gemini Setup
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

  app.post("/api/format", async (req, res) => {
    try {
      const { text, mode, style, options } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      if (!process.env.ROUTERAI_API_KEY) {
        return res.status(500).json({ error: "RouterAI API key not configured on server" });
      }

      const prompt = PROMPT_TEMPLATE
        .replace("{TEXT}", text)
        .replace("{MODE}", mode || "standard")
        .replace("{STYLE}", style || "neutral")
        .replace("{PRESERVE_WORDING}", options?.preserveWording ? "Yes, keep original sentences intact." : "No, allow minor flow improvements.")
        .replace("{WEB_READABLE}", options?.webReadable ? "Yes, optimize for digital screens." : "Standard readability.")
        .replace("{AUTO_HEADINGS}", options?.autoHeadings ? "Strictly only when a new topic starts." : "Encouraged for better scannability.");

      const routerAiResponse = await fetch("https://routerai.ru/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ROUTERAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4.6",
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (!routerAiResponse.ok) {
        const errorData = await routerAiResponse.json();
        throw new Error(errorData.error?.message || "RouterAI API request failed");
      }

      const data = await routerAiResponse.json();
      const formattedText = data.choices[0].message.content;

      res.json({ formattedText });
    } catch (error: any) {
      console.error("AI Formatting Error:", error);
      res.status(500).json({ error: error.message || "Failed to process text" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
