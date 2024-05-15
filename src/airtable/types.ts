import { FieldSet } from 'airtable'

export interface AirtableFieldsComic extends FieldSet {
    url: string
    title: string
    synopsis?: string
    price?: number
    oldPrice?: number
    lastUpdate?: string
    ISBN?: string
    ISBN13?: string
    available?: boolean
    coverImage?: string
    publisher?: string
    weight?: string
    dimensions?: string
    categories?: string
    tags?: string
    seriesType?: string
    color?: string
    authors?: string
    formats?: string
    languages?: string
    numberInSeries?: number
    year?: number        
}

export enum ScrapableSitesNames {
    comix = 'Comix',
    comicboom = 'Comic Boom',
    panini = 'Panini'
}

export enum ScrapingStatus {
    pending = 'PENDING',
    completed = 'COMPLETED',
    next = 'NEXT',
    failed = 'FAILED'
}

export interface AirtableFieldsScraping extends FieldSet {
    url: string
    shop: ScrapableSitesNames
    status: ScrapingStatus
    startedAt: string
    completedAt?: string
    count?: number
    error?: string
}
