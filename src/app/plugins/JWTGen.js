require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = (params) => {
    return jwt.sign(params, process.env.AUTH_HASH, {
        expiresIn: 43200
    })
}
