const path = require('path');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{albumId}/covers',
        handler: handler.postUploadImageHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 512000,
            },
        },
    },
    {
        method: 'GET',
        path: '/albums/{albumId}/covers/{param*}',
        handler: {
            directory: {
                path: path.resolve(__dirname, 'file/images'),
            },
        },
    },
];

module.exports = routes;
