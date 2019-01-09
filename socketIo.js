require('colors');
const moment = require('moment');
const settings = require('./settings');
const db = require('./dataModels');
const Cookies = require('cookies-string-parse');
const redis = require('redis');

let socketIo, io;

// 初始化 redis的订阅
const initRedis = () => {

  const client = redis.createClient();

  client.on('error', (err) => {
    console.log(err.stack.red);
  });
  client.on('message', async (channel, message) => {

    try{

      message = JSON.parse(message);
      if(channel === 'withdrawn') {
        // 撤回信息
        const {r, s, _id} = message;
        socketIo.to(`user-${r}`).to(`user-${s}`).emit('withdrawn', {
          uid: s,
          messageId: _id
        });
      } else if(channel === 'message') {
        const {ty, s, r} = message;
        if(ty === 'STE') {
          // 系统通知，通知给所有人
          socketIo.emit('message', {
            message
          });
        } else if(ty === 'STU') {
          // 系统提醒，提醒某一个用户
          socketIo.to(`user-${r}`).emit('message', {
            message
          });
        } else if(ty === 'UTU') {
          // 用户间的私信
          const sUser = await db.UserModel.findOne({uid: s});
          const rUser = await db.UserModel.findOne({uid: r});
          if(!sUser || !rUser) return;
          socketIo.to(`user-${r}`).emit('message', {
            user: sUser,
            targetUser: rUser,
            myUid: r,
            message
          });
          socketIo.to(`user-${s}`).emit('message', {
            user: sUser,
            targetUser: rUser,
            myUid: s,
            message
          });
        } else if(ty === 'friendsApplication') {
          // 好友申请
          const {respondentId, applicantId} = message;
          const respondent = await db.UserModel.findOne({uid: respondentId});
          const applicant = await db.UserModel.findOne({uid: applicantId});
          if(!respondent || !applicant) return;

          const data = {
            message: {
              ty: 'friendsApplication',
              _id: message._id,
              username: applicant.username,
              description: message.description,
              uid: applicant.uid,
              toc: message.toc,
              agree: message.agree
            }
          };

          socketIo.to(`user-${respondentId}`).emit('message', data);

          if(message.c === 'agree') {
            socketIo.to(`user-${applicantId}`).emit('message', data);
          }
        } else if(ty === 'deleteFriend') {
          // 删除好友
          const {deleterId, deletedId} = message;
          socketIo.to(`user-${deleterId}`).to(`user-${deletedId}`).emit('message', {message});

        } else if(ty === 'modifyFriend') {
          // 修改好友设置
          const {friend} = message;
          socketIo.to(`user-${friend.uid}`).emit('message', {message});

        } else if(ty === 'removeChat') {
          // 删除与好友的聊天
          const {deleterId} = message;
          socketIo.to(`user-${deleterId}`).emit('message', {message});

        } else if(ty === 'markAsRead') {
          // 多终端同步信息，标记为已读
          const {uid} = message;
          socketIo.to(`user-${uid}`).emit('message', {message});

        } else if(ty === 'editFriendCategory') {
          // 编辑好友分组
          const {uid} = message.category;
          socketIo.to(`user-${uid}`).emit('message', {message});

        }
      }
    } catch(err) {
      console.log(err);
    }

  });

  client.subscribe(`message`);

  client.subscribe(`withdrawn`);

};


// 初始化socket.io
const initSocket = async (server) => {

  await db.UserModel.updateMany({online: true}, {$set: {online: false}});

  io = require('socket.io')(server, {
    "serveClient": false,
    "transports":['polling', 'websocket'],
    "pingInterval": 30000
  });

  socketIo = io
    .on('connection', async (socket) => {
      const cookies = new Cookies(socket.request.headers.cookie, {
        keys: [settings.cookie.secret]
      });
      // 获取cookie中的用户信息
      const userInfo = cookies.get('userInfo', {
        signed: true
      });

      // 用户信息验证失败则断开下行连接
      if(!userInfo) return socket.disconnect(true);

      const {username, uid} = JSON.parse(decodeURI(userInfo));
      const user = await db.UserModel.findOne({username, uid});

      // 用户信息验证失败则断开下行连接
      if(!user) return socket.disconnect(true);

      // 从该用户的房间中统计出连接的客户端
      const clients = await getRoomClientCount(socketIo, `user-${user.uid}`);

      // 每个用户最大连接数不能超过5
      // 若连接数超过5，则断开之前的连接建立新连接，保证连接数不超过5。
      if(clients.length > 4) {
        let num = clients.length - 4;
        for(let i = 0; i < num; i++) {
          socketIo.connected[clients[i]].disconnect(true);
        }
      }

      // 在线方式 手机app, 网页
      let onlineType = socket.handshake.query.os;
      if(!['phone', 'computer'].includes(onlineType)) {
        onlineType = 'computer';
      }

      // 在线状态改变时需要通知的用户
      const friendsUid = await db.MessageModel.getUsersFriendsUid(uid);
      await Promise.all(friendsUid.map(uid => {
        socketIo.in(`user-${uid}`).emit('userConnect', {
          targetUid: user.uid,
          onlineType
        })
      }));

      // 加入以uid命名的房间
      socket.join(`user-${user.uid}`, () => {
        console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'连接成功'.bgGreen} 已连接客户端：${io.eio.clientsCount}`);
      });

      // 在socket上设置uid属性，在发生错误或被断开的情况下可知道此客户端所对应的用户
      socket.NKC = {
        uid: user.uid,
        onlineType: onlineType
      };

      // 更新用户在线状态
      if(clients.length === 0 || user.onlineType !== onlineType) {
        await db.UserModel.update({uid}, {
          $set: {
            online: true,
            onlineType
          }
        });
      }

      socket.on('error', (err) => {
        console.log(err);
        disconnect(socket);
      });
      socket.on('disconnect', () => {
        disconnect(socket);
      });

    });

};



async function disconnect (socket) {

  // 获取该用户的所有连接
  const {uid} = socket.NKC;
  if(!uid) return;

  // 获取该用户的连接数
  const clients = await getRoomClientCount(socketIo, `user-${uid}`);

  console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'断开连接'.bgRed} 已连接客户端：${io.eio.clientsCount}`);
  // 若用户还存在其他链接，则无需通知好友该用户下线
  if(clients.length !== 0) return;

  await db.UserModel.update({uid}, {
    $set: {
      online: false
    }
  });

  const friendsUid = await db.MessageModel.getUsersFriendsUid(uid);

  await Promise.all(friendsUid.map(friendUid => {
    socketIo.in(`user-${friendUid}`).emit('userDisconnect', {
      targetUid: uid
    })
  }));

}


// 获取命名空间下的某房间的所有客户端id
async function getRoomClientCount(nameSpaceObj, roomName) {
  return new Promise((resolve, reject) => {
    nameSpaceObj.in(roomName).clients((err, clients) => {
      if(err) return reject(err);
      resolve(clients);
    })
  });
}

module.exports = async (server) => {
  await initSocket(server);
  initRedis();
  console.log(`socket server has started`.green);
};