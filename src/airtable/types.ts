import { FieldSet } from 'airtable'

export interface AirtableFieldsComic extends FieldSet {
    Title: string
    Publisher: string
    Price: number
    'Old Price': number
    Available: boolean
    Image: string
    'Last Update': string
    ISBN: string
    ISBN13: string
    Synopsis: string
    url: string           
}
