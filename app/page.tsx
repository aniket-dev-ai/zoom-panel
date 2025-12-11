"use client";

import { useState } from "react";
import { CONTACTS } from "@/lib/contacts";
import type { ActionMode } from "@/lib/types";
import type { EmailFormState, ZoomFormState } from "@/lib/formTypes";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

import { RecipientsSection } from "@/components/recipients-section";
import { ModeSelector } from "@/components/mode-selector";
import { EmailForm } from "@/components/email-form";
import { ZoomForm } from "@/components/zoom-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<ActionMode>("zoom");
  const [submitting, setSubmitting] = useState(false);

  const [emailForm, setEmailForm] = useState<EmailFormState>({
    subject: "",
    body: "",
  });

  const [zoomForm, setZoomForm] = useState<ZoomFormState>({
    title: "Catch-up call",
    date: "",
    time: "",
    duration: 30,
  });

  const toggleContact = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === CONTACTS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(CONTACTS.map((c) => c.id));
    }
  };

  const selectedEmails = CONTACTS.filter((c) => selectedIds.includes(c.id)).map(
    (c) => c.email
  );

  const handleSubmit = async () => {
    if (submitting) return;
    if (selectedEmails.length === 0) {
      toast("No recipients selected", {
        description: "Select at least one contact.",
      });
      return;
    }

    try {
      setSubmitting(true);
      if (mode === "email") {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emails: selectedEmails,
            subject: emailForm.subject,
            body: emailForm.body,
            html: emailForm.html,
          }),
        });

        if (!res.ok) throw new Error("Failed to send email");

        toast.success("Email sent", {
          description: `Sent to ${selectedEmails.length} recipient(s).`,
        });
      } else {
        const res = await fetch("/api/create-zoom-meeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emails: selectedEmails,
            title: zoomForm.title,
            date: zoomForm.date,
            time: zoomForm.time,
            duration: zoomForm.duration,
          }),
        });

        if (!res.ok) throw new Error("Failed to create Zoom meeting");

        const data = await res.json();

        toast.success("Zoom meeting created", {
          description: `Join link: ${data.join_url ?? "check console"}`,
        });

        console.log("Zoom meeting", data);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong", {
        description: err.message ?? "Check server logs.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quick Mail &amp; Zoom Panel</h1>
          <ThemeToggle />
        </div>

        <RecipientsSection
          contacts={CONTACTS}
          selectedIds={selectedIds}
          onToggle={toggleContact}
          onSelectAll={selectAll}
        />

        <ModeSelector mode={mode} onChange={setMode} />

        {mode === "email" ? (
          <EmailForm value={emailForm} onChange={setEmailForm} />
        ) : (
          <ZoomForm value={zoomForm} onChange={setZoomForm} />
        )}

        <Button onClick={handleSubmit} disabled={submitting} aria-busy={submitting} className="min-w-40">
          {submitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              {mode === "email" ? "Sending..." : "Creating..."}
            </span>
          ) : (
            mode === "email" ? "Send Email" : "Create Zoom Meeting"
          )}
        </Button>

        {selectedEmails.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Will target: {selectedEmails.join(", ")}
          </p>
        )}
      </Card>
    </main>
  );
}
