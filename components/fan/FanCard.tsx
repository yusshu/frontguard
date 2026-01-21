'use client';

import { Device } from "@/lib/device";
import { FanMode, FanSpeed, FanState } from "@/lib/fan";
import Fan from "./Fan";
import { Backguard } from "@/hooks/useBackguard";
import { useState } from "react";
import { FaTemperatureThreeQuarters } from "react-icons/fa6";
import FanSpeedSlider from "./FanSpeedSlider";
import FanOscillationSwitch from "./FanOscillationSwitch";
import { DeviceCard } from "../DeviceCard";
import { WiHumidity } from "react-icons/wi";

// manual control
function FanManualControls({
  device,
  setFanSpeed,
  toggleRotation,
}: {
  device: Device<FanState>,
  setFanSpeed: (speed: FanSpeed) => void,
  toggleRotation: () => void,
}) {
  return (
    <>
      <div className="mt-5 mb-6">
        <FanSpeedSlider
          value={device.state!.status}
          onChange={setFanSpeed}
        />
      </div>

      <FanOscillationSwitch
        value={device.state!.rotates}
        onToggle={toggleRotation}
      />
    </>
  );
}

// scheduled control - fan turns on/off at specific day times
function FanScheduledControls({
  device,
  send,
}: {
  device: Device<FanState>,
  send: (cmd: string) => void;
}) {
  const [start, setStart] = useState(device.state!.scheduled_start ?? "08:00");
  const [end, setEnd] = useState(device.state!.scheduled_end ?? "22:00");
  const [speed, setSpeed] = useState<FanSpeed>(device.state!.scheduled_or_thresholded_status ?? "medium");

  function apply() {
    send(`SCHEDULE ${start} ${end}`);
    send(`SET_SCHEDULED_OR_THRESHOLDED_STATUS ${speed}`);
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-3">
        <div className="flex flex-col flex-1">
          <label className="text-xs text-zinc-500 mb-1">Desde</label>
          <input
            type="time"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs"
          />
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-xs text-zinc-500 mb-1">Hasta</label>
          <input
            type="time"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">
          Velocidad
        </label>
        <FanSpeedSelector value={speed} onChange={setSpeed} />
      </div>

      <button
        onClick={apply}
        className="w-full mt-4 mb-4 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/40 py-2 rounded-lg"
      >
        Aplicar programación
      </button>
    </div>
  );
}


function FanSpeedSelector({
  value,
  onChange,
}: {
  value: FanSpeed;
  onChange: (s: FanSpeed) => void;
}) {
  const speeds: FanSpeed[] = ["slow", "medium", "fast"];

  return (
    <div className="flex gap-2">
      {speeds.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`flex-1 text-xs py-1.5 rounded-lg border transition ${
            value === s
              ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
              : "border-white/10 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {(() => {
            switch (s) {
              case "slow":
                return "Lenta";
              case "medium":
                return "Media";
              case "fast":
                return "Rápida";
            }
          })()?.toUpperCase()}
        </button>
      ))}
    </div>
  );
}


// threshold control - fan turns on/off based on temperature threshold
function FanThresholdControls({
  device,
  send,
}: {
  device: Device<FanState>,
  send: (cmd: string) => void;
}) {
  const [value, setValue] = useState(device.state!.threshold_temp ?? 25);
  const [speed, setSpeed] = useState<FanSpeed>(device.state!.scheduled_or_thresholded_status ?? "medium");

  function apply() {
    send(`SET_THRESHOLD ${value}`);
    send(`SET_SCHEDULED_OR_THRESHOLDED_STATUS ${speed}`);
  }

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">
          Umbral de activación (°C)
        </label>

        <input
          type="number"
          step={0.1}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">
          Velocidad
        </label>
        <FanSpeedSelector value={speed} onChange={setSpeed} />
      </div>

      <button
        onClick={apply}
        className="w-full mt-4 mb-4 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/40 py-2 rounded-lg"
      >
        Aplicar umbral
      </button>
    </div>
  );
}


function ControlModeTabs({
  device,
  send,
  setFanSpeed,
  toggleRotation,
}: {
  device: Device<FanState>,
  send: (cmd: string) => void,
  setFanSpeed: (speed: FanSpeed) => void,
  toggleRotation: () => void,
}) {
  const [ uiMode, setUiMode ] = useState<FanMode>(device.state!.mode);
  const base =
    "flex-1 text-xs py-1.5 rounded-lg transition border border-white/10";

  function setMode(mode: FanMode) {
    setUiMode(mode);
    send(`SWITCH_MODE ${mode}`);
  }

  return (<>
    <div className="flex gap-2 bg-zinc-900/60 py-1 rounded-xl">
      <button
        onClick={() => setMode("manual")}
        className={`${base} ${
          uiMode === "manual"
            ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Manual
      </button>

      <button
        onClick={() => setMode("scheduled")}
        className={`${base} ${
          uiMode === "scheduled"
            ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Programado
      </button>

      <button
        onClick={() => setMode("threshold")}
        className={`${base} ${
          uiMode === "threshold"
            ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Umbral
      </button>
    </div>
    
    <div className={`${uiMode !== device.state!.mode ? 'opacity-30 animate-pulse' : ''}`}>
      {uiMode === "manual" && (
        <FanManualControls
          device={device}
          setFanSpeed={setFanSpeed}
          toggleRotation={toggleRotation}
        />
      )}

      {uiMode === "scheduled" && <FanScheduledControls device={device} send={send} />}

      {uiMode === "threshold" && <FanThresholdControls device={device} send={send} />}
    </div>
  </>);
}

export default function FanCard({
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
        <Fan state={device.state || {
          rotates: false, status: "off", temperature: null, humidity: null,
          mode: 'manual', scheduled_start: null, scheduled_end: null, threshold_temp: null, scheduled_or_thresholded_status: null,
        }} />

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
          <ControlModeTabs device={device} send={sendToFan} setFanSpeed={setFanSpeed} toggleRotation={toggleRotation} />
        </>)
      }
    </DeviceCard>
  );
}