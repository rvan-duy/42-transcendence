/*
 * This file contains functions to make requests to the backend.
 */

const BACKEND_URL = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}`;

export function getBackend(endpoint: string): Promise<Response> {
  const endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = getJwtFromCookies();
  const res = fetch(endpointUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res;
}

export async function putBackend(endpoint: string, body: any): Promise<Response> {
  const endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = getJwtFromCookies();
  const res = await fetch(endpointUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res;
}

export function getJwtFromCookies(): string {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    if (cookie.includes('jwt')) {
      return cookie.split('=')[1];
    }
  }
  return '';
}
