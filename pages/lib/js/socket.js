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

const eventsObj = {};
for(const e of events) {
  eventsObj[e.type] = e;
}

export function addSocketStatusChangedEvent(socket, func) {
  const initEvent = function(event) {
    socket.on(event.type, function() {
      func(event);
    });
  }
  for(var i = 0; i < events.length; i++) {
    const event = events[i];
    initEvent(event);
  }
}

export function getSocketStatus(socket) {
  const {connected} = socket;
  if(connected) {
    return eventsObj.connect;
  } else {
    return eventsObj.disconnect;
  }
}