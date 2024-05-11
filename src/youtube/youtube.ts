import axios from 'axios'
import dotenv from 'dotenv'
import { YouTubeSnippet, YouTubeCallback, YouTubeSnippetResponse } from './types'
import { paramsToUrl } from '../utils'
dotenv.config()

interface PlaylistItemsOptions {
    /**
     * The callback function to be called after each page of playlist items is fetched.
     */
    callback?: YouTubeCallback
    /**
     * The published date and time (ISO 8601 format) to filter the playlist items.
     */
    publishedAfter?: string
    /**
     * The number of playlist items to fetch per page.
     */
    perPage?: number
}

/**
 * Fetches playlist items from YouTube API.
 * @param options - The options for fetching playlist items.
 * @returns A promise that resolves to an array of YouTubeSnippet objects.
 * @throws Error if the required environment variables are missing.
 */
export const fetchPlaylistItems = async (options: PlaylistItemsOptions): Promise<YouTubeSnippet[]> => {
  if(!process.env.YOUTUBE_API_KEY) {
    throw new Error('Missing YOUTUBE_API_KEY env variable')
  }
  if(!process.env.YOUTUBE_PLAYLIST_ID) {
    throw new Error('Missing YOUTUBE_PLAYLIST_ID env variable')
  }
  const { publishedAfter, perPage } = options
  const fetchPage = async (pageToken?: string): Promise<YouTubeSnippet[]> => {
    try {
      const url = paramsToUrl('https://www.googleapis.com/youtube/v3/playlistItems', { 
        part: 'snippet',
        playlistId: process.env.YOUTUBE_PLAYLIST_ID,
        key: process.env.YOUTUBE_API_KEY,
        pageToken,
        maxResults: perPage?.toString() || '50',
        publishedAfter
      })

      console.log(`[YOUTUBE] Fetching page: ${url}`) // eslint-disable-line no-console

      const response = await axios.get<YouTubeSnippetResponse>(url)
      const snippets = response.data.items.map(item => item.snippet)
      if(options.callback) {
        await options.callback(snippets)
      }
      const nextPageToken = response.data.nextPageToken

      if (nextPageToken) {
        console.log(`[YOUTUBE] Fetching next page: ${nextPageToken}`) // eslint-disable-line no-console
        await fetchPage(nextPageToken)
      }
      return snippets
    } catch (error) {
      console.error('Error fetching page:', error) // eslint-disable-line no-console
      throw error
    }        
  } 
  return await fetchPage()
}