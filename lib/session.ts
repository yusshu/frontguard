'use server';

import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME = 'authtoken.1';

export async function isAuthenticated(): Promise<boolean> {
  return (await getToken()) !== null;
}

export async function getToken(): Promise<string | null> {
  const cookieList = await cookies();
  const token = cookieList.get(TOKEN_COOKIE_NAME)?.value;
  return token ?? null;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      { username, password }
    ),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data.error || 'Something went wrong' };
  }

  const token = data.token as string;
  if (!token) {
    return { ok: false, error: 'Invalid token received' };
  }

  // save in cookies
  const cookieList = await cookies();
  cookieList.set({
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return { ok: true, token };
}