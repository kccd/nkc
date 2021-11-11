require('colors');
require('../global');
const http = require('http');
const socketIo = require('socket.io');
const socketConfig = require('../config/socket');
const redisConfig = require("../config/redis");
const socketIoRedis = require('socket.io-redis');
const {init, auth, logger, permission} = require("./middlewares");
const common = require('./common');

/*module.exports = async (server) => {
  const io = socketIo(server, socketConfig.options);
  io.on('error', err => {
    console.log(err);
  });
  io.adapter(socketIoRedis({
    host: redisConfig.address,
    port: redisConfig.port
  }));
  const namespace = io.of(`/common`);
  await namespace.use(init);
  await namespace.use(auth);
  await namespace.use(permission);
  await namespace.use(logger);
  await common(namespace);
  global.NKC.io = namespace;
}*/

module.exports = async (server) => {
  const existed = !!server;
  if(!existed) {
    global.NKC.port = socketConfig.port + Number(global.NKC.processId);
    global.NKC.address = socketConfig.address;
    server = http.createServer();
  }
  const io = socketIo(server, socketConfig.options);
  io.on('error', err => {
    console.log(err);
  });
  io.adapter(socketIoRedis({
    host: redisConfig.address,
    port: redisConfig.port
  }));
  const namespace = io.of(`/common`);
  await namespace.use(init);
  await namespace.use(auth);
  await namespace.use(permission);
  await namespace.use(logger);
  await common(namespace);

  if(!existed) {
    server.listen(global.NKC.port, global.NKC.address, () => {
      console.log(`socket service ${global.NKC.processId} is running at ${global.NKC.address}:${global.NKC.port}`.green);
      if(process.connected) process.send('ready');
    });
    process.on('message', async function(msg) {
      if (msg === 'shutdown') {
        server.close();
        console.log(`socket service ${global.NKC.processId} stopped`.green);
        process.exit(0);
      }
    });
  } else {
    console.log(`socket service is running`.green);
  }
};


