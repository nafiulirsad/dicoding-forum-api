import CommentsHandler from './handler.js';
import createCommentsRouter from './routes.js';
import createAuthenticationMiddleware from '../../middlewares/createAuthenticationMiddleware.js';

export default (container) => {
  const commentsHandler = new CommentsHandler(container);
  return createCommentsRouter(commentsHandler, createAuthenticationMiddleware(container));
};
