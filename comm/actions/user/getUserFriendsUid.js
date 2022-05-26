const MessageModel = require('../../../dataModels/MessageModel');
module.exports = {
  params: {
    uid: 'string'
  },
  async handler(ctx) {
    const {uid} = ctx.params;
    const friendsUid = await MessageModel.getUsersFriendsUid(uid);
    return {
      uid,
      friendsUid
    }
  }
}
