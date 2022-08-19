const mongoose = require('../config/database')

const CartItemSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        default: ''
    },
    tickets: {
        type: Array,
        default: []
    },
    product: {
        type: Number,
        required: true
    },
    variant: {
        type: Array,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
})

const CartItem = mongoose.model('cartitems', CartItemSchema)

module.exports = CartItem
