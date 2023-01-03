module.exports = {
  v1: {
    /*user: {
      PARAMETER: {
        'public-info': {
          GET: 'getUserPublicInfo'
        }
      }
    }*/
    threads: {
      selector: {
        GET: 'getUserArticles'
      }
    },
    articles: {
      selector: {
        GET: 'getUserArticles'
      }
    }
  }
}
