var pageName = '';
var socketConfig = $('#socketConfig').text();
socketConfig = JSON.parse(socketConfig);
var url;
if(socketConfig.useHttps) {
  url = 'https://' + window.location.hostname + ':' + socketConfig.httpsPort;
} else {
  url = 'http://' + window.location.hostname + ':' + socketConfig.httpPort;
}
var socket = io(url, {
  forceNew: false,
  reconnection: true,
  autoConnect: true,
  transports: ['polling', 'websocket'],
  reconnectionDelay: 3000,
  reconnectionDelayMax: 5000
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
  var messageNum = $('.bink');
  var messagePoint = $('.newMessagePoint');
  if(number <= 0) {
    messagePoint.css('display', 'inline-none');
    elements.css('display', 'none');
    return;
  }
  messagePoint.css('display', 'inline-block');
  elements.css('display', 'inline-block');
  if(messageNum.length === 0)return;
  var color = messageNum.css('color');
  if(color === 'rgba(0, 0, 0, 0)') {
    color = '#e99';
  } else {
    color = 'rgba(0,0,0,0)';
  }
  messageNum.css('color', color);
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
  clearTimeout(newMessageSetTimeoutName);
  newMessageSetTimeOut();
}

newMessageSetTimeOut();