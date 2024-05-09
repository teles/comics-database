import { scrapeComicsData } from "../src/scraping/scraping";

const scrapeComix = async () => {
    const data = await scrapeComicsData('https://www.comix.com.br/lancamentos/kililana-song-edic-o-integral.html');
    console.log(data);
}

scrapeComix();