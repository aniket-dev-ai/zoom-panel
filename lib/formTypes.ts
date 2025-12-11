// lib/formTypes.ts
export type EmailFormState = {
  subject: string;
  body: string;
};

export type ZoomFormState = {
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  duration: number; // minutes
};
