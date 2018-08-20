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
      contentType: '',
      systemInfo: [data.systemInfo],
      newSystemInfoCount: data.newSystemInfoCount,
      newRemindCount: 0,
      remind: [],
    },
    computed: {
      latestSystemInfo: function() {
        if(this.systemInfo.length !== 0) {
          var systemInfo = this.systemInfo[0];
          return {
            tc: format('MM/DD HH:mm', systemInfo.tc),
            c: systemInfo.c
          };
        } else {
          return {
            tc: '',
            c: '暂无系统通知'
          };
        }
      },
      lastSystemInfoId: function() {
        if(this.systemInfo.length !== 0) {
          return this.systemInfo[this.systemInfo.length - 1]._id;
        } else {
          return ''
        }
      },
      lastRemindId: function() {
        if(this.remind.length !== 0) {
          return this.remind[this.remind.length - 1]._id;
        } else {
          return ''
        }
      },
      latestRemind: function() {
        if(this.remind.length !== 0) {
          var remind = this.remind[0];
          return {
            tc: format('MM/DD HH:mm', remind.tc),
            c: remind.c
          }
        } else {
          return {
            tc: '',
            c: '暂无系统提醒'
          };
        }
      }
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
        app.loadingText = '加载更多';
        app.contentType = 'message';
        if(app.targetUid === uid) return;
        app.targetUid = uid;
        app.messages = [];
        var url = '/message/user/' + app.targetUid;
        nkcAPI(url, 'GET', {})
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
        nkcAPI('/message/user/' + app.targetUid, 'POST', {
          content: app.userInput[app.targetUid],
          tc: tc
        })
          .then(function(data) {
            screenTopAlert('发送成功');
            sendMessage(data.newMessage);
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
      getMessage: getMessage,
      openNotice: function() {
        app.targetUid = '';
        app.targetUser = '';
        app.loadingText = '加载更多';
        app.contentType = 'notice';
        app.newSystemInfoCount = 0;
        getSystemInfo();
      },
      openRemind: function() {
        app.targetUid = '';
        app.targetUser = '';
        app.loadingText = '加载更多';
        app.contentType = 'remind';
        app.newRemindCount = 0;
        getRemind();
      },
      getSystemInfo: getSystemInfo,
      getRemind: getRemind
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
      socket.on('systemInfo', function(data) {
        playBeep('msg');
        app.newSystemInfoCount += 1;
        app.systemInfo.unshift(data);
      });
      socket.on('remind', function(data) {
        playBeep('msg');
        app.newRemindCount += 1;
        app.remind.unshift(data);
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
function getSystemInfo() {
  loadingText = '加载中~';
  var url = '/message/systemInfo';
  if(app.lastSystemInfoId) {
    url += '?lastSystemInfoId=' + app.lastSystemInfoId;
  }
  nkcAPI(url, 'GET', {})
    .then(function(data) {
      if(data.systemInfo.length === 0) {
        app.loadingText = '没有了~';
      } else {
        if(app.systemInfo.length === 0) {
          app.systemInfo = data.systemInfo;
        } else {
          app.systemInfo = app.systemInfo.concat(data.systemInfo);
        }
        loadingText = '加载更多';
      }
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
      loadingText = '加载更多';
    })
}

function getRemind() {
  loadingText = '加载中~';
  var url = '/message/remind';
  if(app.lastRemindId) {
    url += '?lastRemindId=' + app.lastRemindId;
  }
  nkcAPI(url, 'GET', {})
    .then(function(data) {
      if(data.remind.length === 0) {
        app.loadingText = '没有了~';
      } else {
        if(app.remind.length === 0) {
          app.remind = data.remind;
        } else {
          app.remind = app.remind.concat(data.remind);
        }
        loadingText = '加载更多';
      }
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
      loadingText = '加载更多';
    })
}

function getMessage() {
  if(!app.canGetMessage) return;
  app.canGetMessage = false;
  app.loadingText = '拼命加载中~';
  var url = '/message/user/' + app.targetUid;
  if(app.lastMessageId) {
    url += '?lastMessageId=' + app.lastMessageId;
  }
  nkcAPI(url, 'GET', {})
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
      app.loadingText = '加载更多';
    });
}