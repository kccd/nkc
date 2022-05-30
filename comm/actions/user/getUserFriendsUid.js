const MessageModel = require('../../../dataModels/MessageModel');
module.exports = {
  params: {
    uid: 'string'
  },
  async handler(ctx) {
    const {uid} = ctx.params;
    return await MessageModel.getUsersFriendsUid(uid);
  }
}
