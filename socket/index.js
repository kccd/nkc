require('colors');
const moment = require('moment');
const settings = require('../settings');
const db = require('../dataModels');
const Cookies = require('cookies-string-parse');
const {pubConnect, pubDisconnect} = require('../redis');

let socketIo;
let io;


const func = async (server) => {

  await db.SocketModel.remove({processId: global.NKC.processId});
  await db.UserModel.updateMany({online: true}, {$set: {online: false}});

  io = require('socket.io')(server, {
    "serveClient": false ,
    "transports":['websocket', 'polling'],
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

      if(!userInfo) return socket.disconnect(true);

      const {username, uid} = JSON.parse(decodeURI(userInfo));

      const user = await db.UserModel.findOne({username, uid});

      if(!user) return socket.disconnect(true);

      let userSockets = await db.SocketModel.find({uid}).sort({toc: 1});

      userSockets = await Promise.all(userSockets.map(async socket => {

        const targetSocket = socketIo.connected[socket.socketId];

        if(!targetSocket) await socket.remove();

        return socket;

      }));

      // 每个用户的连接数不能超过5
      if(userSockets.length >= 5) {

        const firstSocket = userSockets[0];

        const targetSocket = socketIo.connected[firstSocket.socketId];

        if(targetSocket) targetSocket.disconnect(true);

      }

      socket.NKC = {
        uid
      };

      const newSocket = await db.SocketModel({
        uid,
        processId: global.NKC.processId,
        socketId: socket.id
      });

      await newSocket.save();


      await pubConnect(uid);


      console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'连接成功'.bgGreen} 已连接客户端：${io.eio.clientsCount}`);

      if(userSockets.length === 0) {

        await db.UserModel.update({uid}, {
          $set: {
            online: true
          }
        });

      }

      socket.on('error', (error) => {
        console.log(error);
        disconnect(socket);
        console.log(error.message.red);
      });
      socket.on('disconnect', () => {
        disconnect(socket);
      });

    });

  global.NKC.socketIo = socketIo;
  global.NKC.io = io;

};



async function disconnect (socket) {

  // 获取该用户的所有连接
  const {uid} = socket.NKC;
  if(!uid) return;

  await db.SocketModel.remove({uid, socketId: socket.id});

  // 若用户没有连接则向其他用户通知该用户下线

  const socketsCount = await db.SocketModel.count({uid});
  console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'断开连接'.bgRed} 已连接客户端：${io.eio.clientsCount}`);

  if(socketsCount !== 0) return;

  await db.UserModel.update({uid}, {
    $set: {
      online: false
    }
  });

  await pubDisconnect(uid);

}



module.exports = func;