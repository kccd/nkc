var app;
var n = 1;
$(function() {
  var data = JSON.parse(document.getElementById('data').innerText);
  app = new Vue({
    el: '#app',
    data: {
      uidList: data.uidList,
      error: '',
      val: '',
      targetUid: '',
      userList: data.userList,
      messages: [],
      user: data.user,
      targetUser: '',
      searchUsers: [],
      searchText: '',
      lastMessageId: '',
      latestMessageId: '',
      loadingText: '加载更多',
      canGetMessage: true,
      userInput: {},
      contentType: ''
    },
    watch: {
      searchText: function() {
        app.searchUsers = [];
      },
    },
    methods: {
      fromNow: fromNow,
      format: format,
      selectUser: function(uid) {
        if(app.targetUid === uid) return;
        app.targetUid = uid;
        app.messages = [];
        socket.kcEmit('getMessage', {
          ty: 'UTU',
          id: app.targetUid,
        })
          .then(function(data) {
            if(data.messages.length === 0) {
              app.loadingText = '没有了~';
              app.canGetMessage = false;
              app.lastMessageId = '';
            } else {
              app.lastMessageId = data.messages[0]._id;
            }
            app.messages = data.messages;
            app.targetUser = data.targetUser;
            app.contentType = 'message';

            for(var i = 0; i < app.userList.length; i++) {
              if(app.userList[i].user.uid !== app.targetUid) continue;
              app.userList[i].newMessageCount = 0;
            }

          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      },
      sendToUser: function() {
        app.userInput[app.targetUid]=app.userInput[app.targetUid].replace(/\r\n/g,"");
        app.userInput[app.targetUid]=app.userInput[app.targetUid].replace(/\n/g,"");
        if(!app.userInput[app.targetUid]) return screenTopWarning('输入的内容不能为空');
        var tc = new Date();
        socket.kcEmit('UTU', {
          targetUid: app.targetUid,
          content: app.userInput[app.targetUid],
          tc: tc
        })
          .then(function(data) {
            screenTopAlert('发送成功');
            sendMessage(data);
            app.userInput[app.targetUid] = '';
            computUserListOrder();
          })
          .catch(function(data) {
            screenTopWarning(data);
          })
      },
      search: function() {
        if(!app.searchText) {
          return screenTopWarning('请输入用户名');
        }
        var obj = {
          uid: app.searchText,
          username: app.searchText
        };
        var url = '/u?username=' + app.searchText + '&uid=' + app.searchText;
        nkcAPI(url, 'GET', {})
          .then(function(data) {
            var searchUsers = [];
            for(var i = 0; i < data.targetUsers.length; i++) {
              var targetUser = data.targetUsers[i];
              if(targetUser.uid !== app.user.uid) {
                searchUsers.push(targetUser);
              }
            }
            app.searchUsers = searchUsers;
            if(searchUsers.length === 0) screenTopWarning('未找到相关用户');
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      },
      getMessage: function() {
        if(!app.canGetMessage) return;
        app.canGetMessage = false;
        app.loadingText = '拼命加载中~';
        socket.kcEmit('getMessage', {
          ty: 'UTU',
          id: app.targetUid,
          lastMessageId: app.lastMessageId
        })
          .then(function(data) {
            if(data.messages.length === 0) {
              return app.loadingText = '没有了~';
            }
            app.lastMessageId = data.messages[0]._id;
            app.messages = data.messages.concat(app.messages);
            app.targetUser = data.targetUser;
            app.canGetMessage = true;
            app.loadingText = '加载更多';
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
            app.canGetMessage = true;
          })
      },
      openNotice: function() {
        app.contentType = 'notice';
      },
      openRemind: function() {
        app.contentType = 'remind';
      }
    },
    updated: function() {
      var newId = this.messages.length > 0? this.messages[this.messages.length - 1]._id: '';
      var oldId = this.latestMessageId;
      if(newId !== oldId) {
        scrollToBottom();
        this.latestMessageId = newId;
      }
    },
    created: function() {
      socket.on('UTU', function(data) {
        playBeep('msg');
        receiveMessage(data);
        computUserListOrder();
      });

      socket.on('logout', function(data) {
        var uid = data.targetUid;
        var index = app.uidList.indexOf(uid);
        if(index !== -1) {
          app.userList[index].user.online = false;
        }
      });
      socket.on('login', function(data) {
        var uid = data.targetUid;
        var index = app.uidList.indexOf(uid);
        if(index !== -1) {
          app.userList[index].user.online = true;
        }
      });
    }
  })
});


function receiveMessage(data) {
  var user = data.fromUser;
  var obj;
  for(var i = 0; i < app.userList.length; i++) {
    if(app.userList[i].user.uid !== user.uid) continue;
    obj = app.userList[i];
  }

  if(obj) {
    obj.latestMessage = data.message;
  } else {
    app.userList.unshift({
      user: user,
      latestMessage: data.message
    })
  }
  if(user.uid === app.targetUid) {
    app.messages.push(data.message);
  } else {
    obj.newMessageCount++;
  }
}

function sendMessage(data) {
  var obj;
  for(var i = 0; i < app.userList.length; i++) {
    if(app.userList[i].user.uid !== app.targetUser.uid) continue;
    obj = app.userList[i];
  }
  if(obj) {
    obj.latestMessage = data;
  } else {
    app.userList.unshift({
      user: app.targetUser,
      latestMessage: data
    })
  }
  app.messages.push(data);
}

function scrollToBottom() {
  var contentBody = document.getElementById('contentBody');
  if(contentBody) {
    contentBody.scrollTop = contentBody.scrollHeight;
  }
}

function computUserListOrder() {
  var userListArr = [];
  var userListTocArr = [];
  app.uidList = [];
  for(var i = 0; i < app.userList.length; i++) {
    var list = app.userList[i];
    var tc = new Date(list.latestMessage.tc).getTime();
    if(userListTocArr.length === 0) {
      userListTocArr.push(tc);
      userListArr.push(list);
      app.uidList.push(list.user.uid);
      continue;
    }
    var insert = false;
    var length = userListTocArr.length;
    for(var j = 0; j < length; j++) {
      var toc = userListTocArr[j];
      if(tc < toc) continue;
      userListTocArr.splice(j, 0, tc);
      userListArr.splice(j, 0, list);
      app.uidList.splice(j, 0, list.user.uid);
      insert = true;
      break;
    }
    if(!insert) {
      userListTocArr.push(tc);
      userListArr.push(list);
      app.uidList.push(list.user.uid);
    }
  }
  app.userList = userListArr;
}