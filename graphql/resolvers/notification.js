const Notification = require('../../models/Notification')

module.exports = {
    Query: {
        async getNotifications(_, { id }) {
            try {
                const notifications = await Notification.find({ user: id }).sort({ date: -1 }).populate('community user').limit(10)
                return notifications

            } catch (error) {
                throw new Error(error)
            }
        }
    }
}