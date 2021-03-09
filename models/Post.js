const mongoose = require('mongoose')
const schema = mongoose.Schema
const model = mongoose.model

const postSchema = new schema({
    user: {
        type: schema.Types.ObjectId,
        ref: 'user'
    },
    community: {
        type: schema.Types.ObjectId,
        ref: 'community'
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    image: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    likes: [{
        user: {
            type: schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    dislikes: [{
        user: {
            type: schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    bookmarks: [{
        user: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        date: {
            type: String
        }
    }],
    comments: [{
        user: {
            type: schema.Types.ObjectId,
            ref: 'user'
        },
        date: {
            type: String
        },
        comment: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        avatar: {
            type: String
        }
    }]
})

module.exports = Post = model('post', postSchema)