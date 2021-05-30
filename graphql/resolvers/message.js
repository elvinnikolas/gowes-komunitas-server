const Message = require('../../models/Message')
const Chat = require('../../models/Chat')
const auth = require('../../utils/auth')
const { AuthenticationError, withFilter } = require('apollo-server')

module.exports = {
    Query: {
        async getMessages(_, { chatId }, context) {
            const payload = auth(context)

            try {
                await Chat.findOneAndUpdate(
                    { _id: chatId, "status.user": payload._id },
                    { $set: { "status.$.read": true } },
                    { new: true })

                const messages = await Message
                    .find({ chat: chatId })
                    .sort({ sent: -1 })
                return messages
            } catch (err) {
                throw new Error(err)
            }
        }
    },

    Mutation: {
        async sendMessage(_, { chatId, to, content }, context) {
            const payload = auth(context)

            if ((content.trim() == '')) {
                throw new Error('Message cannot be empty')
            }

            let chatExist = await Chat.findById(chatId)
            let message

            try {
                if (!chatExist) {
                    const newChat = {
                        users: [payload._id, to],
                        lastMessage: content,
                        sent: new Date().toISOString()
                    }
                    chat = new Chat(newChat)
                    await chat.save()
                        .then(
                            async function (chat) {
                                const newMessage = {
                                    chat: chat._id,
                                    from: payload._id,
                                    to: to,
                                    content: content,
                                    sent: new Date().toISOString()
                                }

                                message = new Message(newMessage)
                                await message.save()
                            }
                        )

                } else {
                    await Chat.findOneAndUpdate(
                        { _id: chatId },
                        {
                            $set: {
                                lastMessage: content,
                                sent: new Date().toISOString()
                            }
                        },
                        { new: true })

                    await Chat.findOneAndUpdate(
                        { _id: chatId, "status.user": to },
                        { $set: { "status.$.read": false } },
                        { new: true })

                    await Chat.findOneAndUpdate(
                        { _id: chatId, "status.user": payload._id },
                        { $set: { "status.$.read": true } },
                        { new: true })

                    const newMessage = {
                        chat: chatId,
                        from: payload._id,
                        to: to,
                        content: content,
                        sent: new Date().toISOString()
                    }

                    message = new Message(newMessage)
                    await message.save()
                }

                context.pubsub.publish('NEW_MESSAGE', { newMessage: message })

                return message

            } catch (error) {
                throw new Error(error)
            }
        }
    },

    Subscription: {
        // newMessage: {
        //     subscribe: withFilter((_, __, context) => {
        //         return context.pubsub.asyncIterator(['NEW_MESSAGE'])
        //     }, ({ newMessage }, _, context) => {
        //         if (newMessage.from === context._id || newMessage.to === context._id) {
        //             return true
        //         } else {
        //             return false
        //         }
        //     })
        // }

        newMessage: {
            subscribe: (_, __, context) => {
                return context.pubsub.asyncIterator(['NEW_MESSAGE'])
            }
        }
    }
}