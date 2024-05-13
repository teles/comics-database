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
    'Cookie': 'sucuri_cloudproxy_uuid_ccf5b6b71=9adac5b08f944c72171063d21bdabd54'
  })
  console.log(data) // eslint-disable-line no-console
  rl.close()
})