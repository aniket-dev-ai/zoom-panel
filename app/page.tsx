"use client";

import { useState } from "react";
import { CONTACTS } from "@/lib/contacts";
import type { ActionMode } from "@/lib/types";
import type { EmailFormState, ZoomFormState } from "@/lib/formTypes";

import { Card, CardHeader, CardTitle, CardDescription, CardContent  } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { RecipientsSection } from "@/components/recipients-section";
import { ModeSelector } from "@/components/mode-selector";
import { EmailForm } from "@/components/email-form";
import { ZoomForm } from "@/components/zoom-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Send, AlarmClock } from "lucide-react";

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
    link: "",
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
            link: zoomForm.link,
          }),
        });

        if (!res.ok) throw new Error("Failed to create Zoom meeting");

        const data = await res.json();

        toast.success("Reminders scheduled", {
          description: `${data.scheduled?.length ?? 0} emails will be sent before start.`,
        });

        console.log("Reminder schedule", data);
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
    <main className="min-h-screen app-bg grid-overlay p-6">
      <div className="mx-auto max-w-6xl h-[85vh] grid grid-rows-[auto_1fr_auto] gap-4">
        {/* Top brand bar */}
        <div className="glass-panel rounded-2xl border px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold brand-gradient">Quick Mail &amp; Zoom Panel</div>
            <div className="text-sm text-muted-foreground">Luxury, fast and polished actions</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Selected: {selectedEmails.length}</Badge>
            <ThemeToggle />
          </div>
        </div>

        {/* Split panels */}
        <div className="grid md:grid-cols-2 gap-4 overflow-hidden">
          <Card className="glass-panel h-full overflow-auto">
            <CardHeader>
              <CardTitle className="text-lg">Recipients</CardTitle>
              <CardDescription>Select who should receive the message</CardDescription>
            </CardHeader>
            <CardContent>
              <RecipientsSection
                contacts={CONTACTS}
                selectedIds={selectedIds}
                onToggle={toggleContact}
                onSelectAll={selectAll}
              />
            </CardContent>
          </Card>

          <Card className="glass-panel h-full overflow-auto">
            <CardHeader>
              <CardTitle className="text-lg">Action</CardTitle>
              <CardDescription>Compose an email or schedule reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ModeSelector mode={mode} onChange={setMode} />
              {mode === "email" ? (
                <EmailForm value={emailForm} onChange={setEmailForm} />
              ) : (
                <ZoomForm value={zoomForm} onChange={setZoomForm} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom sticky CTA */}
        <div className="flex items-center justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            aria-busy={submitting}
            className="min-w-48 cta-gradient text-primary-foreground hover:opacity-95"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                {mode === "email" ? "Sending..." : "Scheduling..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {mode === "email" ? <Send className="size-4" /> : <AlarmClock className="size-4" />}
                {mode === "email" ? "Send Email" : "Schedule Reminders"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
