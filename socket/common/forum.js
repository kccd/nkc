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
  if(global.NKC.NODE_ENV !== 'production') {
    console.log(`用户 ${user.username} 加入房间 ${roomName}`);
  }

  /*// 获取可在上层显示文章的专业
  const displayThreadForumsId = await db.ForumModel.getDisplayOnParentForumsIdFromRedis();
  // 获取当前专业的所有下级专业
  const childForumsId = await db.ForumModel.getAllChildForumsIdByFid(forumId);
  let targetForumsId = (childForumsId || [])
    .filter(fid => forumsId.includes(fid)) // 排除不能阅读的专业
    .filter(fid => displayThreadForumsId.includes(fid)); // 排除不在上层显示文章的专业
  targetForumsId.push(forumId);
  targetForumsId = [...new Set(targetForumsId)];
  for(const fid of targetForumsId) {
    const roomName = util.getRoomName('forum', fid);
    socket.join(roomName);
    if(global.NKC.NODE_ENV !== 'production') {
      console.log(`用户 ${user.username} 加入房间 ${roomName}`);
    }
  }*/
}
