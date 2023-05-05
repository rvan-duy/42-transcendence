/*
 * This file contains some wrapper functions for making requests to the backend.
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

export async function postBackend(endpoint: string, body: any): Promise<Response> {
  const endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = getJwtFromCookies();
  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function postPictureBackend(endpoint: string, body: any): Promise<Response> {
  const endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = getJwtFromCookies();
  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: body,
  });
  return res;
}

// Start of oswin's code

interface QueryParams {
  [key: string]: any;
}

export async function postBackendWithQueryParams<T>(endpoint: string, body: any, queryParams?: QueryParams): Promise<T> {
  let endpointUrl = `${BACKEND_URL}/${endpoint}`;
  const token = getJwtFromCookies();
  
  // Add query parameters to the endpoint URL if provided
  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    endpointUrl += `?${params.toString()}`;
  }

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseData = await res.json();
  return responseData as T;
}

// End of oswin's code

export function getJwtFromCookies(): string {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    if (cookie.includes('jwt')) {
      return cookie.split('=')[1];
    }
  }
  return '';
}
