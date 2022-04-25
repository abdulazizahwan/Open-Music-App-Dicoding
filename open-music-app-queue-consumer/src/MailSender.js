const nodemailer = require('nodemailer');

class MailSender {
    constructor() {
        this._transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    sendEmail(targetEmail, content) {
        const message = {
            from: 'Open Music Apps v3',
            to: targetEmail,
            subject: 'Ekspor Lagu Pada Playlist',
            text: 'Terlampir hasil dari ekspor lagu pada playlist',
            attachments: [
                {
                    filename: 'playlist_songs.json',
                    content,
                },
            ],
        };

        return this._transporter.sendMail(message);
    }
}

module.exports = MailSender;
