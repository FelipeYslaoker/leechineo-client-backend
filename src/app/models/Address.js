const mongoose = require('../config/database')

const AddressSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    complement: {
        type: String,
        default: ''
    },
    reference: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: true
    }
})

const Address = mongoose.model('addresses', AddressSchema)

module.exports = Address
