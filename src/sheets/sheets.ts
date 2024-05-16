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
  credentials.client_email, 
  undefined, 
  credentials.private_key, 
  ['https://www.googleapis.com/auth/spreadsheets']
)

const sheets = google.sheets({ version: 'v4', auth })

/**
 * Represents the options for inserting data into a sheet.
 */
interface InsertOptions<TableName extends string> {
    /**
     * The name of the table where the data will be inserted.
     */
    tableName?: TableName;

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
export async function write<TableName extends string>(options: InsertOptions<TableName>) {
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
export async function insert<TableName extends string, RecordType extends Record<string, any>>(options: { tableName: TableName, records: RecordType[] }) {
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
async function getHeaders<TableName extends string>(options: {tableName: TableName}): Promise<SheetHeaders[]> {
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
      return []
    }
  } catch (error) {
    console.error(`Error getting headers: ${error}`) // eslint-disable-line
    throw error
  }
}

/**
 * Combines an array of records with an array of headers to create a new record.
 * 
 * @template RecordType - The type of the resulting record.
 * @param {any[]} records - The array of records.
 * @param {SheetHeaders[]} headers - The array of headers.
 * @returns {RecordType} - The combined record.
 */
const combine = <RecordType extends Record<string, string|number>>(records: (string|number)[], headers: SheetHeaders[]): RecordType => {
  return headers.reduce((acc: RecordType, header) => {
    const headerByIndex = headers.find(h => h.index === header.index)
    const key = headerByIndex?.name as keyof RecordType
    acc[key] = records[header.index] as RecordType[keyof RecordType]
    return acc
  }, {} as RecordType)
}

type ColumnName<RecordType> = keyof RecordType;

type WhereClause<RecordType> = Partial<{
  [column in ColumnName<RecordType>]: any;
}>

/**
 * Finds the first record in a table that matches the specified conditions.
 * 
 * @param options - The options for finding the record.
 * @param options.tableName - The name of the table to search in.
 * @param options.where - The conditions to match the record against.
 * @returns A promise that resolves to an array of values representing the first matching record, or undefined if no record is found.
 */
export async function findFirst<TableName extends string, RecordType extends Record<string, any>>(options: { tableName: TableName, where: WhereClause<RecordType> }): Promise<RecordType|undefined>{
  const { tableName, where } = options
  const headers = await getHeaders({ tableName })
  const columns = Object.keys(where) as ColumnName<RecordType>[]
  const header = headers.find(header => header.name === columns[0])
  const range = `${tableName}!${header?.column}:${header?.column}`
  try {    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range
    })
    const rowIndex = response.data.values?.findIndex(row => row[0] === where[columns[0]])
    if(rowIndex === -1 || !rowIndex) {
      return undefined
    }
    const rowRange = `${tableName}!A${rowIndex + 1}:${indexToColumn(headers.length - 1)}${rowIndex + 1}`
    const rowResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: rowRange
    })
    console.log(rowResponse) // eslint-disable-line
    if(!rowResponse.data.values) {
      return undefined
    }
    return combine<RecordType>(rowResponse.data.values[0] as (string|number)[], headers)
  } catch(error) {
    console.error('Error finding data' + error) // eslint-disable-line
  }
}

enum SheetsTables {
    comicboom = 'Comic Boom',
    comix = 'Comix',
    qns = 'QnS',
    scraping = 'Scraping'
}

interface ComicBoomTable {
    authors: string
    title: string
    url: string
    price: number
}

const main = async () => {

  const hello = await findFirst<SheetsTables.comicboom, ComicBoomTable>(
    {
      tableName: SheetsTables.comicboom,
      where: {
        title: 'Hello World'
      }
    }
  )
  console.log(hello) // eslint-disable-line

}

void main()

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