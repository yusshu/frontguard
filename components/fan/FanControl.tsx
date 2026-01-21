'use client';

import { Device } from "@/lib/device";
import { FanSpeed, FanState } from "@/lib/fan";
import Fan from "./Fan";
import { Backguard } from "@/hooks/useBackguard";
import FanButton from "@/app/FanButton";
import { useState, useEffect } from "react";
import { FaWifi } from "react-icons/fa";
import { FaTemperatureThreeQuarters } from "react-icons/fa6";
import WiFiModal from "../WiFiModal";
import FanSpeedSlider from "./FanSpeedSlider";

export default function FanControl({
  device,
  backguard,
}: {
  device: Device<FanState>,
  backguard: Backguard, 
}) {
  const [wifiOpen, setWifiOpen] = useState(false);

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
  
  function updateWiFi(ssid: string, password: string) {
    if (backguard.readyState !== WebSocket.OPEN) return;

    const payload = JSON.stringify({
      ssid: ssid.trim(),
      password,
    });

    sendToFan(`SET_WIFI ${payload}`);
  }

  return (
    <div className="w-full max-w-md rounded-3xl py-8 px-6 shadow-2xl bg-zinc-900 border border-white/5">
      <WiFiModal open={wifiOpen} setOpen={setWifiOpen} onSubmit={updateWiFi} />

      <div className="mb-6 text-center flex flex-row justify-between">
        <div className="flex-[0.2]">
        </div>
        <div className="flex flex-[0.6] flex-col items-center">
          <h1 className="text-2xl font-bold text-white/90">
            Effio Fan
          </h1>
          <p className="text-sm text-zinc-600">
            ID: <span className="font-mono">{device.name}</span>
          </p>
        </div>

        <div className="flex flex-row items-center justify-end flex-[0.2]">
          <button
            onClick={() => setWifiOpen(!wifiOpen)}
            className="p-2 border border-white/5 rounded-md"
          >
            <FaWifi className="h-4.5 w-4.5 text-white/50" />
          </button>
        </div>
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
          <div className="mt-12 mb-6">
            <FanSpeedSlider
              value={device.state.status}
              onChange={setFanSpeed}
            />
          </div>

          {/* Rotation toggle */}
          <button
            onClick={toggleRotation}
            className={`mb-6 w-full rounded-xl py-3.5 text-sm font-semibold transition
              ${
                device.state?.rotates
                  ? "bg-green-600/60 text-white/80 border border-white/10"
                  : "bg-zinc-800 text-zinc-500 border border-white/5"
              }
              disabled:opacity-50
            `}
          >
            {device.state?.rotates ? "Oscilación Activada" : "Oscilación Desactivada"}
          </button>

          <div className="mb-6 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-zinc-100 py-2 dark:bg-zinc-800">
              <p className="text-xs uppercase text-zinc-500">Temperatura</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                {device.state?.temperature !== null
                  ? `${device.state?.temperature.toFixed(1)} °C`
                  : "--"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-100 py-2 dark:bg-zinc-800">
              <p className="text-xs uppercase text-zinc-500">Humedad</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                {device.state?.humidity !== null
                  ? `${device.state?.humidity} %`
                  : "--"}
              </p>
            </div>
          </div>
        </>)
      }
    </div>
  );
}