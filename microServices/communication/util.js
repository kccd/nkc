const func = {};
/*
* 获取目标服务的房间名
* @param {String} serviceName 服务器名称
* @return {String}
* */
func.getRoomNameByServiceName = async (serviceName = '') => {
  return `microservice:${serviceName}`;
};

/*
* 获取目标服务的socket连接
* @param {SocketIO} socketIO 实例
* @param {String} serviceName 目标服务名
* @return {String || null} 目标socketId或null
* */
func.getTargetSocketByServiceName = async (socketIO, serviceName) => {
  const roomName = await func.getRoomNameByServiceName(serviceName);
  const sockets = await socketIO.to(roomName).allSockets();
  if(sockets.size === 0) return null;
  const socketId = [...sockets][Math.round(Math.random() * 10000) % sockets.size];
  return socketIO.of('/').sockets.get(socketId);
};
module.exports = func;
