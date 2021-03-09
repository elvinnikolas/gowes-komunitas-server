const { ApolloServer, PubSub } = require('apollo-server')
const mongoose = require('mongoose')

const config = require('config')
const db = config.get('mongoURI')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const pubsub = new PubSub()

const PORT = process.env.PORT || 1000

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
})

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDB connected')
        return server.listen({ port: PORT })
    })
    .then((res) => {
        console.log(`Server running at ${res.url}`);
    });
