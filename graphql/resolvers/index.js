const postResolvers = require('./post')
const userResolvers = require('./user')
const communityResolvers = require('./community')

module.exports = {
    // Post: {
    //     likesCount: (parent) => parent.likes.length,
    //     dislikesCount: (parent) => parent.dislikes.length,
    //     commentsCount: (parent) => parent.comments.length
    // },

    Query: {
        ...postResolvers.Query,
        ...userResolvers.Query,
        ...communityResolvers.Query
    },

    Mutation: {
        ...userResolvers.Mutation,
        ...postResolvers.Mutation,
        ...communityResolvers.Mutation
    }
}