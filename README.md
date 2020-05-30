# Dep

Deno dependency management tool.

[TOC]

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
  add                Add a package dependency.
  remove             Remove a package dependency.
  init               Interactively create a pkg.json file.
  info               Show information about a package.
  signup             Sign up for a depjs.com account.
  login              Log in to depjs.com.
  logout             Clear login credentials.
  publish            Publish a package to depjs.com.
  start              Start a deno program with automatically generated flags.
  help [command]     display help for command
```

### add

Add a dependency.

```sh
dep add <package...>
```

Add a deno standard (`std`) module.
```sh
dep add std:<module-name>
```

Add a github registry as dependency.

```sh
dep add github:<owner>/<repo-name>
```

### remove

Remove a dependency.

```sh
dep remove <package...>
```

### init

Init a project.

```sh
dep init
```

### info

Show information about a package.

```sh
dep info <package>
```

### publish

Publish a package to `depjs.com`.

```sh
dep publish
```

### start

Start a deno program with automatically generated flags.

```sh
dep start
```

### signup

Interactively sign up for a `depjs.com` account.

```sh
dep signup
```

### login

Interactively login to `depjs.com`.

```sh
dep login
```

### logout

Clear login credentials.

```sh
dep logout
```

## License

[MIT](https://github.com/denodep/dep/blob/master/LICENSE)

Copyright (c) 2020, Acathur
