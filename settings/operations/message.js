module.exports = {
  GET: 'visitMessagePage',
  systemInfo: {
    //GET: 'getSystemInfo'
  },
  blackList: {
    POST: "messageBlackList"
  },
  remind: {
    //GET: 'getRemind'
  },
  friendsApplication: {
    GET: 'getFriendsApplication'
  },
  user: {
    PARAMETER: {
      //GET: 'getUserMessage',
      POST: 'sendMessageToUser'
    }
  },
  resource: {
    POST: 'sendMessageFile',
    PARAMETER: {
      GET: 'getMessageFile'
    }
  },
  frame: {
    PARAMETER: {
      GET: 'getMessageVideoFrame'
    }
  },
  settings: {
    PATCH: 'modifyMessageSettings',
    PARAMETER: {
      PATCH: 'modifyMessageSettingsForUser'
    }
  },
  mark: {
    PATCH: 'modifyMessageStatus'
  },
  withdrawn: {
    PATCH: 'userWithdrawnMessage'
  },
  newMessages: {
    GET: 'getNewMessages'
  },
  chat: {
    PARAMETER: {
      DELETE: 'removeMessageChat'
    }
  },
  search: {
    GET: 'messageSearchUser'
  },
  data: {
    GET: "messageDataGet"
  },
  addFriend: {
    GET: 'sendAnApplicationToAddAFriend'
  }
};
