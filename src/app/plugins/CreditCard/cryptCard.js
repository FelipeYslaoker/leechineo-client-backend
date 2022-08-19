const Cryptr = require('cryptr')

class CryptCard {
    constructor ({ card, user, encryptedCard }) {
        this.card = card
        this.user = user
        this.encryptedCard = encryptedCard
        this.key = `${process.env.AUTH_HASH}-${user.id}`
    }
    get encrypted () {
        return this.encrypt()
    }
    get decrypted () {
        return this.decrypt()
    }
    encrypt () {
        const cryptr = new Cryptr(this.key)
        const number = cryptr.encrypt(this.card.number),
        holderName = cryptr.encrypt(this.card.holderName),
        expireMonth = cryptr.encrypt(this.card.expireMonth),
        expireYear = cryptr.encrypt(this.card.expireYear),
        card = { number, holderName, expireMonth, expireYear },
        encryptedCard = cryptr.encrypt(JSON.stringify(card))
        return encryptedCard
    }
    decrypt () {
        const cryptr = new Cryptr(this.key),
        encryptedCard = JSON.parse(cryptr.decrypt(this.encryptedCard)),
        number = cryptr.decrypt(encryptedCard.number),
        holderName = cryptr.decrypt(encryptedCard.holderName),
        expireMonth = cryptr.decrypt(encryptedCard.expireMonth),
        expireYear = cryptr.decrypt(encryptedCard.expireYear)
        return { number, holderName, expireYear, expireMonth }
    }
}

module.exports = CryptCard
