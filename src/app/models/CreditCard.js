const mongoose = require('../config/database')

const CreditcardSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    charge: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    }
})

const Creditcard = mongoose.model('creditcards', CreditcardSchema)

module.exports = Creditcard
