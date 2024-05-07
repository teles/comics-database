export interface ProductOffer {
    price: number;
    isAvailable?: boolean;
    oldPrice?: string;
}

export interface ComicData {
    title: string;
    url: string;
    publisher: string;
    offer: ProductOffer;
    synopsis: string;
    imageUrl: string | undefined;
    pages?: number;
    isbn?: string;
    isbn13?: string;
    lastSuccessfulUpdate: Date;
}

/**
 * Represents a comic scraper that can be used to scrape comic data from a given URL and content.
 */
export interface ComicScraper {
    /**
     * Scrapes comic data from the provided URL and content.
     * @param url - The URL of the comic page.
     * @param content - The HTML content of the comic page.
     * @returns A promise that resolves to the scraped comic data.
     */
    scrape(url: string, content: string): Promise<ComicData>;
}