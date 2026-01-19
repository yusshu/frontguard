"use client";

import useBackguard from "@/hooks/useBackguard";
import FanControl from "@/components/fan/FanControl";

export default function Home() {
  const backguard = useBackguard();
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 px-6 py-16 dark:from-zinc-950 dark:to-zinc-900">
      {Object.values(backguard.devices).length === 0 && (
        <p className="text-center text-zinc-500">No hay dispositivos registrados.</p>
      )}

      {Object.values(backguard.devices).map(device => {
        switch (device.type) {
          case 'fan': return <FanControl key={device.id} device={device} backguard={backguard} />;
          default: return null;
        }
      })}
    </main>
  );
}
