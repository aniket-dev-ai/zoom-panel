export function reminderEmailHtml(args: {
  title: string;
  link: string;
  minutes: number;
  startAt: number; // epoch ms
  timezone?: string;
}) {
  const { title, link, minutes, startAt, timezone = "Asia/Kolkata" } = args;
  const startStr = new Date(startAt).toLocaleString("en-IN", { timeZone: timezone });
  const minuteLabel = `in ${minutes} minute${minutes === 1 ? "" : "s"}`;

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; background:#0f172a; color:#e5e7eb; padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#0b1222;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">
      <div style="padding:20px 20px 0 20px;">
        <h2 style="margin:0 0 8px 0; font-size:20px; color:#ffffff;">Reminder: ${title} ${minuteLabel}</h2>
        <p style="margin:0; font-size:14px; color:#94a3b8;">Starts at: <strong style="color:#cbd5e1;">${startStr}</strong> (${timezone})</p>
      </div>
      <div style="padding:16px 20px 24px 20px;">
        <p style="margin:12px 0; font-size:14px; color:#cbd5e1;">Your meeting begins ${minuteLabel}. Use the button below to join promptly.</p>
        <div style="margin:16px 0;">
          <a href="${link}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block; text-decoration:none; background:#2563eb; color:#ffffff; padding:10px 16px; border-radius:8px; font-weight:600;">
            Join Meeting
          </a>
        </div>
        <p style="margin:12px 0; font-size:12px; color:#94a3b8;">If the button doesn't work, copy this link: <span style="color:#60a5fa;">${link}</span></p>
        <hr style="border:none; border-top:1px solid #1f2937; margin:20px 0;"/>
        <p style="margin:0; font-size:12px; color:#64748b;">Best regards,<br/>Aniket Srivastava</p>
      </div>
    </div>
  </div>`;
}
