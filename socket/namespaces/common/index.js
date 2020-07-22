/**
 * 通用消息连接
 */
const handles = require('./handles');
const {storeUser} = require('./store');

module.exports = function(io){

  let send = handles.makeSend(io);

  // 客户端连入
  io.on("connection", async socket => {
    await storeUser(socket);
    socket.sendMessage = send;
    socket.on("message", handles.message);
    socket.on("disconnect", handles.disconnect);
    socket.on('error', handles.error);
  });

  // 暴露消息发送函数
  io.NKC = {...io.NKC, send}
};