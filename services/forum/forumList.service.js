const UsersGeneralModel = require('../../dataModels/UsersGeneralModel');
const SettingModel = require('../../dataModels/SettingModel');
const ForumModel = require('../../dataModels/ForumModel');
const tools = require('../../nkcModules/tools');
class ForumListService {
  async getForumsObjectByForumsIdFromCache(forumsId) {
    const forums = {};
    for (const fid of forumsId) {
      forums[fid] = await ForumModel.getForumByIdFromRedis(fid);
    }
    return forums;
  }

  async getForumsByForumsIdFromCache(forumsId) {
    const forums = [];
    for (const fid of forumsId) {
      const forum = await ForumModel.getForumByIdFromRedis(fid);
      if (!forum) {
        continue;
      }
      forums.push(forum);
    }
    return forums;
  }

  async extendForumsBaseInfo(forums) {
    const targetForums = [];
    for (const forum of forums) {
      targetForums.push({
        fid: forum.fid,
        name: forum.displayName,
        desc: forum.description,
        url: tools.getUrl('forumHome', forum.fid),
        color: forum.color,
        logo: forum.logo,
        logoUrl: forum.logo ? tools.getUrl('forumLogo', forum.logo) : '',
      });
    }
    return targetForums;
  }

  async getUserVisitedForums(uid, count = 5) {
    let visitedForumsId = await UsersGeneralModel.getUserVisitedForumsId(uid);
    visitedForumsId = visitedForumsId.slice(0, count);
    const forums = await this.getForumsByForumsIdFromCache(visitedForumsId);
    return await this.extendForumsBaseInfo(forums);
  }

  async getDefaultSubscribeForums() {
    const { defaultSubscribeForumsId } = await SettingModel.getSettings(
      'register',
    );
    const forums = await this.getForumsByForumsIdFromCache(
      defaultSubscribeForumsId,
    );
    return await this.extendForumsBaseInfo(forums);
  }
}

module.exports = {
  forumListService: new ForumListService(),
};
