const mongoose = require('../config/database')

const SettingsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    value: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Settings = mongoose.model('settings', SettingsSchema)

module.exports = Settings
