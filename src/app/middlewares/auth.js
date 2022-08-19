require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const errors = require('../config/errors')

function auth(required = true) {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            if (!required) {
                req.user = {
                    logged: false
                }
                return next()
            }
            return res.status(401).send(errors.auth.loginRequired)
        }
        const parts = authHeader.split(' ')
        if (parts.length !== 2) {
            return res.status(401).send(errors.auth.loginRequired)
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).send(errors.auth.loginRequired)
        }

        jwt.verify(token, process.env.AUTH_HASH, async (err, decoded) => {
            if (err) {
                return res.status(401).send(errors.auth.loginRequired)
            }
            const user = await User.findById(decoded.id)
            req.user = user
            req.user.logged = true
            return next()
        })
    }
}
module.exports = auth;
