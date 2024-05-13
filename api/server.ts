import fastify, { FastifyInstance, type FastifyReply, FastifyRequest } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import swaggerui from '@fastify/swagger-ui'
import { createComicsRoutes } from '@/routes/comics'

const app: FastifyInstance = fastify({ logger: true })
void app.register(fastifySwagger, {})

void app.register(swaggerui, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  },
  uiHooks: {
    onRequest: function (_request, _reply, next) {
      next()
    },
    preHandler: function (_request, _reply, next) {
      next()
    }
  }        
})

void app.register(createComicsRoutes, { 
  prefix: '/api/comics/'
})

// /**
//  * Handles incoming requests.
//  *
//  * @param req - The Fastify request object.
//  * @param res - The Fastify reply object.
//  */
export default async function handler(req: FastifyRequest, res: FastifyReply) {
  const serverAddress = app.server.address()
  console.log('Server running on', serverAddress) // eslint-disable-line no-console
  try {
    await app.ready()
    app.server.emit('request', req, res)
    app.log.info(`Server running on ${serverAddress?.toString()}`) // eslint-disable-line no-console
  } catch (error) {
    console.error('Error starting server', error) // eslint-disable-line no-console
    await res.code(500).send({ error: 'Error starting server' }) 
  }
}

const start = async () => {
  try {
    await app.ready()
    void app.listen({ port: 3000 })
    app.log.info(`Server running on ${app.server.address()?.toString()}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

void start()