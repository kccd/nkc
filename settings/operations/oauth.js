module.exports = {
  editor: {
    GET: 'createOAuthClient',
    POST: 'createOAuthClient'
  },
  client: {
    PARAMETER: {
      PUT: 'modifyOAuthClientInfo',
      DELETE: 'deleteOAuthClient',
      secret: {
        POST: 'modifyOAuthClientSecret'
      },
      ban: {
        PUT: 'disableOAuthClient'
      },
    }
  },
  login: {
    GET: 'OAuthClientLogin'
  }
}
