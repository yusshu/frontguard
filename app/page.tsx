"use client";

import { useEffect, useRef, useState } from "react";
import { WSStatus } from "./types";
import FanBlades from "./FanBlades";
import FanButton from "./FanButton";

import { FanState, FanSpeed } from "@/lib/fan";

const WS_URL = "wss://ws0.prislex.com/";

export default function Home() {
  const [wsStatus, setWsStatus] = useState<WSStatus>("connecting");

  const [devices, setDevices] = useState<Record<string, FanState>>({});
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  // WiFi
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [wifiOpen, setWifiOpen] = useState(false);
  const [wifiMessage, setWifiMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const activeFan = activeDeviceId ? devices[activeDeviceId] : null;
  const speed = activeFan?.status ?? "off";

  // -------------------- WebSocket --------------------
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    setWsStatus("connecting");

    ws.onopen = () => {
      setWsStatus("connected");

      // HELLO handshake
      ws.send("HELLO client andre ipoopmypants");
    };

    ws.onmessage = (event) => {
      const text = event.data.trim();
      console.log("[WS]", text);

      const spaceIndex = text.indexOf(" ");
      const cmd = spaceIndex === -1 ? text : text.slice(0, spaceIndex);
      const body = spaceIndex === -1 ? "" : text.slice(spaceIndex + 1);

      if (cmd === "DEVICE_ALL") {
        const json = JSON.parse(body);
        setDevices(json);

        // Pick first device automatically
        const firstId = Object.keys(json)[0];
        if (firstId) setActiveDeviceId(firstId);
        return;
      }

      if (cmd === "DEVICE") {
        const [deviceId, jsonPart] = body.split(" ", 2);
        const state = JSON.parse(jsonPart);

        setDevices((prev) => ({
          ...prev,
          [deviceId]: state,
        }));

        if (!activeDeviceId) {
          setActiveDeviceId(deviceId);
        }
        return;
      }

      if (text.startsWith("x error")) {
        setWifiMessage("❌ " + text.slice(8));
      }
    };

    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("disconnected");

    return () => ws.close();
  }, [activeDeviceId]);

  // -------------------- Commands --------------------
  function sendToFan(command: string) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!activeDeviceId) return;

    wsRef.current.send(`DEVICE ${activeDeviceId} ${command}`);
  }

  function setFanSpeed(newSpeed: FanSpeed) {
    sendToFan(`SET_STATUS ${newSpeed}`);
  }

  function toggleRotation() {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const newValue = !activeFan?.rotates;
    wsRef.current.send(`DEVICE ${activeDeviceId} SET_ROTATES ${newValue}`);
  }

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
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Smart Fan
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Ventilador inteligente
          </p>
        </div>

        <div className="relative mx-auto mb-8 h-48 w-48">
          <div
            className={`absolute inset-0 rounded-full border-8 ${
              speed === "off"
                ? "border-zinc-300 dark:border-zinc-700"
                : "border-blue-500"
            }`}
          />
          <FanBlades speed={speed} />
        </div>

        {/* Ambient info */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-xl bg-zinc-100 py-3 dark:bg-zinc-800">
            <p className="text-xs uppercase text-zinc-500">Temperatura</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              {activeFan?.temperature !== null
                ? `${activeFan?.temperature.toFixed(1)} °C`
                : "--"}
            </p>
          </div>

          <div className="rounded-xl bg-zinc-100 py-3 dark:bg-zinc-800">
            <p className="text-xs uppercase text-zinc-500">Humedad</p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">
              {activeFan?.humidity !== null
                ? `${activeFan?.humidity} %`
                : "--"}
            </p>
          </div>
        </div>

        {/* Rotation toggle */}
        <button
          onClick={toggleRotation}
          disabled={wsStatus !== "connected"}
          className={`mb-6 w-full rounded-xl py-3 text-sm font-semibold transition
            ${
              activeFan?.rotates
                ? "bg-green-600 text-white"
                : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }
            disabled:opacity-50
          `}
        >
          {activeFan?.rotates ? "🌀 Rotation ON" : "⏸ Rotation OFF"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <FanButton label="APAGADO" active={speed === "off"} onClick={() => setFanSpeed("off")} />
          <FanButton label="LENTO" active={speed === "slow"} onClick={() => setFanSpeed("slow")} />
          <FanButton label="MEDIO" active={speed === "medium"} onClick={() => setFanSpeed("medium")} />
          <FanButton label="RÁPIDO" active={speed === "fast"} onClick={() => setFanSpeed("fast")} />
        </div>

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
