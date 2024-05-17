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
    table?: TableName;

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
async function write<TableName extends string>(options: InsertOptions<TableName>) {
  if(!process.env.SPREADSHEET_ID) {
    throw new Error('Missing SPREADSHEET_ID env variable')
  }

  const { range, values, table } = options
  const rangeWithSheet = `${table}!${range}`

  try {
    const request = {
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: table ? rangeWithSheet : range,
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
 * Inserts data into a Google Sheets spreadsheet.
 * @param options - The options for inserting data.
 * @throws Error if the SPREADSHEET_ID environment variable is missing.
 */
export async function insert<TableName extends string, RecordType extends Record<string, any>>(options: { table: TableName, data: RecordType[] }) {
  const { table, data } = options

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${table}!${alphabet[0]}:${alphabet[alphabet.length - 1]}`
    })

    if(!response.data.values) {
      throw new Error('No data found in the sheet.')
    }
    const lastLine = response.data.values.length
    const headers = await getHeaders({ table })

    const valuesFromRecords = data.map(record => decombine(record, headers))
    const range = `A${lastLine + 1}:${indexToColumn(headers.length - 1)}${lastLine + valuesFromRecords.length}`
    await write({
      table,
      range,
      values: valuesFromRecords
    })
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
 * @param options.table - The name of the table.
 * @returns A promise that resolves to an array of SheetHeaders representing the headers of the table.
 */
async function getHeaders<TableName extends string>(options: {table: TableName}): Promise<SheetHeaders[]> {
  const { table } = options    
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${table}!1:1`
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
 * Deconstructs a record object into an array of values based on the provided headers.
 * 
 * @template RecordType - The type of the record object.
 * @param {RecordType} record - The record object to deconstruct.
 * @param {SheetHeaders[]} headers - The headers to use for deconstruction.
 * @returns {(string | number)[]} - An array of deconstructed values.
 */
const decombine = <RecordType extends Record<string, string>>(record: RecordType, headers: SheetHeaders[]): string[] => {
  const valuesForRow: string[] = []
  headers.forEach(header => {
    const isValidType = typeof record[header.name] === 'string'
    valuesForRow.push(isValidType ? record[header.name] : '')
  })
  return valuesForRow
}

/**
 * Combines an array of data with an array of headers to create a new record.
 * 
 * @template RecordType - The type of the resulting record.
 * @param {any[]} data - The array of data.
 * @param {SheetHeaders[]} headers - The array of headers.
 * @returns {RecordType} - The combined record.
 */
const combine = <RecordType extends Record<string, string>>(data: string[], headers: SheetHeaders[]): RecordType => {
  return headers.reduce((acc: RecordType, header) => {
    const headerByIndex = headers.find(h => h.index === header.index)
    const key = headerByIndex?.name as keyof RecordType
    acc[key] = data[header.index] as RecordType[keyof RecordType]
    return acc
  }, {} as RecordType)
}

interface RowSet<RecordType extends Record<string, string>> {
  range: string
  fields: Partial<RecordType>
}

type WhereFilter = (value: string) => boolean;

const whereFilters = {
  contains: (value: string): WhereFilter => (data: string) => data.includes(value),
  equals: (value: string): WhereFilter => (data: string) => data === value
}

type WhereFilterKey = keyof typeof whereFilters;

type WhereCondition = {
  [key in WhereFilterKey]?: string;
};

type WhereClause<RecordType> = {
  [column in keyof RecordType]?: WhereCondition | string;
};
type SelectClause<RecordType> = Partial<{[column in keyof RecordType]: boolean}>

/**
 * Finds the first record in a table that matches the specified conditions.
 * 
 * @param options - The options for finding the record.
 * @param options.table - The name of the table to search in.
 * @param options.where - The conditions to match the record against.
 * @returns A promise that resolves to an array of values representing the first matching record, or undefined if no record is found.
 */
export async function findFirst<RecordType extends Record<string, any>>(options: { table: string, where: WhereClause<RecordType>, select?: SelectClause<RecordType> }): Promise<RowSet<RecordType>|undefined>{
  const { table, where } = options
  const headers = await getHeaders({ table })
  const columns = Object.keys(where) as (keyof RecordType)[]
  const header = headers.find(header => header.name === columns[0])
  const range = `${table}!${header?.column}:${header?.column}`
  try {    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range
    })
    const rowIndex = response.data.values?.findIndex(row => row[0] === where[columns[0]])
    if(rowIndex === -1 || !rowIndex) {
      return undefined
    }
    const rowRange = `${table}!A${rowIndex + 1}:${indexToColumn(headers.length - 1)}${rowIndex + 1}`
    const rowResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: rowRange
    })

    if(!rowResponse.data.values) {
      return undefined
    }
    const selectedHeaders = headers.filter(header => options.select ? options.select[header.name] : true)
    const fields = combine<RecordType>(rowResponse.data.values[0] as string[], selectedHeaders)
    return { range: rowRange, fields }
  } catch(error) {
    console.error('Error finding data' + error) // eslint-disable-line
  }
}

/**
 * Retrieves multiple data from a specified table based on the provided conditions.
 *
 * @param options - The options for finding the data.
 * @param options.table - The name of the table to search in.
 * @param options.where - The conditions to filter the data.
 * @returns A promise that resolves to an array of matching data.
 */
export async function findMany<RecordType extends Record<string, any>>(options: { table: string, where: WhereClause<RecordType>, select?: SelectClause<RecordType> }): Promise<RowSet<RecordType>[]> {
  const { table, where, select } = options
  const headers = await getHeaders({ table })
  const columns = Object.keys(where) as (keyof RecordType)[]
  const header = headers.find(header => header.name === columns[0])
  const range = `${table}!${header?.column}:${header?.column}`
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range
    })
    const rowIndexes = response.data.values?.reduce((acc: number[], row, index) => {
      if(row[0] === where[columns[0]]) {
        acc.push(index)
      }
      return acc
    }, [])
    if(!rowIndexes || rowIndexes.length === 0) {
      return []
    }
    const rowsRange = rowIndexes.map(index => `${table}!A${index + 1}:${indexToColumn(headers.length - 1)}${index + 1}`)
    const rowsResponse = await Promise.all(rowsRange.map(async rowRange => {
      const rowResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: rowRange
      })
      const values = rowResponse.data.values
      return {range: rowRange, values}
    }))
    return rowsResponse.map(({range, values}) => {  
      const selectedHeaders = headers.filter(header => select ? select[header.name] : true)    
      const fields = combine<RecordType>(values ? values[0] as string[] : [], selectedHeaders)
      return { range, fields }
    })
  } catch(error) {
    console.error('Error finding data' + error) // eslint-disable-line
    return []
  }
}

const main = async () => {
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

  const hello = await findMany<ComicBoomTable>(
    {
      table: SheetsTables.comicboom,
      where: {
        title: {
          contains: 'Hello'
        },
        price: '9.99'
      },
      select: {
        title: true
      }
    }
  )

  console.log(hello) // eslint-disable-line

  void insert<SheetsTables, ComicBoomTable>({
    table: SheetsTables.comicboom,
    data: [{
      'authors': 'John Doe',
      'title': 'Hello World',
      'url': 'https://example.com',
      'price': 9.99
    },
    {
      'authors': 'Mary Doe',
      'title': 'Hello Teles Exemplo 2',
      'url': 'https://example2.com',
      'price': 0.99
    }]
  })
}

void main()

