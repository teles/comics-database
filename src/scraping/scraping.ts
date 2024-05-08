import axios from 'axios';
import { ComicData, ComicScraper } from './types';
import { Comix } from './scrapers/comix';
import { removeNonAscii } from '../utils';

interface ScraperHandler {
    pattern: RegExp
    handler: ComicScraper
}

const handlers: ScraperHandler[] = [
    {
        pattern: /^https:\/\/www\.comix\.com.br\//,
        handler: new Comix()
    }
]

async function scrapeComicsData(url: string): Promise<ComicData> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.9999.999 Safari/537.36'
            }
        });

        const scraperHandler: ScraperHandler | undefined = handlers.find((item) => {
            return url.match(item.pattern)
        })

        if(!scraperHandler) {
            throw `Handler not found for ${url}`
        }

        return await scraperHandler.handler.scrape(url, removeNonAscii(response.data))

    } catch (error) {
        console.error('Scraping error:', error);
        throw error;
    }
}

const comicUrl = 'https://www.comix.com.br/miles-morales-homem-aranha-2023-vol-2.html';

scrapeComicsData(comicUrl)
    .then(data => {
        console.log('Comic data:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
