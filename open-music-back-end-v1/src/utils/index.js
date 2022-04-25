/* eslint-disable camelcase */
const mapDBToSongModel = ({
    album_id,
    ...restOfData
}) => ({
    ...restOfData,
    albumId: album_id,
});

module.exports = {
    mapDBToSongModel,
};
