require('colors');
const moment = require('moment');

// socket => user
let socketToUserMap = new WeakMap();

/**
 * 创建房间用来保存此用户的连接
 */
async function storeUser(socket) {
  return new Promise((resolve, _) => {
    const {user} = socket.NKC.data;
    const {uid} = user;
    if(!user) return socket.disconnect(true);
    socketToUserMap.set(socket, user);
    socket.join(`user/${uid}`, async () => {
      console.log(`${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' '+global.NKC.processId + ' ').grey} ${' SOCKET '.bgGreen} ${uid.bgCyan} ${'/common'.bgBlue} ${'连接成功'.bgGreen}`);
      global.NKC.io.of('/console').NKC.socketMessage('/common', true, uid);
      return resolve(true);
    });
  });
}

module.exports = {
  storeUser
}
