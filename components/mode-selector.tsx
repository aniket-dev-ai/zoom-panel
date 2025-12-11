import type { ActionMode } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Timer } from "lucide-react";

type ModeSelectorProps = {
  mode: ActionMode;
  onChange: (mode: ActionMode) => void;
};

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <section className="space-y-2">
      <Label>Action</Label>
      <Tabs value={mode} onValueChange={(val) => onChange(val as ActionMode)}>
        <TabsList>
          <TabsTrigger value="email">
            <Mail />
            Send Email
          </TabsTrigger>
          <TabsTrigger value="zoom">
            <Timer />
            Schedule Reminders
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </section>
  );
}
