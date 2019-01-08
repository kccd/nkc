var tid = document.getElementById('threadId');
tid = tid.innerText;
var threadSocket = io('/thread', {
  forceNew: false,
  reconnection: true,
  autoConnect: true,
  transports: ['polling', 'websocket'],
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000,
  query: {tid: tid}
});

// socket.open();

threadSocket.on('connect', function () {
  console.log('threadSocket连接成功');
});
threadSocket.on('error', function(err) {
  console.log('threadSocket连接出错:');
  console.log(err);
  threadSocket.disconnect();
});
threadSocket.on('disconnect', function() {
  console.log('threadSocket连接已断开');
});
threadSocket.on('postToThread', function(data) {
  console.log(data.post.c);
});