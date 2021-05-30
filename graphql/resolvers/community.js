const Post = require('../../models/Post')
const Community = require('../../models/Community')
const Member = require('../../models/Member')
const User = require('../../models/User')
const Notification = require('../../models/Notification')
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

        async getApproveCommunities() {
            try {
                const communities = await Community.find({ isActive: false }).sort({ date: -1 })
                return communities

            } catch (error) {
                throw new Error(error)
            }
        },

        async getFilterCommunities(_, { filter, location, sort }) {
            try {
                let communities

                if (filter == '' && location == '' && sort == '') {
                    communities = await Community.find({ isActive: true }).sort({ date: -1 })

                } else {
                    if (filter && location) {
                        if (sort == 'member') {
                            communities = await Community.find({
                                $and: [
                                    { name: { $regex: filter, $options: 'i' } },
                                    { province: { $regex: location, $options: 'i' } }
                                ]
                            }).sort({ memberCount: -1 })
                        } else {
                            communities = await Community.find({
                                $and: [
                                    { name: { $regex: filter, $options: 'i' } },
                                    { province: { $regex: location, $options: 'i' } }]
                            }).sort({ date: -1 })
                        }

                    } else if (filter) {
                        if (sort == 'member') {
                            communities = await Community
                                .find({ name: { $regex: filter, $options: 'i' } })
                                .sort({ memberCount: -1 })
                        } else {
                            communities = await Community
                                .find({ name: { $regex: filter, $options: 'i' } })
                                .sort({ date: -1 })
                        }

                    } else if (location) {
                        if (sort == 'member') {
                            communities = await Community
                                .find({ province: { $regex: location, $options: 'i' } })
                                .sort({ memberCount: -1 })
                        } else {
                            communities = await Community
                                .find({ province: { $regex: location, $options: 'i' } })
                                .sort({ date: -1 })
                        }

                    } else {
                        if (sort == 'member') {
                            communities = await Community.find().sort({ memberCount: -1 })
                        } else {
                            communities = await Community.find().sort({ date: -1 })
                        }
                    }
                }

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
                const posts = await Post.find({ community: communityId }).sort({ date: -1 }).populate('community user').populate('comments.user')

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
        async createCommunity(_, { communityInput: { name, bio, city, province, isPrivate, image } }, context) {

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
                    image,
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
                    )
                return community

            } catch (error) {
                throw new Error(error)
            }
        },

        async approveCommunity(_, { communityId }, context) {
            const payload = auth(context)

            let user = await User.findById(payload._id)
            let community = await Community.findById(communityId)
            let member = await Member.findOne({ community: communityId })

            if (user.isAdmin == true) {
                try {
                    const updateActive = {
                        isActive: true
                    }

                    if (community && member) {
                        await Community.findOneAndUpdate(
                            { _id: communityId },
                            { $set: updateActive },
                            { new: true })

                        const newNotification = {
                            community: communityId,
                            user: member.user,
                            content: "Your created community has been approved by admin",
                            date: new Date().toISOString()
                        }
                        const notification = new Notification(newNotification)
                        await notification.save()

                    } else {
                        throw new Error('Invalid community')
                    }

                } catch (error) {
                    throw new Error(error)
                }
            } else {
                throw new Error('User is not admin')
            }

            return 'community approved'
        },

        async disapproveCommunity(_, { communityId }, context) {
            const payload = auth(context)

            let user = await User.findById(payload._id)
            let community = await Community.findById(communityId)
            let member = await Member.findOne({ community: communityId })
            let memberId = member.user

            if (user.isAdmin == true) {
                try {
                    if (community && member) {
                        await community.remove()
                        await member.remove()

                        const newNotification = {
                            community: communityId,
                            user: memberId,
                            content: "Your created community has been disapproved by admin",
                            date: new Date().toISOString()
                        }
                        const notification = new Notification(newNotification)
                        await notification.save()

                    } else {
                        throw new Error('Invalid community')
                    }

                } catch (error) {
                    throw new Error(error)
                }
            } else {
                throw new Error('User is not admin')
            }

            return 'community dissaproved'
        },

        async requestJoinCommunity(_, { communityId, message }, context) {
            const payload = auth(context)

            let community = await Community.findById(communityId)

            try {
                if (community) {
                    const newMember = {
                        community: communityId,
                        user: payload._id,
                        message: message,
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
                    if (community.memberCount <= 1) {
                        await community.remove()
                        await Post.deleteMany({ community: communityId })

                        if (member) {
                            await member.remove()
                            return 'Member removed'
                        } else {
                            throw new Error(error)
                        }
                    } else {
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

                    const newNotification = {
                        community: communityId,
                        user: userId,
                        content: "Your request to join this community has been accepted",
                        date: new Date().toISOString()
                    }
                    const notification = new Notification(newNotification)
                    await notification.save()

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

                    const newNotification = {
                        community: communityId,
                        user: userId,
                        content: "Your request to join this community has been rejected",
                        date: new Date().toISOString()
                    }
                    const notification = new Notification(newNotification)
                    await notification.save()

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

                        const newNotification = {
                            community: communityId,
                            user: userId,
                            content: "You have been kicked from this community",
                            date: new Date().toISOString()
                        }
                        const notification = new Notification(newNotification)
                        await notification.save()

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
                        { new: true }
                    )

                    const newNotification = {
                        community: communityId,
                        user: userId,
                        content: "You have been appointed as admin of this community",
                        date: new Date().toISOString()
                    }
                    const notification = new Notification(newNotification)
                    await notification.save()
                }

            } catch (error) {
                throw new Error(error)
            }

            return member
        },

        async deleteCommunityPost(_, { postId }, context) {
            const payload = auth(context)
            const userId = payload._id
            const post = await Post.findById(postId).populate('community user').populate('comments.user')
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