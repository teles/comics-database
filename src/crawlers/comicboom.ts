import Bluebird from 'bluebird'
import { scrapeComicsData } from '../scraping/scraping'
import { getXMLContent, extractUrlsFromSitemap, extractUrlsFromURLSet } from '../scraping/sitemapXmlParser'
import { insert, select, update } from '../airtable/airtable'
import { ScrapingStatus, ScrapableSitesNames, AirtableFieldsScraping } from '../airtable/types'
import { FieldSet } from 'airtable'
  
export const crawlComicBoom = async (callback: CallableFunction, concurrency: number): Promise<void> => {
  const sitemapContent = await getXMLContent('https://comicboom.com.br/wp-sitemap.xml')
  const urls: string[] = await extractUrlsFromSitemap(sitemapContent)
  const productSitemaps: string[] = urls.filter(url => url.includes('wp-sitemap-posts-product-'))

  const records: { id: string; fields: FieldSet; }[] = await Promise.all(productSitemaps.map(async (url: string) => {
    const getRecord = async () => await select({
      tableName: 'scraping',
      filterByFormula: `AND(
          {url} = "${url}",
          {shop} = "${ScrapableSitesNames.comicboom}",
          NOT({status} = "${ScrapingStatus.completed}")
        )`
    })

    const record = await getRecord()

    if (record.length === 0) {
      await insert({
        tableName: 'scraping',
        record: {
          url,
          shop: ScrapableSitesNames.comicboom,
          status: ScrapingStatus.pending,
          startedAt: new Date().toISOString()
        } as const satisfies AirtableFieldsScraping
      })
    }

    const updatedRecord = await getRecord()
    return record.length === 0 ? updatedRecord[0] : record[0]
  }))

  await Bluebird.each(records, async (record: { id: string; fields: FieldSet; }) => {
    const url = record.fields.url
    const content = await getXMLContent(url as string)
    await update({
      tableName: 'scraping',
      recordId: record.id,
      record: {
        status: ScrapingStatus.next
      }
    })
    const productUrls: string[] = await extractUrlsFromURLSet(content)
    await Bluebird.map(productUrls, async (url: string) => {
      const data = await scrapeComicsData(url, {
        'Cookie': 'sucuri_cloudproxy_uuid_ccf5b6b71=aee5823510417d8ed5bf6504c1677766'
      })
      callback(data)
      return data
    }, { concurrency })      
  })    
}