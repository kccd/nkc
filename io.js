require('colors');
const moment = require('moment');
const db = require('./dataModels');
const tools = require('./tools');
const nkcModules = require('./nkcModules');
const settings = require('./settings');
const Cookies = require('cookies-string-parse');
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
        socket.kc = {
          uid: user.uid
        };
        const socketDB = await db.SocketModel.findOne({uid});
        if(!socketDB) {
          const s = db.SocketModel({
            uid,
            socketId: socket.id
          });
          await s.save();
        } else {
          await socketDB.update({socketId: socket.id});
        }
        await user.update({online: true});
        io.sockets.emit('login', {
          targetUid: user.uid
        });
        console.log(`用户：${user.username}连接成功`);
      } else {
        socket.disconnect();
      }
    } else {
      socket.disconnect();
    }
    // 断线处理
    socket.on('disconnect', async (reason) => {
      api.print(reason);
      const socketDB = await db.SocketModel.findOne({socketId: socket.id, online: true});
      if(socketDB) {
        await socketDB.update({targetUid: ''});
        await db.UserModel.update({uid: socketDB.uid}, {online: false});
        io.sockets.emit('logout', {
          targetUid: socketDB.uid
        })
      }
    });
    socket.on('error', async (reason) => {
      api.print(reason);
      const socketDB = await db.SocketModel.findOne({socketId: socket.id, online: true});
      if(socketDB) {
        await socketDB.update({targetUid: ''});
        await db.UserModel.update({uid: socketDB.uid}, {online: false});
        io.sockets.emit('logout', {
          targetUid: socketDB.uid
        })
      }
    });

    socket.on('message', (data) => {
      console.log(`------message---------`);
      console.log(data);
      console.log(`----------------------`);
    });
  });

  return io;
};
module.exports = func;