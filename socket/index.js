require('colors');
const socketIo = require('socket.io');
const socketConfig = require('../config/socket');
const redisConfig = require("../config/redis");
const socketIoRedis = require('socket.io-redis');
const {init, auth, logger} = require("./middlewares");
const common = require('./common');

module.exports = async (server) => {
  const io = socketIo(server, socketConfig);
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
  await namespace.use(logger);
  await common(namespace);
  global.NKC.io = io;
}
