const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    username: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
    },
    profilePhoto: {
        type: String,
    },
    password: {
        type: String,
    },
    activationToken: String,
    passwordResetToken: String,
    passwordResetExpiration: String,
})

module.exports = mongoose.model('User', userSchema)
