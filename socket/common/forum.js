module.exports = async (socket, io) => {
  const {data, util, query, db} = socket.NKC;
  const {user} = data;
  const {forumId} = query;
  const forumsId = await db.ForumModel.getReadableForumsIdByUid(user.uid);
  if(!forumsId.includes(forumId)) {
    return util.connect.disconnectSocket(socket);
  }
  const roomName = util.getRoomName('forum', forumId);
  socket.join(roomName);
}
