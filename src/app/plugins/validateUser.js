const User = require('../models/User')

async function canBeCreated (user) {
    const userWithEmail = await User.findOne({ email: user.email })
    const userWithCPF = await User.findOne({ cpf: user.cpf })
    if (userWithEmail || userWithCPF) {
        const existingKey = userWithCPF ? 'cpf' : 'email'
        return `${existingKey}_already_in_use`
    }
    return true
}

function validateCPF (cpf) {
    if (!Number(cpf)) {
        return false
    }
    if (typeof cpf !== 'string') { return false }
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) { return false }
    cpf = cpf.split('')
    const validator = cpf
        .filter(
            (digit, index, array) => index >= array.length - 2 && digit
        )
        .map(el => +el)
    const toValidate = pop =>
        cpf
            .filter(
                (digit, index, array) => index < array.length - pop && digit
            )
            .map(el => +el)
    const rest = (count, pop) =>
        ((toValidate(pop).reduce(
            (soma, el, i) => soma + el * (count - i),
            0
        ) *
            10) %
            11) %
        10
    if (!(rest(10, 2) !== validator[0] || rest(11, 1) !== validator[1])) { return true }
    return false
}

function validateBirthday (birthday) {
    if (!birthday || !birthday.day || !birthday.month || !birthday.year) {
        return false
    }
    if (birthday.day.length !== 2 || birthday.month.length !== 2 || birthday.year.length !== 4) {
        return false
    }
    if (Number(birthday.day) < 1 || Number(birthday.day) > 31 || Number(birthday.month) < 1 || Number(birthday.month) > 12) {
        return false
    }
    if (new Date().getFullYear() - Number(birthday.year) < 15) {
        return 'min_age_required'
    }
    if (!Number(birthday.day) || !Number(birthday.month) || !Number(birthday.year)) {
        return false
    }
    return true
}

function validateEmail (email) {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}

function validateName (user) {
    if (!user.name || !user.surname) {
        return false
    }
    if (user.name.length < 2 || user.surname.length < 2) {
        return false
    }
    return true
}

module.exports = async (user) => {
    if (
        !user.email ||
        !user.password ||
        !validateEmail(user.email) ||
        user.password.length < 8 ||
        !validateCPF(user.cpf.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')) ||
        !validateBirthday(user.birthday) ||
        !validateName(user)
    ) {
        return false
    }
    if (validateBirthday(user.birthday) === 'min_age_required') {
        return 'min_age_required'
    }
    const alreadyInUse = await canBeCreated(user)
    if (/already\_in\_use/g.test(alreadyInUse)) {
        return alreadyInUse
    }
    return true
}