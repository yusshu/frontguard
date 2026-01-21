'use client';

import { useEffect, useState } from "react";

export default function FanOscillationSwitch({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: (next: boolean) => void;
}) {
  // optimistic ui state
  const [uiValue, setUiValue] = useState<boolean>(value);

  const pending = uiValue !== value;

  return (
    <button
      onClick={() => {
        const next = !uiValue;
        setUiValue(next);
        onToggle(next);
      }}
      className={`mb-6 w-full rounded-xl py-3.5 text-sm font-semibold transition-all
        ${
          uiValue
            ? "bg-green-600/60 text-white/80 border border-white/10"
            : "bg-zinc-800 text-zinc-500 border border-white/5"
        }
        ${pending ? "opacity-30" : ""}
      `}
    >
      {uiValue ? "Oscilación Activada" : "Oscilación Desactivada"}
    </button>
  );
}
