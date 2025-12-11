import type { ActionMode } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ModeSelectorProps = {
  mode: ActionMode;
  onChange: (mode: ActionMode) => void;
};

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <section className="space-y-2">
      <Label>Action</Label>
      <RadioGroup
        value={mode}
        onValueChange={(val) => onChange(val as ActionMode)}
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
  );
}
