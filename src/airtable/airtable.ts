import Airtable, { FieldSet, SelectOptions } from 'airtable'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.AIRTABLE_TOKEN) {
  console.error('Missing AIRTABLE_TOKEN env variable')
  process.exit(1)
}

interface AirtableTables {
  videos: Airtable.Table<FieldSet>
}

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_TOKEN
})

export const getAirtableTables = (): AirtableTables => {
  if(!process.env.AIRTABLE_DATABASE_ID) {
    throw new Error('Missing AIRTABLE_DATABASE_ID env variable');
  }
  const airtableDatabase = Airtable.base(process.env.AIRTABLE_DATABASE_ID)
  
  return {
    videos: airtableDatabase('Videos')
  }
}

/**
 * Creates a new record in the specified Airtable table.
 * 
 * @param tableName - The name of the table in which to create the record.
 * @param record - The record to create.
 * @returns A promise that resolves to the created record.
 */
interface InsertOptions {
  tableName: keyof AirtableTables
  record: Record<string, string | number | boolean>
}
export const insert = async (options: InsertOptions): Promise<Record<string, any>> => {
  const { tableName, record } = options
  const tables =  getAirtableTables()
  const table = tables[tableName]
  return await new Promise((resolve, reject) => {
    table.create(record, { typecast: true }, function (err: Airtable.Error | undefined) {
      if (err != null) {
        reject(err)
        return
      }
      console.log('[INSERT] Record created successfully')
      resolve(record)
      })
    }
  )  
}

/**
 * Retrieves records from the specified Airtable table.
 * 
 * @param tableName - The name of the table to select records from.
 * @param filterByFormula - The formula used to filter the records.
 * @param sort - The sorting options for the records.
 * @param maxRecords - The maximum number of records to retrieve.
 * @returns A promise that resolves to an array of records.
 */
interface SelectMethodOptions {
  tableName: keyof AirtableTables, 
  filterByFormula: SelectOptions<Airtable.FieldSet>['filterByFormula'],
  sort?: SelectOptions<Airtable.FieldSet>['sort'],
  maxRecords?: SelectOptions<Airtable.FieldSet>['maxRecords']
}

export const select = async (options: SelectMethodOptions): Promise<Record<string, any>[]> => {
  const { tableName, filterByFormula, sort, maxRecords } = options
  const tables =  getAirtableTables()
  const table = tables[tableName]
  const params: SelectOptions<Airtable.FieldSet> = { filterByFormula }
  if (sort) {
    params.sort = sort;
  }
  if (maxRecords) {
    params.maxRecords = maxRecords;
  }
  return await new Promise((resolve, reject) => {
    table.select({...params}).firstPage(function (err: Airtable.Error | undefined, records: Airtable.Records<FieldSet> | undefined) {
      if (err != null) {
        reject(err)
        return
      }
      console.log('[SELECT] Records fetched successfully')
      resolve(records?.map(record => ({id: record.id, fields: record.fields})) || [])
      })
    }
  )  
}

/**
 * Updates a record in the specified Airtable table.
 * 
 * @param tableName - The name of the table to update the record in.
 * @param recordId - The ID of the record to update.
 * @param record - The updated record data.
 * @returns A Promise that resolves to the updated record.
 */
interface UpdateOptions {
  tableName: keyof AirtableTables
  recordId: string
  record: Record<string, any>
}

export const update = async (options: UpdateOptions): Promise<Record<string, any>> => {
  const { tableName, recordId, record } = options
  const tables =  getAirtableTables()
  const table = tables[tableName]
  return await new Promise((resolve, reject) => {
    table.update(recordId, record, { typecast: true }, function (err: Airtable.Error | undefined) {
      if (err != null) {
        reject(err)
        return
      }
      console.log('[UPDATE] Record updated successfully')
      resolve(record)
      })
    }
  )
}

/**
 * Upserts a record into the specified Airtable table.
 * If a record matching the provided filter exists, it will be updated.
 * Otherwise, a new record will be created.
 *
 * @param tableName - The name of the Airtable table.
 * @param filterByFormula - The filter formula to find existing records.
 * @param record - The record to upsert.
 * @returns A promise that resolves to the upserted record.
 */
interface UpsertOptions {
  tableName: keyof AirtableTables, 
  filterByFormula: string, 
  record: Record<string, any>
}
export const upsert = async (options: UpsertOptions): Promise<Record<string, any>> => {
  const { tableName, filterByFormula, record } = options;
  try {
    const records = await select({ tableName, filterByFormula, maxRecords: 1 });
    if (records.length > 0) {
      return await update({ tableName, recordId: records[0].id, record });
    } else {
      return await insert({ tableName, record });
    }
  } catch (error) {
    throw error;
  }
};