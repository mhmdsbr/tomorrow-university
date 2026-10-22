import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import {
  pathwaySuggestionsSchema,
  type PathwayTopic,
} from "../../shared/milestones";
import { MILESTONE_PROMPT } from "./constant";

const responseSchema = z.object({
  candidates: z
    .array(
      z.object({
        finishReason: z.literal("STOP"),
        content: z.object({
          parts: z.array(
            z.object({
              text: z.string().optional(),
              thought: z.boolean().optional(),
            }),
          ),
        }),
      }),
    )
    .min(1),
});

const deepseekResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.literal("stop"),
        message: z.object({
          content: z.string().min(1),
        }),
      }),
    )
    .min(1),
});

async function generateWithDeepSeek(topic: PathwayTopic) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-flash";
  if (!apiKey?.trim() || !model.trim()) {
    throw new Error(
      "Set DEEPSEEK_API_KEY and a non-empty DEEPSEEK_MODEL on the server.",
    );
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: MILESTONE_PROMPT,
        },
        { role: "user", content: JSON.stringify(topic) },
      ],
      max_tokens: 32768,
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0,
      stream: false,
    }),
    signal: AbortSignal.timeout(60_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DeepSeek generation failed (HTTP ${response.status}).`);
  }
  const result = deepseekResponseSchema.parse(await response.json());
  return pathwaySuggestionsSchema.parse(
    JSON.parse(result.choices[0].message.content),
  );
}

async function generateWithGemini(topic: PathwayTopic) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    throw new Error("Set GEMINI_API_KEY and GEMINI_MODEL on the server.");
  }

  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: JSON.stringify(topic) }] }],
    config: {
      systemInstruction: MILESTONE_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(pathwaySuggestionsSchema),
      maxOutputTokens: 32768,
      abortSignal: AbortSignal.timeout(60_000),
      httpOptions: { timeout: 60_000 },
    },
  });

  const result = responseSchema.parse(response);
  const text = result.candidates[0].content.parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("");

  return pathwaySuggestionsSchema.parse(JSON.parse(text));
}

export async function generateMilestones(topic: PathwayTopic) {
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  switch (provider) {
    case "gemini":
      return generateWithGemini(topic);
    case "deepseek":
      return generateWithDeepSeek(topic);
    default:
      throw new Error("LLM_PROVIDER must be either gemini or deepseek.");
  }
}
