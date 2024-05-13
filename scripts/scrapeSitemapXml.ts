import readline from 'readline'
import { ComicData } from '../src/scraping/types'
import { crawlComicBoom } from '../src/crawlers/comicboom'

function parseSitemapXml() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const options = ['ComicBoom', 'Comix']
  rl.question('Qual sitemap XML você deseja analisar? (Digite o número correspondente)\n1. ComicBoom\n2. Comix\n', async (answer) => {
    const selectedOption = options[parseInt(answer) - 1]
    if (selectedOption === 'ComicBoom') {
      await crawlComicBoom((data: ComicData) => {
        console.log(data) // eslint-disable-line no-console
      }, 5)
    } else {
      console.log('Opção inválida') // eslint-disable-line no-console
    }
    rl.close()
  })
}

parseSitemapXml()