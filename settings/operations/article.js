module.exports = {
  PARAMETER: {
    DELETE: "deleteArticle",
    options: {
      GET: "getArticleOptions",
    },
    unblock: {
      POST: "unblockArticle",
    },
    draft: {
      DELETE: "deleteArticleDraft",
    },
    collection: {
      POST: 'collectionArticle',
    },
    digest: {
      POST: 'digestArticle',
      DELETE: 'unDigestArticle',
    },
  }
};
