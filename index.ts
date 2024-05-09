import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
const app: FastifyInstance = fastify({ logger: true });

// import { upsert, select } from './src/airtable/airtable'
// import { fetchPlaylistItems } from './src/youtube/youtube'
// import { YouTubeSnippet } from './src/youtube/types'
// import { scrapeComicsData } from './src/scraping/scraping'


// const upsertVideos = async (snippets: YouTubeSnippet[]): Promise<void> => {
//     for (const snippet of snippets) {
//         await upsert({
//             tableName: 'videos',
//             filterByFormula: `{Video ID} = '${snippet.resourceId.videoId}'`,
//             record: {
//                 'Title': snippet.title,
//                 'Description': snippet.description,
//                 'Published At': snippet.publishedAt,
//                 'Video ID': snippet.resourceId.videoId
//             }
//         })
//     }
// }

// const getNewestWideosFromChannel = async () : Promise<void> => {
//     const newest = await select(
//         {
//             tableName: 'videos',
//             sort: [{ field: 'Published At', direction: 'desc' }],
//             maxRecords: 1,
//             filterByFormula: 'NOT({Published At} = "")'
//         }
//     )
//     const newestVideoPublishedAt = newest[0] ? newest[0].fields['Published At'] : undefined

//     await fetchPlaylistItems({
//         callback: upsertVideos,
//         publishedAfter: newestVideoPublishedAt,
//         perPage: 50
//     })
// }

// // getNewestWideosFromChannel()

// scrapeComicsData('https://panini.com.br/tom-strong-edicao-definitiva-vol-1')
//     .then(async data => {
//         console.log(data)
//         await upsert(
//             {
//                 tableName: 'quadrinhos',
//                 filterByFormula: `{url} = "${data.url}"`,
//                 record: {
//                     Title: data.title,
//                     Publisher: data.publisher,
//                     Price: data.offer.price,
//                     'Old Price': data.offer.oldPrice,
//                     Available: data.offer.isAvailable,
//                     Image: data.imageUrl,
//                     'Last Update': data.lastSuccessfulUpdateAt,
//                     ISBN: data.isbn,
//                     ISBN13: data.isbn13,
//                     Synopsis: data.synopsis,
//                     url: data.url
//                 }
//             }
//         )
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

export default async function handler(req: FastifyRequest, res: FastifyReply) {
    app.log.info(`Server running on ${app.server.address()}`);
    await app.ready();
    app.server.emit('request', req, res);
}