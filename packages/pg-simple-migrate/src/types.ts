import { QueryResult } from 'pg'

export interface Db {
  query: <T = any>(sql: string, params?: Array<any>) => Promise<QueryResult<T>>
}

export interface Migration {
  name: string

  path: string

  dependsOn: string[]

  sql: string
}

export interface MigrationRecord {
  batch: number
  name: string
  id: number
  tag: string
  date_executed: string
}
