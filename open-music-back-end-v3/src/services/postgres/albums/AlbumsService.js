const {
    Pool,
} = require('pg');
const {
    nanoid,
} = require('nanoid');

const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');

const {
    mapDBToAlbumModel,
} = require('../../../utils');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({
        name,
        year,
    }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO albums(id, name, year, created_at, updated_at) VALUES($1, $2, $3, $4, $4) RETURNING id',
            values: [id, name, year, createdAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan.');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT id, name, year, cover_url FROM albums WHERE id=$1',
            values: [id],
        };

        const result = await this._pool.query(query);

        const songQuery = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id =$1',
            values: [id],
        };

        const songResult = await this._pool.query(songQuery);

        if (!result.rows.length) {
            throw new NotFoundError(`Album dengan id ${id} tidak ditemukan.`);
        }

        const album = result.rows.map(mapDBToAlbumModel)[0];
        const songs = songResult.rows;

        return {
            ...album,
            songs,
        };
    }

    async editAlbumById(id, {
        name,
        year,
    }) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(`Album dengan id ${id} tidak ditemukan.`);
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id= $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(`Album dengan id ${id} tidak ditemukan.`);
        }
    }
}

module.exports = AlbumsService;
