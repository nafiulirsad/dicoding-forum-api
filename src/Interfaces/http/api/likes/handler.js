import LikeUnlikeCommentUseCase from '../../../../Applications/use_case/LikeUnlikeCommentUseCase.js';

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(req, res, next) {
    try {
      const likeUnlikeCommentUseCase = this._container
        .getInstance(LikeUnlikeCommentUseCase.name);
      const { id: owner } = req.credentials;
      const { threadId, commentId } = req.params;

      await likeUnlikeCommentUseCase.execute({ threadId, commentId, owner });

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LikesHandler;
