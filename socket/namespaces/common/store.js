require('colors');
const moment = require('moment');

// socket => user
let socketToUserMap = new WeakMap();

/**
 * 创建房间用来保存此用户的连接
 */
async function storeUser(socket) {
  const {address, data, query} = socket.NKC;
  const {user} = data;
  const {uid} = user;
  if(!user) return socket.disconnect(true);
  socketToUserMap.set(socket, user);

  // 加入短消息相关房间
  await joinRoom(socket, `user/${uid}`);
  console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' '+global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'/common'.bgBlue} ${'连接成功'.bgGreen} ${address}`);
  global.NKC.io.of('/console').NKC.socketMessage('/common', true, uid);

  const {operationId, forumId} = query;
  // 加入其他房间
  if(operationId === 'visitForumHome' && forumId) {
    // 加入专业主页房间
    const forumRoomName = `forum/${forumId}`;
    await joinRoom(socket, forumRoomName);
  }
}

function joinRoom(socket, roomName) {
  return new Promise((resolve, reject) => {
    socket.join(roomName, err => {
      if(err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  storeUser
}
