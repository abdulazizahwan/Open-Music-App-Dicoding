require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/albums/AlbumsService');
const AlbumsValidator = require('./validator/albums/index');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songs/SongsService');
const SongsValidator = require('./validator/songs/index');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/users/UsersService');
const UsersValidator = require('./validator/users/index');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/authentications/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications/index');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/playlists/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists/index');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/collaborations/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations/index');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports/index');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads/index');

// likes
const likes = require('./api/likes');
const LikesService = require('./services/postgres/likes/LikesService');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
    const cacheService = new CacheService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
    const likesService = new LikesService(cacheService);

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // registrasi plugin eksternal
    await server.register([{
        plugin: Jwt,
    }, {
        plugin: Inert,
    }]);

    // mendefinisikan strategy authentikasi jwt
    server.auth.strategy('openmusicapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([{
        plugin: albums,
        options: {
            service: albumsService,
            validator: AlbumsValidator,
        },
    },
    {
        plugin: songs,
        options: {
            service: songsService,
            validator: SongsValidator,
        },
    },
    {
        plugin: users,
        options: {
            service: usersService,
            validator: UsersValidator,
        },
    },
    {
        plugin: authentications,
        options: {
            authenticationsService,
            usersService,
            tokenManager: TokenManager,
            validator: AuthenticationsValidator,
        },
    },
    {
        plugin: playlists,
        options: {
            service: playlistsService,
            validator: PlaylistsValidator,
        },
    },
    {
        plugin: collaborations,
        options: {
            collaborationsService,
            playlistsService,
            validator: CollaborationsValidator,
        },
    }, {
        plugin: _exports,
        options: {
            service: ProducerService,
            playlistsService,
            validator: ExportsValidator,
        },
    }, {
        plugin: uploads,
        options: {
            service: storageService,
            validator: UploadsValidator,
        },
    }, {
        plugin: likes,
        options: {
            service: likesService,
        },
    },
    ]);

    server.ext('onPreResponse', (request, h) => {
        // mendapatkan konteks response dari request
        const { response } = request;

        if (response instanceof ClientError) {
            // membuat response baru dari response toolkit sesuai kebutuhan error handling
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
        return response.continue || response;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
