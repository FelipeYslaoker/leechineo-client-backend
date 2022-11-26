const mongoose = require('../config/database')
const PendingPix = require('./PendingPix')

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

CartItemSchema.pre('save', async function (next) {
    const pendingPix = await PendingPix.find({user: this.user})
    for (const pix of pendingPix) {
        await PendingPix.findByIdAndDelete(pix.id)
    }
    next()
})

const CartItem = mongoose.model('cartitems', CartItemSchema)

module.exports = CartItem
