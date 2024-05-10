import { FastifyPluginCallback, FastifyReply, FastifyRequest } from "fastify";
import { scrapeComicsData } from "../../src/scraping/scraping";
import { select, upsert } from "../../src/airtable/airtable";
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

/**
 * Creates the routes for handling comics in the API.
 *
 * @param fastify - The Fastify instance.
 * @param _options - The options object.
 * @param done - The callback function to be called when the routes are created.
 */
export const createComicsRoutes: FastifyPluginCallback = (fastify, _options, done) => {
    fastify.get('/:isbn13', {
        schema: {
            tags: ['Comics'],
            description: 'Get comics by ISBN13',
            params: {
                type: 'object',
                properties: {
                    isbn13: { type: 'string', description: 'The ISBN13 of the comic' }
                }
            },
            response: {
                200: {
                    description: 'Successful response',
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            Title: { type: 'string' },
                            Publisher: { type: 'string' },
                            Price: { type: 'number' },
                            'Old Price': { type: 'number' },
                            Available: { type: 'boolean' },
                            Image: { type: 'string' },
                            'Last Update': { type: 'string' },
                            ISBN: { type: 'string' },
                            ISBN13: { type: 'string' },
                            Synopsis: { type: 'string' },
                            url: { type: 'string' }
                        }
                    }
                },
                404: {
                    description: 'Comics not found',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
                500: {
                    description: 'Error response',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        }
    }, getComicsByISBN13);    
    fastify.put('/upsert/:url', {
        schema: {
            tags: ['Comics'],
            description: 'Upsert a comic by URL',
            params: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'The URL of the comic' }
                }
            },
            response: {
                200: {
                    description: 'Successful response',
                    type: 'object',
                    properties: {
                        Title: { type: 'string' },
                        Publisher: { type: 'string' },
                        Price: { type: 'number' },
                        'Old Price': { type: 'number' },
                        Available: { type: 'boolean' },
                        Image: { type: 'string' },
                        'Last Update': { type: 'string' },
                        ISBN: { type: 'string' },
                        ISBN13: { type: 'string' },
                        Synopsis: { type: 'string' },
                        url: { type: 'string' }
                    }
                },
                500: {
                    description: 'Error response',
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        }
    }, upsertComicsByUrl);
    done();
}