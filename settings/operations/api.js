module.exports = {
  v1: {
    /*user: {
      PARAMETER: {
        'public-info': {
          GET: 'getUserPublicInfo'
        }
      }
    }*/
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
      }
    }
  }
}
