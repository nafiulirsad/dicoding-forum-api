export const up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    'comment_id': {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    date: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Satu pengguna hanya boleh menyukai satu komentar sekali. Constraint ini
  // menjaga likeCount tetap benar walau ada request ganda yang beriringan.
  pgm.addConstraint('comment_likes', 'unique_comment_id_and_owner', 'UNIQUE(comment_id, owner)');

  pgm.createIndex('comment_likes', 'comment_id');
};

export const down = (pgm) => {
  pgm.dropTable('comment_likes');
};
