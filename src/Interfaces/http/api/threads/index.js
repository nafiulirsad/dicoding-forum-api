import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';
import createAuthenticationMiddleware from '../../middlewares/createAuthenticationMiddleware.js';

export default (container) => {
  const threadsHandler = new ThreadsHandler(container);
  return createThreadsRouter(threadsHandler, createAuthenticationMiddleware(container));
};
