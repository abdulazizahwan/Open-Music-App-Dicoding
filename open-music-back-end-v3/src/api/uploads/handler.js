class UploadsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h) {
        const data = request.payload;
        const { albumId } = request.params;

        this._validator.validateImageHeaders(data.cover.hapi.headers);

        const filename = await this._service.writeFile(data.cover, data.cover.hapi);
        await this._service.updateCoverUrl(albumId, `http://${process.env.HOST}:${process.env.PORT}/albums/${albumId}/covers/${filename}`);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
            data: {
                coverUrl: `http://${process.env.HOST}:${process.env.PORT}/albums/${albumId}/covers/${filename}`,
            },
        });
        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;
