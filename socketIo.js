require('colors');
const moment = require('moment');
const settings = require('./settings');
const db = require('./dataModels');
const Cookies = require('cookies-string-parse');
const Koa = require('koa');
const http = require('http');
const https = require('https');
const config = require('./config');
const redis = require('redis');
const Ddos = require('ddos');
const ddos = new Ddos();
const app = new Koa();
app.use(ddos.koa().bind(ddos));

app.on('error', (err) => {
  console.log(err.stack.red);
});

let server, socketIo, io;

const createServer = () => {

  if(config.socket.useHttps) {
    const httpsOptions = settings.httpsOptions();
    server = https.createServer(httpsOptions, app);
    server.listen(config.socket.httpsPort);
  } else {
    server = http.createServer(app);
    server.listen(config.socket.httpPort);
  }
};

const initRedis = () => {

  const client = redis.createClient();

  client.on('error', (err) => {
    console.log(err.stack.red);
  });
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

};

const initSocket = async () => {

  await db.SocketModel.remove({});
  await db.UserModel.updateMany({online: true}, {$set: {online: false}});

  io = require('socket.io')(server, {
    "serveClient": false ,
    "transports":['websocket', 'polling'],
    "pingInterval": 2000
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

(async () => {
  try{
    createServer();
    await initSocket();
    initRedis();
    console.log(`socket服务器启动成功.`);
  } catch(err) {
    console.log(err.stack.red);
  }
})();