"use client";

import { useState } from "react";
import { EmailFormState } from "@/lib/formTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type EmailFormProps = {
  value: EmailFormState;
  onChange: (value: EmailFormState) => void;
};

export function EmailForm({ value, onChange }: EmailFormProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAiDraft = async () => {
    if (!aiPrompt.trim()) {
      toast("Describe what email you want", {
        description: "Example: Invite DS batch for a Zoom at 8pm.",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/ai-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate draft");
      }

      const data = (await res.json()) as { subject: string; body: string };

      onChange({
        subject: data.subject,
        body: data.body,
      });

      toast.success("Draft generated", {
        description: "You can edit subject & body before sending.",
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Could not generate email", {
        description: err.message ?? "Try again in a bit.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* Normal manual fields */}
      <div className="space-y-1">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={value.subject}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
          placeholder="Follow-up on yesterday's discussion"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          rows={5}
          value={value.body}
          onChange={(e) => onChange({ ...value, body: e.target.value })}
          placeholder="Write your email here..."
        />
      </div>

      {/* AI helper */}
      <div className="space-y-1 border-t pt-3">
        <Label htmlFor="aiPrompt">Let AI write it for you</Label>
        <div className="flex gap-2">
          <Input
            id="aiPrompt"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder='Example: "Invite the data science group to a Zoom about project planning tomorrow evening."'
          />
          <Button type="button" onClick={handleAiDraft} disabled={loading}>
            {loading ? "Thinking..." : "AI draft"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Type in Hindi/English mix bhi chalega, model samajh lega.
        </p>
      </div>
    </section>
  );
}
