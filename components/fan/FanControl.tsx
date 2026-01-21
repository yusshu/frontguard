'use client';

import { Device } from "@/lib/device";
import { FanSpeed, FanState } from "@/lib/fan";
import Fan from "./Fan";
import { Backguard } from "@/hooks/useBackguard";
import { useState, useEffect } from "react";
import { FaWifi } from "react-icons/fa";
import { FaTemperatureThreeQuarters } from "react-icons/fa6";
import WiFiModal from "../WiFiModal";
import FanSpeedSlider from "./FanSpeedSlider";
import FanOscillationSwitch from "./FanOscillationSwitch";
import { DeviceCard } from "../DeviceCard";

export default function FanControl({
  device,
  backguard,
}: {
  device: Device<FanState>,
  backguard: Backguard, 
}) {
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

  return (
    <DeviceCard backguard={backguard} device={device} sendDeviceCommand={sendToFan}>
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
          <FanOscillationSwitch
            value={device.state.rotates}
            onToggle={toggleRotation}
          />

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
    </DeviceCard>
  );
}