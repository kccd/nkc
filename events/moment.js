const MomentModel = require('../dataModels/MomentModel');
const socket = require('../nkcModules/socket');
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
    const momentsData = await MomentModel.extendMomentsListData(moment, uid);
    if (momentsData[0].status === momentStatus.normal) {
      await socket.sendMomentMessage({
        momentsData,
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
