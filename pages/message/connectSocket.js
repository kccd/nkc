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

  window.addSocketStatusChangedEvent = function(func) {
    const events = [
      {
        type: 'connect',
        name: '已连接'
      },
      {
        type: 'disconnect',
        name: '连接已断开'
      },
      {
        type: 'error',
        name: '连接出错'
      },
      {
        type: 'connecting',
        name: '正在连接'
      },
      {
        type: 'reconnecting',
        name: '正在重连'
      },
      {
        type: 'reconnect',
        name: '重连成功'
      },
      {
        type: 'connect_failed',
        name: '连接失败'
      },
      {
        type: 'reconnect_failed',
        name: '重连失败'
      },
      {
        type: 'connect_timeout',
        name: '连接超时'
      }
    ];
    const initEvent = function(event) {
      socket.on(event.type, function() {
        func(event);
      });
    }
    for(var i = 0; i < events.length; i++) {
      var event = events[i];
      initEvent(event);
    }
  }


  window.socket = socket;
}