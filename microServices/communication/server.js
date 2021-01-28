require('colors');
const SocketIO = require('socket.io');
const HTTP = require('http');
const communicationConfig = require('../serviceConfigs/communication');
const auth = require("./auth");
const connection = require('./connection');

const server = HTTP.createServer();
server.listen(communicationConfig.serverPort, communicationConfig.serverHost, () => {
  console.log(`communication server is running at ${communicationConfig.serverHost}:${communicationConfig.serverPort}`.green);
  process.on('message', function(msg) {
    if (msg === 'shutdown') {
      server.close();
      console.log(`communication service ${global.NKC.processId} has stopped`.green);
      process.exit(0);
    }
  });
});
const socketIO = SocketIO(server, communicationConfig.socketServerOptions);
socketIO.on('error', err => {
  console.log(`Communication error`.red);
  console.error(err);
});
socketIO.use(auth);
connection(socketIO);




