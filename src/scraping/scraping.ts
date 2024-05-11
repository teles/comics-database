import axios from 'axios';
import { removeNonAscii } from '../utils';
import { ComicData, ComicScraper } from './types';
import { Comix } from './scrapers/comix';
import { ComicBoom } from './scrapers/comicboom';
import { Panini } from './scrapers/panini';

enum ScrapableSites {
    comix = 'www.comix.com.br',
    comicboom = 'comicboom.com.br',
    panini = 'panini.com.br'
}

const handlers: Record<ScrapableSites, ComicScraper> = {
    [ScrapableSites.comix]: new Comix(),
    [ScrapableSites.comicboom]: new ComicBoom(),
    [ScrapableSites.panini]: new Panini()
}

export async function scrapeComicsData(url: string): Promise<ComicData> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.9999.999 Safari/537.36'
            }
        });

        const hostname = new URL(url).hostname;
        const scraper = handlers[hostname as ScrapableSites];

        if(!scraper) {
            throw `Handler not found for ${url}`
        }

        return await scraper.scrape(url, removeNonAscii(response.data))

    } catch (error) {
        console.error('Scraping error:', error);
        throw error;
    }
}