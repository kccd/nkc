module.exports = async (socket, io, res) => {
  const {data, util, db} = socket.NKC;
  const {forumId, threadsId} = res;
  const {user} = data;
  if(forumId) {
    // 第一页
    const forumsId = await db.ForumModel.getReadableForumsIdByUid(user.uid);
    if(!forumsId.includes(forumId)) {
      return util.connect.disconnectSocket(socket);
    }
    const roomName = util.getRoomName('forum', forumId);
    socket.join(roomName);
  } else {
    // 其他页
    const threads = await db.ThreadModel.find({tid: {$in: threadsId}});
    for(const thread of threads) {
      try{
        await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
        const roomName = util.getRoomName('thread', thread.tid);
        socket.join(roomName);
      } catch(err) {}
    }
  }
}
