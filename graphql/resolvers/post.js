const Post = require('../../models/Post')
const Member = require('../../models/Member')
const auth = require('../../utils/auth')

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ date: -1 }).populate('community user').populate('comments.user')
                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId).populate('community user').populate('comments.user')

                if (!post) {
                    throw new Error('Post not found')
                }
                return post

            } catch (error) {
                throw new Error(error)
            }
        },

        async getBookmarkPosts(_, { filter }, context) {
            const payload = auth(context)
            let posts

            try {
                if (filter == 'post') {
                    posts = await Post.find({ 'bookmarks.user': payload._id }).sort({ date: -1 }).populate('community user').populate('comments.user')
                } else {
                    posts = await Post.find({ 'bookmarks.user': payload._id }).sort({ 'bookmarks.date': -1 }).populate('community user').populate('comments.user')

                }
                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getUserCommunitiesPosts(_, { filter }, context) {
            const payload = auth(context)
            const communities = await Member.find({ user: payload._id, isJoin: true })

            let communitiesId = []
            communities.forEach(community => {
                communitiesId.push(community.community)
            });

            try {
                let posts
                if (filter == 'recent') {
                    posts = await Post.find({
                        community: {
                            $in: communitiesId
                        }
                    }).sort({ date: -1 }).populate('community user').populate('comments.user')
                } else if (filter == 'popular') {
                    posts = await Post.find({
                        community: {
                            $in: communitiesId
                        }
                    }).sort({ likesCount: -1 }).populate('community user').populate('comments.user')
                } else if (filter == 'comment') {
                    posts = await Post.find({
                        community: {
                            $in: communitiesId
                        }
                    }).sort({ commentsCount: -1 }).populate('community user').populate('comments.user')
                } else {
                    posts = await Post.find({
                        community: {
                            $in: communitiesId
                        }
                    }).populate('community user').populate('comments.user')
                }

                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getUserCommunityPosts(_, { communityId, filter }) {

            try {
                let posts
                if (filter == 'recent') {
                    posts = await Post.find({ community: communityId }).sort({ date: -1 }).populate('community user').populate('comments.user')
                } else if (filter == 'popular') {
                    posts = await Post.find({ community: communityId }).sort({ likesCount: -1 }).populate('community user').populate('comments.user')
                } else if (filter == 'comment') {
                    posts = await Post.find({ community: communityId }).sort({ commentsCount: -1 }).populate('community user').populate('comments.user')
                }

                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getExplorePosts(_, { filter }) {
            let today = new Date()
            let month = today.getMonth() + 1
            let year = today.getFullYear()
            month = month.toString()
            year = year.toString()

            if (month < 10) {
                month = '0' + month
            }

            try {
                let posts
                if (filter == 'recent') {
                    posts = await Post.aggregate(
                        [
                            {
                                '$addFields': {
                                    'month': {
                                        '$substr': [
                                            '$date', 5, 2
                                        ]
                                    },
                                    'year': {
                                        '$substr': [
                                            '$date', 0, 4
                                        ]
                                    }
                                }
                            }, {
                                '$match': {
                                    'month': month,
                                    'year': year
                                }
                            }, {
                                '$lookup': {
                                    'from': 'communities',
                                    'localField': 'community',
                                    'foreignField': '_id',
                                    'as': 'community_docs'
                                }
                            }, {
                                '$unwind': {
                                    'path': '$community_docs'
                                }
                            }, {
                                '$lookup': {
                                    'from': 'users',
                                    'localField': 'user',
                                    'foreignField': '_id',
                                    'as': 'user_docs'
                                }
                            }, {
                                '$unwind': {
                                    'path': '$user_docs'
                                }
                            }, {
                                '$project': {
                                    '_id': 1,
                                    'user': {
                                        '$mergeObjects': '$user_docs'
                                    },
                                    'title': 1,
                                    'date': 1,
                                    'content': 1,
                                    'images': 1,
                                    'likes': 1,
                                    'dislikes': 1,
                                    'comments': 1,
                                    'bookmarks': 1,
                                    'community': {
                                        '$mergeObjects': '$community_docs'
                                    }
                                }
                            }, {
                                '$sort': {
                                    'date': -1
                                }
                            }, {
                                '$limit': 20
                            }
                        ]
                    )
                } else if (filter == 'popular') {
                    posts = await Post.aggregate(
                        [
                            {
                                '$addFields': {
                                    'month': {
                                        '$substr': [
                                            '$date', 5, 2
                                        ]
                                    },
                                    'year': {
                                        '$substr': [
                                            '$date', 0, 4
                                        ]
                                    }
                                }
                            }, {
                                '$match': {
                                    'month': month,
                                    'year': year
                                }
                            }, {
                                '$lookup': {
                                    'from': 'communities',
                                    'localField': 'community',
                                    'foreignField': '_id',
                                    'as': 'community_docs'
                                }
                            }, {
                                '$unwind': {
                                    'path': '$community_docs'
                                }
                            }, {
                                '$lookup': {
                                    'from': 'users',
                                    'localField': 'user',
                                    'foreignField': '_id',
                                    'as': 'user_docs'
                                }
                            }, {
                                '$unwind': {
                                    'path': '$user_docs'
                                }
                            }, {
                                '$project': {
                                    '_id': 1,
                                    'user': {
                                        '$mergeObjects': '$user_docs'
                                    },
                                    'title': 1,
                                    'date': 1,
                                    'content': 1,
                                    'images': 1,
                                    'likes': 1,
                                    'dislikes': 1,
                                    'comments': 1,
                                    'bookmarks': 1,
                                    'community': {
                                        '$mergeObjects': '$community_docs'
                                    }
                                }
                            }, {
                                '$sort': {
                                    'likesCount': -1
                                }
                            }, {
                                '$limit': 20
                            }
                        ]
                    )
                }

                return posts

            } catch (error) {
                throw new Error(error)
            }
        }
    },

    Mutation: {
        async createPost(_, { title, content, communityId, images }, context) {
            const payload = auth(context)

            if ((title.trim() == '') || (content.trim() == '')) {
                throw new Error('Title and content cannot be empty')
            }

            try {
                const newPost = {
                    title,
                    content,
                    user: payload._id,
                    community: communityId,
                    images: images,
                    likesCount: 0,
                    commentsCount: 0,
                    date: new Date().toISOString()
                }

                const post = new Post(newPost)
                await post.save()
                return post

            } catch (error) {
                throw new Error(error)
            }
        },

        async deletePost(_, { postId }, context) {
            const payload = auth(context)

            try {
                const post = await Post.findById(postId)

                if (post) {
                    await post.remove()
                    return 'Post deleted successfully'

                } else {
                    throw new Error('Invalid post')
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async addComment(_, { postId, comment }, context) {
            const payload = auth(context)

            if (comment.trim() === '') {
                throw new Error('comment cannot be empty')
            }

            try {
                const post = await Post.findById(postId)

                if (post) {
                    const newComment = {
                        comment,
                        user: payload._id,
                        date: new Date().toISOString()
                    }

                    post.comments.unshift(newComment)
                    await post.save()

                    await Post.findOneAndUpdate(
                        { _id: postId },
                        { $inc: { commentsCount: 1 } },
                        { new: true }
                    )
                    return post

                } else {
                    throw new Error('Invalid post')
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async deleteComment(_, { postId, commentId }, context) {
            const payload = auth(context)

            try {
                const post = await Post.findById(postId)
                const userId = payload._id
                const comment = await post.comments.find(comment => comment.id === commentId)

                if (!comment) {
                    throw new Error('Comment not found')
                }

                // else if (comment.user.toString() !== userId) {
                //     throw new Error('User not authorized')
                // }

                else {
                    const removeIndex = post.comments.findIndex(comment => comment.id === commentId)
                    post.comments.splice(removeIndex, 1)
                    await post.save()

                    await Post.findOneAndUpdate(
                        { _id: postId },
                        { $inc: { commentsCount: -1 } },
                        { new: true }
                    )
                    return post
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async likePost(_, { postId }, context) {
            const payload = auth(context)

            try {
                const post = await Post.findById(postId)
                const userId = payload._id

                if (post.likes.find(like => like.user.toString() === userId)) {
                    const removeIndex = post.likes.findIndex(like => like.user.toString() === userId)
                    post.likes.splice(removeIndex, 1)

                    await Post.findOneAndUpdate(
                        { _id: postId },
                        { $inc: { likesCount: -1 } },
                        { new: true }
                    )

                } else {
                    post.likes.unshift({ user: userId })

                    await Post.findOneAndUpdate(
                        { _id: postId },
                        { $inc: { likesCount: 1 } },
                        { new: true }
                    )

                    if (post.dislikes.find(dislike => dislike.user.toString() === userId)) {
                        const removeIndex = post.dislikes.findIndex(dislike => dislike.user.toString() === userId)
                        post.dislikes.splice(removeIndex, 1)
                    }
                }

                await post.save()
                return post

            } catch (error) {
                throw new Error(error)
            }
        },

        async dislikePost(_, { postId }, context) {
            const payload = auth(context)

            try {
                const post = await Post.findById(postId)
                const userId = payload._id

                if (post.dislikes.find(dislike => dislike.user.toString() === userId)) {
                    const removeIndex = post.dislikes.findIndex(dislike => dislike.user.toString() === userId)
                    post.dislikes.splice(removeIndex, 1)

                    await Post.findOneAndUpdate(
                        { _id: postId },
                        { $inc: { likesCount: 1 } },
                        { new: true }
                    )

                } else {
                    post.dislikes.unshift({ user: userId })

                    await Post.findOneAndUpdate(
                        { _id: postId },
                        { $inc: { likesCount: -1 } },
                        { new: true }
                    )

                    if (post.likes.find(like => like.user.toString() === userId)) {
                        const removeIndex = post.likes.findIndex(like => like.user.toString() === userId)
                        post.likes.splice(removeIndex, 1)
                    }
                }

                await post.save()
                return post

            } catch (error) {
                throw new Error(error)
            }
        },

        async bookmarkPost(_, { postId }, context) {
            const payload = auth(context)

            try {
                const post = await Post.findById(postId)
                const userId = payload._id

                if (post.bookmarks.find(bookmark => bookmark.user.toString() === userId)) {
                    const removeIndex = post.bookmarks.findIndex(bookmark => bookmark.user.toString() === userId)
                    post.bookmarks.splice(removeIndex, 1)

                } else {
                    post.bookmarks.unshift({
                        user: userId,
                        date: new Date().toISOString()
                    })
                }

                await post.save()
                return post

            } catch (error) {
                throw new Error(error)
            }
        }
    }
}