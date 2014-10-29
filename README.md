flapjack
=======

A simple API for generating new projects from recipes.

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

`URL` can be a relative github URL, ie 'allenai/angular-web.recipe'.  

`TARGET` is the directory where you'd like the project to be generated in.  If not specified it defaults to the current directory.

#### Examples

```
flapjack generate allenai/angular-recipe.recipe
flapjack generate allenai/angular-recipe.recipe /tmp
flapjack generate allenai/angular-recipe.recipe ~/Projects/a-new-angular-project
```
