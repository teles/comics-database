import { ComicData, ComicScraper } from '../types'
import { load } from 'cheerio'
import { normalizePrice } from '../../utils'

/**
 * Represents a scraper for the Comic Boom website.
 */
export class ComicBoom implements ComicScraper {
  scrape(url: string, content: string): ComicData {
    try {
      const $ = load(content)
      const publisher = $('a[id^="editor"]').first().text().trim()
      const isbn13 = $('.shop_attributes tr:contains("ISBN")').first().text().trim()
      const title = $('h1.product-title').text().trim()
      const price = $('.product-info ins .woocommerce-Price-amount.amount').text().trim()
      const pages = $('.shop_attributes tr:contains("Páginas")').first().text().trim()
      const oldPrice = $('.product-info del .woocommerce-Price-amount.amount').text().trim()
      const synopsis = $('#bookDescription_feature_div').first().text().trim()
      const imageUrl = $('img.wp-post-image').attr('src')
      const isAvailable = $('.stock.in-stock').length > 0

      return {
        title,
        publisher: publisher.replace(/.*?:([^;]*);.*/, '$1').trim(),
        url,
        offer: {
          price: normalizePrice(price),
          oldPrice: normalizePrice(oldPrice),
          isAvailable
        },
        pages: Number(pages.match(/\d+/)?.slice(0, 1)) || undefined,
        synopsis: synopsis.replace(/[“”]/g, ''),
        isbn13: isbn13.match(/\d{13}/)?.[0] || '',
        imageUrl,
        lastSuccessfulUpdateAt: new Date()
      }
    } catch (error) {
      console.error('Scraping error:', error) // eslint-disable-line no-console
      throw error
    }
  }
}