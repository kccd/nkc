if(!window.socket) {
  const query = {
    operationId: NKC.configs.refererOperationId,
    data: NKC.configs.socketData || {},
  };
  const socket = io('/common', {
    forceNew: false,
    reconnection: true,
    autoConnect: true,
    transports: ['polling', 'websocket'],
    reconnectionDelay: 5000,
    reconnectionDelayMax: 10000,
    query: query,
    extraHeaders: {
      "X-socket-io": "polling"
    }
  });

  socket.on('connect', function () {
    console.log('socket连接成功');
  });
  socket.on('error', function() {
    console.log('socket连接出错');
    socket.disconnect();
  });
  socket.on('disconnect', function() {
    console.log('socket连接已断开');
  });

  window.socket = socket;
}