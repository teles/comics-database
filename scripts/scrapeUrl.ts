import readline from 'readline'
import { scrapeComicsData } from '../src/scraping/scraping'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Please enter the URL of the comic you want to scrape: ', async (url) => {
  if(url.length === 0) {    
    rl.close()
    return
  }
  const data = await scrapeComicsData(url)
  console.log(data) // eslint-disable-line no-console
  rl.close()
})