export interface ProductOffer {
    price: number;
    isAvailable?: boolean;
    oldPrice?: number;
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
    weight?: string;
    dimensions?: string;
    categories?: string[]; 
    tags?: string[];
    seriesType?: string[];
    coverType?: string[];
    color?: string[];
    authors?: string[];
    formats?: string[];    
    languages?: string[];
    numberInSeries?: string;
    year?: number;
    lastSuccessfulUpdateAt: Date;
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
    scrape: (url: string, content: string) => ComicData;
}