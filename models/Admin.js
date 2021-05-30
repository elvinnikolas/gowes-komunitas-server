const mongoose = require('mongoose')
const schema = mongoose.Schema
const model = mongoose.model

const adminSchema = new schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
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

module.exports = Admin = model('admin', adminSchema)