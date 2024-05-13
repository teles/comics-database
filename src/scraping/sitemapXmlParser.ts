import { parseStringPromise } from 'xml2js'
import axios from 'axios'

interface SitemapXml {
  sitemapindex: {
    sitemap: {
      loc: string
    }[]
  }
}

/**
 * Extracts URLs from a sitemap XML string.
 * @param sitemapXml - The sitemap XML string.
 * @returns A promise that resolves to an array of URLs extracted from the sitemap XML.
 */
export async function extractUrlsFromSitemap(sitemapXml: string): Promise<string[]> {
  if (!sitemapXml) {
    return []
  }
  const { sitemapindex: { sitemap } }: SitemapXml = await parseStringPromise(sitemapXml)
  return sitemap.map(({ loc }) => loc[0])
}

interface URLSet {
  urlset: {
    url: {
      loc: string
    }[]
  }
}
/**
 * Extracts URLs from a URL set XML string.
 * @param urlSetXml - The URL set XML string.
 * @returns A promise that resolves to an array of extracted URLs.
 */
export async function extractUrlsFromURLSet(urlSetXml: string): Promise<string[]> {
  if (!urlSetXml) {
    return []
  }
  const { urlset: { url } }: URLSet = await parseStringPromise(urlSetXml)
  return url.map(({ loc }) => loc[0])
}

/**
 * Fetches the XML content from the specified URL.
 * 
 * @param url - The URL to fetch the XML content from.
 * @returns A promise that resolves to the XML content as a string.
 */
export async function getXMLContent(url: string): Promise<string> {
  const content: string = await axios.get(url).then((response: {data: string}) => response.data)
  return content
}