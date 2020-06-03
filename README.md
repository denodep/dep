<p align="center">
  <img src="https://raw.githubusercontent.com/denodep/assets/master/img/logo_text.png" width="288">
</p>

# Dep

Dep is a dependency management tool for [Deno](https://github.com/denoland/deno). It requires deno 1.0 or greater.

Dep uses [import maps](https://deno.land/manual/linking_to_external_code/import_maps) to manage your project dependencies, which might be the most elegant way so far.

Use dep cli to quickly and easily add any module as a dependency from any arbitrary source you want like dep registry, deno standard library `std`, deno third party modules `x` or `github` repositories.

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
  - [Manifest](#manifest)
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

**Deno script installer**:

```sh
deno install -A --unstable https://cdn.depjs.com/dep/bin/dep.ts
```

*\* See [deno install](https://deno.land/manual/tools/script_installer) documentation if you're new to deno script installer.*

**Homebrew (Mac)**:

```sh
brew tap denodep/dep && brew install deno-dep
```

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
  whoami             Print the dep username.
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

If you're using import maps in your project, dep cli will replace all the relative URLs to absolute URLs that mapping in your import map before packaging. With this feature, developers can always import / run / install any module or script by the remote URLs without import maps.

### start

Start a deno program with automatically generated flags.

```sh
dep start [<file>]
```

After defining the entry point and permission in `pkg.json` file, you can use this common to execute your deno program.

Here's an example:

```js
// pkg.json
{
  "main": "mod.ts",
  "importmap": "deps.json",
  "permissions": {
    "read": true,
    "run": true,
    "net": ["google.com", "cdn.depjs.com"]
  }
}
```

```sh
dep start
# >> deno run --allow-read --allow-run --allow-net=google.com,cdn.depjs.com --importmap=deps.json --unstable mod.ts
```

### ...

For more references about dep cli, you can use the `dep help` command to read any of them once it's installed.

### Manifest

If you're a module contributor, you might want to know more information about the manifest `pkg.json`, it's much like the `package.json` in npm as you already know, but a little different. It has a `importmap` property to specify the filename of import map (Defaults to `deps.json`) and a `permissions` property to specify the required permissions of your program.

```ts
type Manifest = {
  name: string
  version: string
  description?: string
  main?: string
  importmap?: string
  dependencies?: {
    [key: string]: string
  }
  permissions?: {
    [key: string]: true | Array<string>
  }
  keywords?: string[]
  homepage?: string
  author?: string | {
    name: string
    email?: string
    url?: string
  }
  license?: string
  repository?: {
    type: string
    url: string
  }
  bugs?: {
    url: string
  }
}
```

## Issues

If you find some issues about dep, or a module is not loading correctly, please report them:

<https://github.com/denodep/dep/issues>

## Contributing

Contributions are always welcome, and they are greatly appreciated! Before you submit a pull request, check that it meets these guidelines:

- Use `TypeScript` instead of `JavaScript`.
- Use underscores in filenames.
- Make pull requests as descriptive as possible.

## License

[MIT](https://github.com/denodep/dep/blob/master/LICENSE)

Copyright (c) 2020, Acathur
