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

    if(!user) {
      return await util.connect.disconnectSocket(socket);
    }

    // socket连接数量限制
    const roomName = await util.getRoomName('user', user.uid);
    const clients = await util.getRoomClientsId(io, roomName);
    const maxCount = 2;
    for(let i = 0; i < (clients.length - maxCount + 1); i++) {
      try{
        await io.adapter.remoteDisconnect(clients[i], true);
      } catch(err) {
        console.log(err.message);
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

    await message(socket, io);

    socket.on('joinRoom', async res => {
      const {type, data} = res;
      if(type === 'console') {
        await require('./console')(socket, io, data);
      } else if(type === 'forum') {
        await require('./forum')(socket, io, data);
      } else if(type === 'post') {
        await require('./post')(socket, io, data);
      }
    });
  });
};
