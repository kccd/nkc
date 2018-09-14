module.exports = {
  GET: 'visitMessagePage',
  systemInfo: {
    GET: 'getSystemInfo'
  },
  remind: {
    GET: 'getRemind'
  },
  user: {
    PARAMETER: {
      GET: 'getUserMessage',
      POST: 'sendMessageToUser'
    }
  },
  resource: {
    POST: 'sendMessageFile',
    PARAMETER: {
      GET: 'getMessageFile'
    }
  },
  settings: {
    PATCH: 'modifyMessageSettings'
  },
  mark: {
    PATCH: 'modifyMessageStatus'
  },
  withdrawn: {
    PATCH: 'userWithdrawnMessage'
  }
};