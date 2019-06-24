require('colors');

/*const Redis = require('redis');

const pub = Redis.createClient();

pub.on('error', (err) => {

  console.log(`连接redis出错: `);
  console.log(err);

});*/
const db = require('../dataModels');
const cacheForums = require('./cacheForums');
const pub = {};
pub.publish = async (channel, message) => {
  global.NKC.io.of('/message').NKC.sendMessage(channel, message);
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
    await db.UsersGeneralModel.update({uid: message.r, 'messageSettings.chat.reminder': false}, {$set: {'messageSettings.chat.reminder': true}});
    console.log(`1:`);
    console.log(message);
    const messageArr = await db.MessageModel.extendSTUMessages([message]);
    console.log(messageArr);
    message = messageArr[0] || '';
    console.log(`2:`);
    console.log(message);
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
