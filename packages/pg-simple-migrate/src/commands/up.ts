import { promisify } from 'util'
import cbGlob from 'glob'
import path from 'path'
import fs from 'fs'
import { Migration } from '../types'
import BaseDbCommand from '../BaseDbCommand'
import { flags } from '@oclif/command'

const readFile = promisify(fs.readFile)
const glob = promisify(cbGlob)

const RE_TAG_VALIDATION = /^[0-9A-Za-z-_]+$/

export default class Up extends BaseDbCommand {
  static description = 'Runs migrations'

  static args = [...BaseDbCommand.args]

  static flags = {
    ...BaseDbCommand.flags,
    verbose: flags.boolean({
      char: 'v',
      default: false,
      description: `Show SQL statements`,
    }),
    'dry-run': flags.boolean({
      default: false,
      description: `Don't execute migration, pretend only`,
    }),
    file: flags.string({
      char: 'f',
      description: `Specify a specific migration file to run [NOT RECOMMENDED IN PRODUCTION]`,
    }),
    release: flags.string({
      description:
        'Associate all migrations to be run with a release tag (ex: git commit sha)',
    }),
  }

  async run() {
    const { args, flags } = this.parse(Up)

    const [previousMigrations, batch] = await Promise.all([
      this.getPreviouslyRunMigrationsSet(),
      this.getNextBatchId(),
    ])

    const release = flags.release

    if (release && !RE_TAG_VALIDATION.test(release)) {
      throw new Error('tag must only contain letters, numbers or _ -')
    }

    const { file } = flags

    if (file && !/__up\.sql$/.test(file)) {
      throw new Error(
        'up file migration must reference a sql file ending in "__up.sql"'
      )
    }

    const migrations = await this.getMigrations(
      file ?? path.join(flags['migrations-folder'], './**/*__up.sql')
    )

    return await this.runMigrations({
      migrations,
      previousMigrations,
      batch,
      tag: release,
      verbose: flags.verbose,
      dryRun: flags['dry-run'],
    })
  }

  private async runMigrations({
    migrations,
    previousMigrations,
    batch,
    tag,
    dryRun,
    verbose,
  }: {
    migrations: Migration[]
    previousMigrations: Set<string>
    batch: number
    tag?: string
    dryRun: boolean
    verbose: boolean
  }) {
    let lastMigrationId: number | null = null
    const toRun = migrations.filter((migration) => {
      return !previousMigrations.has(migration.name)
    })

    if (toRun.length === 0) {
      console.log(`✅ All caught up`)
      return
    }

    console.log(`Running migrations | batch=${batch} | release tag=${tag}\n`)

    if (!dryRun) {
      await this.db.query('BEGIN')
    }
    for (let migration of toRun) {
      const { name, sql } = migration
      console.log(`️▶ ${name}`)

      if (verbose) {
        console.log(sql)
      }

      if (dryRun) {
        continue
      }

      await this.executeMigration(sql)

      lastMigrationId = await this.recordSuccess({ batch, name })
      console.log(`✅ ${name}`)
    }

    // at this point all migrations have been completed
    if (!dryRun) {
      if (tag) {
        await this.createRelease({
          // gauranteed to be number since recordSuccess returns number
          lastMigrationId: lastMigrationId as number,
          tag,
        })
      }

      await this.db.query('COMMIT')
    }
  }

  private async getMigrations(globPath: string): Promise<Migration[]> {
    const files = await glob(globPath)
    if (files.length === 0) {
      throw new Error(`No migrations found (glob=${globPath})`)
    }

    const promises = files.map(async (filepath) => {
      const file = await readFile(filepath, 'utf8')
      const { name } = path.parse(filepath)

      return {
        name,
        path: filepath,
        dependsOn: [],
        sql: file.toString(),
      }
    })
    return Promise.all(promises)
  }

  private async getPreviouslyRunMigrationsSet(): Promise<Set<string>> {
    const res = await this.db.query<{ name: string }>(
      `SELECT name from migrations`
    )

    return res.rows.reduce((carry, item) => {
      carry.add(item.name)
      return carry
    }, new Set<string>())
  }

  private async recordSuccess({
    batch,
    name,
  }: {
    batch: number
    name: string
  }): Promise<number> {
    const { rows } = await this.db.query<{ id: number }>(
      `INSERT INTO migrations (batch, name) VALUES ($1, $2) RETURNING id`,
      [batch, name]
    )
    if (!rows.length) {
      throw new Error('Failed to insert into migrations')
    }
    return rows[0].id
  }

  private async executeMigration(sql: string): Promise<boolean> {
    try {
      await this.db.query(sql)
    } catch (e) {
      console.error(`Error: ${e.message}`)
      return false
    }

    return true
  }

  private async getNextBatchId(): Promise<number> {
    const { rows } = await this.db.query<{ batch: number }>(
      `SELECT batch from migrations order by id DESC limit 1`
    )
    if (!rows.length) {
      return 1
    }
    return rows[0].batch + 1
  }

  private async createRelease({
    tag,
    lastMigrationId,
  }: {
    tag: string
    lastMigrationId: number
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO migration_releases (tag, last_migration_id) VALUES ($1, $2)`,
      [tag, lastMigrationId]
    )
  }
}
