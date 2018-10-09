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
const Redis = require('ioredis');
const ratelimit = require('koa-ratelimit');
const app = new Koa();

app.use(ratelimit({
  db: new Redis(),
  duration: 600000,
  errorMessage: '<div style="text-align: center;font-size: 2rem;padding-top: 15rem;color: #888888;">Sometimes You Just Have to Slow Down.</div>',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  max: 100,
  disableHeader: false,
}));

app.use((ctx, next) => {
  if(config.socket.useHttps) {
    ctx.redirect('https://www.kechuang.org');
  } else {
    ctx.body = '<a href="https://www.kechuang.org" style="display: block;text-align: center;font-size: 2rem;padding-top: 15rem;color: #888888;">www.kechuang.org</a>';
    next();
  }
});

app.on('error', (err) => {
  console.log(err.stack?err.stack.red:err);
});

let server, socketIo, io;

const createServer = () => {

  if(config.socket.useHttps) {

    const greenlock = require('greenlock-koa').create({
      version: 'draft-11' // Let's Encrypt v2
      // You MUST change this to 'https://acme-v02.api.letsencrypt.org/directory' in production
      // , server: 'https://acme-staging-v02.api.letsencrypt.org/directory'
      , server: 'https://acme-v02.api.letsencrypt.org/directory'
      , email: config.httpsCert.email
      , agreeTos: true
      , approveDomains: config.httpsCert.approveDomains

      // Join the community to get notified of important updates
      // and help make greenlock better
      , communityMember: true

      , configDir: require('os').homedir() + '/acme/etc'

      , debug: false
    });

    server = https.createServer(greenlock.tlsOptions, greenlock.middleware(app.callback()));

    const app2 = new Koa();

    const redirectHttps = app2.use(require('koa-sslify')()).callback();

    http.createServer(greenlock.middleware(redirectHttps)).listen(config.socket.redirectHttpPort, function() {
      console.log('Listening on port 8081 to handle ACME http-01 challenge and redirect to https'.green);
    });

    server.listen(config.socket.httpsPort);
  } else {
    server = http.createServer(app.callback());
    server.listen(config.socket.httpPort);
  }
};

const initRedis = () => {

  const client = redis.createClient();

  client.on('error', (err) => {
    console.log(err.stack.red);
  });
  client.on('message', async (channel, message) => {

    try{

      message = JSON.parse(message);
      if(channel === 'withdrawn') {
        const {r, s, _id} = message;
        const sockets = await db.SocketModel.find({
          $or: [
            {
              uid: r
            },
            {
              uid: s
            }
          ]
        });
        await Promise.all(sockets.map(async socket => {
          const targetSocket = socketIo.connected[socket.socketId];
          if(targetSocket) {
            targetSocket.emit('withdrawn', {
              uid: s,
              messageId: _id
            });
          }
        }));
      } else if(channel === 'message') {
        const {ty, s, r} = message;
        if(ty === 'STE') {
          io.sockets.emit('message', {
            message
          });
        } else if(ty === 'STU') {
          const targetUser = await db.UserModel.findOne({uid: r});
          if(!targetUser) return;
          const targetSockets = await db.SocketModel.find({uid: r});
          await Promise.all(targetSockets.map(async socket => {
            const targetSocket = socketIo.connected[socket.socketId];
            if(targetSocket) {
              targetSocket.emit('message', {
                message
              })
            } else {
              await socket.remove();
            }
          }));
        } else if(ty === 'UTU') {
          const sUser = await db.UserModel.findOne({uid: s});
          const rUser = await db.UserModel.findOne({uid: r});
          if(!sUser || !rUser) return;
          const targetSockets = await db.SocketModel.find({
            $or: [
              {
                uid: r
              },
              {
                uid: s
              }
            ]
          });
          await Promise.all(targetSockets.map(async socket => {
            const targetSocket = socketIo.connected[socket.socketId];
            if(targetSocket) {
              targetSocket.emit('message', {
                user: sUser,
                targetUser: rUser,
                myUid: socket.uid,
                message
              });
            } else {
              await socket.remove();
            }
          }));
        }
      }
    } catch(err) {
      console.log(err);
    }

  });

  client.subscribe(`message`);

  client.subscribe(`withdrawn`);

};

const initSocket = async () => {

  await db.SocketModel.remove({});
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
        socketId: socket.id
      });

      await newSocket.save();


      let onlineType = socket.handshake.query.os;
      if(!['phone', 'computer'].includes(onlineType)) {
        onlineType = 'computer';
      }

      const friendsUId = await db.MessageModel.getUsersFriendsUid(uid);

      await Promise.all(friendsUId.map(async targetUid => {
        const sockets = await db.SocketModel.find({uid: targetUid});
        await Promise.all(sockets.map(async s => {
          const targetSocket = socketIo.connected[s.socketId];
          if(targetSocket) {
            targetSocket.emit('userConnect', {
              targetUid: uid,
              onlineType
            });
          } else {
            await s.remove();
          }
        }));
      }));


      console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'连接成功'.bgGreen} 已连接客户端：${io.eio.clientsCount}`);
      await db.UserModel.update({uid}, {
        $set: {
          online: true,
          onlineType
        }
      });

      /*socket.on('req', (data) => {
        console.log(`${new Date()} test-socket: ${data}`);
        socket.emit('res', `${new Date()} test-socket success`);
      });*/

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
  console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'断开连接'.bgRed} 已连接客户端：${io.eio.clientsCount}`);

  if(socketsCount !== 0) return;

  await db.UserModel.update({uid}, {
    $set: {
      online: false
    }
  });

  const friendsUId = await db.MessageModel.getUsersFriendsUid(uid);

  await Promise.all(friendsUId.map(async targetUid => {
    const sockets = await db.SocketModel.find({uid: targetUid});
    await Promise.all(sockets.map(async s => {
      const targetSocket = socketIo.connected[s.socketId];
      if(targetSocket) {
        targetSocket.emit('userDisconnect', {
          targetUid: uid
        });
      } else {
        await s.remove();
      }
    }));
  }));

}


(async () => {
  try{
    createServer();
    await initSocket();
    initRedis();
    console.log(`socket server listening on ${config.socket.httpPort}`.green);
  } catch(err) {
    console.log('socket 服务器启动失败:'.red);
    console.log(err.stack.red);
  }
})();