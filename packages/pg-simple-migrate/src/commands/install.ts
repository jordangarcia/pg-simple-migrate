import BaseDbCommand from '../BaseDbCommand'

const MIGRATIONS = 'migrations'
const MIGRATION_RELEASES = 'migration_releases'

const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS "${MIGRATIONS}" (
  id SERIAL,
  batch integer,
  name text NOT NULL,
  created timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "${MIGRATION_RELEASES}" (
  tag text NOT NULL,
  last_migration_id integer REFERENCES ${MIGRATIONS}(id) ON DELETE CASCADE,
  created timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("tag")
);
`

export default class Install extends BaseDbCommand {
  static description = 'Creates the migration table'

  static flags = {
    ...BaseDbCommand.flags,
  }

  static args = [...BaseDbCommand.args]

  async run() {
    if (
      (await this.db.checkTableExists(MIGRATIONS)) &&
      (await this.db.checkTableExists(MIGRATION_RELEASES))
    ) {
      console.log('Migrations table already exists')
      return
    }

    await this.db.query(CREATE_MIGRATIONS_TABLE)
    console.log('✅ Installed migrations table')
  }
}
