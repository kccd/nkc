const { subscribeService } = require('./subscribe.service');
const { subscribeSources } = require('../../settings/subscribe');
const { ResponseTypes } = require('../../settings/response');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');

class SubscribeColumnService {
  async isSubscribedColumn(uid, columnId) {
    return await subscribeService.isSubscribed({
      uid,
      source: subscribeSources.column,
      sid: columnId,
    });
  }

  async checkSubscribeColumn(uid, columnId) {
    const isSubscribed = await this.isSubscribedColumn(uid, columnId);
    if (isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_SUBSCRIBED_COLUMN,
      );
    }
  }

  async checkUnsubscribeColumn(uid, columnId) {
    const isSubscribed = await this.isSubscribedColumn(uid, columnId);
    if (!isSubscribed) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_SUBSCRIBED_COLUMN,
      );
    }
  }

  async subscribeColumn(uid, columnId, cid = []) {
    return await subscribeService.createSubscribe({
      source: subscribeSources.column,
      sid: columnId,
      uid,
      cid,
    });
  }

  async unsubscribeColumn(uid, columnId) {
    await subscribeService.cancelSubscribe({
      uid,
      source: subscribeSources.column,
      sid: columnId,
    });
  }

  async getSubscribeColumnCategoriesId(uid, columnId) {
    let cid = [];
    const subscribe = await subscribeService.getUserSubscribeBySource({
      uid,
      source: subscribeSources.column,
      sid: columnId,
    });
    if (subscribe) {
      cid = subscribe.cid;
    }
    return cid;
  }

  async getSubscribeColumnCount(columnId) {
    return await subscribeService.getSubscribeCountBySource({
      source: subscribeSources.column,
      sid: columnId,
    });
  }
}

module.exports = {
  subscribeColumnService: new SubscribeColumnService(),
};
