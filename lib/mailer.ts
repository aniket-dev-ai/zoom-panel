// lib/mailer.ts
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

if (!host || !user || !pass) {
  // Don’t crash here, just warn – API route will throw if used
  console.warn(
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

export async function sendMail(opts: {
  to: string[];
  subject: string;
  text?: string;
  html?: string;
}) {
  if (!host || !user || !pass) {
    throw new Error("SMTP environment variables not configured");
  }

  const info = await transporter.sendMail({
    from,
    to: opts.to.join(", "),
    subject: opts.subject,
    text: opts.text,
    html: opts.html ?? `<pre>${opts.text ?? ""}</pre>`,
  });

  return info;
}
