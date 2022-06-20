const UserModel = require('../../../dataModels/UserModel');
module.exports = {
  params: {
    uid: 'string',
    online: 'string'
  },
  async handler(ctx) {
    const {uid, online} = ctx.params;
    const user = await UserModel.findOnly({uid});
    return await user.setOnlineStatus(online);
  }
}
