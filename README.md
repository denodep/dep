<p align="center">
  <img src="https://raw.githubusercontent.com/denodep/assets/master/img/logo_text.png" width="288">
</p>

# Dep

Dep is a dependency management tool for Deno. It requires deno 1.0 or greater.

Dep uses [import maps](https://deno.land/manual/linking_to_external_code/import_maps) to manage your project dependencies, which might be the most concise way so far.

Use dep cli to quickly and easily add any module as a dependency from any arbitrary source you want like dep registry, deno standard library `std`, deno third party module `x` or `github` repository.

- [CDN](#cdn)
- [CLI](#cli)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Commands](#commands)
    - [add](#add)
    - [remove](#remove)
    - [init](#init)
    - [info](#info)
    - [publish](#publish)
    - [start](#start)
    - ...
- [Issues](#issues)
- [Contributing](#contributing)
- [License](#license)

## CDN

Dep provides a fast, global content delivery network (CDN) for every published package on the dep registry. All the modules are served as separate files over HTTP/2 with edge caching. So you can easily import any file directly using a URL like:

```
https://cdn.depjs.com/<package>[@<version>]/<file>
```

*\* If you're building a complex program with deno, you might want to use dep `cli` to manage project dependencies.*

## CLI

## Installation

Using deno install:

```sh
deno install -A --unstable https://deno.land/x/dep/bin/dep.ts
```

*\* See [deno install](https://deno.land/manual/tools/script_installer) documentation if you're new to deno script installer.*

## Basic Usage

**Step 1: Add**

Add dependencies by using `dep add` command.

For example, the following command adds `http` module from deno standard library.

```sh
dep add std:http
```

**Step 2: Import**

Import the module with a relative URL in your script.

The following code import `server` from `http` module.

```ts
import { serve } from 'http/mod.ts'

// your codes...
```
**Step 3: Run**

Run your deno program with `--importmap` flag. Or just use `dep start` instead.

```sh
deno run --importmap=deps.json --unstable <file>

# or
dep start <file>
```

## Commands

```sh
Usage: dep [command] [flags]

Options:
  -v, --version      output the version number
  --verbose          output verbose messages on internal operations
  -h, --help         display help for command

Commands:
  add                Add a dependency.
  remove             Remove a dependency.
  init               Interactively create a pkg.json file.
  info               Show information about a package.
  signup             Sign up for a dep registry account.
  login              Log in to dep registry.
  logout             Clear login credentials.
  publish            Publish a package to the dep registry.
  start              Start a deno program with automatically generated flags.
  help [command]     display help for command
```

### add

Add a dependency.

```sh
dep add <package...>
```

```sh
# Add a module published on then dep registry.
dep add <module>[@<version>]

# Add a deno standard (std) module.
dep add std:<module>[@<version>]

# Add a deno third party (x) module.
dep add x:<module>[@<version>]

# Add a github repository as dependency. (You can also use the prefix alias gh:)
dep add github:<owner>/<repo>[@<tag>]
```

### remove

Remove a dependency.

```sh
dep remove <package...>
```

### init

Interactively create a pkg.json file.

```sh
dep init
```

### info

Show information about a package.

```sh
dep info <package>[@<version>]
```

### publish

Publish a package to the dep registry.

```sh
dep publish
```

### start

Start a deno program with automatically generated flags.

```sh
dep start
```

### ...

For more references about dep cli, you can use the `dep help` command to read any of them once it's installed.

## Issues

If you find some issues about dep cli, or a module is not loading correctly, please report them:

<https://github.com/denodep/dep/issues>

## Contributing

Contributions are always welcome, and they are greatly appreciated! Before you submit a pull request, check that it meets these guidelines:

- Use `TypeScript` instead of `JavaScript`.
- Use underscores in filenames.
- Make pull requests as descriptive as possible.

## License

[MIT](https://github.com/denodep/dep/blob/master/LICENSE)

Copyright (c) 2020, Acathur
