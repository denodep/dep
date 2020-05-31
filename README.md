# Dep

Dep is a dependency management tool for Deno.

- [CDN](#cdn)
- [CLI](#cli)
  - [Installation](#installation)
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

Dep provides a fast, global content delivery network (CDN) for every published package. All the modules are served as separate files over HTTP/2 with edge caching. So you can easily import any file directly using a URL like:

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

# Add a deno standard (std) module.
dep add std:<module>

# Add a github repository as dependency.
dep add github:<owner>/<repo>
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
