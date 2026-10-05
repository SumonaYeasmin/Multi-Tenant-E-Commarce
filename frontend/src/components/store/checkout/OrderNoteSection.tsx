import React from 'react';

interface OrderNoteSectionProps {
  note: string;
  onChange: (note: string) => void;
}

export function OrderNoteSection({ note, onChange }: OrderNoteSectionProps) {
  return (
    <div>
      <label htmlFor="order-note" className="text-sm font-medium text-ink">
        Order note <span className="font-normal text-ink-muted">(optional)</span>
      </label>
      <textarea
        id="order-note"
        rows={2}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none"
        placeholder="Gift message, landmark, preferred delivery time…"
      />
    </div>
  );
}
