import { getState } from './state';
import { getUrl } from './tools';
const { uid, refererOperationId } = getState();

const hasLogged = !!uid;
const operationId = refererOperationId;

const functions = [];
const handlers = [];

const events = [
  {
    type: 'connect',
    name: '已连接',
  },
  {
    type: 'disconnect',
    name: '连接已断开',
  },
  {
    type: 'error',
    name: '连接出错',
  },
  {
    type: 'connecting',
    name: '正在连接',
  },
  {
    type: 'reconnecting',
    name: '正在重连',
  },
  {
    type: 'reconnect',
    name: '重连成功',
  },
  {
    type: 'connect_failed',
    name: '连接失败',
  },
  {
    type: 'reconnect_failed',
    name: '重连失败',
  },
  {
    type: 'connect_timeout',
    name: '连接超时',
  },
];

const eventsObj = {};
for (const e of events) {
  eventsObj[e.type] = e;
}

/*
 * 获取socket.io实例
 * */
export function getSocket() {
  if (!hasLogged) {
    return null;
  } else if (window.socket) {
    return window.socket;
  } else {
    const query = {
      operationId,
      data: {},
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
        'X-socket-io': 'polling',
      },
    });

    socket.on('connect', function () {
      console.log('socket连接成功');
    });
    socket.on('error', function () {
      console.log('socket连接出错');
      socket.disconnect();
    });
    socket.on('disconnect', function () {
      console.log('socket连接已断开');
    });
    socket.on('connect_error', function (err) {
      console.log(err);
    });
    socket.on('test', console.log);
    window.socket = socket;
    return window.socket;
  }
}

function initSocketIoEvent(event, func) {
  const socket = getSocket();
  if (!socket) {
    return;
  }
  let index = functions.indexOf(func);
  let handlerObj;
  if (index === -1) {
    handlerObj = {};
    functions.push(func);
    handlers.push(handlerObj);
  } else {
    handlerObj = handlers[index];
  }
  let handler = handlerObj[event.type];
  if (handler) {
    return;
  }
  handler = function () {
    func(event);
  };
  handlerObj[event.type] = handler;
  socket.on(event.type, handler);
}

function removeSocketIoEvent(event, func) {
  const socket = getSocket();
  if (!socket) {
    return;
  }
  let index = functions.indexOf(func);
  if (index === -1) {
    return;
  }
  const handlerObj = handlers[index];
  const handler = handlerObj[event.type];
  if (!handler) {
    return;
  }
  socket.off(event.type, handler);
  handlerObj[event.type] = undefined;
}

export function addSocketStatusChangedEvent(func) {
  for (const event of events) {
    initSocketIoEvent(event, func);
  }
}

export function removeSocketStatusChangedEvent(func) {
  for (const event of events) {
    removeSocketIoEvent(event, func);
  }
}

export function getSocketStatus() {
  const socket = getSocket();
  if (!socket) {
    return null;
  }
  const { connected } = socket;
  if (connected) {
    return eventsObj.connect;
  } else {
    return eventsObj.disconnect;
  }
}

export function initEventToGetUnreadMessageCount(callback) {
  const socket = getSocket();
  const audio = new Audio();
  audio.src = getUrl('messageTone');
  let unreadMessageCount = 0;

  const playAudio = (url) => {
    audio.onload = function () {
      audio.play();
    };
    audio.src = url;
  };

  const runCallback = () => {
    callback(unreadMessageCount);
  };

  socket.on('unreadMessageCount', (data) => {
    const { newMessageCount } = data;
    unreadMessageCount = newMessageCount;
    runCallback();
  });
  //接受到新消息
  socket.on('receiveMessage', (data) => {
    if (data.localId && data.chat.type === 'UTU') {
      return;
    }
    if (data.beep) {
      playAudio(data.beep); // 播放音频
    }
    if (data.selfDefine) {
      unreadMessageCount -= 1;
    } else {
      unreadMessageCount += 1;
    }
    runCallback();
  });
  //读取未读消息
  socket.on('markAsRead', (data) => {
    const { unread } = data;
    unreadMessageCount = unread;
    runCallback();
  });
}
