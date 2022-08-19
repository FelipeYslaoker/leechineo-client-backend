const mongoose = require('../config/database')

const SectionSchema = new mongoose.Schema({
    name: String,
    type: {
        type: String,
        default: 'product'
    },
    items: {
        type: Array,
        required: true
    },
    rules: {
        type: Array
    },
    position: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Section = mongoose.model('homesections', SectionSchema)

module.exports = Section
