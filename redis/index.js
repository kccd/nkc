require('colors');
const db = require('../dataModels');
const cacheForums = require('./cacheForums');
const socket = require("../nkcModules/socket");

const pub = {};
pub.publish = async (channel, message) => {
  socket.sendUserMessage(channel, message);
};

const obj = {};

obj.pubConnect = async (uid) => {
  pub.publish(`connect`, JSON.stringify({
    uid
  }));
};

obj.pubDisconnect = async (uid) => {
  pub.publish(`disconnect`, JSON.stringify({
    uid
  }));
};

obj.pubMessage = async (message) => {
  if(message.ty === 'STU') {
    await db.UsersGeneralModel.updateOne({uid: message.r, 'messageSettings.chat.reminder': false}, {$set: {'messageSettings.chat.reminder': true}});
    const messageArr = await db.MessageModel.extendSTUMessages([message]);
    message = messageArr[0] || '';
    const messageType = await db.MessageTypeModel.findOnly({_id: "STU"});
    message.c.messageType = {
      name: messageType.name,
      content: '新消息'
    }
  }
  pub.publish('message', JSON.stringify(message));
};

obj.pubWithdrawn = async (message) => {
  pub.publish('withdrawn', JSON.stringify(message));
};

obj.cacheForums = cacheForums;
module.exports = obj;
