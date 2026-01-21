'use client';

import { useState } from 'react';

export default function WiFiModal({
  open,
  setOpen,
  onSubmit,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (ssid: string, password: string) => void;
}) {
  if (!open) return null;

  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit() {
    onSubmit(ssid, password);
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-20 p-4 flex items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={e => {
        if (e.target === e.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-lg shadow-lg">
        <h2 className="text-center text-lg font-semibold mb-8">Configuración WiFi</h2>
        <input
          id="ssid"
          type="text"
          placeholder="Nombre de Red"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
          className="mb-4 py-2 px-4 border border-white/10 rounded-lg w-full focus:outline-2 focus:outline-blue-500/50"
          autoComplete="off"
        />
        <input
          id="wifipass"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 py-2 px-4 border border-white/10 rounded-lg w-full focus:outline-2 focus:outline-blue-500/50"
          autoComplete="off"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white/80 px-4 py-2 rounded-xl w-full mt-6"
        >
          Conectar
        </button>
        <button
          onClick={() => setOpen(false)}
          className="border border-white/10 bg-white/5 text-white/60 px-4 py-2 rounded-xl w-full mt-3"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}