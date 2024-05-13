import { ComicData } from '../types'
import { ComicBoom } from './comicboom'

describe('ComicBoom', () => {
  let comicBoom: ComicBoom

  beforeEach(() => {
    comicBoom = new ComicBoom()
  })

  describe('scrape', () => {
    it('should scrape the comic details correctly when the comic is available', () => {
      const url = 'https://example.com/comic'
      const content = `
        <html>
          <body>
            <div class="stock in-stock"></div>
            <div class="product-info">
              <ins><span class="woocommerce-Price-amount amount">R$ 9,99</span></ins>
              <del><span class="woocommerce-Price-amount amount">R$ 15,10</span></del>
            </div>
            <h1 class="product-title">Spiderman Comic Book</h1>
            <img src="example.jpg" class="wp-post-image">
            <div id="bookDescription_feature_div">“Example synopsis”</div>
            <div class="shop_attributes">
              <table>
                <tr>
                  <th>Dimensões:</th>
                  <td>16 x 24 cm</td>
                </tr>
                <tr>
                  <th>Peso:</th>
                  <td>100 g</td>
                </tr>
                <tr>
                  <th>Categoria:</th>
                  <td><a>Category 1</a>, <a>Category 2</a></td>
                </tr>
                <tr>
                  <th>Tag:</th>
                  <td><a>Tag 1</a>, <a>Tag 2</a></td>
                </tr>
                <tr>
                  <th>Tipo de série:</th>
                  <td><a>Type 1</a>, <a>Type 2</a></td>
                </tr>
                <tr>
                  <th>Cor:</th>
                  <td><a>Color 1</a>, <a>Color 2</a></td>
                </tr>
                <tr>
                  <th>Editora:</th>
                  <td><a>Marvel Comics</a></td>
                </tr>
                <tr>
                  <th>ISBN:</th>
                  <td>9781234567891</td>
                </tr>
                <tr>
                  <th>Páginas:</th>
                  <td>100</td>
                </tr>
                <tr>
                  <th>Autor:</th>
                  <td><a>Author 1</a>, <a>Author 2</a></td>
                </tr>
                <tr>
                  <th>Idioma:</th>
                  <td><a>Português</a></td>
                </tr>
                <tr>
                  <th>Número:</th>
                  <td>1</td>
                </tr>
                <tr>
                  <th>Synopsis:</th>
                  <td>Example synopsis</td>
                </tr>
                <tr>
                  <th>Formato:</th>
                  <td><a>Encadernado</a></td>
                </tr>
                <tr>
                  <th>Ano:</th>
                  <td>2022</td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `

      const expectedData: ComicData = {
        title: 'Spiderman Comic Book',
        publisher: 'Marvel Comics',
        url: 'https://example.com/comic',
        offer: {
          price: 9.99,
          oldPrice: 15.1,
          isAvailable: true
        },
        pages: 100,
        synopsis: 'Example synopsis',
        isbn13: '9781234567891',
        weight: '100 g',
        dimensions: '16 x 24 cm',
        categories: ['Category 1', 'Category 2'],
        tags: ['Tag 1', 'Tag 2'],
        seriesType: ['Type 1', 'Type 2'],
        color: ['Color 1', 'Color 2'],
        authors: ['Author 1', 'Author 2'],
        formats: ['Encadernado'],
        languages: ['Português'],
        numberInSeries: '1',
        year: 2022,
        imageUrl: 'example.jpg',
        lastSuccessfulUpdateAt: expect.any(Date)
      }

      const result = comicBoom.scrape(url, content)

      expect(result).toEqual(expectedData)

    })

    it('should scrape the comic details correctly when the comic is not available', () => {
      const url = 'https://example.com/comic-not-available'
      const content = `
        <html>
          <body>
            <div class="stock out-of-stock"></div>
            <div class="price-wrapper">
              <span class="woocommerce-Price-amount amount">R$ 9,99</span>
              </div>
              <h1 class="product-title">Spiderman Comic Book</h1>
              <img src="example.jpg" class="wp-post-image">
              <div id="bookDescription_feature_div">“Example synopsis”</div>
              <div class="shop_attributes">
                <table>
                  <tr>
                    <th>Dimensões:</th>
                    <td>16 x 24 cm</td>
                    </tr>
                  </table>
                </div>
              </body>
            </html>`
      const expectedData: ComicData = {
        title: 'Spiderman Comic Book',
        publisher: '',
        url: 'https://example.com/comic-not-available',
        offer: {
          price: 9.99,
          oldPrice: 0,
          isAvailable: false
        },
        pages: 0,
        synopsis: 'Example synopsis',
        imageUrl: 'example.jpg',
        lastSuccessfulUpdateAt: expect.any(Date)
      }

      const result = comicBoom.scrape(url, content)
      expect(result.offer).toEqual(expectedData.offer)

    })

    // it('should handle scraping errors', () => {
    //   const url = 'https://example.com/comic'
    //   const content = `
    //     <html>
    //       <body>
    //         <div class="stock in-stock"></div>
    //         <div class="shop_attributes">
    //           <table>
    //             <tr>
    //               <th>Publisher:</th>
    //               <td>Marvel Comics</td>
    //             </tr>
    //             <tr>
    //               <th>ISBN:</th>
    //               <td>9781234567891</td>
    //             </tr>
    //             <tr>
    //               <th>Title:</th>
    //               <td>Spiderman Comic Book</td>
    //             </tr>
    //             <tr>
    //               <th>Price:</th>
    //               <td>$9.99</td>
    //             </tr>
    //             <tr>
    //               <th>Pages:</th>
    //               <td>100</td>
    //             </tr>
    //             <tr>
    //               <th>Synopsis:</th>
    //               <td>Example synopsis</td>
    //             </tr>
    //             <tr>
    //               <th>Image:</th>
    //               <td><img src="example.jpg"></td>
    //             </tr>
    //           </table>
    //         </div>
    //       </body>
    //     </html>
    //   `

    //   jest.spyOn(console, 'error').mockImplementation(() => {})

    //   expect(() => {
    //     comicBoom.scrape(url, content)
    //   }).toThrowError('Scraping error')

    //   expect(console.error).toHaveBeenCalled()
    // })
  })
})