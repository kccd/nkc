require('colors');

const index = require('redis');
const db = require('../dataModels');

const client = index.createClient();

client.on('error', (err) => {

  console.log(`连接redis出错: `);
  console.log(err);

});


// 通知该用户的好友

async function notifyFriends (message, type) {

  const {sockets, uid} = message;

  // 获取用户在当前进程的socketId
  const socketsId = sockets[global.NKC.processId] || [];

  socketsId.map(async id => {

    const targetSocket = global.NKC.socketIo.connected[id];

    if(targetSocket) {

      targetSocket.emit(type, {
        targetUid: uid
      });

    } else {

      // socket不存在则删掉数据库中的数据
      await db.SocketModel.remove({processId: global.NKC.processId, socketId: id});

    }

  });
}

client.on('message', async (channel, data) => {
  try{
    data = JSON.parse(data);

    if(channel === 'message') {

      const {message, user, sockets} = data;

      // 系统通知，发给所有人
      if(message.ty === 'STE') {
        global.NKC.io.sockets.emit('message', {
          message
        });

      } else {

        // 若接收者在该进程存在连接，则发送信息

        const targetUserSocketsId = sockets[global.NKC.processId] || [];

        let data;

        if(message.ty === 'STU') {

          // 系统提醒
          data = {
            message
          };

        } else {

          // 来自用户的信息

          data = {
            message,
            user
          };
        }

        await Promise.all(targetUserSocketsId.map( async id => {

          const targetSocket = global.NKC.socketIo.connected[id];

          if(targetSocket) {

            targetSocket.emit('message', data);

          } else {

            await db.SocketModel.remove({socketId: id, processId: global.NKC.processId});

          }

        }));

      }

    } else if(channel === 'connect') {
      await notifyFriends(data, 'userConnect')
    } else if(channel === 'disconnect') {
      await notifyFriends(data, 'userDisconnect')
    } else if(channel === 'withdrawn') {

      const {message, sockets} = data;

      const targetUserSocketsId = sockets[global.NKC.processId] || [];

      await Promise.all(targetUserSocketsId.map(async id => {

        const targetSocket = global.NKC.socketIo.connected[id];

        if(targetSocket) {

          targetSocket.emit('withdrawn', {
            uid: message.s,
            messageId: message._id
          });

        } else {

          await db.SocketModel.remove({socketId: id, processId: global.NKC.processId});

        }

      }));

    }
  } catch(err) {
    console.log(err);
  }

});

client.subscribe(`message`);

client.subscribe(`connect`);

client.subscribe(`disconnect`);

client.subscribe(`withdrawn`);

module.exports = client;
