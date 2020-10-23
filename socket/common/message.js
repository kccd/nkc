module.exports = async (socket, io) => {
  const {db, data, onlineType, util} = socket.NKC;
  const {user} = data;
  const friendsUid = await db.MessageModel.getUsersFriendsUid(user.uid);
  await Promise.all(friendsUid.map(friendUid => {
    io.in(`user/${friendUid}`).emit('userConnect', {
      targetUid: user.uid,
      onlineType,
      platform: onlineType === 'phone'? 'app': 'web'
    });
  }));
  socket.on('disconnect', async () => {
    const {user} = socket.NKC.data;
    const clients = await util.getRoomClientsId(io);
    // 未完成 通知好友当前用户已下线
  })
};
