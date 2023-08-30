const SubscribeModel = require('../../dataModels/SubscribeModel');
const SettingModel = require('../../dataModels/SettingModel');
const { subscribeSources } = require('../../settings/subscribe');
class SubscribeService {
  async getNewSubscribeId() {
    return await SettingModel.operateSystemID('subscribes', 1);
  }
  async createSubscribe(props) {
    const { source, sid, uid, cancel = false, cid = [] } = props;
    const subscribeId = await this.getNewSubscribeId();
    const subscribe = new SubscribeModel({
      _id: subscribeId,
      uid,
      source,
      sid,
      cancel,
      cid,
    });
    await subscribe.save();
    return subscribe;
  }

  async isSubscribed(props) {
    const { uid, source, sid } = props;
    const subscribe = await SubscribeModel.findOne(
      { uid, source, sid, cancel: false },
      { _id: 1 },
    );
    return !!subscribe;
  }

  async cancelSubscribe(props) {
    const { uid, source, sid } = props;
    await SubscribeModel.updateOne(
      {
        uid,
        source,
        sid,
        cancel: false,
      },
      {
        $set: {
          cancel: true,
          tlm: Date.now(),
        },
      },
    );
  }

  async getSubscribeBySource(props) {
    const { uid, source, sid } = props;
    return await SubscribeModel.findOne({ uid, source, sid });
  }

  getSubscribeSources() {
    return { ...subscribeSources };
  }
}
module.exports = {
  subscribeService: new SubscribeService(),
};
