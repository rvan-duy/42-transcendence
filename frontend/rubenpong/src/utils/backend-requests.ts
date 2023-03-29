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

/* Untested */
export async function putBackend(endpoint: string, body: any): Promise<any> {
  const endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = getJwtFromCookies();
  const res = await fetch(endpointUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (res.status === 200) {
    return await res.json();
  }
  console.log('Error requesting from backend:', res.status, res.statusText);
  return null;
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
