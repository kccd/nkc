const db = require('../../dataModels');
const message = require('./message');

const CommunicationClient = require('../../tools/communicationClient');
const communicationConfig = require('../../config/communication');

const socketClient = new CommunicationClient({
  serviceName: communicationConfig.servicesName.socket,
  serviceId: global.NKC.processId
});

module.exports = async (io) => {
  socketClient.onMessage((req) => {
    const {from, content} = req;
    const {roomName, data, eventName} = content;
    let rooms = [];
    if(typeof roomName === 'string') {
      rooms.push(roomName)
    } else {
      for(const r of roomName) {
        rooms.push(r);
      }
    }
    let _io = io;
    for(const r of rooms) {
      _io = _io.to(r);
    }
    _io.emit(eventName, data);
  });

  // 启动时修改所有用户的状态为离线
  if(global.NKC.processId === 0) {
    await db.UserModel.updateMany({online: true}, {
      $set: {
        online: false,
        onlineType: ''
      }
    });
  }
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
    const maxCount = 10;
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
