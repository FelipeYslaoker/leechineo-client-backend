const mongoose = require('../config/database')

const ProductSchema = new mongoose.Schema({
    urlNumber: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    specifications: Array,
    category: String,
    subCategory: String,
    subSubCategory: String,
    brand: String,
    type: {
        type: String,
        default: 'product'
    },
    description: String,
    images: Array,
    variants: {
        type: Object,
        required: true
    },
    visibility: {
        type: String,
        default: 'private'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

ProductSchema.index({name: 'text', description: 'text'})

const Product = mongoose.model('Product', ProductSchema)

module.exports = Product
