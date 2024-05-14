import puppeteer from 'puppeteer'

async function getCookie() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://comicboom.com.br/produto/wash-day-para-o-que-der-e-vier-pre-venda-10-06/')

  const cookies = await page.cookies()
    
  const sucuriCookie = cookies.find(cookie => cookie.name.startsWith('sucuri_cloudproxy_uuid'))

  if (sucuriCookie) {
    console.log('Valor do cookie:', sucuriCookie) // eslint-disable-line no-console
  } else {
    console.log('Cookie não encontrado') // eslint-disable-line no-console
  }

  await browser.close()
}

void getCookie()
