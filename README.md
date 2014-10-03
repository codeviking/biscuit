biscuit
=======

An API for generating simple scaffolding for a Javascript powered web-application and simple Http server which executes a [gulp](http://gulpjs.com) build when necessary and reports errors
to the developer in a friendly format.

## Installation

Install via `npm`:

```
npm install -g biscuit
```

## Usage

### Generating a new Project

```
biscuit generate URL TARGET
```

### Starting the Http Server

```
biscuit start-server TARGET [PORT]
```

### Stopping the Http Server

```
biscuit stop-server TARGET [PORT]`
```

### Restarting the Http Server

```
biscuit restart-server TARGET [PORT]
```

## What's Next

1. Support for project-name on generate.
2. Improved documentation.
3. Improved test coverage.
4. Creation of expanded recipe.
5. Server flags to disable file watching and associated auto "baking.""






