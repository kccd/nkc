require('colors');
const moment = require('moment');
const socketIo = require('socket.io');
const socketConfig = require('../config/socket');
const namespaces = Object.assign({}, require('./namespaces'));
async function createSocketServer(server) {
  const io = socketIo(server, socketConfig);
  for(const namespace in namespaces) {
    if(!namespaces.hasOwnProperty(namespace)) continue;
    await namespaces[namespace](io.of(`/${namespace}`));
    console.log(`namespace: ${namespace}`);
  }
}
module.exports = createSocketServer;