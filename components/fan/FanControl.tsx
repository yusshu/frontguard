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
import { WiHumidity } from "react-icons/wi";

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
              ? "border-zinc-700"
              : "border-blue-500"
          }`}
        />
        <Fan state={device.state || { rotates: false, status: "off", temperature: null, humidity: null }} />

        {device.state && (
          <div className="absolute -bottom-4 w-[calc(100%+5rem)] -mx-10 flex flex-col text-blue-500/70 text-xs">
            <span className="flex flex-row items-center -ml-0.5">
              <WiHumidity className="w-4.5 h-4.5" />
              <span className="">
                {device.state?.humidity !== null
                  ? `${device.state?.humidity}%`
                  : "--"}
              </span>
            </span>

            <span className="flex flex-row items-center gap-1">
              <FaTemperatureThreeQuarters className="w-3 h-3" />
              <span className="text-blue-500">
                {device.state?.temperature !== null
                  ? `${device.state?.temperature.toFixed(1)}°C`
                  : "--"}
              </span>
            </span>
          </div>
        )}
      </div>

      {
        device.state === null ? (
          <p className="mb-6 -mt-2 text-sm text-center text-zinc-700">
            Dispositivo desconectado
            </p>
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
        </>)
      }
    </DeviceCard>
  );
}