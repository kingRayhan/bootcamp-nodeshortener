const nodemailer = require('nodemailer')

const MailTranspailer = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
})

module.exports = MailTranspailer
