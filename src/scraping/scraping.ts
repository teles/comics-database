import axios from 'axios';
import { removeNonAscii } from '../utils';
import { ComicData, ComicScraper } from './types';
import { Comix } from './scrapers/comix';
import { ComicBoom } from './scrapers/comicboom';
import { Panini } from './scrapers/panini';

interface ScraperHandler {
    pattern: RegExp
    handler: ComicScraper
}

const handlers: ScraperHandler[] = [
    {
        pattern: /^https:\/\/www\.comix\.com.br\//,
        handler: new Comix()
    },
    {
        pattern: /^https:\/\/comicboom\.com\.br\//,
        handler: new ComicBoom()
    },
    {
        pattern: /^https:\/\/panini\.com\.br\//,
        handler: new Panini()    
    }
]

export async function scrapeComicsData(url: string): Promise<ComicData> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.9999.999 Safari/537.36'
            }
        });

        const scraper: ScraperHandler | undefined = handlers.find((item) => {
            return url.match(item.pattern)
        })

        if(!scraper) {
            throw `Handler not found for ${url}`
        }

        return await scraper.handler.scrape(url, removeNonAscii(response.data))

    } catch (error) {
        console.error('Scraping error:', error);
        throw error;
    }
}