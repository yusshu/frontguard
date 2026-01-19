'use client';

import { Device } from "@/lib/device";
import { FanSpeed, FanState } from "@/lib/fan";
import Fan from "./Fan";
import { Backguard } from "@/hooks/useBackguard";
import FanButton from "@/app/FanButton";
import { useState, useEffect } from "react";

export default function FanControl({
  device,
  backguard,
}: {
  device: Device<FanState>,
  backguard: Backguard, 
}) {
  const [wifiOpen, setWifiOpen] = useState(false);
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [wifiMessage, setWifiMessage] = useState<string | null>(null);

  function sendToFan(command: string) {
    if (backguard.readyState !== WebSocket.OPEN) return;
    backguard.sendMessage(`DEVICE ${device.id} ${command}`);
  }

  function setFanSpeed(newSpeed: FanSpeed) {
    sendToFan(`SET_STATUS ${newSpeed}`);
  }

  function toggleRotation() {
    const newValue = !(device.state ?? { rotates: false }).rotates;
    sendToFan(`SET_ROTATES ${newValue}`);
  }
  
  function updateWiFi() {
    if (backguard.readyState !== WebSocket.OPEN) return;

    if (!ssid.trim()) {
      setWifiMessage("SSID is required");
      return;
    }

    const payload = JSON.stringify({
      ssid: ssid.trim(),
      password,
    });

    sendToFan(`SET_WIFI ${payload}`);
    setWifiMessage("Sending WiFi credentials...");
  }

  useEffect(() => {
    if (!backguard.lastMessage?.data) return;

    if (backguard.lastMessage.data === "OK WIFI_SAVED") {
      setWifiMessage("WiFi saved. Device reconnecting…");
    } else if (backguard.lastMessage.data.toUpperCase().startsWith("ERROR")) {
      setWifiMessage(backguard.lastMessage.data);
    }
  }, [backguard.lastMessage]);

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Ventilador Inteligente
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {device.name}
        </p>
      </div>

      <div className="relative mx-auto mb-8 h-48 w-48">
        <div
          className={`absolute inset-0 rounded-full border-8 ${
            (!device.state || device.state.status === "off")
              ? "border-zinc-300 dark:border-zinc-700"
              : "border-blue-500"
          }`}
        />
        <Fan state={device.state || { rotates: false, status: "off", temperature: null, humidity: null }} />
      </div>

      {
        device.state === null ? (
        <p className="mb-6 text-center text-zinc-500">Dispositivo desconectado</p>
        ) : (<>
          <div className="mb-6 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-zinc-100 py-3 dark:bg-zinc-800">
              <p className="text-xs uppercase text-zinc-500">Temperatura</p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-white">
                {device.state?.temperature !== null
                  ? `${device.state?.temperature.toFixed(1)} °C`
                  : "--"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-100 py-3 dark:bg-zinc-800">
              <p className="text-xs uppercase text-zinc-500">Humedad</p>
              <p className="text-xl font-semibold text-zinc-900 dark:text-white">
                {device.state?.humidity !== null
                  ? `${device.state?.humidity} %`
                  : "--"}
              </p>
            </div>
          </div>

          {/* Rotation toggle */}
          <button
            onClick={toggleRotation}
            disabled={backguard.readyState !== WebSocket.OPEN}
            className={`mb-6 w-full rounded-xl py-3 text-sm font-semibold transition
              ${
                device.state?.rotates
                  ? "bg-green-600 text-white"
                  : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }
              disabled:opacity-50
            `}
          >
            {device.state?.rotates ? "🌀 Oscilación Activada" : "⏸ Oscilación Desactivada"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <FanButton label="APAGADO" active={!device.state || device.state.status === "off"} onClick={() => setFanSpeed("off")} />
            <FanButton label="LENTO" active={device.state?.status === "slow"} onClick={() => setFanSpeed("slow")} />
            <FanButton label="MEDIO" active={device.state?.status === "medium"} onClick={() => setFanSpeed("medium")} />
            <FanButton label="RÁPIDO" active={device.state?.status === "fast"} onClick={() => setFanSpeed("fast")} />
          </div>
        </>)
      }

      <div className="mt-8">
        <button
          onClick={() => setWifiOpen(!wifiOpen)}
          className="w-full rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold dark:bg-zinc-800"
        >
          Opciones WiFi
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
              disabled={backguard.readyState !== WebSocket.OPEN}
              className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Actualizar Red WiFi
            </button>

            {wifiMessage && (
              <p className="text-xs text-zinc-500">{wifiMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}