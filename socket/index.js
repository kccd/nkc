require('colors');
const socketIo = require('socket.io');
const socketConfig = require('../config/socket');
const redisConfig = require("../config/redis");
const namespaces = Object.assign({}, require('./namespaces'));
const socketIoRedis = require('socket.io-redis');

const {init, auth} = require("./middlewares");

async function createSocketServer(server) {
  try {
    const io = socketIo(server, socketConfig);
    io.on("error", (err) => {
      throw err;
    });
    // 多进程适配
    io.adapter(socketIoRedis({ host: redisConfig.address, port: redisConfig.port}));
    // 多个socket连接类型
    for(const name in namespaces) {
      if(!namespaces.hasOwnProperty(name)) continue;
      const namespace = io.of(`/${name}`);
      // 中间处理
      await namespace.use(init);
      await namespace.use(auth);
      await namespaces[name](namespace);
    }
    global.NKC.io = io;
  } catch(err) {
    console.log(`${err.message || err}`.red);
  }

}
module.exports = createSocketServer;