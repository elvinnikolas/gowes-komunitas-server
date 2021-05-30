const postResolvers = require('./post')
const userResolvers = require('./user')
const communityResolvers = require('./community')
const faqResolvers = require('./faq')
const chatResolvers = require('./chat')
const messageResolvers = require('./message')
const notificationResolvers = require('./notification')

module.exports = {
    // Post: {
    //     likesCount: (parent) => parent.likes.length,
    //     dislikesCount: (parent) => parent.dislikes.length,
    //     commentsCount: (parent) => parent.comments.length
    // },

    Query: {
        ...postResolvers.Query,
        ...userResolvers.Query,
        ...communityResolvers.Query,
        ...faqResolvers.Query,
        ...chatResolvers.Query,
        ...messageResolvers.Query,
        ...notificationResolvers.Query
    },

    Mutation: {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...communityResolvers.Mutation,
        ...faqResolvers.Mutation,
        ...chatResolvers.Mutation,
        ...messageResolvers.Mutation,
    },

    Subscription: {
        ...messageResolvers.Subscription
    }
}