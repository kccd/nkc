module.exports = {
  v1: {
    server: {
      info: {
        GET: 'api_get_server_info',
      }
    },
    account: {
      info: {
        GET: 'api_get_account_info',
      },
      card: {
        GET: 'api_get_account_card'
      },
      drawer: {
        GET: 'api_get_account_drawer'
      }
    },
    threads: {
      selector: {
        GET: 'getUserArticles'
      }
    },
    articles: {
      selector: {
        GET: 'getUserArticles'
      }
    },
    column: {
      PARAMETER: {
        'articles': {
          POST: 'columnManage'
        }
      }
    }
  }
}
