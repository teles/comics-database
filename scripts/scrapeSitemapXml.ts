import readline from 'readline'
import * as Bluebird from 'bluebird'
import { extractUrlsFromURLSet, getXMLContent } from '@/scraping/sitemapXmlParser'
import { scrapeComicsData } from '@/scraping/scraping'

function parseSitemapXml() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const options = ['ComicBoom', 'Comix']
  rl.question('Qual sitemap XML você deseja analisar? (Digite o número correspondente)\n1. ComicBoom\n2. Comix\n', async (answer) => {
    const selectedOption = options[parseInt(answer) - 1]
    if (selectedOption === 'ComicBoom') {
      const content = await getXMLContent('https://comicboom.com.br/wp-sitemap-posts-product-6.xml')
      console.log('Parsing ComicBoom sitemap XML...') // eslint-disable-line no-console
      const urls: string[] = await extractUrlsFromURLSet(content)
      await Bluebird.Promise.map<string, any>(urls, async (url: string) => {
        const data = await scrapeComicsData(url)
        console.log(data) // eslint-disable-line no-console
      }, { concurrency: 5 })
    
    } else {
      console.log('Opção inválida') // eslint-disable-line no-console
    }
    rl.close()
  })
}

parseSitemapXml()