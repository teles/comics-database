import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const app: FastifyInstance = fastify({ logger: true });

export default async function handler(req: FastifyRequest, res: FastifyReply) {
    try {
        await app.ready();
        app.server.emit('request', req, res);
    } catch (error) {
        console.error('Erro ao processar solicitação:', error);
        res.code(500).send({ error: 'Erro interno do servidor' });
    }
}