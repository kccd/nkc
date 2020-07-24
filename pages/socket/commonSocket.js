var commonSocket = io('/common', {
  forceNew: false,
  reconnection: true,
  autoConnect: true,
  transports: ['polling', 'websocket'],
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000
});

commonSocket.on('connect', function () {
  console.log('通用消息通道连接成功');
});
commonSocket.on('error', function() {
  console.log('通用消息通道连接出错');
  commonSocket.disconnect();
});
commonSocket.on('disconnect', function() {
  console.log('通用消息通道连接已断开');
});

// commonSocket.on('message', function(data) {
//   console.log("收到消息:", data);
// })