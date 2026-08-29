import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

/**
 * Middleware autentikasi berada pada layer interface (bukan use case) agar use case
 * tetap dapat dipakai ulang oleh delivery mechanism lain, misalnya CLI.
 */
const createAuthenticationMiddleware = (container) => async (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AuthenticationError('Missing authentication');
    }

    const authenticationTokenManager = container.getInstance(AuthenticationTokenManager.name);
    const { id, username } = await authenticationTokenManager.verifyAccessToken(token);

    req.credentials = { id, username };

    next();
  } catch (error) {
    next(error);
  }
};

export default createAuthenticationMiddleware;
