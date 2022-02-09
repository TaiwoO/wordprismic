
const sanitizeHtml = require('sanitize-html');
const { format }  = require('date-fns')


const config = {
  wordpress: {
    url: 'https://fearlessbmore.wpcomstaging.com/'
  },
  // prismic: {
  //   repo: 'intro-project',
  //   locale: 'en-au',
  //   categoriesType: ''
  // },
  optimizeMediaRequests: false,
  schema: async function (post, html) {

    return {
      type: 'blog_post',
      uid: post.slug,
      title: post.title.rendered,
      date: format(new Date(post.date), "yyyy-MM-dd"), // https://prismic.io/docs/core-concepts/import-json-reference#date
      author: post.author?.name,
      // title: post.title?.rendered && html.decode(post.title.rendered),
      featured_image: {
        origin: {
          url: post.featured_media?.guid.rendered
        },
        alt: post.featured_media?.alt_text
      },
      content: post.content && await html.parse(sanitizeHtml(post.content.rendered, { allowedTags: false, allowedAttributes: false }))
    };
  }
}


module.exports = {
  config,
  dest: './'
};
