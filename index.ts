import { upsert, select } from './src/airtable/airtable'
import { fetchPlaylistItems } from './src/youtube/youtube'
import { YouTubeSnippet } from './src/youtube/types'

const upsertVideos = async (snippets: YouTubeSnippet[]): Promise<void> => {
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

const main = async () : Promise<void> => {
    const newest = await select(
        {
            tableName: 'videos',
            sort: [{ field: 'Published At', direction: 'desc' }],
            maxRecords: 1,
            filterByFormula: 'NOT({Published At} = "")'
        }
    )
    const newestVideoPublishedAt = newest[0] ? newest[0].fields['Published At'] : undefined
    console.log('Newest video published at:', newestVideoPublishedAt)
    await fetchPlaylistItems({
        callback: upsertVideos,
        publishedAfter: newestVideoPublishedAt,
        perPage: 50
    })
}

main()