require('colors');
const SocketIO = require('socket.io');
const HTTP = require('http');
const communicationConfig = require('../serviceConfigs/communication');
const auth = require("./auth");
const connection = require('./connection');

const server = HTTP.createServer();
server.listen(communicationConfig.serverPort, communicationConfig.serverHost, () => {
  console.log(`communication server is running at ${communicationConfig.serverHost}:${communicationConfig.serverPort}`.green);
});
const socketIO = SocketIO(server, communicationConfig.socketServerOptions);
socketIO.on('error', err => {
  console.log(`Communication error`.red);
  console.error(err.red);
});
socketIO.use(auth);
connection(socketIO);




