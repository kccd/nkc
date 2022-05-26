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
    homeTop: {
      POST: 'homeTop',
      DELETE: 'homeTop',
    },
    credit: {
      xsf: {
        POST: 'creditXsf',
        PARAMETER: {
          DELETE: 'cancelXsf'
        }
      },
      kcb: {
        POST: 'creditKcb',
        PARAMETER: {
          PUT: "modifyKcbRecordReason"
        }
      }
    },
  }
};
