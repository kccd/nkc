const PostModel = require("../../../dataModels/PostModel");
const ThreadModel = require("../../../dataModels/ThreadModel");
const UserModel = require("../../../dataModels/UserModel");
module.exports = {
  params: {
    uid: 'string',
    pid: 'string'
  },
  async handler(ctx) {
    const {uid, pid} = ctx.params;
    const result = {
      hasPermission: false
    };
    const post = await PostModel.findOne({pid});
    if(!post) return result;
    const thread = await ThreadModel.findOne({tid: post.tid});
    if(!thread) return result;
    const user = await UserModel.findOnly({uid});
    const userGrade = await user.extendGrade();
    const userRoles = await user.extendRoles();
    try{
      await thread.ensurePermission(userRoles, userGrade, user);
      result.hasPermission = true;
    } catch(err) {}
    return result;
  }
}
