const axios = require('axios')
const fs = require('fs')
const path = require('path')
const https = require('https')

let cert

try {
    cert = fs.readFileSync(
        path.resolve(__dirname, `../../certs/${process.env.GN_CERT}`)
    )
} catch (e) {
    console.log(e)
}

const agent = new https.Agent({
    pfx: cert,
    passphrase: ''
})


const authenticate = ({clientID, clientSecret}) => {
    const basicToken = Buffer.from(`${clientID}:${clientSecret}`).toString('base64')
    return axios({
        method: 'post',
        url: `${process.env.GN_ENDPOINT}/oauth/token`,
        headers: {
            Authorization: `Basic ${basicToken}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: agent,
        data: {
            grant_type: 'client_credentials'
        }
    })
}

const GNRequest = async (credentials) => {
    const authResponse = await authenticate(credentials)
    const accessToken = authResponse.data?.access_token

    return axios.create({
        baseURL: process.env.GN_ENDPOINT,
        httpsAgent: agent,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })
}

module.exports = GNRequest
