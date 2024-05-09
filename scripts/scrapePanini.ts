import { scrapeComicsData } from "../src/scraping/scraping";

const scrapePanini = async () => {
    const data = await scrapeComicsData('https://panini.com.br/tom-strong-edicao-definitiva-vol-1');
    console.log(data);
}

scrapePanini();