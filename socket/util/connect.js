const func = {};
const log = require('./log');
func.disconnectSocket = async (socket) => {
  socket.disconnect(true);
  await log.onDisconnectedSocket(socket);
}
module.exports = func;
