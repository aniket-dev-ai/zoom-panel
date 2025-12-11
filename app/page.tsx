// app/page.tsx
"use client";

import { useState } from "react";
import { CONTACTS } from "@/lib/contacts";
import type { ActionMode } from "@/lib/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type EmailFormState = {
  subject: string;
  body: string;
};

type ZoomFormState = {
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  duration: number; // minutes
};

export default function HomePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<ActionMode>("zoom");
  // using shadcn sonner's toast

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
    if (selectedEmails.length === 0) {
      toast("No recipients selected", {
        description: "Select at least one contact.",
      });
      return;
    }

    try {
      if (mode === "email") {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emails: selectedEmails,
            subject: emailForm.subject,
            body: emailForm.body,
          }),
        });

        if (!res.ok) throw new Error("Failed to send email");

        toast.success("Email sent", {
          description: `Sent to ${selectedEmails.length} recipient(s).`,
        });
      } else {
        // Zoom meeting
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
    } catch (err: string | any) {
      console.error(err);
      toast.error("Something went wrong", {
        description: err.message ?? "Check server logs.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Quick Mail & Zoom Panel</h1>

        {/* Recipients */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recipients</h2>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedIds.length === CONTACTS.length ? "Clear" : "Select all"}
            </Button>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {CONTACTS.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded border p-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedIds.includes(c.id)}
                  onCheckedChange={() => toggleContact(c.id)}
                />
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.email}</div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Mode */}
        <section className="space-y-2">
          <Label>Action</Label>
          <RadioGroup
            value={mode}
            onValueChange={(val) => setMode(val as ActionMode)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="mode-email" />
              <Label htmlFor="mode-email">Send Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="zoom" id="mode-zoom" />
              <Label htmlFor="mode-zoom">Create Zoom Meeting</Label>
            </div>
          </RadioGroup>
        </section>

        {/* Forms */}
        {mode === "email" ? (
          <section className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="Follow-up on yesterday's discussion"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                rows={5}
                value={emailForm.body}
                onChange={(e) =>
                  setEmailForm((f) => ({ ...f, body: e.target.value }))
                }
                placeholder="Write your email here..."
              />
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="title">Meeting title</Label>
              <Input
                id="title"
                value={zoomForm.title}
                onChange={(e) =>
                  setZoomForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Sprint planning / Catch-up"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={zoomForm.date}
                  onChange={(e) =>
                    setZoomForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={zoomForm.time}
                  onChange={(e) =>
                    setZoomForm((f) => ({ ...f, time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  step={15}
                  value={zoomForm.duration}
                  onChange={(e) =>
                    setZoomForm((f) => ({
                      ...f,
                      duration: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>
          </section>
        )}

        <Button onClick={handleSubmit}>
          {mode === "email" ? "Send Email" : "Create Zoom Meeting"}
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
