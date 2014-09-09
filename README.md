biscuit
=======

A scrumptious serving of HTML, CSS and Javascript designed to make developing a web UI as easy as possible.

## API

* [`biscuit generate`](#generate)
* [`biscuit start-server`](#start-server)
* [`biscuit stop-server`](#stop-server)
* [`biscuit update`](#update)

### <a name="generate"></a> `biscuit generate [DIRECTORY] [NAME]` (~ Unstable)

Generates a new project named `NAMED` in the specified `DIRECTORY`.  If `DIRECTORY` isn't specified, defaults to the current working directory.  If `NAME` isn't specified, `"A Tasty Biscuit"` is used instead.

Supported Options:

* `--clobber`: If specified existing directories and files matching those output by `generate` will be overwritten.

### <a name="start-server"></a> `biscuit start-server DIRECTORY [PORT]` (~ Unstable)

Starts a new oven instance (a simple HTTP server which performs on-demand Biscuit compilation) at the specified `DIRECTORY` and `PORT`.  If not specified, `PORT` defaults to *4040*.

### <a name="stop-server"></a> `biscuit stop-server DIRECTORY` (~ Unstable)

Stops an oven instance serving files from the specified `DIRECTORY`.

### <a name="update"></a> `biscuit update [DIRECTORY]` (~ Unimplemented)

Updates biscuit files in the specified `DIRECTORY` or the current working directory if not specified.  Creates a backup of existing files in `.biscuit-backup`.

Supported Options:

* `--revert`: Reverts the last update, restoring files located in `.biscuit-backup`.
