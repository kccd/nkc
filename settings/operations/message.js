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
  }
};