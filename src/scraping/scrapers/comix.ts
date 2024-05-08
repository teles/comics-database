import { load } from 'cheerio';
import { ComicData, ComicScraper } from '../types';
import { normalizePrice, removeNonAscii } from '../../utils';

/**
 * Represents a scraper for the Comix website.
 */
export class Comix implements ComicScraper {
    async scrape(url: string, content: string): Promise<ComicData> {
        try {            
            const $ = load(content);
            const publisher = $('.description.product li:contains("Editora")').first().text().trim();
            const isbn = $('.description.product li:contains("ISBN-10")').first().text().trim();
            const isbn13 = $('.description.product li:contains("ISBN-13")').first().text().trim();
            const title = $('h1.page-title').text().trim();
            const price = normalizePrice($('.special-price .price').text().trim());
            const pages = $('.description.product li:contains("páginas")').first().text().trim();
            const oldPrice = normalizePrice($('.old-price .price').text().trim());
            const synopsis = $('.product.attribute.description p').first().text().trim();
            const imageUrl = $('img.gallery-placeholder__image').attr('src');
            const isAvailable = $('.stock.available').length > 0

            return {
                title,
                publisher: publisher.replace(/.*?:([^;]*);.*/, '$1').trim(),
                url,
                offer: {
                    price,
                    oldPrice,
                    isAvailable
                },
                pages: Number(pages.match(/\d+/)?.slice(0, 1)) || undefined,
                synopsis,
                isbn: removeNonAscii(isbn?.split(':')[1]).trim(),
                isbn13: removeNonAscii(isbn13.replace('-', '')?.split(':')[1]).trim(),
                imageUrl,
                lastSuccessfulUpdateAt: new Date()
            };
        } catch (error) {
            console.error('Scraping error:', error);
            throw error;
        }
    }
}
