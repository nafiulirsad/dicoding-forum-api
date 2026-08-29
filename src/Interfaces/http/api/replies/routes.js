import express from 'express';

const createRepliesRouter = (handler, authenticationMiddleware) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', authenticationMiddleware, handler.postReplyHandler);
  router.delete('/:replyId', authenticationMiddleware, handler.deleteReplyHandler);

  return router;
};

export default createRepliesRouter;
