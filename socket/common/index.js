const db = require('../../dataModels');
const message = require('./message');
module.exports = async (io) => {
  // 启动时修改所有用户的状态为离线
  await db.UserModel.updateMany({online: true}, {
    $set: {
      online: false,
      onlineType: ''
    }
  });
  io.on('connection', async socket => {
    socket.on('error', async err => {
      console.error(err);
      await util.connect.disconnectSocket(socket);
    });
    socket.on('disconnect', async ()=> {
      await util.connect.disconnectSocket(socket);
    });

    const {data, address, query, util} = socket.NKC;
    const {user} = data;

    // socket连接数量限制
    const roomName = user? `user/${user.uid}`: `visitor/${address}`;
    const clients = await util.getRoomClientsId(io, roomName);
    if(clients.length >= 10) {
      let num = clients.length - 9;
      for(let i = 0; i < num; i++) {
        if(io.connected[clients[i]]) {
          io.connected[clients[i]].disconnect(true);
        }
      }
    }
    // 平台判断
    let onlineType = query.os;
    if(!['phone', 'computer'].includes(onlineType)) {
      onlineType = 'computer';
    }
    socket.NKC.onlineType = onlineType;
    await db.UserModel.update({uid: user.uid}, {
      $set: {
        online: true,
        onlineType
      }
    });

    if(!socket.NKC.data.user) {
      return await util.connect.disconnectSocket(socket);
    }
    await message(socket, io);
    switch(query.operationId) {
      case 'visitExperimentalConsole': return await require('./console')(socket, io);
      default: return;
    }
  });
};
