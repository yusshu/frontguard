'use client';

import { useState } from 'react';

export default function NameChangeModal({
  open,
  setOpen,
  onSubmit,
  initialName = "",
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
}) {
  if (!open) return null;

  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      await onSubmit(name.trim());
      setOpen(false);
    } catch (err) {
      setError('No se pudo actualizar el nombre');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 p-4 flex items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          setOpen(false);
        }
      }}
    >
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-center text-lg font-semibold mb-8">
          Cambiar nombre
        </h2>

        <input
          type="text"
          placeholder="Nuevo nombre"
          value={name}
          disabled={loading}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 py-2 px-4 border border-white/10 rounded-lg w-full
                     focus:outline-2 focus:outline-blue-500/50
                     disabled:opacity-50"
          autoComplete="off"
        />

        {error && (
          <p className="text-sm text-red-400 mb-2 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white/80 px-4 py-2 rounded-xl w-full mt-6
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando…' : 'Guardar'}
        </button>

        <button
          onClick={() => !loading && setOpen(false)}
          disabled={loading}
          className="border border-white/10 bg-white/5 text-white/60 px-4 py-2 rounded-xl w-full mt-3
                     disabled:opacity-40"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
