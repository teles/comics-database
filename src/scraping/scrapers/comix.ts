import { load } from "cheerio";
import { ComicData, ComicScraper } from "../types";
import { normalizePrice } from "../../utils";

/**
 * Represents a scraper for the Comix website.
 */
export class Comix implements ComicScraper {
    async scrape(url: string, content: string): Promise<ComicData> {
        try {
            const $ = load(content);
            const title = $('h1.page-title').text().trim();
            const publisher = $('div.info-produto a:contains("Editora")').text().trim();
            const price = normalizePrice($('.special-price .price').text().trim());
            const synopsis = $('.product.attribute.description p').first().text().trim();
            const imageUrl = $('img.gallery-placeholder__image').attr('src');

            return {
                title,
                publisher,
                url,
                offer: {
                    price,
                    isAvailable: true
                },
                synopsis,
                imageUrl,
                lastSuccessfulUpdate: new Date()
            };
        } catch (error) {
            console.error('Scraping error:', error);
            throw error;
        }
    }
}
