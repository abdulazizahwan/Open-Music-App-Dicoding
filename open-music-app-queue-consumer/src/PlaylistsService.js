const { Pool } = require('pg');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    async getSongsPlaylist(playlistId) {
        const playlistQuery = {
            text: 'SELECT playlists.id, playlists.name FROM playlists WHERE id = $1',
            values: [playlistId],
        };
        const playlistQueryResult = await this._pool.query(playlistQuery);

        const songsQuery = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
            values: [playlistId],
        };
        const songsQueryResult = await this._pool.query(songsQuery);

        const playlistResult = playlistQueryResult.rows[0];
        const songs = songsQueryResult.rows;

        return {
            playlist: {
                ...playlistResult,
                songs,
            },
        };
    }
}

module.exports = PlaylistsService;
