// lib/types.ts
export type Contact = {
  id: string;
  name: string;
  email: string;
  tag?: "team" | "friend" | "client" | "other";
};

export type ActionMode = "email" | "zoom";
