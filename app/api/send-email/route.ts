// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";

type RequestBody = {
  emails: string[];
  subject: string;
  body: string;   // plain text
  html?: string;  // optional rich HTML
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

    const results = await Promise.all(
      body.emails.map((email) =>
        sendMail({
          to: [email],
          subject: body.subject,
          text: body.body,
          html: body.html, // 👈 if AI ne HTML diya, yahi jayega
        }).then(
          () => ({ email, success: true }),
          (err) => ({ email, success: false, error: err.message })
        )
      )
    );

    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Some emails failed",
          results,
        },
        { status: 207 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "All emails sent",
        results,
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
