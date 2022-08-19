require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const crypto = require('crypto');
const mailer = require('../config/mailer');

const User = require('../models/User');

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, process.env.AUTH_HASH, {
        expiresIn: 86400
    });
}
router.post('/reset-or-confirm-token-is-valid', async (req, res) => {
    const { token, request } = req.body;
    if (!token || !request) return res.send({
        valid: false,
    });
    try {
        const user = request === 'reset'
            ? await User.findOne({ passwordResetToken: token }).select('+passwordResetToken passwordResetExpires')
            : await User.findOne({ emailConfirmationToken: token }).select('+emailConfirmationToken emailConfirmationExpires');
        if (!user) return res.send({
            valid: false
        });
        if (request === 'reset') {
            if (new Date > user.passwordResetExpires) return res.send({
                valid: false
            });
        } else if (new Date > user.emailConfirmationExpires) return res.send({
            valid: false
        });
        return res.send({
            valid: true
        });
    } catch (e) {
        console.log(e)
        return res.send({
            valid: false
        });
    }
});

router.post('/logout', auth(), async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        return res.send({ user });
    } catch (e) {
        console.log(e);
        return res.status(500).send({
            error: 'internal_server_error',
            message: 'Erro interno do servidor.'
        });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send({
            error: 'user_not_found',
            message: 'Usuário não encontrado.'
        });
        const token = crypto.randomBytes(50).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);
        await User.findOneAndUpdate({ email }, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            },
        });
        await mailer.sendMail({
            to: email,
            template: 'auth/forgot_password',
            from: '"Leechineo" <teste@leechineo.com>',
            subject: 'Redefinição de senha',
            ctx: {
                token,
                domain: 'http://192.168.31.209:3000/redefinir-senha',
                name: `${user.name}`
            }
        });
        return res.send();
    } catch (e) {
        console.log(e);
        return res.status(500).send({
            error: 'internal_server_error',
            message: 'Erro interno do servidor.'
        });
    }
});

router.post('/reset-password', auth({ required: false }), async (req, res) => {
    const { password, currentPassword } = req.body;
    const token = req.query.token;
    try {
        const user = req.user.logged
            ? await User.findOne({ _id: req.user._id }).select('+passwordResetToken passwordResetExpires password')
            : await User.findOne({ passwordResetToken: token }).select('+passwordResetToken passwordResetExpires password');
        if (req.user.logged) {
            if (!await bcrypt.compare(currentPassword, user.password)) {
                return res.status(401).send({
                    error: 'invalid_email_or_password',
                    message: 'Por favor, digite corretamente sua senha atual.'
                });
            }
        }
        if (!user) return res.status(404).send({
            error: 'user_not_found',
            message: 'Usuário não encontrado.'
        });
        if (token !== user.passwordResetToken) return res.status(401).send({
            error: 'invalid_token',
            message: 'O link que você está utilizando não é válido.'
        });
        if (new Date > user.passwordResetExpires) return res.status(401).send({
            error: 'expired_token',
            message: 'O link que você está utilizando está expirado.'
        });
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return res.send();
    } catch (e) {
        console.log(e);
        return res.status(500).send({
            error: 'internal_server_error',
            message: 'Erro interno do servidor.'
        });
    }
});

module.exports = app => app.use('/auth', router);
