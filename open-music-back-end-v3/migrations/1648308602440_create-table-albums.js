/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('albums', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
        },
        cover_url: {
            type: 'TEXT',
            default: null,
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
};

exports.down = (pgm) => {
    pgm.dropTable('albums');
};
