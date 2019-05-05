var homeSocket = io("/home", {
  forceNew: false,
  reconnection: true,
  autoConnect: true,
  transports: ['polling', 'websocket'],
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000
});

homeSocket.on("connect", function() {
  console.log("连接成功");
});
homeSocket.on("error", function(err) {
  console.log(err);
  console.log("连接失败");
});
homeSocket.on("disconnect", function() {
  console.log("连接已断开");
});