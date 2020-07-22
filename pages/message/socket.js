var pageName = '';
var socket = io('/message', {
  forceNew: false,
  reconnection: true,
  autoConnect: true,
  transports: ['polling', 'websocket'],
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000
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

socket.on('message', function(data) {
  var ty = data.message.ty;
  if(ty === 'STE') {
    newMessageRemind('notice');
  } else if(ty === 'STU') {
    newMessageRemind('reminder');
  } else if(ty === 'UTU') {
    var user = data.user;
    var myUid = data.myUid;
    if(user.uid !== myUid) {
      newMessageRemind('message');
    }
  } else if(ty === 'friendsApplication') {
    newMessageRemind('friendsApplication');
  }
});

function newMessageRemind(name) {
  if(pageName && pageName === 'message') return;
  beep(name);
  var number = getNewMessageNumber();
  setNewMessageNumber(number+1);
}




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