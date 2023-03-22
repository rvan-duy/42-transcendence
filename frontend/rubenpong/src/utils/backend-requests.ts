export async function getBackend(endpoint: string): Promise<any> {
  const backendUrl = `http://${import.meta.env.VITE_CODAM_PC}:${import.meta.env.VITE_BACKEND_PORT}/${endpoint}`;
  const token = document.cookie.split(';').find(cookie => cookie.includes('jwt'))?.split('=')[1]; // Extract JWT from cookie
  const res = await fetch(backendUrl, {
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
