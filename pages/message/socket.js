var pageName = '';
var reconnectNumber = 0;
var socket = new io('/', {
  transports:['polling', 'websocket'],
  rememberUpgrade: true,
  requestTimeout: 10,
  reconnection: false
});
socket.on('connect', function () {
  console.log('socket连接成功');
});

socket.on('disconnect', function() {
  reconnectNumber ++;
  if(reconnectNumber > 20) return;
  setTimeout(function() {
    socket.connect();
  }, 3000);
});
var newMessageSetTimeoutName;

var getNewMessageNumber = function() {
  var elements = $('.newMessageDiv .newMessage');
  if(elements.length === 0) return 0;
  var number = Number(elements.eq(0).text());
  if(number > 0) return number;
  return 0;
};
var setNewMessageNumber = function(number) {
  var elements = $('.newMessageDiv .newMessage');
  if(elements.length === 0) return 0;
  elements.text(number);
};
var newMessageSetTimeOut = function() {
  var number = getNewMessageNumber();
  var elements = $('.newMessageDiv');
  var messagePoint = $('.newMessagePoint');
  if(number <= 0) {
    messagePoint.css('display', 'inline-none');
    elements.css('display', 'none');
    return;
  }
  messagePoint.css('display', 'inline-block');
  elements.css('display', 'inline-block');
  if(elements.length === 0)return;
  var visibility = elements.css('visibility');
  if(visibility === 'visible') {
    visibility = 'hidden';
  } else {
    visibility = 'visible';
  }
  elements.css('visibility', visibility);
  newMessageSetTimeoutName = setTimeout(function() {
    newMessageSetTimeOut();
  }, 500);
};

socket.on('message', function(data) {
  var ty = data.message.ty;
  if(ty === 'STE') {
    newMessageRemind('notice');
  } else if(ty === 'STU') {
    newMessageRemind('reminder');
  } else {
    newMessageRemind('message');
  }
});

function newMessageRemind(name) {
  if(pageName && pageName === 'message') return;
  beep(name);
  var number = getNewMessageNumber();
  setNewMessageNumber(number+1);
  clearTimeout(newMessageSetTimeoutName);
  newMessageSetTimeOut();
}

newMessageSetTimeOut();