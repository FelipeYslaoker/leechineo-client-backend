const mongoose = require('../config/database')

const ShippingMethodSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    mappings: {
        type: Array
    },
    defaultMapping: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const ShippingMethod = mongoose.model('shppingmethods', ShippingMethodSchema)

module.exports = ShippingMethod
