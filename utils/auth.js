// const jwt = require('jsonwebtoken')
// const config = require('config')
// const { AuthenticationError } = require('apollo-server')
// const { PubSub } = require('apollo-server')

// const pubsub = new PubSub()

// module.exports = (context) => {
//     let token

//     if (context.req && context.req.headers.authorization) {
//         token = context.req.headers.authorization.split('Bearer ')[1]

//         if (token) {
//             try {
//                 const jwtSecret = config.get('jwtSecret')
//                 const user = jwt.verify(token, jwtSecret)
//                 return user

//             } catch (error) {
//                 throw new AuthenticationError('Invalid token')
//             }

//         } else {
//             throw new Error('No token')
//         }

//     } else if (context.connection && context.connection.context.Authorization) {
//         token = context.connection.context.Authorization.split('Bearer ')[1]

//         if (token) {
//             try {
//                 const jwtSecret = config.get('jwtSecret')
//                 user = jwt.verify(token, jwtSecret)
//                 context.pubsub = pubsub
//                 return user

//             } catch (error) {
//                 throw new AuthenticationError('Invalid token')
//             }

//         } else {
//             throw new Error('No token')
//         }

//     } else {
//         throw new Error('No auth header')
//     }
// }

const jwt = require('jsonwebtoken')
const config = require('config')
const { AuthenticationError } = require('apollo-server')

module.exports = (context) => {
    //get auth from header
    const authHeader = context.req.headers.authorization

    const jwtSecret = config.get('jwtSecret')
    let token

    if (context.req && authHeader) {
        //get token from header
        token = authHeader.split('Bearer ')[1]
        if (token) {
            try {
                user = jwt.verify(token, jwtSecret)
                return user

            } catch (error) {
                throw new AuthenticationError('Invalid token')
            }

        } else {
            throw new Error('No token')
        }

    } else if (context.connection && context.connection.context.Authorization) {
        token = context.connection.context.Authorization.split('Bearer ')[1]

        if (token) {
            try {
                user = jwt.verify(token, jwtSecret)
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