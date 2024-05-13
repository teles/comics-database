import { ComicData, ComicScraper } from '@/scraping/types'
import { load } from 'cheerio'
import { normalizePrice } from '@/utils'

/**
 * Represents the details of a comic book from ComicBoom.
 */
interface ComicBoomDetails extends Record<string, string | string[] | undefined> {
  peso?: string
  dimensões?: string
  categoria?: string[]
  tag?: string[]
  'tipo de série'?: string[]
  editora?: string[]
  autor?: string[]
  formato?: string[]
  'tipo de capa'?: string[]
  cor?: string[]
  idioma?: string[]
  'número'?: string
  'páginas'?: string
  ano?: string
  isbn?: string
}

/**
 * Represents a scraper for the Comic Boom website.
 */
export class ComicBoom implements ComicScraper {
  scrape(url: string, content: string): ComicData {
    try {
      const $ = load(content)
      const isAvailable = $('.stock.in-stock').length > 0
      const details: ComicBoomDetails = $('.shop_attributes tr').get().reduce((acc, element) => {
        const th = $(element).find('th').first().text()
        const td = $(element).find('td').first().text()
        const isListOfAnchors = $(element).find('a').length > 0
        return {
          ...acc,
          [`${th.replace(/:/, '').toLowerCase().trim()}`]: isListOfAnchors
            ? $(element).find('a').map((_i, el) => $(el).text().trim()).get()
            : td.trim()
        }
      }, {}) as ComicBoomDetails
      const publisher = details.editora
      const isbn13 = details.isbn
      const title = $('h1.product-title').text().trim()
      const price = isAvailable 
        ? $('.product-info ins .woocommerce-Price-amount.amount').first().text().trim() 
        : $('.price-wrapper .woocommerce-Price-amount.amount').first().text().trim()
      const pages = details['páginas']
      const oldPrice = $('.product-info del .woocommerce-Price-amount.amount').text().trim()
      const synopsis = $('#bookDescription_feature_div,.product-short-description').first().text().trim()
      const imageUrl = $('img.wp-post-image').attr('src')
      const weight = details.peso
      const dimensions = details['dimensões']
      const categories = details.categoria
      const tags = details.tag
      const seriesType = details['tipo de série']
      // const coverType = details['tipo de capas']
      const color = details.cor
      const authors = details.autor
      const formats = details.formato
      const languages = details.idioma
      const numberInSeries = details['número']
      const year = details.ano      
      
      return {
        title,
        publisher: publisher?.[0] || '',
        url,
        offer: {
          price: normalizePrice(price),
          oldPrice: normalizePrice(oldPrice),
          isAvailable
        },
        pages: pages ? Number(pages.match(/\d+/)?.slice(0, 1)) : 0,
        synopsis: synopsis.replace(/[“”]/g, ''),
        isbn13: isbn13 ? isbn13.match(/\d{13}/)?.[0] : '',
        weight,
        dimensions,
        categories,
        tags,
        seriesType,
        color,
        authors,
        formats,
        languages,
        numberInSeries,
        year: isNaN(Number(year)) ? undefined : Number(year),
        imageUrl,
        lastSuccessfulUpdateAt: new Date()
      }
    } catch (error) {
      console.error('Scraping error:', error) // eslint-disable-line no-console
      throw error
    }
  }
}