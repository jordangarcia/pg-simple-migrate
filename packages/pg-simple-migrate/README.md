# pg-simple-migrate

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pg-simple-migrate.svg)](https://npmjs.org/package/@pangaea-holdings/pg-simple-migrate)
[![Downloads/week](https://img.shields.io/npm/dw/pg-simple-migrate.svg)](https://npmjs.org/package/@pangaea-holdings/pg-simple-migrate)

A plain sql database migration tool for postgresql.

### Features

- Plain sql based migrations
- Supports rollbacks and tagged releases
- DB mirgation state tracked in database table
- Atomic migrations, either they all succeed or nothing is written

## Installation

```
yarn add @pangaea-holdings/pg-simple-migrate
```

Update `package.json` scripts

```
{
  "dependencies": {
    "@pangaea-holdings/pg-simple-migrate": "^0.1.0",
  },
  "scripts": {
    "migrate": "pg-simple-migrate"
  }
}
```

By adding `migrate` to scripts you can now access via `yarn migrate [CMD]`

## Creating Migration Tables

`pg-simple-migrate` requires two tables, `migrations` `migration_releases` to be created to track migration state.

✅ Ensure that a valid `DATABASE_URL` env variable exists (ENV variables automatically loaded from .env)

ex: `postrgesql://user:password@localhost:5432/db_name`

```
yarn migrate install
```

## Creating a migration

```
yarn migrate make
```

This will create two migration files `<TIMESTAMP>__<NAME>.sql` and `<TIMESTAMP>__<NAME>__rollback.sql`.

## Running migrations

The most basic usage looks for all migrations in the `migrations-folder` and runs them in order of name (excluding files ending in `__rollback.sql`)

```
yarn migrate up
```

#### Tagging release

Every time a `yarn migrate up` is run in production it's best practice to supply a `--release <GIT SHA TAG>` to tag the release. This way the system can figure out

## Rollbacks

#### Rollback the last set of migrations

```
yarn migrate rollback
```

#### Rollback migrations to the state of a specific release

```
yarn migrate rollback --tag <GIT SHA>
```

## Commands

### install

`yarn migrate install`

```
Creates the migration table

USAGE
  $ yarn migrate install

OPTIONS
  -m, --migrations-folder=migrations-folder  [default: ./db/migrations]
  -v, --verbose                              Show debug information
  --db-url=db-url                            Postgres URL (default env
                                             DATABASE_URL)
```

### make

`yarn migrate make`

```
Make a new migration

USAGE
  $ yarn migrate make

OPTIONS
  -h, --help                             show CLI help
  -n, --name=name                        migration name
  --migrations-folder=migrations-folder  [default: ./db/migrations]
```

### up

`yarn migrate up`

```
Runs migrations

USAGE
  $ yarn migrate up

OPTIONS
  -f, --file=file                            Specify a specific migration file
                                             to run [NOT RECOMMENDED IN
                                             PRODUCTION]

  -m, --migrations-folder=migrations-folder  [default: ./db/migrations]

  -v, --verbose                              Show debug information

  --db-url=db-url                            Postgres URL (default env
                                             DATABASE_URL)

  --dry-run                                  Don't execute migration, pretend
                                             only

  --release=release                          Associate all migrations to be run
                                             with a release tag (ex: git commit
                                             sha)
```

### rollback

`yarn migrate rollback`

```
Rolls back migrations, if supplied with no options rolls back last "batch" of migrations

USAGE
  $ yarn migrate rollback

OPTIONS
  -m, --migrations-folder=migrations-folder  [default: ./db/migrations]
  -v, --verbose                              Show debug information

  --db-url=db-url                            Postgres URL (default env
                                             DATABASE_URL)

  --dry-run                                  Don't execute migration, pretend
                                             only

  --no-prompt                                Do not prompt for confirmation of
                                             rollback

  --num-batches=num-batches                  [default: 1]

  --release=release                          Rollback all migrations after a
                                             specific release tag

```
