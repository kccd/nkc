require('colors');
const moment = require('moment');
const db = require('./dataModels');
const tools = require('./tools');
const nkcModules = require('./nkcModules');
const settings = require('./settings');
const Cookies = require('cookies-string-parse');
const sockets = {};
const api = {};
api.print = (text) => {
  console.log(`${moment().format('HH:mm:ss')} ${' socket '.bgGreen} ${text}`)
};
const func = (server) => {
  const io = require('socket.io')(server);
  io.on('connection', async (socket) => {
    const cookies = new Cookies(socket.request.headers.cookie, {
      keys: [settings.cookie.secret]
    });
    const userInfo = cookies.get('userInfo', {signed: true});
    if(userInfo) {
      const {username, uid} = JSON.parse(decodeURI(userInfo));
      const user = await db.UserModel.findOne({username, uid});
      if(user) {
        const oldSocket = sockets[user.uid];
        if(oldSocket) {
          oldSocket.disconnect(true);
        }
        socket.NKC = {
          uid: user.uid,
          targetUid: ''
        };
        sockets[user.uid] = socket;
        await user.update({online: true});
        io.sockets.emit('login', {
          targetUid: user.uid
        });
        console.log(`用户：${user.username}连接成功`);
      } else {
        socket.disconnect(true);
      }
    } else {
      socket.disconnect(true);
    }
    // 断线处理
    socket.on('disconnect', async (reason) => {
      const {uid} = socket.NKC;
      io.sockets.emit('logout', {targetUid: uid});
      delete sockets[uid];
      await db.UserModel.update({uid}, {online: false});
      console.log(`用户：${uid} 已下线。`);
    });
    socket.on('error', async (reason) => {
      const {uid} = socket.NKC;
      io.sockets.emit('logout', {targetUid: uid});
      delete sockets[uid];
      await db.UserModel.update({uid}, {online: false});
      console.log(`用户：${uid} 已下线。`);
    });

    socket.on('message', (data) => {
      console.log(`------message---------`);
      console.log(data);
      console.log(`----------------------`);
    });
  });

  return {
    io,
    sockets
  };
};
module.exports = func;