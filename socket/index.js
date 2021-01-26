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

const run = async () => {
  const server = http.createServer();
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

  server.listen(socketConfig.port, socketConfig.address, () => {
    console.log(`SOCKET服务已启动 ${socketConfig.address}:${socketConfig.port}`);
  });
};

run()
  .catch(err => {
    console.log(`SOCKET服务启动失败`.red);
    console.log((err.stack || err.message || err).red);
  });


