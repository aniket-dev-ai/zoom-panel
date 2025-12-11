// lib/mailer.ts
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

if (!host || !user || !pass) {
  console.log(
    "[mailer] SMTP env vars missing. Email sending will fail."
  );
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for 587/25
  auth: {
    user,
    pass,
  },
});

// helper: escape + convert \n -> <br/>
function textToHtml(text?: string) {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // single \n and \n\n both handled
  return escaped.replace(/\n/g, "<br/>");
}

export async function sendMail(opts: {
  to: string[];
  subject: string;
  text?: string;
  html?: string;
}) {
  if (!host || !user || !pass) {
    throw new Error("SMTP environment variables not configured");
  }

  const htmlBody =
    opts.html ??
    `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5;">
       ${textToHtml(opts.text)}
     </div>`;

  const info = await transporter.sendMail({
    from,
    to: opts.to.join(", "),
    subject: opts.subject,
    text: opts.text, // plain text version (with \n)
    html: htmlBody,  // email clients actually render this
  });

  return info;
}
