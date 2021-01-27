module.exports = async (socket, next) => {
  const {serviceName, serviceId} = socket.handshake.auth;
  if(
    serviceName === undefined ||
    serviceId === undefined
  ) return socket.disconnect(true);
  socket.state = {
    serviceName,
    serviceId
  };
  await next();
}
