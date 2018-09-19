require('colors');

const Redis = require('redis');
const db = require('../dataModels');

const pub = Redis.createClient();


pub.on('error', (err) => {

  console.log(`连接redis出错: `);
  console.log(err);

});


const obj = {};


const getFriendsSockets = async (uid) => {

  const usersFriendsUid = await db.MessageModel.getUsersFriendsUid(uid);
  const sockets = {};
  await Promise.all(usersFriendsUid.map(async targetUid => {

    const targetSockets = await db.SocketModel.find({uid: targetUid});

    targetSockets.map(async socket => {
      const {processId, socketId} = socket;
      if(!sockets[processId]) sockets[processId] = [];
      sockets[processId].push(socketId);
    });

  }));
  return sockets;
};

obj.pubConnect = async (uid) => {
  const sockets = await getFriendsSockets(uid);
  pub.publish(`connect`, JSON.stringify({
    sockets,
    uid
  }));
};

obj.pubDisconnect = async (uid) => {
  const sockets = await getFriendsSockets(uid);
  pub.publish(`disconnect`, JSON.stringify({
    sockets,
    uid
  }));
};

obj.pubMessage = async (message) => {

  let data = {
    message
  };

  if(message.ty === 'STU') {
    const {MessageModel} = require('../dataModels');
    const messageArr = await MessageModel.extendReminder([data.message]);
    data.message = messageArr[0] || '';
  }

  if(message.ty !== 'STE') {
    const targetUserSockets = await db.SocketModel.find({uid: message.r});
    const sockets = {};
    targetUserSockets.map(socket => {
      const {socketId, processId} = socket;
      if(!sockets[processId]) sockets[processId] = [];
      sockets[processId].push(socketId);
    });
    data.sockets = sockets;
  }

  if(message.ty === 'UTU') {
    data.user = await db.UserModel.findOne({uid: message.s});
    if(!data.user) return;
  }

  pub.publish('message', JSON.stringify(data));

};

obj.pubWithdrawn = async (message) => {
  const targetUserSockets = await db.SocketModel.find({uid: message.r});
  const sockets = {};
  targetUserSockets.map(s => {
    const {socketId, processId} = s;
    if(!sockets[processId]) sockets[processId] = [];
    sockets[processId].push(socketId);
  });
  const data = {
    message,
    sockets
  };
  pub.publish('withdrawn', JSON.stringify(data));
};

module.exports = obj;