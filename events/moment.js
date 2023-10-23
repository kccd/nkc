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
    if (
      moment[0].status === momentStatus.normal &&
      moment[0].parents.length === 0
    ) {
      const momentsData = await MomentModel.extendMomentsListData(moment, uid);
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
