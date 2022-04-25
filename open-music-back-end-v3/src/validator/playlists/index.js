const { PostPlaylistPayloadSchema, PostSongPlaylistPayloadSchema, DeleteSongPlaylistPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistsValidator = {
    validatePostPlaylistPayload: (payload) => {
        const validationResult = PostPlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validatePostSongPlaylistPayload: (payload) => {
        const validationResult = PostSongPlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateDeleteSongPlaylistPayload: (payload) => {
        const validationResult = DeleteSongPlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistsValidator;
