module.exports = async (socket, io, res) => {
  const {data, util, db} = socket.NKC;
  const {forumId} = res;
  const {user} = data;
  const forumsId = await db.ForumModel.getReadableForumsIdByUid(user.uid);
  if(!forumsId.includes(forumId)) {
    return util.connect.disconnectSocket(socket);
  }
  const roomName = util.getRoomName('forum', forumId);
  socket.join(roomName);
}
