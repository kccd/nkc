require('colors');
const moment = require('moment');
const socketIo = require('socket.io');
const config = require('../config');
const namespaces = Object.assign({}, require('./namespaces'));
async function createSocketServer(server) {
  const io = socketIo(server, config.socket);
  for(const namespace in namespaces) {
    if(!namespaces.hasOwnProperty(namespace)) continue;
    await namespaces[namespace](io.of(`/${namespace}`));
    console.log(`namespace: ${namespace}`);
  }
}
module.exports = createSocketServer;