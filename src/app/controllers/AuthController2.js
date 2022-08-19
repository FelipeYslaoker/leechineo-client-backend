const express = require('express')
const router = express.Router()
const validateUser = require('../plugins/validateUser')
const crypto = require('crypto')
const sendEmail = require('../plugins/sendEmail')
const JWTGen = require('../plugins/JWTGen')
const errors = require('../config/errors')
const auth = require('../middlewares/auth')
const bcrypt = require('bcryptjs')

const User = require('../models/User')

router.post('/create-account', async (req, res) => {
    const { email, password, birthday, cpf, name, surname } = req.body
    try {
        const validAccount = await validateUser(req.body)
        if (validAccount === 'min_age_required') {
            return res.status(403).send(errors.auth.minAgeRequired)
        }
        if (/already\_in\_use/g.test(validAccount)) {
            return res.status(403).send(errors.auth[`${validAccount.split('_')[0]}AlreadyInUse`])
        }
        if (!validAccount) {
            return res.status(403).send(errors.general.invalidData)
        }
        const emailConfirmationToken = crypto.randomBytes(50).toString('hex')
        const user = await User.create({
            email,
            password,
            cpf,
            birthday,
            name,
            surname,
            emailConfirmationToken,
            emailConfirmationTokenExpiresIn: new Date().setHours(new Date().getHours() + 1)
        })
        sendEmail({
            email,
            template: 'auth/confirm_email',
            subject: 'Confirmação de email',
            context: {
                token: emailConfirmationToken,
                domain: 'http://192.168.31.101:3000/confirmar-email',
                name
            }
        }, async (e) => {
            if (e) {
                console.log(e)
                await User.findOneAndDelete({ cpf })
                return res.status(503).send(errors.general.failedToSendEmail({
                    message: 'Sua conta foi criada, mas ocorreu um erro ao enviar o email de confirmação. Entre em contato com contato@leechineo.com para resolver.'
                }))
            } else {
                return res.send({ token: JWTGen({ id: user.id }) })
            }
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError)
    }
})

router.post('/resend-email-confirmation', auth(), async (req, res) => {
    try {
        const { email, name } = req.user
        if (req.user.verifiedEmail) {
            return res.status(403).send(errors.auth.emailAlreadyVerified)
        }
        const emailConfirmationToken = crypto.randomBytes(50).toString('hex')
        await User.findOneAndUpdate({ id: req.user.id }, {
            emailConfirmationToken,
            emailConfirmationTokenExpiresIn: new Date().setHours(new Date().getHours() + 1)
        })
        sendEmail({
            email,
            template: 'auth/confirm_email',
            subject: 'Confirmação de email',
            context: {
                token: emailConfirmationToken,
                domain: 'http://192.168.31.101:3000/confirmar-email',
                name
            }
        }, async (e) => {
            if (e) {
                console.log(e)
                return res.status(503).send(errors.general.failedToSendEmail({
                    message: 'Ocorreu um erro ao re-enviar o email de confirmação. Entre em contato com contato@leechineo.com para resolver.'
                }))
            } else {
                return res.send()
            }
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError)
    }
})

router.post('/confirm-email', async (req, res) => {
    const { password } = req.body
    const emailConfirmationToken = req.query.token
    try {
        if (!emailConfirmationToken) {
            return res.status(401).send(errors.auth.tokenNotProvided)
        }
        const user = await User.findOne({ emailConfirmationToken }).select('+password emailConfirmationToken emailConfirmationTokenExpiresIn verifiedEmail')
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).send(errors.auth.invalidCredentials)
        }
        if (!user) {
            return res.status(401).send(errors.auth.invalidCredentials)
        }
        if (user.verifiedEmail) {
            return res.status(403).send(errors.auth.emailAlreadyVerified)
        }
        await User.findOneAndUpdate({ emailConfirmationToken }, {
            emailConfirmationTokenExpiresIn: undefined,
            emailConfirmationToken: undefined,
            verifiedEmail: true
        })
        return res.send()
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.auth.internalServerError)
    }
})
router.post('/login', async (req, res) => {
    const { email, password, cpf } = req.body
    try {
        const user = await User.findOne({ email }).select('+password') || await User.findOne({ cpf }).select('+password')
        if (!user) {
            return res.status(401).send(errors.auth.emailCpfOrPasswordInvalid)
        } else if (!await bcrypt.compare(password, user.password)) {
            res.status(401).send(errors.auth.emailCpfOrPasswordInvalid)
        } else {
            res.send({
                    token: JWTGen({ id: user.id })
                }
            )
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError)
    }
})

module.exports = app => app.use('/auth', router)
