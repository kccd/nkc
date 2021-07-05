module.exports = {
  GET: 'visitMessagePage',
  list: {
    GET: 'messageGetData'
  },
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
  friend: {
    GET: 'messageGetData',
    POST: 'messagePostData',
    DELETE: 'messagePostData',
    PUT: 'messagePostData',
    apply: {
      POST: 'messagePostData'
    }
  },
  user: {
    GET: 'messageGetData',
    PARAMETER: {
      //GET: 'getUserMessage',
      POST: 'sendMessageToUser'
    }
  },
  resource: {
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
    GET: 'messageGetData',
    PUT: 'modifyMessageSettings',
  },
  mark: {
    PUT: 'modifyMessageStatus'
  },
  withdrawn: {
    PUT: 'userWithdrawnMessage'
  },
  chat: {
    DELETE: 'messagePostData'
  },
  search: {
    GET: 'messageSearchUser'
  },
  data: {
    GET: "messageDataGet"
  },
  addFriend: {
    GET: 'sendAnApplicationToAddAFriend'
  },
  category: {
    GET: 'messageCategory',
    POST: 'messagePostData',
    DELETE: 'messagePostData',
  },
};
