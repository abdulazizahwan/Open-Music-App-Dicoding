class LikesHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
        this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);
    }

    async postAlbumLikeHandler(request, h) {
        let result;

        const { albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.checkAlbumId(albumId);

        const liked = await this._service.checkAlbumLike(credentialId, albumId);

        if (!liked) {
            await this._service.addAlbumLike(credentialId, albumId);
            result = `Likes berhasil ditambahkan ke album ${albumId}`;
        } else {
            await this._service.deleteAlbumLike(credentialId, albumId);
            result = `Likes berhasil dibatalkan dari album ${albumId}`;
        }

        const response = h.response({
            status: 'success',
            message: result,
        });

        response.code(201);
        return response;
    }

    async getAlbumLikesByIdHandler(request, h) {
        const { albumId } = request.params;
        const result = await this._service.getAlbumLikesById(albumId);

        const response = h.response({
            status: 'success',
            data: {
                likes: result.likes,
            },
        });

        response.code(200);

        if (result.cache) {
            response.header('X-Data-Source', 'cache');
        }

        return response;
    }
}

module.exports = LikesHandler;
