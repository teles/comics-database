import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import credentials from '../../.credentials.json'
import dotenv from 'dotenv'
dotenv.config()

export enum SheetsTables {
    comicboom = 'Comic Boom',
    comix = 'Comix',
    qns = 'QnS',
    scraping = 'Scraping'
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
interface InsertOptions {
    /**
     * The name of the table where the data will be inserted.
     */
    tableName?: SheetsTables;

    /**
     * The range where the data will be inserted.
     */
    range: string;

    /**
     * The values to be inserted into the sheet.
     */
    values: (string | number)[];
}

interface InsertOptions {
    tableName?: SheetsTables
    range: string
    values: (string|number)[]
}

/**
 * Inserts values into a Google Sheets spreadsheet.
 * @param options - The options for inserting values.
 * @throws Error if the SPREADSHEET_ID environment variable is missing.
 */
async function write(options: InsertOptions) {
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
        values: [values]
      }
    }

    await sheets.spreadsheets.values.update(request)    
    console.log(`[INSERT] Row inserted successfully`) // eslint-disable-line
  } catch (error) {
    console.error(`[INSERT] Error: ${error}`) // eslint-disable-line
  }
}

void write({
  tableName: SheetsTables.comicboom,
  range: 'A1:B1',
  values: ['Hello', 'World']
})
