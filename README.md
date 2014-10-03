flapjack
=======

An API for generating a simple scaffolding for javascript powered web-applications and simple http server which executes a [gulp](http://gulpjs.com) build when necessary and reports errors
to the developer in a friendly format.

## Installation

Install via `npm`:

```
npm install -g flapjack
```

## Usage

### Generating a new Project

```
flapjack generate URL TARGET
```

### Starting the Http Server

```
flapjack start-server TARGET [PORT]
```

### Stopping the Http Server

```
flapjack stop-server TARGET [PORT]`
```

### Restarting the Http Server

```
flapjack restart-server TARGET [PORT]
```

## What's Next

1. Support for project-name on generate.
2. Improved documentation.
3. Improved test coverage.
4. Creation of expanded recipe.
5. Server flags to disable file watching and associated auto "baking."  Effectively making the flapjack server something which could be effective in a production enviornment.
