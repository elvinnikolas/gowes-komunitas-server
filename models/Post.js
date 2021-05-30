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
    images: [{
        type: String
    }],
    likesCount: {
        type: Number
    },
    commentsCount: {
        type: Number
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
        avatar: {
            type: String
        }
    }]
})

module.exports = Post = model('post', postSchema)