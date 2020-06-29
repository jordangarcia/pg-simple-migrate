import { Pool, Client, QueryResult } from 'pg'

export class Db {
  private client: Client

  constructor(opts: { connectionString: string }) {
    this.client = new Client(opts)
    this.client.connect()
  }

  query<T = any>(sql: string, params: Array<any> = []) {
    return new Promise<QueryResult<T>>((resolve, reject) => {
      this.client.query<T>(sql, params, (err, res) => {
        if (err) {
          return reject(err)
        }
        resolve(res)
      })
    })
  }

  async first<T = any>(
    sql: string,
    params: Array<any> = []
  ): Promise<T | null> {
    const { rows } = await this.query(sql, params)
    return rows[0] ?? null
  }

  async checkTableExists(tableName: string): Promise<boolean> {
    const value = await this.first<{ exists: string | null }>(
      'SELECT to_regclass($1) as exists;',
      [tableName]
    )

    return Boolean(value && value.exists)
  }

  close() {
    this.client.end()
  }
}
