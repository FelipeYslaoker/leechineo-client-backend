const PendingPix = require('./../../models/PendingPix')

const RequestExistingPix = async (user) => {
    const pendingPixes = await PendingPix.find({
        user: user
    })
    const sortPedingPixes = pendingPixes.sort((a, b) => a > b)
    if (sortPedingPixes.length > 1) {
        for (const index in sortPedingPixes) {
            if (index === 0) {
                continue
            }
            await PendingPix.findByIdAndDelete(sortPedingPixes[index].id)
        }
    }
    const pendingPix = sortPedingPixes[0]
    if (pendingPix) {
        const createdAt = pendingPix.createdAt
        const secondsToExpire = pendingPix.expiresIn
        const expiresIn = createdAt.setSeconds(secondsToExpire)
        if (new Date() < new Date(expiresIn)) {
            return {
                code: pendingPix.code,
                qrCode: pendingPix.qrCode,
                createdAt: pendingPix.createdAt
            }
        } else {
            await PendingPix.findOneAndDelete({user: user})
            return null
        }
    }
    return null
}

module.exports = RequestExistingPix