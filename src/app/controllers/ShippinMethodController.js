const errors = require('../config/errors')
const auth = require('../middlewares/auth')
const calculateShipping = require('../plugins/calculateShipping')
const searchAddressByZipcode = require('../plugins/searchAddressByZipcode')
const axios = require('axios').default

const router = require('express').Router()

router.post('/calculate', auth(), async (req, res) => {
    try {
        const shipping = await calculateShipping(req.body.product, req.body.zipcode)
        if (shipping.name) {
            return res.send(shipping)
        } else {
            return res.status(shipping.error.status).send(shipping.error.message)
        }
    } catch (e) {
        console.log(e)
        if (e.response?.status === 400) {
            return res.status(400).send(errors.zipcode.invalidZipcode)
        }
        return res.status(500).send(errors.internalServerError)
    }
})

router.get('/search-by-zipcode', auth(), async (req, res) => {
    const zipcode = req.query.zipcode
    try {
        const address = await searchAddressByZipcode(zipcode)
        if (address.error) {
            return res.status(400).send(address)
        }
        return res.send(address)
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError)
    }
})

module.exports = app => app.use('/shipping', router)
