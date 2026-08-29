import RepliesHandler from './handler.js';
import createRepliesRouter from './routes.js';
import createAuthenticationMiddleware from '../../middlewares/createAuthenticationMiddleware.js';

export default (container) => {
  const repliesHandler = new RepliesHandler(container);
  return createRepliesRouter(repliesHandler, createAuthenticationMiddleware(container));
};
