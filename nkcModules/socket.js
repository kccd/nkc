const getRoomName = require('../socket/util/getRoomName');
const func = {};

func.sendConsoleMessage = (data) => {
  const roomName = getRoomName('console');
  global.NKC.io.to(roomName).emit('consoleMessage', data);
};

func.sendMessage = () => {
  const roomName = getRoomName('message');
};

func.sendForumMessage = () => {
  const roomName = getRoomName('forum');
};

func.sendThreadMessage = () => {
  const roomName = getRoomName('thread');
};


module.exports = func;
