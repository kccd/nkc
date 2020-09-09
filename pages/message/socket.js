var pageName = '';
var socket = io('/common', {
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
