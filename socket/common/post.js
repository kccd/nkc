module.exports = async (socket, io, res) => {
  const {data, util, db} = socket.NKC;
  const {postId} = res;
  const {userRoles, userGrade, user} = data;
  const post = await db.PostModel.find({pid: postId});
  if(!post) return util.connect.disconnectSocket(socket);
  const thread = await db.ThreadModel.findOne({tid: post.tid});
  if(!thread) return util.connect.disconnectSocket(socket);
  try{
    await thread.ensurePermission(userRoles, userGrade, user);
  } catch(err) {
    return util.connect.disconnectSocket(socket);
  }
  const roomName = util.getRoomName('post', postId);
  socket.join(roomName);
  console.log(`已加入房间 post ${postId}`);
}
