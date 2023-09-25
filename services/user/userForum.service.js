const UsersGeneralModel = require('../../dataModels/UsersGeneralModel');

class UserForumService {
  async getVisitedForumsFromCache(uid, count) {
    const { forumListService } = require('../forum/forumList.service');
    return await forumListService.getUserVisitedForums(uid, count);
  }

  async saveVisitedForumIdToCache(uid, fid) {
    const visitedForumsId = await UsersGeneralModel.getUserVisitedForumsId(uid);
    const index = visitedForumsId.indexOf(fid);
    if (index !== -1) {
      visitedForumsId.splice(index, 1);
    }
    visitedForumsId.unshift(fid);
    await UsersGeneralModel.updateOne(
      { uid },
      {
        $set: {
          visitedForumsId: visitedForumsId,
        },
      },
    );
  }

  async getSubscribeForumsFromCache(uid) {
    const {
      subscribeForumService,
    } = require('../subscribe/subscribeForum.service');
    return await subscribeForumService.getSubscribeForumsFromCache(uid);
  }
}
module.exports = {
  userForumService: new UserForumService(),
};
