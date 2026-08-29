import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-456' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like to database', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].comment_id).toEqual('comment-123');
      expect(likes[0].owner).toEqual('user-123');
    });
  });

  describe('deleteLike function', () => {
    it('should remove like from database', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });

    it('should not throw error when the like does not exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(likeRepositoryPostgres.deleteLike('comment-123', 'user-123'))
        .resolves
        .not.toThrowError();
    });
  });

  describe('verifyCommentIsLiked function', () => {
    it('should return true when the user has liked the comment', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.verifyCommentIsLiked('comment-123', 'user-123');

      // Assert
      expect(isLiked).toEqual(true);
    });

    it('should return false when the user has not liked the comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.verifyCommentIsLiked('comment-123', 'user-123');

      // Assert
      expect(isLiked).toEqual(false);
    });
  });

  describe('getLikeCountsByThreadId function', () => {
    it('should return the like count of every comment in the thread', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-456', commentId: 'comment-123', owner: 'user-456' });
      await LikesTableTestHelper.addLike({ id: 'like-789', commentId: 'comment-456', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toHaveLength(2);
      expect(likeCounts).toEqual(expect.arrayContaining([
        { commentId: 'comment-123', likeCount: 2 },
        { commentId: 'comment-456', likeCount: 1 },
      ]));
    });

    it('should return zero like count for comment without like', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId('thread-123');

      // Assert
      expect(likeCounts).toEqual(expect.arrayContaining([
        { commentId: 'comment-123', likeCount: 0 },
        { commentId: 'comment-456', likeCount: 0 },
      ]));
    });

    it('should return empty array when thread has no comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId('thread-xxx');

      // Assert
      expect(likeCounts).toEqual([]);
    });
  });
});
