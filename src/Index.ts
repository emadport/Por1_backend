import * as path from 'path'
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import bodyParser from 'body-parser'
import ExpressServer from 'express'
import http from 'http'
import { typeDefs } from './graphql/TypeDefs'
import { resolvers } from './graphql/Resolvers'
import { expressMiddleware } from '@apollo/server/express4'

import cors from 'cors'

const app = ExpressServer()
const httpServer = http.createServer(app)

const startServer = async () => {
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept,Authorization,Origin')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    next()
  })

  app.use(bodyParser.json())

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
  })

  await apolloServer.start()

  httpServer.listen({ port: process.env.GQL_PORT })

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({ token: req.headers.token })
    })
  )

  console.log(`⚡️Server ready at localhost:${process.env.GQL_PORT}/graphql`)
}

startServer()
