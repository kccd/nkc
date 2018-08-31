const socket = {};
socket.emitReminder = async (message) => {
  const {MessageModel} = require('../dataModels');
  const remind = await MessageModel.extendReminder([message]);
  MessageModel.execute(message.r, (socket) => {
    socket.emit('remind', remind[0]);
  });
};
module.exports = socket;