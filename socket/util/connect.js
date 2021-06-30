const func = {};
func.disconnectSocket = async (socket) => {
  socket.disconnect(true);
}
module.exports = func;
