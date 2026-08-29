import express from 'express';

const createCommentsRouter = (handler, authenticationMiddleware) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', authenticationMiddleware, handler.postCommentHandler);
  router.delete('/:commentId', authenticationMiddleware, handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;
