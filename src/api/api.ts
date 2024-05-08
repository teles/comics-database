import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { select, upsert } from '../airtable/airtable';
import { scrapeComicsData } from '../scraping/scraping';

const app: FastifyInstance = fastify({ logger: true });

app.get('/api/comics/:isbn13', getComicsByISBN13);
app.put('/api/comics/upsert/:url', upsertComicsByUrl);

/**
 * Retrieves comics by ISBN13.
 *
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to void.
 */
async function getComicsByISBN13(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
        const isbn13 = (request.params as { isbn13: string }).isbn13;
        const comics = await select(
            {
                tableName: 'quadrinhos',
                filterByFormula: `{ISBN13} = "${isbn13}"`
            }
        );

        if (comics.length === 0) {
            reply.code(404).send({ error: `Comics with ISBN13 ${isbn13} not found` });
            return;
        }
        reply.send(comics.map(comic => comic.fields));
    } catch (error) {
        request.log.error(`Server error searching comics`, error);
        reply.code(500).send({ error: 'Server error searching comics' });
    }
}

/**
 * Upserts comics data into the database based on the provided URL.
 * 
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to void.
 */
async function upsertComicsByUrl(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const url = decodeURIComponent((request.params as { url: string }).url);
    try {
        const data = await scrapeComicsData(url);
        await upsert(
            {
                tableName: 'quadrinhos',
                filterByFormula: `{url} = "${data.url}"`,
                record: {
                    Title: data.title,
                    Publisher: data.publisher,
                    Price: data.offer.price,
                    'Old Price': data.offer.oldPrice,
                    Available: data.offer.isAvailable,
                    Image: data.imageUrl,
                    'Last Update': data.lastSuccessfulUpdateAt,
                    ISBN: data.isbn,
                    ISBN13: data.isbn13,
                    Synopsis: data.synopsis,
                    url: data.url
                }
            }
        );
        reply.send(data);
    } catch (error) {
        console.error('Error upserting comics', error);
        reply.code(500).send({ error: 'Error upserting comics' });
    }
}

export default async function handler(req: FastifyRequest, res: FastifyReply) {
    app.log.info(`Server running on ${app.server.address()}`);
    await app.ready();
    app.server.emit('request', req, res);
}