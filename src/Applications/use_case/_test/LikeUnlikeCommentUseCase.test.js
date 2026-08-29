import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import LikeUnlikeCommentUseCase from '../LikeUnlikeCommentUseCase.js';

describe('LikeUnlikeCommentUseCase', () => {
  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: {},
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(likeUnlikeCommentUseCase.execute({ threadId: 'thread-123' }))
      .rejects
      .toThrowError('LIKE_UNLIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: {},
      commentRepository: {},
      threadRepository: {},
    });

    // Action & Assert
    await expect(likeUnlikeCommentUseCase.execute({
      threadId: 'thread-123',
      commentId: 123,
      owner: 'user-123',
    }))
      .rejects
      .toThrowError('LIKE_UNLIKE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the like comment action correctly when comment is not liked yet', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = vi.fn(() => Promise.resolve());
    mockLikeRepository.verifyCommentIsLiked = vi.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = vi.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = vi.fn(() => Promise.resolve());

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith('comment-123');
    expect(mockLikeRepository.verifyCommentIsLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.addLike).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.deleteLike).not.toBeCalled();
  });

  it('should orchestrating the unlike comment action correctly when comment is already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = vi.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = vi.fn(() => Promise.resolve());
    mockLikeRepository.verifyCommentIsLiked = vi.fn(() => Promise.resolve(true));
    mockLikeRepository.addLike = vi.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = vi.fn(() => Promise.resolve());

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith('comment-123');
    expect(mockLikeRepository.verifyCommentIsLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.deleteLike).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.addLike).not.toBeCalled();
  });
});
