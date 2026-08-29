import express from 'express';

const createLikesRouter = (handler, authenticationMiddleware) => {
  const router = express.Router({ mergeParams: true });

  router.put('/', authenticationMiddleware, handler.putLikeHandler);

  return router;
};

export default createLikesRouter;
