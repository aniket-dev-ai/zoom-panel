// app/api/ai-email/route.ts
import { NextResponse } from "next/server";

// Define the response type for type safety
type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
};

type RequestBody = {
  prompt: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    // FIX: Use 'gemini-1.5-flash-latest' or 'gemini-1.5-flash-002'
    // These specific versions are often more reliable than the generic alias.
    const model = "gemini-2.5-flash";
    
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: [
                    `Draft an engaging, funny-toned professional email based on: "${body.prompt}".`,
                    `Return strictly JSON with keys subject and body.`,
                    `In body, include clear paragraphs with proper spacing and intentional line breaks (\n\n between paragraphs).`,
                    `Use short, lively sentences; avoid emojis.`,
                    `End the email with:`,
                    `Best regards,\nAniket Srivastava`,
                  ].join(" \n"),
                },
              ],
            },
          ],
          // JSON Mode config
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                subject: { type: "STRING" },
                body: { type: "STRING" },
              },
              required: ["subject", "body"],
            },
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "Gemini API error", details: errorText },
        { status: geminiRes.status }
      );
    }

    const data = (await geminiRes.json()) as GeminiResponse;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("ai-email route error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}