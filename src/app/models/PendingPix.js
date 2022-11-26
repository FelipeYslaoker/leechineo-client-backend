const mongoose = require('../config/database')

const PendingPixSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: Object,
        required: true
    },
    finalPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    user: {
        type: String,
        default: ''
    },
    expiresIn: {
        type: Number,
        default: 1800
    },
    code: {
        type: String
    },
    socketId: {
        type: String
    },
    qrCode: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const PendingPix = mongoose.model('PendingPix', PendingPixSchema)

module.exports = PendingPix
