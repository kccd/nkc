module.exports = async (socket, io) => {
  const roomName = socket.NKC.util.getRoomName('console');
  socket.join(roomName);
}
