## Overview

Generate Prismic import objects from Fearless' Wordpress blog posts

This repository was forked from https://github.com/madeleineostoja/wordprismic and modified to fix the original source's generation flow/bugs.


## Requirements

- Wordpress's REST API enabled (included and auto-enabled in core from WP 4.4+)
- Both Node 7.6+ and Ruby installed
- Any Wordpress plugins that add or change content models (eg: Advanced Custom Fields, YOAST, etc) hooked up to the REST API, via plugins or otherwise

## Running the program

``` npm run generate ```

Generated files will be located in the /dist folder

### Defining your schema

The config schema describes how your Wordpress posts map to your Prismic content model. It's written as a function that is given two paramaters:
  1. The imported post from Wordpress
  2. Helper functions `html.parse()`, which creates Prismic RichText objects out of HTML strings, and `html.decode()`, which decodes HTML strings with entities

See the Wordpress [Posts API Reference](https://developer.wordpress.org/rest-api/reference/posts/#schema) for all properties available on the `post` object provided. However, the following properties on `post` have been **changed by Wordprismic**:
- `author` is the full [user object](https://developer.wordpress.org/rest-api/reference/users/#schema), rather than just the ID
- `featured_media` is the [media object](https://developer.wordpress.org/rest-api/reference/media/#schema) object of the asset, rather than just the ID
- Each item in `categories` has been populated with a matching Prismic category if it's available (from `prismicCategories` type in config) as follows: `{ wordpress: [category], prismic: [document] }`

The `html.parse()` function is **asynchronous**, so make sure you `await` it and flag your schema as `async`.

---
