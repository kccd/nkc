module.exports = {
  port: 9000,
  socket: {
    serverClient: false,
    transports: ['polling', 'websocket'],
    pingInterval: 30000
  }
};