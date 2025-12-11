import { ZoomFormState } from "@/lib/formTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ZoomFormProps = {
  value: ZoomFormState;
  onChange: (value: ZoomFormState) => void;
};

export function ZoomForm({ value, onChange }: ZoomFormProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title">Meeting title</Label>
        <Input
          id="title"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Sprint planning / Catch-up"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={value.time}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="duration">Duration (min)</Label>
          <Input
            id="duration"
            type="number"
            min={15}
            step={15}
            value={value.duration}
            onChange={(e) =>
              onChange({
                ...value,
                duration: Number(e.target.value || 0),
              })
            }
          />
        </div>
      </div>
    </section>
  );
}
