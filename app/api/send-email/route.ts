// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

type RequestBody = {
  emails: string[];
  subject: string;
  body: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.emails?.length) {
      return NextResponse.json(
        { error: "No recipients provided" },
        { status: 400 }
      );
    }

    if (!body.subject || !body.body) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    // simple text + minimal HTML
    const text = body.body;
    const html = `
      <div>
        <p>${body.body.replace(/\n/g, "<br />")}</p>
      </div>
    `;

    const info = await sendMail({
      to: body.emails,
      subject: body.subject,
      text,
      html,
    });

    return NextResponse.json(
      {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      },
      { status: 200 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("send-email error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
