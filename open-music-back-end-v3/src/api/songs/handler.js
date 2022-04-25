class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postSongHandler = this.postSongHandler.bind(this);
        this.getSongsHandler = this.getSongsHandler.bind(this);
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
        this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    }

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload);

        const {
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        } = request.payload;

        const songId = await this._service.addSong({
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        });

        const response = h.response({
            status: 'success',
            message: `Lagu dengan id ${songId} berhasil ditambahkan`,
            data: {
                songId,
            },
        });

        response.code(201);
        return response;
    }

    async getSongsHandler(request, h) {
        const {
            title,
            performer,
        } = request.query;

        const songs = await this._service.getSongs(title, performer);

        const response = h.response({
            status: 'success',
            data: {
                songs,
            },
        });

        return response;
    }

    async getSongByIdHandler(request, h) {
        const {
            songId,
        } = request.params;
        const song = await this._service.getSongById(songId);

        const response = h.response({
            status: 'success',
            data: {
                song,
            },
        });

        return response;
    }

    async putSongByIdHandler(request, h) {
        this._validator.validateSongPayload(request.payload);

        const {
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        } = request.payload;

        const {
            songId,
        } = request.params;

        await this._service.editSongById(songId, {
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        });

        const response = h.response({
            status: 'success',
            message: `Lagu dengan id ${songId} berhasil diperbarui`,
        });

        return response;
    }

    async deleteSongByIdHandler(request, h) {
        const {
            songId,
        } = request.params;

        await this._service.deleteSongById(songId);

        const response = h.response({
            status: 'success',
            message: `Lagu dengan id ${songId} berhasil dihapus`,
        });

        return response;
    }
}

module.exports = SongsHandler;
