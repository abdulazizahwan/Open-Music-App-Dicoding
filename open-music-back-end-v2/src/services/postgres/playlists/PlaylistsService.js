const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const AuthorizationError = require('../../../exceptions/AuthorizationError');

class PlaylistService {
    constructor(collaborationService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError(`Playlist ${id} gagal ditambahkan`);
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id INNER JOIN users ON users.id = playlists.owner WHERE playlists.owner = $1 OR collaborations.user_id = $1',
            values: [owner],
        };
        const { rows } = await this._pool.query(query);
        return rows;
    }

    async deletePlaylist(playlistId) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Playlist gagal dihapus');
        }
    }

    async addSongPlaylist({ playlistId, songId }) {
        const query = {
            text: 'INSERT INTO playlist_songs (playlist_id, song_id) VALUES($1, $2) RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Song gagal ditambahkan ke dalam Playlist');
        }

        return result.rows[0].id;
    }

    async getSongsPlaylist({ playlistId }) {
        const playlistsJoinWithUsersQuery = {
            text: 'SELECT playlists.*, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1',
            values: [playlistId],
        };
        const playlistUserQueryResult = await this._pool.query(playlistsJoinWithUsersQuery);

        const songsQuery = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
            values: [playlistId],
        };
        const songsQueryResult = await this._pool.query(songsQuery);

        if (!playlistUserQueryResult.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const playlist = playlistUserQueryResult.rows[0];
        const songs = songsQueryResult.rows;

        return {
            id: playlist.id,
            name: playlist.name,
            username: playlist.username,
            songs,
        };
    }

    async deleteSongPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Song gagal dihapus dari Playlist');
        }
    }

    async verifySongId(songId) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [songId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Song tidak ditemukan');
        }
    }

    async verifyPlaylistOwner(playlistId, owner) {
        const query = {
            text: 'SELECT owner FROM playlists WHERE id = $1',
            values: [playlistId],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async checkUserAvailability(userId) {
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [userId],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('User tidak ditemukan');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationService.verifyCollaboration(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addActivity(playlistId, songId, owner, action) {
        const id = `activities-${nanoid(16)}`;
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, owner, action, date],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Activity gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getActivities(playlistId) {
        const activitiesQuery = {
            text: 'SELECT playlist_id FROM playlist_song_activities WHERE playlist_id = $1',
            values: [playlistId],
        };
        const activitiesResult = await this._pool.query(activitiesQuery);

        const activitiesJoinWithUsersQuery = {
            text: 'SELECT t2.username, t3.title, t1.action, t1.time FROM playlist_song_activities t1 INNER JOIN users t2 ON t1.user_id = t2.id INNER JOIN songs t3 ON t1.song_id = t3.id WHERE playlist_id = $1',
            values: [playlistId],
        };

        const activitiesJoinWithUserResult = await this._pool.query(activitiesJoinWithUsersQuery);

        const playlist = activitiesResult.rows[0].playlist_id;

        const activities = activitiesJoinWithUserResult.rows;

        return {
            playlistId: playlist,
            activities,
        };
    }
}

module.exports = PlaylistService;
