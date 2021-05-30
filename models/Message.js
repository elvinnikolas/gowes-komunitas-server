const mongoose = require('mongoose')
const schema = mongoose.Schema
const model = mongoose.model

const messageSchema = new schema({
    chat: {
        type: schema.Types.ObjectId,
        ref: 'chat'
    },
    from: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    to: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    content: {
        type: String
    },
    // image: {
    //     type: String
    // },
    sent: {
        type: String
    }
})

module.exports = Message = model('message', messageSchema)