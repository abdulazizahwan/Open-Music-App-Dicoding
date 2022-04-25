class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
        this.postSongPlaylistHandler = this.postSongPlaylistHandler.bind(this);
        this.getSongsPlaylistHandler = this.getSongsPlaylistHandler.bind(this);
        this.deleteSongPlaylistHandler = this.deleteSongPlaylistHandler.bind(this);
        this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePostPlaylistPayload(request.payload);

        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._service.addPlaylist({
            name, owner: credentialId,
        });

        const response = h.response({
            status: 'success',
            message: `Playlist ${playlistId} berhasil ditambahkan`,
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);

        const response = h.response({
            status: 'success',
            data: {
                playlists,
            },
        });

        return response;
    }

    async deletePlaylistHandler(request) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, credentialId);
        await this._service.deletePlaylist(playlistId);

        return {
            status: 'success',
            message: `Playlist ${playlistId} berhasil dihapus`,
        };
    }

    async postSongPlaylistHandler(request, h) {
        this._validator.validatePostSongPlaylistPayload(request.payload);

        const { playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifySongId(songId);
        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        await this._service.addSongPlaylist({
            playlistId, songId,
        });

        const response = h.response({
            status: 'success',
            message: `Lagu ${songId} berhasil ditambahkan ke dalam Playlist ${playlistId}`,
        });
        response.code(201);

        await this._service.addActivity(playlistId, songId, credentialId, 'add');

        return response;
    }

    async getSongsPlaylistHandler(request) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._service.getSongsPlaylist({
            playlistId,
        });

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deleteSongPlaylistHandler(request) {
        this._validator.validateDeleteSongPlaylistPayload(request.payload);

        const { playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        await this._service.deleteSongPlaylist(playlistId, songId);

        await this._service.addActivity(playlistId, songId, credentialId, 'delete');

        return {
            status: 'success',
            message: `Lagu ${songId} berhasil dihapus dari Playlist ${playlistId}`,
        };
    }

    async getActivitiesHandler(request, h) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(playlistId, credentialId);
        const activities = await this._service.getActivities(playlistId);

        const response = h.response({
            status: 'success',
            data: activities,
        });

        return response;
    }
}

module.exports = PlaylistsHandler;
