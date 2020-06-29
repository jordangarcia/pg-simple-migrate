import { promisify } from 'util'
import cbGlob from 'glob'
import path from 'path'
import cli from 'cli-ux'
import fs from 'fs'
import { Migration, MigrationRecord } from '../types'
import BaseDbCommand from '../BaseDbCommand'
import { flags } from '@oclif/command'

const readFile = promisify(fs.readFile)

type MigrationAndId = {
  id: number
  migration: Migration
}

export default class Rollback extends BaseDbCommand {
  static description =
    'Rolls back migrations, if supplied with no options rolls back last "batch" of migrations'

  static flags = {
    ...BaseDbCommand.flags,
    verbose: flags.boolean({
      char: 'v',
      default: false,
      description: `Show SQL statements`,
    }),
    'num-batches': flags.integer({
      default: 1,
    }),
    'dry-run': flags.boolean({
      default: false,
      description: `Don't execute migration, pretend only`,
    }),
    'no-prompt': flags.boolean({
      default: false,
      description: 'Do not prompt for confirmation of rollback',
    }),

    release: flags.string({
      description: 'Rollback all migrations after a specific release tag',
    }),
  }

  async run() {
    const { args, flags } = this.parse(Rollback)
    const dryRun = flags['dry-run']
    const { verbose } = flags

    const recordsToRun = flags.release
      ? await this.getSinceLastReleaseTag(flags.release)
      : await this.getLastBatch()

    let migrations: MigrationAndId[] = await this.getMigrations(
      recordsToRun,
      flags['migrations-folder']
    )

    if (migrations.length === 0) {
      console.log('No migrations to rollback')
      this.exit(0)
    }

    console.log('The following rollback migrations will be run:')
    migrations.forEach(({ migration: { path } }) => console.log(` - ${path}`))
    console.log('') // newline

    if (!flags['no-prompt'] && !flags['dry-run']) {
      const confirmValue = (await cli.prompt(`Type "yes" to proceed`)) as string
      if (String(confirmValue).toLowerCase() !== 'yes') {
        this.exit(1)
      }
    }

    if (!dryRun) {
      await this.db.query('BEGIN')
    }
    for (let { id, migration } of migrations) {
      const { name, sql } = migration
      console.log(`️▶ ${name}`)

      if (verbose) {
        console.log(`${sql}\n`)
      }

      if (dryRun) {
        continue
      }

      await this.executeRollback(sql)
      await this.recordRollback(id)
      console.log(`✅ ${name}`)
    }
    if (!dryRun) {
      await this.db.query('COMMIT')
    }
  }

  private async getMigrations(
    migrations: MigrationRecord[],
    migrationsFolder: string
  ): Promise<MigrationAndId[]> {
    return Promise.all(
      migrations.map(async ({ name, id }) => {
        return new Promise<MigrationAndId>((resolve) => {
          this.getDownMigration(migrationsFolder, name).then((migration) => {
            resolve({
              id,
              migration,
            })
          })
        })
      })
    )
  }

  private async getDownMigration(
    migrationsPath: string,
    name: string
  ): Promise<Migration> {
    const downName = name.replace('__up', '__down.sql')
    const filepath = path.join(migrationsPath, `${downName}`)
    const file = await readFile(filepath, 'utf8')

    return {
      name: downName,
      path: filepath,
      dependsOn: [],
      sql: file.toString(),
    }
  }

  private async recordRollback(id: number): Promise<void> {
    await this.db.query(`DELETE  FROM migrations WHERE id = $1`, [id])
  }

  private async executeRollback(sql: string): Promise<boolean> {
    try {
      await this.db.query(sql)
    } catch (e) {
      console.error(`Error: ${e.message}`)
      return false
    }
    return true
  }

  private async getLastBatch(): Promise<MigrationRecord[]> {
    const { rows } = await this.db.query<MigrationRecord>(
      `SELECT * from migrations where batch IN (
        SELECT batch as max_batch from migrations order by batch DESC limit 1
      ) ORDER BY name desc`
    )
    return rows
  }

  private async getSinceLastReleaseTag(
    tag: string
  ): Promise<MigrationRecord[]> {
    const { rows } = await this.db.query<MigrationRecord>(
      `SELECT * from migrations where id > (
        SELECT last_migration_id as id from migration_releases where tag = $1
      ) ORDER BY name desc`,
      [tag]
    )
    return rows
  }
}
