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
  const data = await scrapeComicsData(url, {
    'Cookie': 'sucuri_cloudproxy_uuid_2c9276225=443449b8d62f698845cc017eca5510ad'
  })
  console.log(data) // eslint-disable-line no-console
  rl.close()
})