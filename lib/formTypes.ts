// lib/formTypes.ts
export type EmailFormState = {
  subject: string;
  body: string;      // plain text version (for editing + preview)
  html?: string;     // rich HTML version for sending
};

export type ZoomFormState = {
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  duration: number; // minutes
  link?: string; // meeting join link
};
