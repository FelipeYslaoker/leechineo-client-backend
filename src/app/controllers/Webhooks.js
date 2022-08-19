const errors = require('../config/errors');
const Order = require('../models/Order');

const router = require('express').Router();

router.post('/credit-card', async (req, res) => {
    const reference = req.body.reference_id
    const status = req.body.status

    try {
        const order = await Order.findOne({ reference })
        if (order && status) {
            if (order.paymentData.status !== status) {
                order.paymentData.status = status
                await Order.findOneAndUpdate({ reference }, { paymentData: order.paymentData });
            }
        }
        return res.send()
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError);
    }
});

module.exports = app => app.use('/notifications', router);
