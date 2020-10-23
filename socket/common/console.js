module.exports = async (socket, io) => {
  const roomName = socket.NKC.util.getRoomName('console');

  socket.join(roomName, () => {
    console.log(`加入console房间成功`);
  });
}
