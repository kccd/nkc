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
  var messageSwitch = $('.message-switch');
  var number = messageSwitch.html();
  number = Number(number);
  return number;
};
var setNewMessageNumber = function(number) {
  var messageSwitch = $('.message-switch');
  messageSwitch.removeClass("disabled").removeClass("hidden");
  $(".message-switch-div").removeClass("disabled");
  messageSwitch.html(number);
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
