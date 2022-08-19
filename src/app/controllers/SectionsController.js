const express = require('express')
const errors = require('../config/errors')
const Section = require('../models/Section')

const router = express.Router()

router.get('/get', async (req, res) => {
    try {
        const sections = await Section.find()
        return res.send({sections})
    } catch (e) {
        console.log(e)
        return res.status(500).send(errors.internalServerError)
    }
})

module.exports = app => app.use('/sections', router)
