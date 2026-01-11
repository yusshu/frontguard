"use client";

import { useEffect, useRef, useState } from "react";

type FanSpeed = "off" | "slow" | "medium" | "fast";
type WSStatus = "connected" | "connecting" | "disconnected";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export default function Home() {
  const [speed, setSpeed] = useState<FanSpeed>("off");
  const [wsStatus, setWsStatus] = useState<WSStatus>("connecting");

  // WiFi
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [wifiOpen, setWifiOpen] = useState(false);
  const [wifiMessage, setWifiMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // -------------------- WebSocket --------------------
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    setWsStatus("connecting");

    ws.onopen = () => {
      setWsStatus("connected");
      ws.send("CHECK_STATUS");
    };

    ws.onmessage = (event) => {
      const msg = event.data.trim();
      console.log("[WS]", msg);

      if (msg.startsWith("STATUS ")) {
        setSpeed(msg.split(" ")[1] as FanSpeed);
      }

      if (msg === "OK WIFI_SAVED") {
        setWifiMessage("✅ WiFi saved. Device reconnecting…");
      }

      if (msg.startsWith("ERROR")) {
        setWifiMessage("❌ " + msg.replace("ERROR ", ""));
      }
    };

    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("disconnected");

    return () => ws.close();
  }, []);

  // -------------------- Commands --------------------
  function setFanSpeed(newSpeed: FanSpeed) {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(`SET_STATUS ${newSpeed}`);
  }

  function updateWiFi() {
    if (!ssid) {
      setWifiMessage("❌ SSID is required");
      return;
    }

    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const payload = {
      ssid,
      password,
    };

    wsRef.current.send(`SET_WIFI ${JSON.stringify(payload)}`);
    setWifiMessage("⏳ Sending WiFi credentials…");
    setPassword("");
  }

  // -------------------- UI --------------------
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-100 to-zinc-200 px-6 py-16 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Smart Fan
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Ventilador inteligente
          </p>
        </div>

        {/* Fan */}
        <div className="relative mx-auto mb-8 h-48 w-48">
          <div
            className={`absolute inset-0 rounded-full border-8 ${
              speed === "off"
                ? "border-zinc-300 dark:border-zinc-700"
                : "border-blue-500"
            }`}
          />
          <FanBladesSVG speed={speed} />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <FanButton label="APAGADO" active={speed === "off"} onClick={() => setFanSpeed("off")} />
          <FanButton label="LENTO" active={speed === "slow"} onClick={() => setFanSpeed("slow")} />
          <FanButton label="MEDIO" active={speed === "medium"} onClick={() => setFanSpeed("medium")} />
          <FanButton label="RÁPIDO" active={speed === "fast"} onClick={() => setFanSpeed("fast")} />
        </div>

        {/* WiFi Settings */}
        <div className="mt-8">
          <button
            onClick={() => setWifiOpen(!wifiOpen)}
            className="w-full rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold dark:bg-zinc-800"
          >
            WiFi Settings
          </button>

          {wifiOpen && (
            <div className="mt-4 space-y-3">
              <input
                placeholder="SSID"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800"
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-800"
              />

              <button
                onClick={updateWiFi}
                disabled={wsStatus !== "connected"}
                className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Update WiFi
              </button>

              {wifiMessage && (
                <p className="text-xs text-zinc-500">{wifiMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p
          className={`mt-6 text-center text-xs ${
            wsStatus === "connected"
              ? "text-green-500"
              : wsStatus === "connecting"
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        >
          {wsStatus.toUpperCase()}
        </p>
      </div>
    </main>
  );
}

// -------------------- SVG --------------------
function FanBladesSVG({ speed }: { speed: FanSpeed }) {
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

// -------------------- Button --------------------
function FanButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}
