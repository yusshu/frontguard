'use client';

import { useState, ReactNode } from 'react';
import WiFiModal from '@/components/WiFiModal';
import { FaWifi } from 'react-icons/fa6';
import { Device } from '@/lib/device';
import NameChangeModal from './NameChangeModal';
import { Backguard } from '@/hooks/useBackguard';

export function DeviceCard({
  device,
  backguard,
  sendDeviceCommand,
  children,
}: {
  device: Device<any>;
  backguard: Backguard;
  sendDeviceCommand: (command: string) => void;
  children: ReactNode;
}) {
  const [ wifiOpen, setWifiOpen ] = useState(false);
  const [ changingName, setChangingName ] = useState(false);

  function updateWiFi(ssid: string, password: string) {
    const payload = JSON.stringify({
      ssid: ssid.trim(),
      password,
    });

    sendDeviceCommand(`SET_WIFI ${payload}`);
  }

  async function updateDeviceName(name: string) {
    await backguard.fetch('/device_name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: device.id, name }),
    });

    // set devices
    backguard.setDevices((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [device.id]: {
          ...prev[device.id],
          name,
        },
      };
    });
  }

  return (
    <div className="w-full max-w-md rounded-3xl pt-8 pb-1 px-4 shadow-2xl bg-zinc-900 border border-white/5">
      <WiFiModal open={wifiOpen} setOpen={setWifiOpen} onSubmit={updateWiFi} />

      <NameChangeModal open={changingName} setOpen={setChangingName} onSubmit={updateDeviceName} initialName={device.name} />

      <div className="mb-6 text-center flex flex-row justify-between">
        <div className="flex-[0.2]" />
        
        <div
          onClick={() => {
            if (device.state === null) return;
            setChangingName(true);
          }}
          className={`flex flex-[0.6] flex-col items-center ${device.state === null ? 'opacity-50' : ''}`}
        >
          <h1 className="text-xl font-bold text-white/90">
            {device.name}
          </h1>
          <p className="text-xs text-zinc-600">
            ID: <span className="font-mono">{device.id}</span>
          </p>
        </div>

        <div className="flex flex-row items-center justify-end flex-[0.2]">
          <button
            onClick={() => {
              if (device.state === null) return;
              setWifiOpen(!wifiOpen)
            }}
            className={`p-2 border border-white/5 rounded-md ${device.state === null ? 'opacity-50' : ''}`}
          >
            <FaWifi className="h-4.5 w-4.5 text-white/50" />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}