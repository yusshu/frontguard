'use client';

import { FanSpeed } from "@/lib/fan";
import { useState } from "react";

const SPEEDS: FanSpeed[] = [ 'off', 'slow', 'medium', 'fast' ];

export default function FanSpeedSlider({
  value,
  onChange,
}: {
  value: FanSpeed;
  onChange: (speed: FanSpeed) => void;
}) {
  // optimistic-ui speed
  const [uiSpeed, setUiSpeed] = useState<FanSpeed>(value);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={SPEEDS.indexOf(uiSpeed)}
        onChange={(e) => {
          const newIndex = Number(e.target.value);
          setUiSpeed(SPEEDS[newIndex]);
          onChange(SPEEDS[newIndex]);
        }}
        className={`w-full transition-opacity duration-200 accent-blue-500 ${uiSpeed !== value ? 'opacity-50' : ''}`}
      />

      {/* Labels */}
      <div className="flex justify-between text-[0.6rem] text-zinc-500">
        <span>APAGADO</span>
        <span>LENTO</span>
        <span>MEDIO</span>
        <span>RÁPIDO</span>
      </div>
    </div>
  );
}