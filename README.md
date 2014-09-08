biscuit
=======

A scrumptious serving of HTML, CSS and Javascript designed to make developing a web UI as easy as possible.

## Intended API

* [`biscuit generate`](#generate)
* [`biscuit update`](#update)

### <a name="generate"></a> `biscuit generate [DIRECTORY] [NAME]`

Generates a new project named `NAMED` in the specified `DIRECTORY`.  If `DIRECTORY` isn't specified, defaults to the current working directory.  If `NAME` isn't specified, `"A Tasty Biscuit"` is used instead.

Supported Options:

* `--clobber`: If specified existing directories and files matching those output by `generate` will be overwritten.

### <a name="update"></a> `biscuit update [DIRECTORY]`

Updates biscuit files in the specified `DIRECTORY` or the current working directory if not specified.  Creates a backup of existing files in `.biscuit-backup`.

Supported Options:

* `--revert`: Reverts the last update, restoring files located in `.biscuit-backup`.

## Conceptual Overview

`biscuit` is a collection of prebuilt Javascript, CSS and HTML patterns which make developing web based interfaces easy and intuitive.

### Layout

A new `biscuit` project looks something like this:

	src/		
	    biscuit/			
			less/
				*.less // Biscuit LESS files
			directives/
				ai2-title-bar/
					directive.js
					less/
						*.less // LESS specific to directive
			services/
				*.js // Biscuit services
			factories/
				*.js // Biscuit Factories		
		less/
			application-name/
				// Your application specific LESS files
			styles.less
    	views/	
    	services/
    	factories/
    	controllers/
			application-name-controller.js
	    index.html
	    application-name.js
	build/ // Directory where built files exist
	dev-bin/
		start-dev-server
		kill-dev-server
	tests/
		application-name-test.js
	var/ // Runtime data (PID of dev server, etc)
	tmp/ // Directory intended for test output
	gulpfile.js
	package.json
	
### Gulp Commands
	    
A `biscuit` project supports the following `gulp` commands:

`gulp test`: Runs `karma` tests in `tests/`.

`gulp less`: Compiles `LESS` output to `build/css`

`gulp compile`: Compiles project to `build/` and produces a unique hash for cache-breaking purposes.

### Development Utilities

A `biscuit` project provides the following scripts, which can be executed either via the command line or via `npm [script]`:

`dev-bin/start-dev-server`: Starts a simple HTTP server intended for development purposes.

`dev-bin/kill-dev-server`: Kills the devellpment HTTP server (if it's running)

### Open Questions

#### Development - livereload vs simple HTTP server with on-demand compilation:

Currently our development setup uses `livereload` to simply re-compile the entire application and reload as changes are made.  The only grievance this creates is that any compilation errors crash the HTTP server and are output to the terminal / stdout instead of to the browser.   

My suggestion would be to create a simple `express` server which performs the compilation task with each browser refresh and outputs any compilation errors to the browser in a readable fashion.





