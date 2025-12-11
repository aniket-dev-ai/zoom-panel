// app/api/create-zoom-meeting/route.ts
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { reminderEmailHtml } from "@/lib/templates";

type RequestBody = {
  emails: string[];
  title: string;
  date: string;   // yyyy-mm-dd
  time: string;   // hh:mm
  duration: number;
  link: string;   // meeting join link
};

// simple helper
function buildIso(date: string, time: string) {
  // interpret as local time; Zoom expects ISO string
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
  return dt.toISOString();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.emails?.length) {
      return NextResponse.json(
        { error: "No recipients" },
        { status: 400 }
      );
    }
    if (!body.date || !body.time) {
      return NextResponse.json(
        { error: "Missing date/time" },
        { status: 400 }
      );
    }

    if (!body.link?.trim()) {
      return NextResponse.json(
        { error: "Missing meeting link" },
        { status: 400 }
      );
    }

    const startTimeIso = buildIso(body.date, body.time);
    const startAt = new Date(startTimeIso).getTime();
    const now = Date.now();

    const offsets = [40, 30, 20, 1]; // minutes before start

    const schedules = offsets.map((min) => {
      const sendAtMs = startAt - min * 60_000;
      const delay = Math.max(0, sendAtMs - now);
      // schedule the email using a timer
      setTimeout(async () => {
        try {
          const subject = `Reminder: ${body.title || "Meeting"} in ${min} minute${min === 1 ? "" : "s"}`;
          const text = `Your meeting starts in ${min} minute${min === 1 ? "" : "s"}.
Join link: ${body.link}
Start time: ${new Date(startAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;
          const html = reminderEmailHtml({
            title: body.title || "Meeting",
            link: body.link,
            minutes: min,
            startAt,
            timezone: "Asia/Kolkata",
          });

          await Promise.all(
            body.emails.map((email) =>
              sendMail({ to: [email], subject, text, html }).catch((err) => {
                console.error("Reminder send failed:", email, err);
              })
            )
          );
        } catch (err) {
          console.error("Reminder timer error:", err);
        }
      }, delay);

      return { offsetMinutes: min, sendAt: new Date(sendAtMs).toISOString() };
    });

    return NextResponse.json(
      {
        success: true,
        scheduled: schedules,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
