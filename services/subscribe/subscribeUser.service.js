const { subscribeService } = require('./subscribe.service');
const { subscribeSources } = require('../../settings/subscribe');
const { ResponseTypes } = require('../../settings/response');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');

class SubscribeUserService {
  async isSubscribedUser(uid, tUid) {
    return await subscribeService.isSubscribed({
      uid,
      source: subscribeSources.user,
      sid: tUid,
    });
  }

  async checkSubscribeUser(uid, tUid) {
    const isSubscribed = await this.isSubscribedUser(uid, tUid);
    if (isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_SUBSCRIBED_USER,
      );
    }
  }

  async checkUnsubscribeUser(uid, tUid) {
    const isSubscribed = await this.isSubscribedUser(uid, tUid);
    if (!isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_SUBSCRIBED_USER,
      );
    }
  }

  async subscribeUser(uid, tUid, cid = []) {
    return await subscribeService.createSubscribe({
      source: subscribeSources.user,
      sid: tUid,
      uid,
      cid,
    });
  }

  async unsubscribeUser(uid, tUid) {
    await subscribeService.cancelSubscribe({
      uid,
      source: subscribeSources.user,
      sid: tUid,
    });
  }

  async getSubscribeUserCategoriesId(uid, tUid) {
    let cid = [];
    const subscribe = await subscribeService.getUserSubscribeBySource({
      uid,
      source: subscribeSources.user,
      sid: tUid,
    });
    if (subscribe) {
      cid = subscribe.cid;
    }
    return cid;
  }
}

module.exports = {
  subscribeUserService: new SubscribeUserService(),
};
