import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import credentials from '../../.credentials.json'
import dotenv from 'dotenv'
dotenv.config()

type SheetColumn = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | 'AA' | 'AB' | 'AC' | 'AD' | 'AE' | 'AF' | 'AG' | 'AH' | 'AI' | 'AJ' | 'AK' | 'AL' | 'AM' | 'AN' | 'AO' | 'AP' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AV' | 'AW' | 'AX' | 'AY' | 'AZ'
const alphabet: SheetColumn[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ']

const indexToColumn = (index: number): SheetColumn => {  
  return alphabet[index]
}

const auth = new JWT(
    credentials.client_email as string, 
    undefined, 
    credentials.private_key as string, 
    ['https://www.googleapis.com/auth/spreadsheets']
)

const sheets = google.sheets({ version: 'v4', auth })

/**
 * Represents the options for inserting data into a sheet.
 */
interface InsertOptions<TableEnum extends string> {
    /**
     * The name of the table where the data will be inserted.
     */
    tableName?: TableEnum;

    /**
     * The range where the data will be inserted.
     */
    range: string;

    /**
     * The values to be inserted into the sheet.
     */
    values: (string | number)[][];
}

/**
 * Inserts values into a Google Sheets spreadsheet.
 * @param options - The options for inserting values.
 * @throws Error if the SPREADSHEET_ID environment variable is missing.
 */
export async function write<TableEnum extends string>(options: InsertOptions<TableEnum>) {
  if(!process.env.SPREADSHEET_ID) {
    throw new Error('Missing SPREADSHEET_ID env variable')
  }

  const { range, values, tableName } = options
  const rangeWithSheet = `${tableName}!${range}`

  try {
    const request = {
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: tableName ? rangeWithSheet : range,
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    }

    await sheets.spreadsheets.values.update(request)    
    console.log(`[INSERT] Row inserted successfully`) // eslint-disable-line
  } catch (error) {
    console.error(`[INSERT] Error: ${error}`) // eslint-disable-line
  }
}

/**
 * Inserts records into a Google Sheets spreadsheet.
 * @param options - The options for inserting records.
 * @throws Error if the SPREADSHEET_ID environment variable is missing.
 */
export async function insert<TableEnum extends string, RecordType extends Record<string, any>>(options: { tableName: TableEnum, records: RecordType[] }) {
  const { tableName, records } = options

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${tableName}!${alphabet[0]}:${alphabet[alphabet.length - 1]}`
    })

    if(!response.data.values) {
      throw new Error('No data found in the sheet.')
    }
    const lastLine = response.data.values.length
    const headers = await getHeaders({ tableName })

    const valuesFromRecords = records.map((record: RecordType) => {
      const valuesForRow: (string | number)[] = []
      headers.forEach(header => {
        const isValidType = typeof record[header.name] === 'string' || typeof record[header.name] === 'number'
        valuesForRow.push(isValidType ? record[header.name] as string|number : '')
      })
      return valuesForRow
    })
    const range = `A${lastLine + 1}:${indexToColumn(headers.length - 1)}${lastLine + valuesFromRecords.length}`
    await write({
      tableName,
      range,
      values: valuesFromRecords
    })
    console.log({valuesFromRecords, lastLine, range}) // eslint-disable-line
  } catch (error) {
    console.error(`Error inserting data: ${error}`) // eslint-disable-line
    throw error
  }
}

/**
 * Represents the headers of a sheet.
 */
interface SheetHeaders {
    column: SheetColumn
    name: string
    index: number
} 

/**
 * Retrieves the headers of a specified table from a Google Sheets document.
 * @param options - The options for retrieving the headers.
 * @param options.tableName - The name of the table.
 * @returns A promise that resolves to an array of SheetHeaders representing the headers of the table.
 */
async function getHeaders<TableEnum extends string>(options: {tableName: TableEnum}): Promise<SheetHeaders[]> {
  const { tableName } = options    
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${tableName}!1:1`
    })

    const values = response.data.values

    if (values) {
      return values[0].map((name: string, index: number) => (
        { column: indexToColumn(index), name, index }
      ))
    } else {
        console.log('There are no headers in the sheet.') // eslint-disable-line
      return [] as SheetHeaders[] // Add the return type as SheetHeaders[]
    }
  } catch (error) {
    console.error(`Error getting headers: ${error}`) // eslint-disable-line
    throw error
  }
}

// enum SheetsTables {
//     comicboom = 'Comic Boom',
//     comix = 'Comix',
//     qns = 'QnS',
//     scraping = 'Scraping'
// }

// interface ComicBoomTable {
//     authors: string
//     title: string
//     url: string
//     price: number
// }

// void insert<SheetsTables, ComicBoomTable>({
//   tableName: SheetsTables.comicboom,
//   records: [{
//     'authors': 'John Doe',
//     'title': 'Hello World',
//     'url': 'https://example.com',
//     'price': 9.99
//   },
//   {
//     'authors': 'Mary Doe',
//     'title': 'Hello Teles Exemplo 2',
//     'url': 'https://example2.com',
//     'price': 0.99
//   }]
// })