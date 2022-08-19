require('dotenv').config();
const nodemailer = require('nodemailer');
const { pugEngine } = require('nodemailer-pug-engine');
const path = require('path');

var transport = nodemailer.createTransport({
    name: process.env.MAILER_NAME,
    host: process.env.MAILER_HOST,
    port: process.env.PORT_MAILER,
    secure: process.env.SECURE_MAILER,
    auth: {
        user: process.env.USER_MAILER,
        pass: process.env.PASS_MAILER,
    },
});

transport.use('compile', pugEngine({
    templateDir: path.resolve(__dirname, '..', 'templates'),
    pretty: true
}));

module.exports = transport;
