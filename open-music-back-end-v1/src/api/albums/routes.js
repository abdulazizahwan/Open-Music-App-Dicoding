const routes = (handler) => [{
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
}, {
    method: 'GET',
    path: '/albums/{albumId}',
    handler: handler.getAlbumByIdHandler,
}, {
    method: 'PUT',
    path: '/albums/{albumId}',
    handler: handler.putAlbumByIdHandler,
}, {
    method: 'DELETE',
    path: '/albums/{albumId}',
    handler: handler.deleteAlbumByIdHandler,
}];

module.exports = routes;
