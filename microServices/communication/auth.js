module.exports = async (socket, next) => {
  const {
    serviceName,
    serviceId,
    serviceAddress,
    servicePort
  } = socket.handshake.auth;
  if(
    serviceName === undefined
  ) return socket.disconnect(true);
  socket.state = {
    serviceName,
    serviceId,
    serviceAddress,
    servicePort
  };
  await next();
}
