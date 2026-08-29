import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, owner) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async deleteLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2 RETURNING id',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async verifyCommentIsLiked(commentId, owner) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async getLikeCountsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id AS comment_id, COUNT(comment_likes.id)::int AS like_count
             FROM comments
             LEFT JOIN comment_likes ON comment_likes.comment_id = comments.id
             WHERE comments.thread_id = $1
             GROUP BY comments.id`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      commentId: row.comment_id,
      likeCount: row.like_count,
    }));
  }
}

export default LikeRepositoryPostgres;
