/*
 * This file contains functions to make requests to the backend.
 */

const BACKEND_URL = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}`;

export async function getBackend(endpoint: string): Promise<any> {
  const endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = document.cookie.split(';').find(cookie => cookie.includes('jwt'))?.split('=')[1]; // Extract JWT from cookie
  const res = await fetch(endpointUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (res.status === 200) {
    return await res.json();
  }
  console.log('Error requesting from backend:', res.status, res.statusText);
  return null;
}

/* Untested */
export async function putBackend(endpoint: string, body: any): Promise<any> {
  const endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = document.cookie.split(';').find(cookie => cookie.includes('jwt'))?.split('=')[1]; // Extract JWT from cookie
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
