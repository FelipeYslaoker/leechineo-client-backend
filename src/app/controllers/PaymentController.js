const router = require('express').Router()
const Payment = require('../plugins/payment')
const auth = require('../middlewares/auth')
const Address = require('../models/Address')
const CartItem = require('../models/CartItem')
const Product = require('../models/Product')
const generateCart = require('../plugins/generateCart')
const findProductVariant = require('../plugins/findProductVariant')
const errors = require('../config/errors')
const Order = require('../models/Order')
const Creditcard = require('../models/CreditCard')
const CryptCard = require('../plugins/CreditCard/cryptCard')
const uniqid = require('uniqid')

router.post('/pay', auth(), async (req, res) => {
    const cdCardId = req.body['credit-card']
    try {
        let decryptedCard = {}
        if (req.body.method === 'creditCard') {
            const encryptedCard = await Creditcard.findById(cdCardId)
            const cryptcard = new CryptCard({encryptedCard: encryptedCard.hash, user: req.user})
            decryptedCard = cryptcard.decrypted
        }
        const cart = await generateCart(req.user.id)
        if (!cart.length) {
            return res.status(400).send(errors.cart.empty)
        }
        const orderItems = []
        for (const cartItem of cart) {
            const product = await Product.findOne({urlNumber: cartItem.product.code})
            const variant = findProductVariant(cartItem.variant, product)
            const orderItem = {
                name: cartItem.product.name,
                code: cartItem.product.code,
                image: cartItem.product.image,
                price: {
                    currency: variant.price.currency,
                    basePrice: cartItem.price.base,
                    finalPrice: cartItem.price.final || cartItem.price.base
                }
            }
            orderItems.push(orderItem)
        }
        const address = await Address.findById(req.body.address)
        if (!address) {
            return res.status(404).send(errors.address.notFound)
        }
        let price = cart.map(cartItem => cartItem.price.final || cartItem.price.base).reduce((prev, curr) => (prev + curr), 0)
        if (req.body.method === 'slip') {
            const discount = price * 3 / 100
            price -= discount
        }
        let payment
        const reference = uniqid(uniqid(), uniqid())
        try {
            payment = await Payment.pay({
                amount: {
                    currency: 'BRL',
                    value: Number(price).toFixed(2)
                },
                referenceID: reference,
                cdCard: decryptedCard,
                paymentMethod: {
                    type: req.body.method,
                    installments: req.body['credit-card']?.installments || 1
                },
                slip: {
                    holder: req.body.slip.holder,
                    cpf: req.body.slip.cpf
                },
                user: req.user,
                address
            })
            if (payment.status === 'DECLINED') {
                return res.status(401).send(errors.payment.notAuthorized)
            }
        } catch (e) {
            console.log(e?.response?.data || e)
            return res.status(401).send(errors.payment.notAuthorized)
        }
        const cartUser = await CartItem.find({user: req.user.id})
        for (const cartItem of cartUser) {
            await CartItem.findByIdAndDelete(cartItem.id)
        }
        const order = {
            user: req.user.id,
            address,
            items: orderItems,
            finalPrice: price,
            reference,
            paymentData: payment
        }
        await Order.create(order)
        return res.send(order)
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError)
    }
})

module.exports = app => app.use('/payment', router)
