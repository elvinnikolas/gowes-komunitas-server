const mongoose = require('mongoose')
const schema = mongoose.Schema
const model = mongoose.model

const communitySchema = new schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    bio: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    isPrivate: {
        type: Boolean,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    },
    memberCount: {
        type: Number
    }
})

module.exports = Community = model('community', communitySchema)