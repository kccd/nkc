const getRoomName = require("../util/getRoomName");
const log = require('../util/log');
module.exports = async (socket, io) => {
  const {db, data, query, util} = socket.NKC;
  const {user} = data;
  let userRoom = uid => getRoomName("user", uid);
  // 加入房间
  socket.join(userRoom(user.uid));
  // 获取聊天列表中用户的uid
  const friendsUid = await db.MessageModel.getUsersFriendsUid(user.uid);

  // 平台判断
  let onlineType = query.os;
  if(!['app', 'web'].includes(onlineType)) {
    onlineType = 'web';
  }
  socket.NKC.onlineType = onlineType;
  // 更新用户在线状态
  await db.UserModel.updateOne({uid: user.uid}, {
    $set: {
      online: onlineType
    }
  });
  // 给每个好友通知我已经上线了!
  const status = await db.UserModel.getUserOnlineStatus(user.uid);
  await Promise.all(friendsUid.map(friendUid => {
    io.in(userRoom(friendUid)).emit('updateUserOnlineStatus', {
      uid: user.uid,
      status,
    });
  }));
  socket.on('disconnect', async () => {
    // 更新用户在线状态
    const roomName = await util.getRoomName('user', user.uid);
    const clients = await util.getRoomClientsId(io, roomName);
    if(clients.length === 0) {
      await db.UserModel.updateOne({uid: socket.NKC.data.user.uid}, {
        $set: {
          online: '',
        }
      });
    }
    // 给每个好友通知我下线了!
    const status = await db.UserModel.getUserOnlineStatus(user.uid);
    await Promise.all(friendsUid.map(friendUid => {
      io.in(userRoom(friendUid)).emit('updateUserOnlineStatus', {
        uid: user.uid,
        status,
      });
    }));

    await log.onDisconnectedSocket(socket);
  })
};
