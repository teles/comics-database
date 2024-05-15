import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import { scrapeComicsData } from '../../src/scraping/scraping'
import { type JSONSchema } from 'json-schema-to-ts'
import { select, upsert, listAll } from '../../src/airtable/airtable'
import { AirtableFieldsComic } from '../../src/airtable/types'

async function listAllComics(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const pageSize = (request.query as { pageSize: number }).pageSize
    const offset = (request.query as { offset: number }).offset

    const comics = await listAll(
      {
        tableName: 'quadrinhos',
        'pageSize': pageSize,
        'offset': offset
      }
    ) as {id: string, fields: AirtableFieldsComic}[]

    if (comics.length === 0) {
      await reply.code(404).send({ error: `Comics not found` })
      return
    }

    await reply.send(comics.map((comic => {
      return {
        title: comic.fields.Title,
        url: comic.fields.url        
      }
    })))
  } catch (error) {
    request.log.error('Server error searching comics', error)
    console.log("Error")
    console.log(error)
    await reply.code(500).send({ error: 'Server error searching comics' })
  }
  
}

/**
 * Retrieves comics by ISBN13.
 *
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to void.
 */
async function getComicsByISBN13(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const isbn13 = (request.params as { isbn13: string }).isbn13
    const comics = await select(
      {
        tableName: 'quadrinhos',
        filterByFormula: `{ISBN13} = "${isbn13}"`
      }
    ) as {id: string, fields: AirtableFieldsComic}[]

    if (comics.length === 0) {
      await reply.code(404).send({ error: `Comics with ISBN13 ${isbn13} not found` })
      return
    }

    await reply.send(comics.map((comic => {
      return {
        title: comic.fields.Title,
        publisher: comic.fields.Publisher,
        offer: {
          price: comic.fields.Price,
          oldPrice: comic.fields['Old Price'],
          isAvailable: comic.fields.Available
        },
        image: comic.fields.Image,
        lastSuccessfulUpdateAt: comic.fields['Last Update'],
        isbn: comic.fields.ISBN,
        isbn13: comic.fields.ISBN13,
        synopsis: comic.fields.Synopsis,
        url: comic.fields.url        
      }
    })))
  } catch (error) {
    request.log.error('Server error searching comics', error)
    await reply.code(500).send({ error: 'Server error searching comics' })
  }
}
const comicProperties = {
  title: { type: 'string' },
  offer: {
    type: 'object',
    properties: {
      price: { type: 'number' },
      oldPrice: { type: 'number' },
      isAvailable: { type: 'boolean' }
    },
    required: ['price', 'isAvailable']
  },
  publisher: { type: 'string' },
  image: { type: 'string' },
  lastSuccessfulUpdateAt: { type: 'string' },
  ISBN: { type: 'string' },
  ISBN13: { type: 'string' },
  synopsis: { type: 'string' },
  url: { type: 'string' }
} as const 

const comicSchema: JSONSchema = {
  type: 'object',
  properties: comicProperties
}

/**
 * Upserts comics data into the database based on the provided URL.
 * 
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @returns A Promise that resolves to void.
 */
async function upsertComicsByUrl(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const url = decodeURIComponent((request.params as { url: string }).url)
  try {
    const data = await scrapeComicsData(url)
    await upsert(
      {
        tableName: 'quadrinhos',
        filterByFormula: `{url} = "${data.url}"`,
        record: {
          url,
          title: data.title,
          synopsis: data.synopsis,
          price: data.offer.price,
          oldPrice: data.offer.oldPrice,
          lastUpdate: data.lastSuccessfulUpdateAt,
          ISBN: data.isbn,
          ISBN13: data.isbn13,
          available: data.offer.isAvailable,
          coverImage: data.imageUrl,
          publisher: data.publisher,
          weight: data.weight,
          dimensions: data.dimensions,
          categories: data.categories,
          tags: data.tags,
          seriesType: data.seriesType,
          color: data.color,
          authors: data.authors,
          formats: data.formats,
          languages: data.languages,
          numberInSeries: data.numberInSeries,
          year: data.year                    
        }
      }
    )
    await reply.send(data)
  } catch (error) {
    console.error('Error upserting comics', error) // eslint-disable-line no-console
    await reply.code(500).send({ error: 'Error upserting comics' })
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
          isbn13: { 
            type: 'string', 
            description: 'Comic book ISBN13 number',
            pattern: '^[0-9]{13}$'
          }
        }
      },
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: comicSchema
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
  }, getComicsByISBN13)    
  fastify.get('/all', {
    schema: {
      tags: ['Comics'],
      description: 'List all Comics',
      querystring: {
        pageSize: { type: 'string' },
        offset: { type: 'string' }
      },
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: comicSchema
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
  }, listAllComics)    
  fastify.put('/upsert/:url', {
    schema: {
      tags: ['Comics'],
      description: 'Upsert a comic by URL',
      params: {
        type: 'object',
        properties: {
          url: { 
            type: 'string', 
            description: 'The URL of the comic',
            format: 'uri'
          }
        }
      },
      response: {
        200: {
          description: 'Successful response',
          type: comicSchema['type'],
          properties: comicSchema['properties']
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
  }, upsertComicsByUrl)
  done()
}