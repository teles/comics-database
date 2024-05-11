export interface YouTubeSnippet {
    resourceId: {
      videoId: string
    }
    publishedAt: string
    title: string
    description: string
    thumbnails: {
      standard?: {
        url: string
      }
    }
    pageInfo?: {
      totalResults: number
    }
}
  
export type YouTubeCallback = (snippets: YouTubeSnippet[]) => Promise<void>;

export interface YouTubeSnippetResponse {
  items: {
    snippet: YouTubeSnippet
  }[]
  nextPageToken?: string
}