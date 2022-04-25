const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{albumId}/likes',
        handler: handler.postAlbumLikeHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{albumId}/likes',
        handler: handler.getAlbumLikesByIdHandler,
    },
];

module.exports = routes;
