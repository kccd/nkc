require('colors');
const moment = require('moment');
const db = require('./dataModels');
const tools = require('./tools');
const nkcModules = require('./nkcModules');
const settings = require('./settings');
const Cookies = require('cookies-string-parse');
const sockets = {};
const noticeSockets = {};
let io;
const api = {};
let n = 0;
api.print = (text) => {
  console.log(`${moment().format('HH:mm:ss')} ${' socket '.bgGreen} ${text}`)
};

const onlienUsersCount = () => {
  let n = 0;
  for(let i in sockets) {
    if(sockets.hasOwnProperty(i) && sockets[i].length !== 0) {
      n++;
    }
  }
  return n;
};
const func = async (server) => {

  io = require('socket.io')(server);

  // 聊天socket
  io
    .on('connection', async (socket) => {
      socket.on('aaa', () => {
        for(let i in sockets) {
          if(sockets.hasOwnProperty(i)) {
            const targetSockets = sockets[i];
            const arr = targetSockets.map(s => s.id);
            console.log(`${i}: ${arr}`);
          }
        }
      });
      connection(socket, async (socket, user) => {
        // login
        let userSockets;
        if(!sockets[user.uid] || sockets[user.uid].length === 0) {
          sockets[user.uid] = [];
        }
        userSockets = sockets[user.uid];
        socket.NKC = {
          uid: user.uid,
          targetUid: ''
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
          console.log(`${' CHAT '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${user.uid.bgCyan} ${'连接成功'.bgGreen} 在线人数：${onlienUsersCount()}` );
        }

      }, async (socket) => {
        // logout
        if(socket.NKC.removed) return;
        const {uid} = socket.NKC;
        if(!uid) return;
        const index = sockets[uid].indexOf(socket);
        sockets[uid].splice(index, 1);
        if(sockets[uid].length === 0) {
          console.log(`${' CHAT '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${uid.bgCyan} ${'断开连接'.bgRed} 在线人数：${onlienUsersCount()}` );
          await db.UserModel.update({uid}, {$set: {online: false}});
          await notifyFriends(uid, 'logout');
        }
      })
    });
  global.NKC.sockets = sockets;
  global.NKC.io = io;
};

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
    socket.on('disconnect', async (reason) => {
      await logout(socket);
    });
    socket.on('error', async (reason) => {
      await logout(socket);
    });
  } catch(err) {
    console.log(err);
  }
}

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

module.exports = func;