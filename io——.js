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
const func = async (server) => {

  io = require('socket.io')(server);

  // 聊天socket
  const chat = io
    .of('/chat')
    .on('connection', async (socket) => {
      socket.on('message', (type) => {
        if(type === 'chat') {
          console.log(sockets);
        } else if(type === 'notice') {
          console.log(noticeSockets);
        }
      });
      connection(socket, async (socket, user) => {
        // login
        const oldChatSocket = sockets[user.uid];
        const noticeSocket = noticeSockets[user.uid];
        // 断开通知socket连接
        console.log(socket.id, noticeSocket.id);
        if(noticeSocket) {
          console.log(`chatSocket: 正在断开noticeSocket`);
          noticeSocket.disconnect(true);
        }
        // // 断开旧的聊天socket连接
        // if(oldChatSocket) {
        //   console.log(`chatSocket: 正在断开旧的chatSocket`);
        //   oldChatSocket.disconnect(true);
        // }

        console.log(`chatSocket: 后续...`);

        socket.NKC = {
          uid: user.uid,
          targetUid: ''
        };

        sockets[user.uid] = socket;

        // 用户上线
        await user.update({online: true});
        // 通知好友该用户上线
        await notifyFriends(user.uid, 'login');

        console.log(`${' CHAT '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${user.uid.bgCyan} ${'连接成功'.bgGreen}` );

      }, async (socket) => {
        // logout
        const {uid} = socket.NKC;
        if(!uid) return;
        const noticeSocket = noticeSockets[uid];
        // 若聊天socket未连接，则通知好友该用户下线
        if(!noticeSocket) {
          await db.UserModel.update({uid}, {$set: {online: false}});
          await notifyFriends(uid, 'logout');
        }
        if(sockets[uid].id === socket.id) {
          delete sockets[uid];
        }
        console.log(`${' CHAT '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${uid.bgCyan} ${'断开连接'.bgRed}` );
      })
    });





  // 通知socket
  const notice = io
    .of('/notice')
    .on('connection', async (socket) => {
      connection(socket, async (socket, user) => {
        // login
        const oldNoticeSocket = noticeSockets[user.uid];
        const chatSocket = sockets[user.uid];

        if(oldNoticeSocket) {
          oldNoticeSocket.disconnect(true);
          console.log(`noticeSocket: 存在旧的noticeSocket，正在断开`);
        }

        if(chatSocket) {
          console.log(`noticeSocket:  存在chatSocket，正在断开当前连接`);
          return socket.disconnect(true);
        }
        console.log(`noticeSocket: 后续...`);
        socket.NKC = {
          uid: user.uid,
          targetUid: ''
        };

        noticeSockets[user.uid] = socket;

        if(!chatSocket) {
          await user.update({online: true});
          await notifyFriends(user.uid, 'login');
        }
        console.log(`${' NOTICE '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${user.uid.bgCyan} ${'连接成功'.bgGreen}` );
      }, async (socket) => {
        // logout
        const {uid} = socket.NKC;
        if(!uid) return;
        // 若该用户没有打开聊天窗口，则通知好友该用户下线
        const chatSocket = sockets[uid];
        const noticeSocket = noticeSockets[uid];
        if(!chatSocket) {
          await db.UserModel.update({uid}, {$set: {online: false}});
          await notifyFriends(uid, 'logout');
        }
        if(noticeSocket === socket.id) {
          delete noticeSockets[uid];
        }
        console.log(`${' NOTICE '.bgGreen} ${(' ' + moment().format('HH:mm:ss') + ' ').grey} ${uid.bgCyan} ${'断开连接'.bgRed}` );
      })
    });
  global.NKC.noticeSockets = noticeSockets;
  global.NKC.sockets = sockets;
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
        socket.disconnect(true);
      }
    } else {
      socket.disconnect(true);
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
    const targetSocket = global.NKC.sockets[targetUid];
    if(targetSocket) {
      targetSocket.emit(type, {
        targetUid: uid
      });
    }
  }));
}

module.exports = func;