import { getBackend } from '../utils/backend-requests';

export function isLoggedIn(): Promise<boolean> {
  return getBackend('auth/validate')
    .then((res) => {
      if (res.status === 200) {
        return true;
      }
      return false;
    });
}
