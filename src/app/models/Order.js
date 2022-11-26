const mongoose = require('../config/database')

const OrderSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    finalPrice: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
    },
    message: {
        type: String
    },
    installments: {
        type: Number,
        default: 1
    },
    trackingCode: {
        type: String
    },
    paymentStatus: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model('Orders', OrderSchema)

module.exports = Order
