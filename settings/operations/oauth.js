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
  token: {
    // 由于GET请求会完全暴露url中的信息，所以此处通过POST请求获取token
    creation: {
      POST: 'getOAuthToken',
    },
    content: {
      POST: 'getOAuthToken',
    }
  },

  authentication: {
    GET: 'OAuthAuthentication',
    POST: 'OAuthAuthentication',
  }
}
