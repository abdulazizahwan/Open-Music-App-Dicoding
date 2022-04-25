/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        title: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
        },
        genre: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        performer: {
            type: 'VARCHAR(50)',
            notNull: true,
        },

        duration: {
            type: 'INTEGER',
            notNull: false,
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: false,
        },
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
        },
        updated_at: {
            type: 'TIMESTAMP',
            notNull: true,
        },
    });

    pgm.addConstraint(
        'songs',
        'fk_albums_album_id',
        'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE',
    );
};

exports.down = (pgm) => {
    pgm.dropTable('songs');
};