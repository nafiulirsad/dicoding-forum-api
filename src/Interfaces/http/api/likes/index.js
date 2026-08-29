import LikesHandler from './handler.js';
import createLikesRouter from './routes.js';
import createAuthenticationMiddleware from '../../middlewares/createAuthenticationMiddleware.js';

export default (container) => {
  const likesHandler = new LikesHandler(container);
  return createLikesRouter(likesHandler, createAuthenticationMiddleware(container));
};
