import { Contact } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type RecipientsSectionProps = {
  contacts: Contact[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
};

export function RecipientsSection({
  contacts,
  selectedIds,
  onToggle,
  onSelectAll,
}: RecipientsSectionProps) {
  const allSelected = selectedIds.length === contacts.length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Recipients</h2>
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          {allSelected ? "Clear" : "Select all"}
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {contacts.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-2 rounded border p-2 cursor-pointer"
          >
            <Checkbox
              checked={selectedIds.includes(c.id)}
              onCheckedChange={() => onToggle(c.id)}
            />
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.email}</div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
