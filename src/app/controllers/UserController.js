const express = require("express");
const auth = require("../middlewares/auth");
const errors = require("../config/errors");
const User = require("../models/User");
const Product = require("../models/Product");
const findProductVariant = require("../plugins/findProductVariant");
// const calculateShipping = require("../plugins/calculateShipping");
const validateTicket = require("../plugins/validateTicket");
const CartItem = require("../models/CartItem");
const Address = require("../models/Address");
const generateCart = require("../plugins/generateCart");
const Order = require("../models/Order");
const CryptCard = require("../plugins/CreditCard/cryptCard");
const randomInt = require("../plugins/randomInt");
const Creditcard = require("../models/CreditCard");
const Payment = require("../plugins/payment");
const getCardBrand = require("../plugins/CreditCard/creditCardBrand");

const router = express.Router();

router.get("/get", auth(), async (req, res) => {
  try {
    const user = {
      id: req.user.id,
      birthday: req.user.birthday,
      cpf: req.user.cpf,
      email: req.user.email,
      name: req.user.name,
      selectedAddress: req.user.selectedAddress,
      surname: req.user.surname
    }
    return res.send({user});
  } catch (e) {
    console.log(e);
    return res.status(500).send(errors.internalServerError);
  }
});

router.put("/favorites/update", auth(), async (req, res) => {
  try {
    const productID = req.query.id;
    if (!productID) {
      return res.status(400).send(errors.product.productIdRequired);
    }
    const product = await Product.findOne({
      urlNumber: productID,
      visibility: "public",
    });
    if (!product) {
      return res.status(404).send(errors.product.notFound);
    }
    const user = await User.findById(req.user.id).select("+favorites");
    const favorites = [...user.favorites];
    if (favorites.includes(product.id)) {
      favorites.splice(favorites.indexOf(product.id), 1);
    } else {
      favorites.push(product.id);
    }
    await User.findByIdAndUpdate(user.id, { favorites });
    return res.send();
  } catch (e) {
    console.log(e);
    return res.status(500).send(errors.internalServerError);
  }
});

router.post("/cart/add", auth(), async (req, res) => {
  const { product: productID, variant, zipcode, tickets, quantity } = req.body;

  try {
    // Validation of Cart Item
    const user = await User.findById(req.user.id).select('+orders');
    const product = await Product.findOne({ urlNumber: Number(productID) });
    if (!product) {
      //Poduct exists?
      return res.status(404).send(errors.product.notFound);
    }
    const variantOption = findProductVariant(variant, product);
    if (!variantOption) {
      return res.status(404).send(errors.product.variant.notFound);
    }
    const calculateShippinProduct = {
      product: {
        id: productID,
        variant,
      },
      zipcode,
    };
    /*
    const shippingMethod = await calculateShipping(
      calculateShippinProduct.product,
      zipcode
    );
    if (shippingMethod.error) {
      return res
        .status(shippingMethod.error.status)
        .send(shippingMethod.error.message);
    }
    */
    if (variantOption.stock < quantity) {
      return res.status(403).send(errors.product.variant.insuficientStock);
    } //TODO Refatorar
    for (const ticket of tickets) {
      const ticketIsValid = await validateTicket({
        name: ticket,
        productID,
        user,
        type: "product",
      });
      if (ticketIsValid.error) {
        return res
          .status(ticketIsValid.error.status)
          .send(ticketIsValid.error.message);
      }
    }
    const _cart = await CartItem.find({user: req.user.id});
    // Repeated items verification
    const itemsWithTheSameProduct = _cart.filter(
      (item) => item.product === Number(productID)
    );
    if (itemsWithTheSameProduct.length > 1) {
      if (
        itemsWithTheSameProduct.filter(
          (item) => item.variant.join(" ") === variant.join(" ")
        ).length >= 1
      ) {
        return res.status(403).send(errors.cart.repeated);
      }
    }
    await CartItem.create({
      user: req.user.id,
      tickets,
      product: Number(productID),
      variant,
      quantity
    })
    return res.send();
  } catch (e) {
    console.log(e);
    return res.status(500).send(errors.internalServerError);
  }
});

router.get("/cart", auth(), async (req, res) => {
  try {
    const cartItems = await generateCart(req.user.id)    
    return res.send(cartItems);
  } catch (e) {
    console.log(e);
    return res.status(500).send(errors.internalServerError);
  }
});

router.get('/orders', auth(), async (req, res) => {
  try {
    const orders = await Order.find({user: req.user.id})
    return res.send(orders)
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})

router.post('/address/add', auth(), async (req, res) => {
  const address = req.body

  try {
    const newAddress = {
      user: req.user.id,
      zipcode: address.zipcode,
      city: address.city,
      state: address.state,
      district: address.district,
      street: address.street,
      number: address.number,
      complement: address.complement,
      phone: address.phone
    }
    const addedAddress = await Address.create(newAddress)
    return res.send(addedAddress)
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})

router.get('/address/get', auth(), async (req, res) => {
  try {
    const addresses = await Address.find({user: req.user.id})
    return res.send(addresses)
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})
router.delete('/address/delete', auth(), async (req, res) => {
  try {
    const address = await Address.findById(req.query.id)
    if (!address) {
      return res.status(404).send(errors.address.notFound)
    }
    await Address.findByIdAndDelete(req.query.id)
    return res.send()
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})

router.post('/store-card', auth(), async (req, res) => {
  const creditCard = req.body.creditCard
  try {
    if (!creditCard) {
      return res.status(400).send(errors.invalidRequest)
    }
    const cryptCard = new CryptCard({card: creditCard, user: req.user})
    const encryptedCard = cryptCard.encrypted
    const card = {
      hash: encryptedCard,
      name: req.body.name,
      user: req.user.id
    }
    const storedCard = await Creditcard.create(card)
    return res.send(
      {
        lastDigits: creditCard.number.substring(15, 19),
        name: creditCard.name,
        id: storedCard.id
      }
    )
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})

router.post('/store-card/charge', auth(), async (req, res) => {
  const { creditCard, securityCode } = req.body
  try {
    const chargeValue = (randomInt(100, 500)/100).toFixed(2)
    const encryptedCard = await Creditcard.findById(creditCard)
    if (!encryptedCard) {
      return res.status(404).send()
    }
    const cryptCard = new CryptCard({encryptedCard: encryptedCard.hash, user: req.user})
    const decryptedCard = cryptCard.decrypted
    let payment
    try {
      payment = await Payment.pay({
        amount: {
          currency: 'BRL',
          value: chargeValue
        },
        cdCard: { securityCode, ...decryptedCard },
        paymentMethod: {
          installments: 1,
          type: 'creditCard'
        },
        slip: {},
        address: {},
        user: req.user,
      })
      if (payment.status === 'DECLINED') {
        return res.status(401).send(errors.payment.notAuthorized)
      }
      await Payment.refund({reference: payment.reference, value: chargeValue * 100})
      console.log(payment.reference)
    } catch (e) {
      console.log(e.response)
      return res.status(401).send(errors.payment.notAuthorized)
    }
    encryptedCard.charge = chargeValue
    await encryptedCard.save()
    return res.send()
  } catch (e) {
    console.log(e.response)
    return res.status(500).send(errors.internalServerError)
  }
})

router.post('/store-card/verify', auth(), async (req, res) => {
  const { creditCard, chargeValue } = req.body
  try {
    const storedCard = await Creditcard.findById(creditCard)
    if (!storedCard) {
      return res.status(404).send(errors.creditCard.notFound)
    }
    if (storedCard.charge === 0) {
      return res.status(401).send(errors.invalidRequest)
    }
    if (storedCard.charge !== chargeValue) {
      return res.status(403).send(errors.creditCard.invalidValue)
    }
    storedCard.verified = true
    await storedCard.save()
    return res.send()
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})

router.post('/store-card/cancel', auth(), async (req, res) => {
  try {
    await Creditcard.findOneAndDelete(req.query.id)
    return res.send()
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})

router.get('/credit-card/get', auth(), async (req, res) => {
  try {

    //Get unique card
    if (req.query.id) {
      const encryptedCard = await Creditcard.findById(req.query.id)
      if (!encryptedCard) {
        return res.status(404).send(errors.creditCard.notFound)
      }
      const cryptCard = new CryptCard({encryptedCard: encryptedCard.hash, user: req.user})
      const decryptedCard = cryptCard.decrypted
      const brand = getCardBrand(decryptedCard.number.replaceAll(' ', ''))
      return res.send({
        brand: {
          name: brand.brand,
          id: brand.id
        },
        name: encryptedCard.name,
        verified: encryptedCard.verified,
        id: encryptedCard.id,
        lastDigits: decryptedCard.number.substring(15, 19)
      })
    }

    //Get all cards
    const encryptedCards = await Creditcard.find({user: req.user.id})
    const decryptedCards = encryptedCards.map(card => {
      const cryptCard = new CryptCard({encryptedCard: card.hash, user: req.user})
      const decryptedCard = cryptCard.decrypted
      const brand = getCardBrand(decryptedCard.number.replaceAll(' ', ''))
      return {
        brand: {
          name: brand.brand,
          id: brand.id
        },
        name: card.name,
        id: card.id,
        verified: card.verified,
        lastDigits: decryptedCard.number.substring(15, 19)
      }
    })
    return res.send(decryptedCards)
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})
router.delete('/credit-card/delete', auth(), async (req, res) => {
  try {
    const card = await Creditcard.findById(req.query.id)
    if (!card) {
      return res.status(404).send(errors.creditCard.notFound)
    }
    await Creditcard.findByIdAndDelete(req.query.id)
    return res.send()
  } catch (e) {
    console.log(e)
    return res.status(500).send(errors.internalServerError)
  }
})

module.exports = (app) => app.use("/user", router);
