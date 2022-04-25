/* eslint-disable camelcase */
const mapDBToSongModel = ({
    album_id,
    ...restOfData
}) => ({
    ...restOfData,
    albumId: album_id,
});

const mapDBToAlbumModel = ({
    cover_url,
    ...restOfData
}) => ({
    ...restOfData,
    coverUrl: cover_url,
});

module.exports = {
    mapDBToSongModel,
    mapDBToAlbumModel,
};
