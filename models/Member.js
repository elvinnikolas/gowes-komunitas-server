const mongoose = require('mongoose')
const schema = mongoose.Schema
const model = mongoose.model

const memberSchema = new schema({
    community: {
        type: schema.Types.ObjectId,
        ref: 'community'
    },
    user: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    isJoin: {
        type: Boolean,
        required: true
    },
    isRequest: {
        type: Boolean,
        required: true
    }
})

module.exports = Member = model('member', memberSchema)