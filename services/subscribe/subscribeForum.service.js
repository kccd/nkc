const { subscribeService } = require('./subscribe.service');
const { subscribeSources } = require('../../settings/subscribe');
const { ResponseTypes } = require('../../settings/response');
const SubscribeModel = require('../../dataModels/SubscribeModel');
const ForumModel = require('../../dataModels/ForumModel');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const tools = require('../../nkcModules/tools');

class SubscribeForumService {
  async isSubscribedForum(uid, fid) {
    return await subscribeService.isSubscribed({
      uid,
      source: subscribeSources.forum,
      sid: fid,
    });
  }

  async checkSubscribeForum(uid, fid) {
    const isSubscribed = await this.isSubscribedForum(uid, fid);
    if (isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_SUBSCRIBED_FORUM,
      );
    }
  }

  async checkUnsubscribeForum(uid, fid) {
    const isSubscribed = await this.isSubscribedForum(uid, fid);
    if (!isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_SUBSCRIBED_FORUM,
      );
    }
  }

  async subscribeForum(uid, fid, cid = []) {
    return await subscribeService.createSubscribe({
      source: subscribeSources.forum,
      sid: fid,
      uid,
      cid,
    });
  }

  async unsubscribeForum(uid, fid) {
    await subscribeService.cancelSubscribe({
      uid,
      source: subscribeSources.forum,
      sid: fid,
    });
  }

  async getSubscribeForumCategoriesId(uid, fid) {
    let cid = [];
    const subscribe = await subscribeService.getUserSubscribeBySource({
      uid,
      source: subscribeSources.forum,
      sid: fid,
    });
    if (subscribe) {
      cid = subscribe.cid;
    }
    return cid;
  }

  async getSubscribeForumsIdFromCache(uid) {
    return await SubscribeModel.getUserSubForumsId(uid);
  }

  async getSubscribeForumsFromCache(uid) {
    const { forumListService } = require('../forum/forumList.service');
    const subscribeForumsId = await this.getSubscribeForumsIdFromCache(uid);
    const readableForumsId = await ForumModel.getReadableForumsIdByUid(uid);
    const forums = await ForumModel.getForumsByIdFromRedis(
      subscribeForumsId.filter((fid) => readableForumsId.includes(fid)),
    );
    return await forumListService.extendForumsBaseInfo(forums);
  }
}

module.exports = {
  subscribeForumService: new SubscribeForumService(),
};
