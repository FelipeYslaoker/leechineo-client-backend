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
    reference: {
        type: String,
        required: true
    },
    paymentData: {
        type: Object,
        required: true
    }
})

const Order = mongoose.model('Orders', OrderSchema)

module.exports = Order
