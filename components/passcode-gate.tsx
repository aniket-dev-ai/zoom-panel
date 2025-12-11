"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const PASSCODE = process.env.NEXT_PUBLIC_PASSCODE ?? "";

export default function PasscodeGate() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always show gate on load; no persistence
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === PASSCODE) {
      setError(null);
      setOpen(false);
    } else {
      setError("Galat passcode. Kripya dobara koshish karein.");
    }
  }

  return (
    <Dialog open={open}>
      {open && (
        <div className="fixed inset-0 z-40 backdrop-blur-xl bg-transparent" />
      )}
      <DialogContent className="sm:max-w-md z-50">
        <DialogHeader>
          <DialogTitle>Passcode Zaroori Hai</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Passcode daaliye</label>
            <Input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="XXXX"
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">Unlock</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
