const Post = require('../../models/Post')
const Community = require('../../models/Community')
const Member = require('../../models/Member')
const auth = require('../../utils/auth')

module.exports = {
    Query: {
        async getCommunities() {
            try {
                const communities = await Community.find().sort({ date: -1 })
                return communities

            } catch (error) {
                throw new Error(error)
            }
        },

        async getCommunity(_, { communityId }) {
            try {
                const community = await Community.findById(communityId)

                if (!community) {
                    throw new Error(error)
                }
                return community

            } catch (error) {
                throw new Error(error)
            }
        },

        async getCommunityPosts(_, { communityId }) {
            try {
                const posts = await Post.find({ community: communityId })

                if (!posts) {
                    throw new Error(error)
                }
                return posts

            } catch (error) {
                throw new Error(error)
            }
        },

        async getCommunityMembers(_, { communityId }) {
            try {
                const members = await Member.find({ community: communityId, isJoin: true }).populate('user')

                if (!members) {
                    throw new Error(error)
                }
                return members

            } catch (error) {
                throw new Error(error)
            }
        },

        async getUserCommunities(_, { userId }) {
            try {
                const communities = await Member.find({ user: userId, isJoin: true }).populate('community')

                if (!communities) {
                    throw new Error(error)
                }
                return communities

            } catch (error) {
                throw new Error(error)
            }
        },

        async getCommunityMemberRequests(_, { communityId }) {
            try {
                const members = await Member.find({ community: communityId, isRequest: true }).populate('user')

                if (!members) {
                    throw new Error(error)
                }
                return members

            } catch (error) {
                throw new Error(error)
            }
        },

        async getCommunityAndMemberStatus(_, { userId, communityId }) {
            try {
                const community = await Community.findById(communityId)
                const member = await Member.findOne({ user: userId, community: communityId })

                if (!member) {
                    return {
                        ...community._doc,
                        isAdmin: false,
                        isJoin: false,
                        isRequest: false
                    }
                } else {
                    return {
                        ...community._doc,
                        isAdmin: member.isAdmin,
                        isJoin: member.isJoin,
                        isRequest: member.isRequest
                    }
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async getMemberStatus(_, { userId, communityId }) {
            try {
                const community = await Community.findById(communityId)
                const member = await Member.findOne({ user: userId, community: communityId })

                if (!member) {
                    return {
                        _id: community._id,
                        isAdmin: false,
                        isJoin: false,
                        isRequest: false
                    }
                } else {
                    return {
                        _id: community._id,
                        ...member._doc
                    }
                }

            } catch (error) {
                throw new Error(error)
            }
        },
    },

    Mutation: {
        async createCommunity(_, { communityInput: { name, bio, city, province, isPrivate } }, context) {

            const payload = auth(context)

            if ((name.trim() == '') || (bio.trim() == '') || (city.trim() == '') || (province.trim() == '')) {
                throw new Error('All field must be filled')
            }

            try {
                const newCommunity = {
                    name,
                    bio,
                    city,
                    province,
                    isPrivate,
                    isActive: false,
                    memberCount: 1,
                    date: new Date().toISOString()
                }

                const community = new Community(newCommunity)
                await community.save()
                    .then(
                        async function (community) {
                            const newMember = {
                                community: community._id,
                                user: payload._id,
                                isAdmin: true,
                                isJoin: true,
                                isRequest: false,
                                date: new Date().toISOString()
                            }

                            const member = new Member(newMember)
                            await member.save()
                        }
                    );
                return community

            } catch (error) {
                throw new Error(error)
            }
        },

        async requestJoinCommunity(_, { communityId }, context) {
            const payload = auth(context)

            let community = await Community.findById(communityId)

            try {
                if (community) {
                    const newMember = {
                        community: communityId,
                        user: payload._id,
                        isAdmin: false,
                        isJoin: false,
                        isRequest: true,
                        date: new Date().toISOString()
                    }

                    const member = new Member(newMember)
                    await member.save()

                    return {
                        _id: community._id,
                        ...member._doc
                    }

                } else {
                    throw new Error('Invalid community')
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async joinCommunity(_, { communityId }, context) {
            const payload = auth(context)

            let community = await Community.findById(communityId)

            try {
                if (community) {
                    await Community.findOneAndUpdate(
                        { _id: communityId },
                        { $inc: { memberCount: 1 } },
                        { new: true })

                    const newMember = {
                        community: communityId,
                        user: payload._id,
                        isAdmin: false,
                        isJoin: true,
                        isRequest: false,
                        date: new Date().toISOString()
                    }

                    const member = new Member(newMember)
                    await member.save()

                    return {
                        _id: community._id,
                        ...member._doc
                    }

                } else {
                    throw new Error('Invalid community')
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async leaveCommunity(_, { communityId }, context) {
            const payload = auth(context)
            const userId = payload._id

            let member = await Member.findOne({ user: userId, community: communityId })
            let community = await Community.findById(communityId)

            try {
                if (community) {
                    await Community.findOneAndUpdate(
                        { _id: communityId },
                        { $inc: { memberCount: -1 } },
                        { new: true })

                    if (member) {
                        await member.remove()
                        return 'Member removed'
                    } else {
                        throw new Error(error)
                    }

                } else {
                    throw new Error('Invalid community')
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async acceptMember(_, { communityId, userId }) {

            let member = await Member.findOne({ user: userId, community: communityId })
            const id = member._id

            let community = await Community.findById(communityId)

            try {
                if (community) {

                    await Community.findOneAndUpdate(
                        { _id: communityId },
                        { $inc: { memberCount: 1 } },
                        { new: true })

                    const updateMember = {
                        isJoin: true,
                        isRequest: false,
                        date: new Date().toISOString()
                    }

                    if (member) {
                        member = await Member.findOneAndUpdate(
                            { _id: id },
                            { $set: updateMember },
                            { new: true })
                    } else {
                        throw new Error(error)
                    }

                } else {
                    throw new Error('Invalid community')
                }

            } catch (error) {
                throw new Error(error)
            }

            return member
        },

        async rejectMember(_, { communityId, userId }) {

            let member = await Member.findOne({ user: userId, community: communityId })

            try {
                if (member) {
                    await member.remove()
                    return 'Member removed'
                }
                else {
                    throw new Error(error)
                }
            } catch (error) {
                throw new Error(error)
            }
        },

        async removeMember(_, { communityId, userId }) {

            let member = await Member.findOne({ user: userId, community: communityId })
            let community = await Community.findById(communityId)

            try {
                if (community) {
                    await Community.findOneAndUpdate(
                        { _id: communityId },
                        { $inc: { memberCount: -1 } },
                        { new: true })

                    if (member) {
                        await member.remove()
                        return 'Member removed'
                    } else {
                        throw new Error(error)
                    }

                } else {
                    throw new Error('Invalid community')
                }

            } catch (error) {
                throw new Error(error)
            }
        },

        async appointAdmin(_, { communityId, userId }) {

            let member = await Member.findOne({ user: userId, community: communityId })
            const id = member._id

            try {
                const updateMember = {
                    isAdmin: true
                }

                if (member) {
                    member = await Member.findOneAndUpdate(
                        { _id: id },
                        { $set: updateMember },
                        { new: true })
                }

            } catch (error) {
                throw new Error(error)
            }

            return member
        },

        async deleteCommunityPost(_, { postId }, context) {
            const payload = auth(context)
            const userId = payload._id
            const post = await Post.findById(postId)
            const communityId = post.community
            const member = await Member.findOne({ user: userId, community: communityId })

            try {
                if (post) {
                    if (member) {
                        if (member.isAdmin === true) {
                            await post.remove()
                            return 'Post deleted'
                        }
                    } else {
                        throw new Error('Invalid member')
                    }

                } else {
                    throw new Error('Invalid post')
                }

            } catch (error) {
                throw new Error(error)
            }
        },
    }
}