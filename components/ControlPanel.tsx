'use client';

import useBackguard from "@/hooks/useBackguard";
import FanControl from "@/components/fan/FanControl";
import { AiOutlineLoading } from "react-icons/ai";
import { BiNetworkChart } from "react-icons/bi";

export default function ControlPanel({ token }: { token: string }) {
  const backguard = useBackguard(token);
  if (backguard.readyState !== WebSocket.OPEN) {
    return (
      <main className="flex flex-col gap-12 min-h-screen items-center justify-center bg-linear-to-br px-6 py-16 from-zinc-950 to-zinc-900">
        <AiOutlineLoading className="text-8xl text-white/10 animate-spin" />
        <p className="text-center text-zinc-600 animate-pulse">Conectando a EffioThings...</p>
      </main>
    );
  } else if (backguard.devices === null) {
    return (
      <main className="flex flex-col gap-12 min-h-screen items-center justify-center bg-linear-to-br px-6 py-16 from-zinc-950 to-zinc-900">
        <AiOutlineLoading className="text-8xl text-white/10 animate-spin" />
        <p className="text-center text-zinc-600 animate-pulse">Cargando dispositivos...</p>
      </main>
    );
  } else if (Object.values(backguard.devices).length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linear-to-br px-6 py-16 from-zinc-950 to-zinc-900">
        <p className="text-center text-zinc-500">No hay dispositivos registrados.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4.5 min-h-screen items-center justify-start bg-linear-to-br px-4 py-8 from-zinc-950 to-zinc-900">
      <span className="flex flex-row items-center w-full justify-start">
        <span>
          <BiNetworkChart className="w-6 h-6 text-blue-500/80" />
        </span>
        <span className="ml-2 text-lg text-white/90 font-bold">Effio</span>
        <span className="text-lg text-blue-500/80">Things</span>
      </span>

      {Object.values(backguard.devices).map(device => {
        switch (device.type) {
          case 'fan': return <FanControl key={device.id} device={device} backguard={backguard} />;
          default: return null;
        }
      })}
    </main>
  );
}