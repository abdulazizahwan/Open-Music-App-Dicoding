/* eslint-disable no-underscore-dangle */

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const {
            name,
            year,
        } = request.payload;

        const albumId = await this._service.addAlbum({
            name,
            year,
        });

        const response = h.response({
            status: 'success',
            message: `Album dengan id ${albumId} berhasil ditambahkan`,
            data: {
                albumId,
            },
        });

        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request, h) {
        const {
            albumId,
        } = request.params;

        const album = await this._service.getAlbumById(albumId);

        const response = h.response({
            status: 'success',
            data: {
                album,
            },
        });

        return response;
    }

    async putAlbumByIdHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const {
            name,
            year,
        } = request.payload;

        const {
            albumId,
        } = request.params;

        await this._service.editAlbumById(albumId, {
            name,
            year,
        });

        const response = h.response({
            status: 'success',
            message: `Album dengan id ${albumId} berhasil diperbarui`,
        });

        return response;
    }

    async deleteAlbumByIdHandler(request, h) {
        const {
            albumId,
        } = request.params;

        await this._service.deleteAlbumById(albumId);

        const response = h.response({
            status: 'success',
            message: `Album dengan id ${albumId} berhasil dihapus`,
        });

        return response;
    }
}

module.exports = AlbumsHandler;
