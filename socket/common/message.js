const getRoomName = require("../util/getRoomName");
module.exports = async (socket, io) => {
  const {db, data, onlineType, util} = socket.NKC;
  const {user} = data;
  let userRoom = uid => getRoomName("user", uid);
  // 加入房间
  socket.join(userRoom(user.uid));
  // 获取聊天列表中用户的uid
  const friendsUid = await db.MessageModel.getUsersFriendsUid(user.uid);
  // 给每个好友通知我已经上线了!
  await Promise.all(friendsUid.map(friendUid => {
    io.in(userRoom(friendUid)).emit('userConnect', {
      targetUid: user.uid,
      onlineType,
      platform: onlineType === 'phone'? 'app': 'web'
    });
  }));
  socket.on('disconnect', async () => {
    // 给每个好友通知我下线了!
    await Promise.all(friendsUid.map(friendUid => {
      io.in(userRoom(friendUid)).emit('userDisconnect', {
        targetUid: user.uid,
        onlineType,
        platform: onlineType === 'phone'? 'app': 'web'
      });
    }));
  })
};
