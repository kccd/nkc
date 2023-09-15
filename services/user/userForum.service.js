const UsersGeneralModel = require('../../dataModels/UsersGeneralModel');
const ForumModel = require('../../dataModels/ForumModel');
const tools = require('../../nkcModules/tools');
class UserForumService {
  async getVisitedForumsFromCache(uid, count) {
    const visitedForumsId = await UsersGeneralModel.getUserVisitedForumsId(uid);
    const forums = await ForumModel.getForumsByIdFromRedis(
      visitedForumsId.slice(0, count),
    );
    return forums.map((forum) => {
      return {
        fid: forum.fid,
        name: forum.displayName,
        desc: forum.description,
        url: tools.getUrl('forumHome', forum.fid),
        color: forum.color,
        logo: forum.logo,
        logoUrl: forum.logo ? tools.getUrl('forumLogo', forum.logo) : '',
      };
    });
  }
}
module.exports = {
  userForumService: new UserForumService(),
};
