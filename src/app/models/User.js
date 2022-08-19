const mongoose = require('../config/database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    birthday: {
        type: Object,
        required: true
    },
    cpf: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    selectedAddress: {
        type: String,
        default: ''
    },
    paymentMethods: {
        type: Array,
        default: [],
        select: false
    },
    favorites: {
        type: Array,
        default: [],
        select: false
    },
    verifiedEmail: {
        type: Boolean,
        default: false,
        select: false
    },
    verifiedAccount: {
        type: Boolean,
        default: false,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    emailConfirmationToken: {
        type: String,
        select: false
    },
    emailConfirmationTokenExpiresIn: {
        type: Date,
        select: false
    },
    orders: {
        type: Array,
        default: [],
        select: false
    },
    usedTickets: {
        type: Array,
        default: [],
        select: false
    },
    admin: {
        type: Boolean,
        default: false,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

UserSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;
