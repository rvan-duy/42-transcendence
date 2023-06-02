import { getBackend } from '../utils/backend-requests';

// Check if user is logged in, also return if 2FA is required
// 200 = logged in, 2FA not required
// 401 = not logged in
// 403 = logged in, 2FA required

export function isLoggedIn(): Promise<number> {
  return getBackend('auth/validate')
    .then((res) => {
      return res.status;
    })
};
