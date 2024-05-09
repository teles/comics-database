import fastify, { FastifyInstance } from "fastify";
const app: FastifyInstance = fastify({ logger: true });

const start = async () => {
    try {
        await app.listen(3000);
        app.log.info(`Server running on ${app.server.address()}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
