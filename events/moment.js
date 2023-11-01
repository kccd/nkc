const MomentModel = require('../dataModels/MomentModel');
const UserModel = require('../dataModels/UserModel');
const socket = require('../nkcModules/socket');
const { getUrl } = require('../nkcModules/tools');
const momentPublishType = {
  momentBubble: 'moment-bubble',
};
function initMomentEvents(eventEmitter) {
  eventEmitter.on('moment-bubble', async (data) => {
    const momentStatus = await MomentModel.getMomentStatus();
    const { uid, momentId } = data;
    const moment = await MomentModel.find({
      _id: momentId,
    });
    if (
      moment[0].status === momentStatus.normal &&
      moment[0].parents.length === 0
    ) {
      // 获取头像信息
      const { avatar } = await UserModel.findOnly({ uid }, { avatar: 1 });
      // const momentsData = await MomentModel.extendMomentsListData(moment, uid);
      await socket.sendMomentMessage({
        bubbleData: {
          avatarUrl: getUrl('userAvatar', avatar),
          uid,
          status: moment[0].status,
          momentId,
        },
      });
    }
  });
}
function getMomentPublishType() {
  return { ...momentPublishType };
}
module.exports = {
  initMomentEvents,
  getMomentPublishType,
};
