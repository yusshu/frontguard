'use client';

import { useState } from "react";

export default function AuthForm({ type }: { type: 'register' | 'login' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(
          type === 'register'
            ? { username, name, email, password }
            : { username, password }
        )
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (type === 'register') {
        window.location.href = '/login';
      } else {
        window.location.href = '/';
      }

    } catch {
      setError('Server unreachable');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl bg-zinc-900">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white">
          {type === 'register' ? 'Registrarme' : 'Inicia Sesión'}
        </h1>
        <p className="text-sm text-zinc-400/70">
          {type === 'register' ? 'Crea una cuenta nueva' : 'Bienvenido de nuevo'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <>
            <input
              className="w-full rounded-lg p-3 bg-zinc-800 text-white"
              placeholder="Nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              className="w-full rounded-lg p-3 bg-zinc-800 text-white"
              placeholder="Correo"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </>
        )}

        <input
          className="w-full rounded-lg p-3 bg-zinc-800 text-white"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <input
          className="w-full rounded-lg p-3 bg-zinc-800 text-white"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          type="submit"
        >
          {loading ? 'Procesando...' : type === 'register' ? 'Registrarme' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
