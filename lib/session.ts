'use server';

import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME = 'authtoken.1';

export async function isAuthenticated(): Promise<boolean> {
  const cookieList = await cookies();
  const token = cookieList.get(TOKEN_COOKIE_NAME)?.value;
  if (token === undefined) return false;
  // TODO
  return true;
}
