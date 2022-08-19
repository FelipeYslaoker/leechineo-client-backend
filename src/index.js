require('dotenv').config()
const cors = require('cors')
const express = require('express')
const Controllers = require('./app/controllers/GlobalController')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

Controllers(app)

app.get('/', (req, res) => {
    res.send('OK')
})

const appPort = process.env.PORT || 3003

app.listen(appPort, () => {
    console.log('Server running on port', appPort)
})
