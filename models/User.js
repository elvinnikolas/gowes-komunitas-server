const mongoose = require('mongoose')
const schema = mongoose.Schema
const model = mongoose.model

const userSchema = new schema({
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    date: {
        type: String
    }
})

module.exports = User = model('user', userSchema)