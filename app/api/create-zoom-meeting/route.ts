// app/api/create-zoom-meeting/route.ts
import { NextResponse } from "next/server";
import { getZoomAccessToken } from "@/lib/zoom";

type RequestBody = {
  emails: string[];
  title: string;
  date: string;   // yyyy-mm-dd
  time: string;   // hh:mm
  duration: number;
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

    const accessToken = await getZoomAccessToken();

    const startTimeIso = buildIso(body.date, body.time);

    const zoomUserId = process.env.ZOOM_DEFAULT_USER_ID ?? "me";

    const res = await fetch(
      `https://api.zoom.us/v2/users/${encodeURIComponent(
        zoomUserId
      )}/meetings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: body.title || "Meeting",
          type: 2, // scheduled meeting
          start_time: startTimeIso,
          duration: body.duration || 30,
          timezone: "Asia/Kolkata",
          settings: {
            join_before_host: false,
            waiting_room: true,
            approval_type: 2,
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Zoom create meeting error:", text);
      return NextResponse.json(
        { error: "Zoom API error", details: text },
        { status: 500 }
      );
    }

    const data = await res.json();

    // You can also email data.join_url + data.start_url to recipients here
    return NextResponse.json(
      {
        id: data.id,
        join_url: data.join_url,
        start_url: data.start_url,
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
