import Bluebird from 'bluebird'
import { scrapeComicsData } from '../scraping/scraping'
import { getXMLContent, extractUrlsFromSitemap, extractUrlsFromURLSet } from '../scraping/sitemapXmlParser'
import { ComicData } from '../scraping/types'
  
export const crawlComicBoom = async (callback: CallableFunction, concurrency: number) => {
  const sitemapContent = await getXMLContent('https://comicboom.com.br/wp-sitemap.xml')
  console.log('Parsing ComicBoom sitemap XML...') // eslint-disable-line no-console
  const urls: string[] = await extractUrlsFromSitemap(sitemapContent)
  const productSitemaps: string[] = urls.filter(url => url.includes('wp-sitemap-posts-product-'))

  await Bluebird.Promise.each<string>(productSitemaps, async (url: string) => {
    const content = await getXMLContent(url)
    const productUrls: string[] = await extractUrlsFromURLSet(content)
    await Bluebird.Promise.map<string, ComicData>(productUrls, async (url: string) => {
      const data = await scrapeComicsData(url)
      callback(data)
      return data
    }, { concurrency })      
  })    
}
    