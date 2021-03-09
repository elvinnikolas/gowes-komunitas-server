const jwt = require('jsonwebtoken')
const config = require('config')
const { AuthenticationError } = require('apollo-server')

module.exports = (context) => {
    //get auth from header
    const authHeader = context.req.headers.authorization

    if (authHeader) {
        //get token from header
        const token = authHeader.split('Bearer ')[1]
        if (token) {
            try {
                const jwtSecret = config.get('jwtSecret')
                const user = jwt.verify(token, jwtSecret)
                return user

            } catch (error) {
                throw new AuthenticationError('Invalid token')
            }

        } else {
            throw new Error('No token')
        }

    } else {
        throw new Error('No auth header')
    }
}