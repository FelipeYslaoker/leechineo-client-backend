const cors = require('cors')
const express = require('express')
const Controllers = require('./app/controllers/GlobalController')
const Address = require('./app/models/Address')
const Order = require('./app/models/Order')

const PedingPix = require('./app/models/PendingPix')
const CleanCart = require('./app/plugins/Cart/CleanCart')
const GenerateOrderItem = require('./app/plugins/Order/GenerateOrderItem')
const RequestExistingPix = require('./app/plugins/Pix/RequestExistingPix')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

Controllers(app)

app.get('/', (req, res) => {
    res.send('OK')
})

io.on('connection', socket => {
    socket.emit('connected')

    socket.on('pixGenerated', async (data) => {
        await PedingPix.findOneAndUpdate({ user: data.user }, {
            socketId: socket.id
        })
        socket.emit('pendingOrderCreated')
    })

    socket.on('requestExistingPix', async (data) => {
        const pedingPixes = await PedingPix.find({ user: data.user })
        for (const pix of pedingPixes) {
            await PedingPix.findByIdAndUpdate(pix.id, {
                socketId: socket.id
            })
        }
        const existingPix = await RequestExistingPix(data.user)
        socket.emit('pixLoaded', existingPix)
    })

    socket.on('disconnect', async () => {
        const pedingPixes = await PedingPix.find({ socketId: socket.id })
        if (!pedingPixes.length) {
            return
        }
        for (const pix of pedingPixes) {
            await PedingPix.findByIdAndUpdate(pix.id, {
                socketId: ''
            })
        }
    })

    socket.on('pixPayed', async (data) => {
        if (data.socketId) {
            io.to(data.socketId).emit('generatingOrder')
        }
        const pendingPix = data.pendingPix
        const address = await Address.findById(pendingPix.address)
        const items = await GenerateOrderItem()

        await Order.create({
            user: pendingPix.user,
            transactionId: pendingPix.transactionId,
            paymentMethod: 'pix',
            message: data.message,
            address,
            items,
            price: pendingPix.price,
            finalPrice: pendingPix.finalPrice,
            paymentStatus: 'approved'
        })
        await CleanCart(pendingPix.user)

        if (data.socketId) {
            io.to(data.socketId).emit('paymentSuccessfully')
        }
    })
})

module.exports = { server, io }