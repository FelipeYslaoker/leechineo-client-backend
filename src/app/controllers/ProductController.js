const router = require('express').Router()
const errors = require('../config/errors')
const Product = require('../models/Product')
const userProduct = require('../plugins/userProduct')
const paginate = require('../middlewares/paginate')
const auth = require('../middlewares/auth')
const User = require('../models/User')

router.get('/get', auth(false), paginate(Product), async (req, res) => {
    try {
        let user = await User.findById(req.user.id).select('+favorites')
        if (req.query.id) {
            const _product = await Product.findOne({ urlNumber: Number(req.query.id), visibility: 'public' })
            if (!_product) {
                return res.status(404).send(errors.product.notFound)
            } else {
                const product = await userProduct(_product, user)
                return res.send({ product })
            }
        } else {
            const products = []
            for (const _product of res.paginatedResult.results) {
                const product = await userProduct(_product, user)
                products.push(product)
            }
            return res.send(products)
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError)
    }
})

module.exports = app => app.use('/products', router)
