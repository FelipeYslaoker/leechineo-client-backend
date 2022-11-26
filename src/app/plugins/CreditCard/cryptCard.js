const Cryptr = require('cryptr')
const getCardBrand = require('./creditCardBrand')

class CryptCard {
    constructor ({ card, encryptedCard, securityCode }) {
        this.card = card
        this.encryptedCard = encryptedCard
        this.fullCrypt = new Cryptr(`${process.env.CREDIT_CARD_KEY_HASH}${card?.securityCode || securityCode}`)
        this.basicCrypt = new Cryptr(process.env.CREDIT_CARD_KEY_HASH)
    }

    get encrypted () {
        return this.#encrypt()
    }
    get fullDecrypted () {
        return this.#fullDecrypt()
    }
    get basicDecrypted () {
        return this.#basicDecrypt()
    }

    #encrypt () {
        const number = this.fullCrypt.encrypt(this.card.number),
        lastDigits = this.basicCrypt.encrypt(this.card.number.substring(15, 19)),
        holderName = this.fullCrypt.encrypt(this.card.holderName),
        expireMonth = this.fullCrypt.encrypt(this.card.expireMonth),
        expireYear = this.fullCrypt.encrypt(this.card.expireYear),
        brand = this.basicCrypt.encrypt(JSON.stringify(getCardBrand(this.card.number))),
        card = { number, holderName, expireMonth, expireYear, lastDigits, brand },
        encryptedCard = this.basicCrypt.encrypt(JSON.stringify(card))
        return encryptedCard
    }
    #fullDecrypt () {
        const encryptedCard = JSON.parse(this.basicCrypt.decrypt(this.encryptedCard.hash)),
        number = this.fullCrypt.decrypt(encryptedCard.number),
        holderName = this.fullCrypt.decrypt(encryptedCard.holderName),
        expireMonth = this.fullCrypt.decrypt(encryptedCard.expireMonth),
        expireYear = this.fullCrypt.decrypt(encryptedCard.expireYear)
        return { number, holderName, expireYear, expireMonth }
    }

    #basicDecrypt () {
        const encryptedCard = JSON.parse(this.basicCrypt.decrypt(this.encryptedCard.hash)),
        lastDigits = this.basicCrypt.decrypt(encryptedCard.lastDigits),
        brand = JSON.parse(this.basicCrypt.decrypt(encryptedCard.brand))
        return {
            lastDigits, brand
        }
    }
}

module.exports = CryptCard
