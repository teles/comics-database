import axios from 'axios';
import { ComicData } from './types';
import { Comix } from './scrapers/comix';

async function scrapeComicsData(url: string): Promise<ComicData> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.9999.999 Safari/537.36'
            }
        });

        const scraper = new Comix();
        return await scraper.scrape(url, response.data);

    } catch (error) {
        console.error('Scraping error:', error);
        throw error;
    }
}

const comicUrl = 'https://www.comix.com.br/gata-de-ferro.html';

scrapeComicsData(comicUrl)
    .then(data => {
        console.log('Comic data:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
