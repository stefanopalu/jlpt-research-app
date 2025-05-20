const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

const Word = require('./models/word')
const User = require('./models/user')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const http = require('http')
const express = require('express')
const cors = require('cors')

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET;

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

  const start = async () => {
    const app = express()
    const httpServer = http.createServer(app)

    try {
      const words = await Word.find({})
      console.log('Words fetched from MongoDB:', words)
    } catch (error) {
      console.error('Error fetching words from MongoDB:', error)
    }

    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql',
    })
    
    const schema = makeExecutableSchema({ typeDefs, resolvers })
    const serverCleanup = useServer({ schema }, wsServer)
  
    const server = new ApolloServer({
      schema,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    })
  
    await server.start()
  
    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization || '';
        const token = auth.toLowerCase().startsWith('bearer ')
          ? auth.substring(7)
          : null;

        if (!token) {
          return { currentUser: null };
        }

        try {
          const decodedToken = jwt.verify(token, JWT_SECRET);
          const currentUser = await User.findById(decodedToken.id);
          console.log('CurrentUser in context:', currentUser);
          return { currentUser };
        } catch (err) {
          console.error('Invalid token:', err.message);
          return { currentUser: null };
        }
      }
    }),
    )
  
    const PORT = 4000
  
    httpServer.listen(PORT, () =>
      console.log(`Server is now running on http://localhost:${PORT}/graphql`)
    )
  }
  
  start()