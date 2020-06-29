pg-simple-migrate
=================



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pg-simple-migrate.svg)](https://npmjs.org/package/pg-simple-migrate)
[![Downloads/week](https://img.shields.io/npm/dw/pg-simple-migrate.svg)](https://npmjs.org/package/pg-simple-migrate)
[![License](https://img.shields.io/npm/l/pg-simple-migrate.svg)](https://github.com/https://gitlab.com/pangaea-holdings/pg-simple-migrate/pg-simple-migrate/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g pg-simple-migrate
$ pg-simple-migrate COMMAND
running command...
$ pg-simple-migrate (-v|--version|version)
pg-simple-migrate/0.0.0 darwin-x64 node-v12.18.0
$ pg-simple-migrate --help [COMMAND]
USAGE
  $ pg-simple-migrate COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pg-simple-migrate hello [FILE]`](#pg-simple-migrate-hello-file)
* [`pg-simple-migrate help [COMMAND]`](#pg-simple-migrate-help-command)

## `pg-simple-migrate hello [FILE]`

describe the command here

```
USAGE
  $ pg-simple-migrate hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ pg-simple-migrate hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://gitlab.com/pangaea-holdings/pg-simple-migrate/pg-simple-migrate/blob/v0.0.0/src/commands/hello.ts)_

## `pg-simple-migrate help [COMMAND]`

display help for pg-simple-migrate

```
USAGE
  $ pg-simple-migrate help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_
<!-- commandsstop -->
