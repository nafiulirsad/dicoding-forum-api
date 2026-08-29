export const up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    'thread_id': {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"threads"',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    'is_delete': {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });

  pgm.createIndex('comments', 'thread_id');
  pgm.createIndex('comments', 'owner');
};

export const down = (pgm) => {
  pgm.dropTable('comments');
};
