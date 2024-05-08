import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const app: FastifyInstance = fastify({ logger: true });

export default async function handler(req: FastifyRequest, res: FastifyReply) {
    app.log.info(`Server running on ${app.server.address()}`);
    await app.ready();
    app.server.emit('request', req, res);
}