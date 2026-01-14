'use client';

import { FanSpeed } from "./types";

export default function FanBlades({ speed }: { speed: FanSpeed }) {
  const isOn = speed !== "off";

  return (
    <svg
      viewBox="-50 -50 100 100"
      className={`absolute h-full w-full ${isOn ? "animate-spin" : ""}`}
      style={{
        animationDuration:
          speed === "slow"
            ? "2s"
            : speed === "medium"
            ? "1s"
            : speed === "fast"
            ? "0.4s"
            : undefined,
      }}
    >
      {[0, 72, 144, 216, 288].map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          <path
            d="M 0 0 C 6 -8, 14 -28, 4 -42 C -2 -48, -6 -48, -4 -42 C -2 -28, -2 -10, 0 0 Z"
            className={
              isOn
                ? "fill-blue-500"
                : "fill-zinc-400 dark:fill-zinc-600"
            }
          />
        </g>
      ))}

      <circle
        cx="0"
        cy="0"
        r="4"
        className="fill-zinc-800 dark:fill-zinc-200"
      />
    </svg>
  );
}
