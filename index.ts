import { upsert, select } from './src/airtable/airtable'
import { fetchPlaylistItems } from './src/youtube/youtube'
// import { YouTubeSnippet } from './src/youtube/types'

const main = async () : Promise<void> => {
    const newest = await select(
        {
            tableName: 'videos',
            sort: [{ field: 'Published At', direction: 'desc' }],
            maxRecords: 1,
            filterByFormula: 'NOT({Published At} = "")'
        }
    )
    const newestVideoPublishedAt = newest[0] ? newest[0]['Published At'] : undefined
    const snippets = await fetchPlaylistItems({
        publishedAfter: newestVideoPublishedAt,
        perPage: 50
    })
    for (const snippet of snippets) {
        await upsert({
            tableName: 'videos',
            filterByFormula: `{Video ID} = '${snippet.resourceId.videoId}'`,
            record: {
                'Title': snippet.title,
                'Description': snippet.description,
                'Published At': snippet.publishedAt,
                'Video ID': snippet.resourceId.videoId
            }
        })
    }
}

main()