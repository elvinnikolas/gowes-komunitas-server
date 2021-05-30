const mongoose = require('mongoose')
const schema = mongoose.Schema
const model = mongoose.model

const notificationSchema = new schema({
    community: {
        type: schema.Types.ObjectId,
        ref: 'community'
    },
    user: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    content: {
        type: String
    },
    date: {
        type: String
    }
})

module.exports = Member = model('notification', notificationSchema)