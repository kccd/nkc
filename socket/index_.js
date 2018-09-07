require('colors');
const moment = require('moment');
const db = require('../dataModels');
const settings = require('../settings');
const redis = require('redis');
const Cookies = require('cookies-string-parse');
const sockets = {};
let io;

const func = async (server) => {

  io = require('socket.io')(server);

  io
    .on('connection', async (socket) => {
      connection(socket, async (socket, user) => {
        // login
        let userSockets;
        if(!sockets[user.uid] || sockets[user.uid].length === 0) {
          sockets[user.uid] = [];
        }
        userSockets = sockets[user.uid];
        socket.NKC = {
          uid: user.uid,
        };

        if(userSockets.length >= 5) {
          const firstSocket = userSockets[0];
          firstSocket.NKC.removed = true;
          firstSocket.disconnect(true);
          userSockets = userSockets.shift();
        }
        userSockets.push(socket);

        if(sockets[user.uid].length === 1) {
          // 用户上线
          await user.update({online: true});
          // 通知好友该用户上线
          await notifyFriends(user.uid, 'login');
          console.log(`${' CHAT '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${user.uid.bgCyan} ${'连接成功'.bgGreen} 在线人数：${onlineUsersCount()}` );
        }

      }, async (socket) => {
        // logout
        if(socket.NKC.removed) return;
        const {uid} = socket.NKC;
        if(!uid) return;
        const index = sockets[uid].indexOf(socket);
        sockets[uid].splice(index, 1);
        if(sockets[uid].length === 0) {
          console.log(`${' CHAT '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${uid.bgCyan} ${'断开连接'.bgRed} 在线人数：${onlineUsersCount()}` );
          await db.UserModel.update({uid}, {$set: {online: false}});
          await notifyFriends(uid, 'logout');
        }
      })
    });
};

// socket连接后
// 通过cookie确认用户身份
async function connection(socket, login, logout) {
  try{
    const cookies = new Cookies(socket.request.headers.cookie, {
      keys: [settings.cookie.secret]
    });
    const userInfo = cookies.get('userInfo', {signed: true});
    if(userInfo) {
      const {username, uid} = JSON.parse(decodeURI(userInfo));
      const user = await db.UserModel.findOne({username, uid});
      if(user) {
        await login(socket, user);
      } else {
        return socket.disconnect(true);
      }
    } else {
      return socket.disconnect(true);
    }
    // 断线处理
    socket.on('disconnect', async () => {
      await logout(socket);
    });
    socket.on('error', async () => {
      await logout(socket);
    });
  } catch(err) {
    console.log(err);
  }
}

// 用户连接或断开
// 通知该用户的好友
async function notifyFriends(uid, type) {
  const usersFriendsUid = await db.MessageModel.getUsersFriendsUid(uid);
  await Promise.all(usersFriendsUid.map(targetUid => {
    const targetSockets = global.NKC.sockets[targetUid];
    if(targetSockets && targetSockets.length !== 0) {
      targetSockets.map(socket => {
        socket.emit(type, {
          targetUid: uid
        });
      });
    }
  }));
}


// 统计在线用户（待优化）
function onlineUsersCount() {
  let n = 0;
  for(let i in sockets) {
    if(sockets.hasOwnProperty(i) && sockets[i].length !== 0) {
      n++;
    }
  }
  return n;
}

const client = redis.createClient();

client.on('subscribe', (channel) => {
  console.log(`进程订阅频道 ${channel.green} 成功.`);
});

client.on('error', (err) => {
  console.log(`连接redis出错：`);
  console.log(err.red);
});

client.on('message', (channel, data) => {
  if(channel !== 'socket') return;
  data = JSON.parse(data);

});

client.subscribe('socket');



module.exports = func;