const Post = require('../../models/Post')
const auth = require('../../utils/auth')

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ date: -1 }).populate('community')
                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId).populate('community')

                if (!post) {
                    throw new Error('Post not found')
                }
                return post

            } catch (error) {
                throw new Error(error)
            }
        },

        async getBookmarkPosts(_, { }, context) {
            const payload = auth(context)

            try {
                const posts = await Post.find({ 'bookmarks.user': payload._id }).sort({ 'bookmarks.date': -1 }).populate('community')
                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getUserCommunitiesPosts(_, { }, context) {
            const payload = auth(context)
            const communities = await Member.find({ user: payload._id, isJoin: true })

            let communitiesId = []
            communities.forEach(community => {
                communitiesId.push(community.community)
            });

            try {
                posts = await Post.find({
                    community: {
                        $in: communitiesId
                    }
                }).populate('community')

                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getUserCommunityPosts(_, { communityId }) {

            try {
                const posts = await Post.find({ community: communityId }).populate('community')
                return posts

            } catch (error) {
                throw new Error(error)
            }
        }
    },

    Mutation: {
        async createPost(_, { title, content, communityId }, context) {
            const payload = auth(context)

            if ((title.trim() == '') || (content.trim() == '')) {
                throw new Error('Title and content cannot be empty')
            }

            try {
                const newPost = {
                    title,
                    content,
                    user: payload._id,
                    name: payload.name,
                    community: communityId,
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
                    if (post.user.toString() === payload._id) {
                        await post.remove()
                        return 'Post deleted successfully'
                    }
                    else {
                        throw new Error('Invalid user')
                    }

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
                        name: payload.name,
                        date: new Date().toISOString()
                    }

                    post.comments.unshift(newComment)
                    await post.save()
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

                else if (comment.user.toString() !== userId) {
                    throw new Error('User not authorized')
                }

                else {
                    const removeIndex = post.comments.findIndex(comment => comment.id === commentId)
                    post.comments.splice(removeIndex, 1)
                    await post.save()
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

                } else {
                    post.likes.unshift({ user: userId })

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

                } else {
                    post.dislikes.unshift({ user: userId })

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