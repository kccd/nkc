const func = {};
const moment = require("moment");
require('colors');

func.onDisconnectedSocket = async socket => {
  const {data, address} = socket.NKC;
  const {user} = data;
  if(user) {
    console.log(
      `${moment().format('YYYY/MM/DD HH:mm:ss').grey} `+
      `${(' '+global.NKC.processId + ' ').grey} `+
      `${' SOCKET '.bgGreen} ${user.uid.bgCyan} `+
      `${'/common'.bgBlue} ${'断开连接'.bgRed} ${address}`
    );
  } else {
    console.log(
      `${moment().format('YYYY/MM/DD HH:mm:ss').grey} `+
      `${(' '+global.NKC.processId + ' ').grey} `+
      `${' SOCKET '.bgGreen} visitor `+
      `${'/common'.bgBlue} ${'断开连接'.bgRed} ${address}`
    );
  }
  socket.NKC.nkcModules.socket.sendConsoleMessage({
    consoleType: 'socket',
    reqTime: Date.now(),
    processId: global.NKC.processId,
    url: `/`,
    uid: user? user.uid: '',
    connect: false
  });
};

func.onConnectedSocket = async socket => {
  const {data, address} = socket.NKC;
  const {user} = data;
  if(user) {
    console.log(
      `${moment().format('YYYY/MM/DD HH:mm:ss').grey} `+
      `${(' '+global.NKC.processId + ' ').grey} `+
      `${' SOCKET '.bgGreen} ${user.uid.bgCyan} `+
      `${'/common'.bgBlue} ${'连接成功'.bgGreen} ${address}`
    );
  } else {
    console.log(
      `${moment().format('YYYY/MM/DD HH:mm:ss').grey} `+
      `${(' '+global.NKC.processId + ' ').grey} `+
      `${' SOCKET '.bgGreen} visitor `+
      `${'/common'.bgBlue} ${'连接成功'.bgGreen} ${address}`
    );
  }
  socket.NKC.nkcModules.socket.sendConsoleMessage({
    consoleType: 'socket',
    reqTime: Date.now(),
    processId: global.NKC.processId,
    url: `/`,
    uid: user? user.uid: '',
    connect: true
  });
};
module.exports = func;
