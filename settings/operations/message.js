const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitMessagePage,
  list: {
    GET: Operations.messageGetData,
  },
  systemInfo: {
    //GET: Operations.getSystemInfo
  },
  blackList: {
    POST: Operations.messageBlackList,
  },
  remind: {
    //GET: Operations.getRemind
  },
  friendsApplication: {
    GET: Operations.getFriendsApplication,
  },
  friend: {
    GET: Operations.messageGetData,
    POST: Operations.messagePostData,
    DELETE: Operations.messagePostData,
    PUT: Operations.messagePostData,
    apply: {
      POST: Operations.messagePostData,
    },
  },
  user: {
    GET: Operations.messageGetData,
    PARAMETER: {
      //GET: Operations.getUserMessage,
      POST: Operations.sendMessageToUser,
    },
  },
  resource: {
    PARAMETER: {
      GET: Operations.getMessageFile,
    },
  },
  settings: {
    GET: Operations.messageGetData,
    PUT: Operations.modifyMessageSettings,
  },
  mark: {
    PUT: Operations.modifyMessageStatus,
  },
  withdrawn: {
    PUT: Operations.userWithdrawnMessage,
  },
  chat: {
    DELETE: Operations.messagePostData,
  },
  search: {
    GET: Operations.messageSearchUser,
  },
  data: {
    GET: Operations.messageDataGet,
  },
  addFriend: {
    GET: Operations.sendAnApplicationToAddAFriend,
  },
  category: {
    GET: Operations.messageCategory,
    POST: Operations.messagePostData,
    DELETE: Operations.messagePostData,
  },
};
