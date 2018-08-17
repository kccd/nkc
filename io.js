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


const func = async (server) => {
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


    // 用户 > 用户
    socket.on('UTU', async (data, fn) => {
      const {targetUid, content, toc} = data;
      const {uid} = socket.kc;
      if(content === '') return fn({
        status: false,
        data: '内容不能未空'
      });
      const user = await db.UserModel.findOnly({uid});
      const _id = await db.SettingModel.operateSystemID('messages', 1);
      const newMessage = db.MessageModel({
        _id,
        ty: 'UTU',
        tc: toc,
        c: content,
        s: uid,
        r: targetUid
      });
      await newMessage.save();
      const targetSocket = await db.SocketModel.findOne({uid: targetUid, online: true});
      if(targetSocket) {
        io.to(targetSocket.socketId).emit('UTU', {
          fromUser: user,
          message: newMessage
        });
        if(targetSocket.targetUid === uid) {
          await newMessage.update({vd: true});
        }
      }
      fn({
        status: true,
        data: newMessage
      });
    });

    socket.on('getMessage', async (data, fn) => {
      const {ty, id, lastMessageId} = data;
      const uid = socket.kc.uid;
      await db.SocketModel.update({uid}, {targetUid: id});
      socket.kc.targetUid = id;
      const targetUid = id;
      const targetUser = await db.UserModel.findOnly({uid: targetUid});
      if(ty === 'UTU') {
        const q = {
          $or: [
            {
              r: uid,
              s: targetUid
            },
            {
              r: targetUid,
              s: uid
            }
          ]
        };
        if(lastMessageId) {
          q._id = {$lt: lastMessageId};
        }
        const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
        fn({
          status: true,
          data: {
            messages: messages.reverse(),
            targetUser: targetUser
          }
        });
        await db.MessageModel.updateMany({
          r: uid,
          s: targetUid,
          vd: false
        }, {$set: {vd: true}});
      }
    });
  });
  return io;
};
module.exports = func;