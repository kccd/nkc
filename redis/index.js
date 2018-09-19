require('colors');

const Redis = require('redis');
const db = require('../dataModels');
const pub = Redis.createClient();


pub.on('error', (err) => {

  console.log(`连接redis出错: `);
  console.log(err);

});


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
    const messageArr = await db.MessageModel.extendReminder([message]);
    message = messageArr[0] || '';
  }
  pub.publish('message', JSON.stringify(message));

};

obj.pubWithdrawn = async (message) => {

  pub.publish('withdrawn', JSON.stringify(message));
};

module.exports = obj;

// require('colors');
//
// const index = require('redis');
// const db = require('../dataModels');
//
// const client = index.createClient();
// const pub = index.createClient();
//
//
// client.on('error', (err) => {
//
//   console.log(`连接redis出错: `);
//   console.log(err);
//
// });
//
//
// client.on('message', async (channel, data) => {
//   try{
//     data = JSON.parse(data);
//
//     if(channel === 'message') {
//
//        const {message, user, sockets} = data;
//
//       // 系统通知，发给所有人
//       if(message.ty === 'STE') {
//         global.NKC.io.sockets.emit('message', {
//           message
//         });
//
//       } else {
//
//         // 若接收者在该进程存在连接，则发送信息
//
//         const targetUserSocketsId = sockets[global.NKC.processId] || [];
//
//         let data;
//
//         if(message.ty === 'STU') {
//
//           // 系统提醒
//           data = {
//             message
//           };
//
//         } else {
//
//           // 来自用户的信息
//
//           data = {
//             message,
//             user
//           };
//         }
//
//         await Promise.all(targetUserSocketsId.map( async id => {
//
//           const targetSocket = global.NKC.socketIo.connected[id];
//
//           if(targetSocket) {
//
//             targetSocket.emit('message', data);
//
//           } else {
//
//             await db.SocketModel.remove({socketId: id, processId: global.NKC.processId});
//
//           }
//
//         }));
//
//       }
//
//     } else if(channel === 'connect') {
//       await notifyFriends(data, 'userConnect')
//     } else if(channel === 'disconnect') {
//       await notifyFriends(data, 'userDisconnect')
//     } else if(channel === 'withdrawn') {
//
//       const {message, sockets} = data;
//
//       const targetUserSocketsId = sockets[global.NKC.processId] || [];
//
//       await Promise.all(targetUserSocketsId.map(async id => {
//
//         const targetSocket = global.NKC.socketIo.connected[id];
//
//         if(targetSocket) {
//
//           targetSocket.emit('withdrawn', {
//             uid: message.s,
//             messageId: message._id
//           });
//
//         } else {
//
//           await db.SocketModel.remove({socketId: id, processId: global.NKC.processId});
//
//         }
//
//       }));
//
//     }
//   } catch(err) {
//     console.log(err);
//   }
//
// });
//
// client.subscribe(`message`);
//
// client.subscribe(`connect`);
//
// client.subscribe(`disconnect`);
//
// client.subscribe(`withdrawn`);
//
// const obj = {};
//
// // 通知该用户的好友
//
// async function notifyFriends (message, type) {
//
//   const {sockets, uid} = message;
//
//   // 获取用户在当前进程的socketId
//   const socketsId = sockets[global.NKC.processId] || [];
//
//   socketsId.map(async id => {
//
//     const targetSocket = global.NKC.socketIo.connected[id];
//
//     if(targetSocket) {
//
//       targetSocket.emit(type, {
//         targetUid: uid
//       });
//
//     } else {
//
//       // socket不存在则删掉数据库中的数据
//       await db.SocketModel.remove({processId: global.NKC.processId, socketId: id});
//
//     }
//
//   });
// }
//
// const getFriendsSockets = async (uid) => {
//
//   const usersFriendsUid = await db.MessageModel.getUsersFriendsUid(uid);
//   const sockets = {};
//   await Promise.all(usersFriendsUid.map(async targetUid => {
//
//     const targetSockets = await db.SocketModel.find({uid: targetUid});
//
//     targetSockets.map(async socket => {
//       const {processId, socketId} = socket;
//       if(!sockets[processId]) sockets[processId] = [];
//       sockets[processId].push(socketId);
//     });
//
//   }));
//   return sockets;
// };
//
// obj.pubConnect = async (uid) => {
//   const sockets = await getFriendsSockets(uid);
//   pub.publish(`connect`, JSON.stringify({
//     sockets,
//     uid
//   }));
// };
//
// obj.pubDisconnect = async (uid) => {
//   const sockets = await getFriendsSockets(uid);
//   pub.publish(`disconnect`, JSON.stringify({
//     sockets,
//     uid
//   }));
// };
//
// obj.pubMessage = async (message) => {
//
//   let data = {
//     message
//   };
//
//   if(message.ty === 'STU') {
//     const {MessageModel} = require('../dataModels');
//     const messageArr = await MessageModel.extendReminder([data.message]);
//     data.message = messageArr[0] || '';
//   }
//
//   if(message.ty !== 'STE') {
//     const targetUserSockets = await db.SocketModel.find({uid: message.r});
//     const sockets = {};
//     targetUserSockets.map(socket => {
//       const {socketId, processId} = socket;
//       if(!sockets[processId]) sockets[processId] = [];
//       sockets[processId].push(socketId);
//     });
//     data.sockets = sockets;
//   }
//
//   if(message.ty === 'UTU') {
//     data.user = await db.UserModel.findOne({uid: message.s});
//     if(!data.user) return;
//   }
//
//   pub.publish('message', JSON.stringify(data));
//
// };
//
// obj.pubWithdrawn = async (message) => {
//   const targetUserSockets = await db.SocketModel.find({uid: message.r});
//   const sockets = {};
//   targetUserSockets.map(s => {
//     const {socketId, processId} = s;
//     if(!sockets[processId]) sockets[processId] = [];
//     sockets[processId].push(socketId);
//   });
//   const data = {
//     message,
//     sockets
//   };
//   pub.publish('withdrawn', JSON.stringify(data));
// };
//
// module.exports = obj;
