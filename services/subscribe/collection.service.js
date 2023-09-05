const { subscribeService } = require('./subscribe.service');
const { subscribeSources } = require('../../settings/subscribe');
const { ResponseTypes } = require('../../settings/response');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');

class CollectionService {
  async isCollectedThread(uid, tid) {
    return await subscribeService.isSubscribed({
      uid,
      source: subscribeSources.collectionThread,
      sid: tid,
    });
  }

  async isCollectedArticle(uid, aid) {
    return await subscribeService.isSubscribed({
      uid,
      source: subscribeSources.collectionArticle,
      sid: aid,
    });
  }

  async checkWhenCollectThread(uid, tid) {
    const isCollected = await this.isCollectedThread(uid, tid);
    if (isCollected) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_COLLECTED_THREAD,
      );
    }
  }

  async checkWhenCollectArticle(uid, aid) {
    const isCollected = await this.isCollectedArticle(uid, aid);
    if (isCollected) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_COLLECTED_THREAD,
      );
    }
  }

  async collectThread(uid, tid, cid = []) {
    return await subscribeService.createSubscribe({
      source: subscribeSources.collectionThread,
      sid: tid,
      uid,
      cid,
    });
  }

  async collectArticle(uid, aid, cid = []) {
    return await subscribeService.createSubscribe({
      source: subscribeSources.collectionArticle,
      sid: aid,
      uid,
      cid,
    });
  }

  async unCollectThread(uid, tid) {
    await subscribeService.cancelSubscribe({
      uid,
      source: subscribeSources.collectionThread,
      sid: tid,
    });
  }

  async unCollectArticle(uid, aid) {
    await subscribeService.cancelSubscribe({
      uid,
      source: subscribeSources.collectionArticle,
      sid: aid,
    });
  }

  async getCollectedThreadCategoriesId(uid, tid) {
    let cid = [];
    const subscribe = await subscribeService.getUserSubscribeBySource({
      uid,
      source: subscribeSources.collectionThread,
      sid: tid,
    });
    if (subscribe) {
      cid = subscribe.cid;
    }
    return cid;
  }

  async getCollectedArticleCategoriesId(uid, aid) {
    let cid = [];
    const subscribe = await subscribeService.getUserSubscribeBySource({
      uid,
      source: subscribeSources.collectionArticle,
      sid: aid,
    });
    if (subscribe) {
      cid = subscribe.cid;
    }
    return cid;
  }
}

module.exports = {
  collectionService: new CollectionService(),
};
