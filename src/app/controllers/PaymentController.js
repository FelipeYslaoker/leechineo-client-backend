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
const PendingPix = require('../models/PendingPix')
const RequestExistingPix = require('../plugins/Pix/RequestExistingPix')
const GenerateOrderItem = require('../plugins/Order/GenerateOrderItem')
const GetCartPrice = require('../plugins/Cart/GetCartPrice')
const CleanCart = require('../plugins/Cart/CleanCart')
const Settings = require('../models/Settings')

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

router.post('/credit-card', auth(), async (req, res) => {
    const { creditCardID, securityCode, installments, message } = req.body

    if (!securityCode) {
        return res.status(400).send(errors.payment.notAuthorized)
    }
    try {
        const installmentsSetting = await Settings.findOne({ name: 'installments' })
        const cart = await generateCart(req.user.id)
        const cartPrice = await GetCartPrice({ cart })
        const allowedInstallments = JSON.parse(installmentsSetting.value).filter(installment => installment.minValue < cartPrice)
        const selectedInstallment = allowedInstallments.find(installment => installment.value === installments)
        if (!selectedInstallment) {
            return res.status(403).send(errors.payment.notAuthorized)
        }

        const creditCard = await Creditcard.findById(creditCardID)

        const orderItems = await GenerateOrderItem(req.user.id)
        const address = await Address.findById(req.body.address)
        if (!address) {
            return res.status(404).send(errors.address.notFound)
        }
        const price = await GetCartPrice({ cart, installments })

        const payment = await Payment.creditCard({
            price,
            installments: installments,
            creditCard, securityCode
        })
        if (payment.status === 'DECLINED') {
            return res.status(403).send(errors.payment.notAuthorized)
        }
        const order = {
            user: req.user.id,
            address,
            items: orderItems,
            finalPrice: price,
            transactionId: payment.transactionId,
            paymentMethod: 'credit_card',
            message: message || '',
            installments: installments,
            paymentStatus: payment.status
        }
        await Order.create(order)
        await CleanCart(req.user.id)
        res.send({
            paymentData: {
                status: payment.status
            }
        })
    } catch (e) {
        console.log(e.response?.data || e, e.config?.data)
        return res.status(500).send(errors.internalServerError)
    }
});

router.post('/slip', auth(), async (req, res) => {
    const { holderTaxID, holderName, message } = req.body

    if (!holderTaxID || !holderName) {
        return res.status(400).send(errors.payment.notAuthorized)
    }
    try {
        const address = await Address.findById(req.body.address)
        const orderItems = await GenerateOrderItem(req.user.id)
        if (!address) {
            return res.status(404).send(errors.address.notFound)
        }
        const price = await GetCartPrice({ userID: req.user.id })
        const payment = await Payment.slip({ holderTaxID, holderName, holderEmail: req.user.email, price, address })

        if (payment.status === 'DECLINED') {
            return res.status(403).send(errors.payment.notAuthorized)
        }
        const order = {
            user: req.user.id,
            address,
            items: orderItems,
            finalPrice: price,
            transactionId: payment.transactionId,
            paymentMethod: 'slip',
            message: message || '',
            installments: 1,
            paymentStatus: payment.status
        }
        await Order.create(order)
        await CleanCart(req.user.id)
        res.send({
            paymentData: {
                status: payment.status,
                slipUrl: payment.slipUrl
            }
        })
    } catch (e) {
        console.log(e.response?.data || e, e.config?.data)
        return res.status(500).send(errors.internalServerError)
    }
})

router.post('/pix', auth(), async (req, res) => {
    try {
        const existingPix = await RequestExistingPix(req.user.id)
        if (existingPix) {
            return res.send(existingPix)
        }
        const pix = await Payment.pix({userId: req.user.id})
        const newPedingOrder = await PendingPix.create({
            user: req.user.id,
            transactionId: pix.id,
            code: pix.code,
            address: req.body.address,
            qrCode: pix.qrCode,
            price: pix.price,
            finalPrice: pix.finalPrice,
        })
        return res.send({
            code: newPedingOrder.code,
            qrCode: newPedingOrder.qrCode,
            createdAt: newPedingOrder.createdAt
        })
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
})

router.get('/installments-settings', auth(), async (req, res) => {
    try {
        const installments = await Settings.findOne({ name: 'installments' })
        if (!installments) {
            return res.send([])
        }
        const installmentsSettings = JSON.parse(installments.value)
        const cartPrice = await GetCartPrice({ userID: req.user.id })
        const allowedInstallments = installmentsSettings.filter(installment => installment.minValue < cartPrice)
        return res.send(allowedInstallments)
    } catch (e) {
        console.log(e)
        return res.sendStatus(500)
    }
})

module.exports = app => app.use('/payment', router)
