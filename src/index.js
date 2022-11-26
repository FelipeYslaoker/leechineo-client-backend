require('dotenv').config()
const { server } = require('./server')

const appPort = process.env.API_CLIENT_PORT || 3003

server.listen(appPort, () => {
    console.log('Server running on port', appPort)
})
