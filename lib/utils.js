const fs = require('fs')
const fetch = require('node-fetch');
const Prismic = require('prismic-javascript');
const chalk = require('chalk');
const cheerio = require('cheerio');
const he = require('he');
const { exec } = require('child_process');
const { wordpress, prismic } = require('../config').config;
const TurndownService = require('turndown')

const WP_API = `${wordpress.url}/wp-json/wp/v2`,
  HTML_PARSER = `${__dirname}/htmlParser.rb`,
  MARKDOWN_PARSER = `${__dirname}/markdownParser.rb`;

/**
 * Helper function to fetch paginated WP data
 * @param {string} resource REST resource to get
 * @param {number} page Current page, called recursively
 */
async function getAllWp(resource, queryParams) {
  let page = 1;

  const baseQuery = `${WP_API}/${resource}?per_page=100&${queryParams}`,
    totalPages = await fetch(baseQuery, { mode: 'headers' }).then(response =>
      response.headers.get('x-wp-totalpages')
    ),
    getPage = async page => {
      console.log(
        chalk.gray(
          `Fetching ${page > 1 ? `page ${page} of ` : ``}${resource}...`
        )
      );
      return await fetch(`${baseQuery}&page=${page}`).then(response => {
        if (!response.ok) {
          throw new Error(
            `Fetching ${resource} failed with code ${response.status}`
          );
        }
        return response.json();
      });
    },
    resources = await getPage(page);

  while (page < totalPages) {
    page++;
    Array.prototype.push.apply(resources, await getPage(page));
  }

  return resources;
}

function htmlDecoder(html) {
  return he.decode(html);
}

async function htmlParser(html) {


  return await new Promise((resolve, reject) => {

    const turndownService = new TurndownService()
    const markdown = turndownService.turndown(html)

    // write html to file to avoid "The command line is too long" error
    // 

    if (!fs.existsSync(".tmp")) fs.mkdirSync(".tmp");

    fs.writeFileSync('.tmp/markdown.txt', markdown, err => {
      if (err) {
        console.error(err)
        return
      }
    })

    exec(
      `ruby "${MARKDOWN_PARSER}"`,
      (err, stdout) => {
        err && reject(err);
        resolve(stdout ? JSON.parse(stdout) : "");
      }
    );
  });
}

/**
 * Map Wordpress categories to Prismic topic documents
 */
// async function mapCategories() {
//   const prismicApi = await Prismic.getApi(
//     `https://${prismic.repo}.prismic.io/api/v2`
//   ),
//     prismicTopics = await prismicApi.query(
//       Prismic.Predicates.at('document.type', prismic.categoriesType),
//       { pageSize: 100 }
//     ),
//     wpCategories = await getAllWp('categories');

//   return wpCategories.map(wpCategory => {
//     const prismicTopic = prismicTopics.results.find(
//       topic => wpCategory.slug === topic.uid
//     );

//     return {
//       wordpress: wpCategory,
//       ...(prismicTopic && { prismic: prismicTopic })
//     };
//   });
// }

module.exports = {
  getAllWp,
  html: {
    parse: htmlParser,
    decode: htmlDecoder
  },
  // mapCategories
};
