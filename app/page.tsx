"use client";

import { useRef, useState } from "react";
import useBackguard from "@/hooks/useBackguard";
import FanControl from "@/components/fan/FanControl";

export default function Home() {
  const backguard = useBackguard();

  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  const [wifiOpen, setWifiOpen] = useState(false);
  const [wifiMessage, setWifiMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  function updateWiFi() {
    if (!ssid) {
      setWifiMessage("❌ SSID is required");
      return;
    }

    sendToFan(`SET_WIFI ${JSON.stringify({ ssid, password })}`);
    setWifiMessage("⏳ Sending WiFi credentials…");
    setPassword("");
  }

  // -------------------- UI --------------------
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 px-6 py-16 dark:from-zinc-950 dark:to-zinc-900">
      {Object.values(backguard.devices).map(device => {
        switch (device.type) {
          case 'fan': return <FanControl key={device.id} device={device} backguard={backguard} />;
          default: return null;
        }
      })}
    </main>
  );
}
