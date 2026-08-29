import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import DetailThread from '../../../Domains/threads/entities/DetailThread.js';
import DetailComment from '../../../Domains/comments/entities/DetailComment.js';
import DetailReply from '../../../Domains/replies/entities/DetailReply.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should throw error when payload did not contain thread id', async () => {
    // Arrange
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: {},
      commentRepository: {},
      replyRepository: {},
      likeRepository: {},
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute({}))
      .rejects
      .toThrowError('GET_THREAD_DETAIL_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw error when thread id did not meet data type specification', async () => {
    // Arrange
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: {},
      commentRepository: {},
      replyRepository: {},
      likeRepository: {},
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute({ threadId: 123 }))
      .rejects
      .toThrowError('GET_THREAD_DETAIL_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const useCasePayload = { threadId: 'thread-123' };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadById = vi.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    }));

    mockCommentRepository.getCommentsByThreadId = vi.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        isDelete: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'comment yang dihapus',
        isDelete: true,
      },
    ]));

    mockReplyRepository.getRepliesByThreadId = vi.fn(() => Promise.resolve([
      {
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'balasan yang dihapus',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        isDelete: true,
      },
      {
        id: 'reply-456',
        commentId: 'comment-123',
        content: 'sebuah balasan',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        isDelete: false,
      },
    ]));

    mockLikeRepository.getLikeCountsByThreadId = vi.fn(() => Promise.resolve([
      { commentId: 'comment-123', likeCount: 2 },
      { commentId: 'comment-456', likeCount: 0 },
    ]));

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        new DetailComment({
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          isDelete: false,
          likeCount: 2,
          replies: [
            new DetailReply({
              id: 'reply-123',
              content: 'balasan yang dihapus',
              date: '2021-08-08T07:59:48.766Z',
              username: 'johndoe',
              isDelete: true,
            }),
            new DetailReply({
              id: 'reply-456',
              content: 'sebuah balasan',
              date: '2021-08-08T08:07:01.522Z',
              username: 'dicoding',
              isDelete: false,
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-456',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: 'comment yang dihapus',
          isDelete: true,
          likeCount: 0,
          replies: [],
        }),
      ],
    });

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual(expectedDetailThread);
    expect(detailThread.comments[0].content).toEqual('sebuah comment');
    expect(detailThread.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(detailThread.comments[0].likeCount).toEqual(2);
    expect(detailThread.comments[1].likeCount).toEqual(0);
    expect(detailThread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
    expect(detailThread.comments[0].replies[1].content).toEqual('sebuah balasan');
    expect(detailThread.comments[1].replies).toHaveLength(0);
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-123');
    expect(mockLikeRepository.getLikeCountsByThreadId).toBeCalledWith('thread-123');
  });

  it('should default likeCount to zero when the comment has no like entry', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.getThreadById = vi.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    }));
    mockCommentRepository.getCommentsByThreadId = vi.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        isDelete: false,
      },
    ]));
    mockReplyRepository.getRepliesByThreadId = vi.fn(() => Promise.resolve([]));
    mockLikeRepository.getLikeCountsByThreadId = vi.fn(() => Promise.resolve([]));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getThreadDetailUseCase.execute({ threadId: 'thread-123' });

    // Assert
    expect(detailThread.comments[0].likeCount).toEqual(0);
  });
});
