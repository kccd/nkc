module.exports = {
  GET: 'visitOAuthHome',
  creation: {
    GET: 'createOAuthApp',
    POST: 'createOAuthApp'
  },
  app: {
    PARAMETER: {
      DELETE: 'deleteOAuthApp',
      settings: {
        GET: 'modifyOAuthAppInfo',
        PUT: 'modifyOAuthAppInfo',
      },
      secret: {
        POST: 'modifyOAuthAppSecret'
      },
      ban: {
        PUT: 'disableOAuthApp'
      },
    }
  },
  authentication: {
    GET: 'OAuthAuthentication',
    POST: 'OAuthAuthentication',
    PUT: 'OAuthAuthentication',
  }
}
