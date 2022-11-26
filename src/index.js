require('dotenv').config()
const { server } = require('./server')

const appPort = process.env.PORT || 3003

server.listen(appPort, () => {
    console.log('Server running on port', appPort)
})
