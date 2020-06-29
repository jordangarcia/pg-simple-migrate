import { Command, flags } from '@oclif/command'
import { Db } from './db'
import { OutputFlags } from '@oclif/parser'

export default abstract class BaseDbCommand extends Command {
  static args = []

  static flags = {
    'db-url': flags.string({
      env: 'DATABASE_URL',
      description: 'Postgres URL (default env DATABASE_URL)',
    }),
    'migrations-folder': flags.string({
      char: 'm',
      default: './db/migrations',
    }),
    verbose: flags.boolean({
      char: 'v',
      default: false,
      description: `Show debug information`,
    }),
  }

  // @ts-ignore since we're initializing in the init function instead of constructor
  protected db: Db

  async init() {
    // https://github.com/oclif/oclif/issues/225
    const {
      flags,
    }: { flags: OutputFlags<typeof BaseDbCommand.flags> } = this.parse(
      this.constructor as any
    )
    if (flags.verbose) {
      console.log(`flags: ${JSON.stringify(flags, null, '  ')}`)
    }

    if (!flags['db-url']) {
      throw new Error(
        'Must supply a valid postgres url, using `--db-url` or `DATABASE_URL` db url ex: postgresql://[username]:[password]@[host]:[port]/[db]'
      )
    }

    this.db = new Db({
      connectionString: flags['db-url'],
    })

    try {
      await this.db.query('SELECT NOW()')
    } catch (e) {
      console.error(`Unable to connect to DB:`)
      throw e
    }
  }

  async catch(err: Error) {
    console.error(err.message)
    this.exit(1)
  }

  async finally(err: Error) {
    try {
      // set timeout to give errors a chance to surface
      setTimeout(() => {
        if (this.db) {
          this.db.close()
        }
      }, 0)
    } catch (e) {}
  }
}
