import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

type RequestBody = {
  emails: string[];
  subject: string;
  body?: string; // plain text body with \n line breaks
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!Array.isArray(body.emails) || body.emails.length === 0) {
      return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
    }
    if (!body.subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const info = await sendMail({
      to: body.emails,
      subject: body.subject,
      text: body.body ?? "",
    });

    return NextResponse.json({ ok: true, messageId: info.messageId }, { status: 200 });
  } catch (err: any) {
    console.error("send-email route error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to send email" },
      { status: 500 }
    );
  }
}
