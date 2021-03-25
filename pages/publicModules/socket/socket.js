var pageName = '', query = {
  operationId: NKC.configs.refererOperationId,
  data: NKC.configs.socketData || {},
};
var socket = io('/common', {
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

// socket.open();

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

function addSocketStatusChangedEvent(func) {
  var events = [
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
  var initEvent = function(event) {
    socket.on(event.type, function() {
      func(event);
    });
  }
  for(var i = 0; i < events.length; i++) {
    var event = events[i];
    initEvent(event);
  }
}


var getNewMessageNumber = function() {
  var messageCount = $('.message-count');
  var number = messageCount.html();
  number = Number(number);
  return number;
};
var setNewMessageNumber = function(number) {
  var messageSwitch = $('.message-switch');
  var messageCount = $(".message-count");
  messageSwitch.removeClass("hidden");
  messageCount.html(number);
};

if(!NKC.configs.isApp) {
  socket.on('message', function(data) {
    if(!data.message) return;
    var ty = data.message.ty;
    if(!ty) return;
    if(ty === 'STE') {
      newMessageRemind('notice');
    } else if(ty === 'STU') {
      newMessageRemind('reminder');
    } else if(ty === 'UTU') {
      var user = data.user;
      var myUid = data.myUid;
      if(user.uid !== myUid) {
        newMessageRemind('message');
        // NKC.methods.showNotification("新消息", data.message.c);
      }
    } else if(ty === 'friendsApplication') {
      newMessageRemind('friendsApplication');
    }
  });
}
function newMessageRemind(name) {
  if(pageName && pageName === 'message') return;
  beep(name);
  var number = getNewMessageNumber();
  setNewMessageNumber(number+1);
}
