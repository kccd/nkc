require('colors');
const socketIo = require('socket.io');
const socketConfig = require('../config/socket');
const namespaces = Object.assign({}, require('./namespaces'));
const socketIoRedis = require('socket.io-redis');
async function createSocketServer(server) {
  const io = socketIo(server, socketConfig);
  global.NKC.io = io;
  io.adapter(socketIoRedis({ host: 'localhost', port: 6379 }));
  for(const namespace in namespaces) {
    if(!namespaces.hasOwnProperty(namespace)) continue;
    await namespaces[namespace](io.of(`/${namespace}`));
  }
}
module.exports = createSocketServer;