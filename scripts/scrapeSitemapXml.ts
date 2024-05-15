import { setupSentry } from '../src/lib/sentry'
setupSentry()

import readline from 'readline'
import { ComicData } from '../src/scraping/types'
import { crawlComicBoom } from '../src/crawlers/comicboom'
import { upsert } from '../src/airtable/airtable'

function parseSitemapXml() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const options = ['ComicBoom', 'Comix']
  rl.question('Qual sitemap XML você deseja analisar? (Digite o número correspondente)\n1. ComicBoom\n', async (answer) => {
    const selectedOption = options[parseInt(answer) - 1]
    if (selectedOption === 'ComicBoom') {
      await crawlComicBoom((data: ComicData) => {
        void upsert({
          tableName: 'quadrinhos',
          filterByFormula: `{URL} = '${data.url}'`,
          record: {
            url: data.url,
            title: data.title,
            synopsis: data.synopsis,
            price: data.offer.price,
            oldPrice: data.offer.oldPrice,
            lastUpdate: data.lastSuccessfulUpdateAt,
            ISBN: data.isbn,
            ISBN13: data.isbn13,
            available: data.offer.isAvailable,
            coverImage: data.imageUrl,
            publisher: data.publisher,
            weight: data.weight,
            dimensions: data.dimensions,
            categories: data.categories?.join(', '),
            tags: data.tags?.join(', '),
            seriesType: data.seriesType,
            color: data.color?.join(', '),
            authors: data.authors?.join(', '),
            formats: data.formats?.join(', '),
            languages: data.languages?.join(', '),
            numberInSeries: data.numberInSeries,
            year: data.year            
          }
        })        
      }, 5)
    } else {
      console.log('Opção inválida') // eslint-disable-line no-console
    }
    rl.close()
  })
}

parseSitemapXml()