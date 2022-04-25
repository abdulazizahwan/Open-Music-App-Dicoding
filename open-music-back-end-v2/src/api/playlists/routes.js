const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: handler.postPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: handler.getPlaylistsHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistId}',
        handler: handler.deletePlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'POST',
        path: '/playlists/{playlistId}/songs',
        handler: handler.postSongPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/songs',
        handler: handler.getSongsPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistId}/songs',
        handler: handler.deleteSongPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/activities',
        handler: handler.getActivitiesHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
];

module.exports = routes;
