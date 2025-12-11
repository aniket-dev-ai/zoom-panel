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

    const model = "gemini-2.5-flash";

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
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
                    `You are an expert email copywriter and HTML email designer.`,
                    `Draft an engaging, slightly funny but professional email based on: "${body.prompt}".`,
                    `You MUST return STRICT JSON with keys: subject, bodyText, bodyHtml.`,
                    `subject: short email subject line (no quotes).`,
                    `bodyText: plain text version with \\n\\n between paragraphs.`,
                    `bodyHtml: full HTML fragment for the email body, using <h1>, <h2>, <div>, <p>, <strong>, <em>, <ul>, <li>, <br/>.`,
                    `Include inline CSS (style="...") for mobile-friendly formatting. Use different text colors that match the vibe of the content where appropriate.`,
                    `Use tasteful bold (<strong>) and italic (<em>) emphasis, headings (<h1>, <h2>) for structure, and keep it readable.`,
                    `No external CSS, no <html> or <body> tags—return only the inner HTML fragment.`,
                    `End the email with a closing like:`,
                    `Best regards,<br/>Aniket Srivastava`,
                  ].join(" \n"),
                },
              ],
            },
          ],
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

    // Some Gemini responses wrap JSON in markdown fences like ```json ... ```
    const cleanedText = (() => {
      const t = text.trim();
      const fenceMatch = t.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/);
      if (fenceMatch) return fenceMatch[1].trim();
      // Also handle single-line fences without trailing newline
      const genericFence = t.match(/^```[a-zA-Z]*\s*([\s\S]*?)\s*```$/);
      if (genericFence) return genericFence[1].trim();
      return t;
    })();

    const parsed = JSON.parse(cleanedText) as {
      subject: string;
      bodyText: string;
      bodyHtml: string;
    };

    if (!parsed.subject || !parsed.bodyText || !parsed.bodyHtml) {
      throw new Error("Invalid JSON from Gemini");
    }

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
