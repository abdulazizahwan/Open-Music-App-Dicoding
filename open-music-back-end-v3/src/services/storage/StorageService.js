const fs = require('fs');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class StorageService {
    constructor(folder) {
        this._folder = folder;
        this._pool = new Pool();

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
    }

    writeFile(file, meta) {
        const filename = +new Date() + meta.filename;
        const path = `${this._folder}/${filename}`;

        const fileStream = fs.createWriteStream(path);

        return new Promise((resolve, reject) => {
            fileStream.on('error', (error) => reject(error));

            file.pipe(fileStream);
            file.on('end', () => resolve(filename));
        });
    }

    async updateCoverUrl(albumId, url) {
        const query = {
            text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
            values: [url, albumId],
        };

        const { rows } = await this._pool.query(query);

        if (!rows[0].id) {
            throw new InvariantError(`Sampul Album ${albumId} gagal ditambahkan`);
        }

        return rows[0].id;
    }
}

module.exports = StorageService;
