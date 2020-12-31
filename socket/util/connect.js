const func = {};
const log = require('./log');
const db = require('../../dataModels');
func.disconnectSocket = async (socket) => {
  socket.disconnect(true);
  if(socket.NKC.data.user) {
    await db.UserModel.updateOne({uid: socket.NKC.data.user.uid}, {
      $set: {
        online: false,
      }
    });
  }
  await log.onDisconnectedSocket(socket);
}
module.exports = func;
