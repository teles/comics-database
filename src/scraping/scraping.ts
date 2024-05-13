import axios from 'axios'
import { removeNonAscii } from '../utils'
import { ComicData, ComicScraper } from './types'
import { Comix } from './scrapers/comix'
import { ComicBoom } from './scrapers/comicboom'
import { Panini } from './scrapers/panini'

export enum ScrapableSites {
    comix = 'www.comix.com.br',
    comicboom = 'comicboom.com.br',
    panini = 'panini.com.br'
}

const handlers: Record<ScrapableSites, ComicScraper> = {
  [ScrapableSites.comix]: new Comix(),
  [ScrapableSites.comicboom]: new ComicBoom(),
  [ScrapableSites.panini]: new Panini()
}

export async function scrapeComicsData(url: string, headers?: Record<'Cookie', string>): Promise<ComicData> {
  try {
    const response: {data: string} = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Cookie': headers?.Cookie || ''
      }      
    })
    const hostname = new URL(url).hostname
    const scraper = handlers[hostname as ScrapableSites]

    if(!scraper) {
      throw `Handler not found for ${url}`
    }

    return scraper.scrape(url, removeNonAscii(response.data))

  } catch (error) {
    console.error('Scraping error:', error) // eslint-disable-line no-console
    throw error
  }
}