const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('config')
const { UserInputError } = require('apollo-server')

const User = require('../../models/User')
const Post = require('../../models/Post')
const auth = require('../../utils/auth')
const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')

module.exports = {
    Query: {
        async getUser(_, { id }) {
            try {
                const user = await User.findById(id)
                return user

            } catch (error) {
                throw new Error(error)
            }
        },

        async getUserPosts(_, { id }) {
            try {
                const posts = await Post.find({ user: id }).populate('community')
                return posts

            } catch (error) {
                throw new Error(error)
            }
        }
    },

    Mutation: {
        async login(_, { email, password }) {
            //validate errors
            const { valid, errors } = validateLoginInput(
                email,
                password
            )

            if (!valid) {
                throw new UserInputError('Error', { errors })
            }

            //check if user exist
            let user = await User.findOne({ email })

            if (!user) {
                errors.general = 'User not exists'
                throw new UserInputError('User not exists', { errors })
            }

            //check if password is true
            const match = await bcrypt.compare(password, user.password)

            if (!match) {
                errors.general = 'Incorrect password'
                throw new UserInputError('Incorrect password', { errors })
            }

            //create jwt token
            const payload = {
                _id: user.id,
                name: user.name
            }
            const jwtSecret = config.get('jwtSecret')

            const token = jwt.sign(
                payload,
                jwtSecret,
                { expiresIn: 3600 }
            )

            //return data
            return {
                ...user._doc,
                token
            }
        },

        async register(_, { registerInput: { name, email, password, password2 } }) {
            //validate errors
            const { valid, errors } = validateRegisterInput(
                name,
                email,
                password,
                password2
            )

            if (!valid) {
                throw new UserInputError('Error', { errors })
            }

            //check duplicate user
            let user = await User.findOne({ email })

            if (user) {
                throw new UserInputError('User already exists', {
                    errors: {
                        email: 'This email is already used'
                    }
                })
            }

            if (password !== password2) {
                throw new UserInputError('Password does not match', {
                    errors: {
                        password: 'Password must match',
                        password2: 'Password must match'
                    }
                })
            }

            //hash password
            const salt = await bcrypt.genSalt(10)
            password = await bcrypt.hash(password, salt)

            //update to db
            user = new User({
                name,
                email,
                password,
                date: new Date().toISOString()
            })

            const res = await user.save()

            //create jwt token
            const payload = {
                user: {
                    _id: user.id,
                    name: user.name
                }
            }
            const jwtSecret = config.get('jwtSecret')

            const token = jwt.sign(
                payload,
                jwtSecret,
                { expiresIn: 3600 }
            )

            //return data
            return {
                ...res._doc,
                token
            }
        },

        //edit profile
        async editProfile(_, { profileInput }, context) {
            const payload = auth(context)
            const id = payload._id

            let profile = await User.findById(id)

            //update
            if (profile) {
                profile = await User.findOneAndUpdate(
                    { _id: id },
                    { $set: profileInput },
                    { new: true })
            }

            //return data
            return profile
        }
    }
}