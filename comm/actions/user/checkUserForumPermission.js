const ForumModel = require("../../../dataModels/ForumModel");
module.exports = {
  params: {
    uid: 'string',
    fid: 'string',
  },
  async handler(ctx) {
    const {uid, fid} = ctx.params;
    const forumsId = await ForumModel.getReadableForumsIdByUid(uid);
    const hasPermission = forumsId.includes(fid);
    return {
      hasPermission
    }
  }
}
