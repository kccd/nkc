var app;
var n = 1;
var pageName = 'message';
var winWidth = $(window).width();
// 1110;
var xss = window.filterXSS;
var data = document.getElementById('data').innerText;
data = JSON.parse(data);
var targetUid = data.targetUid;
var PS;
$(function() {

  app = new Vue({
    el: '#app',
    data: {
      userList: [],
      targetUid: '',
      targetUser: ''
    }
  });
  app1 = new Vue({
    el: '#app1',
    data: {
      showSettings: false,
      mobile: winWidth < 1110,
      uidList: [],
      error: '',
      val: '',
      targetUid: '',
      uploadInfo: '',
      userList: [],
      showEmoji: false,
      messages: [],
      user: '',
      targetUser: '',
      searchUsers: [],
      searchText: '',
      lastMessageId: '',
      latestMessageId: '',
      loadingText: '点击加载更多',
      canGetMessage: true,
      userInput: {},
      contentType: '',
      systemInfo: [],
      newSystemInfoCount: 0,
      newRemindCount: 0,
      remind: [],
      socketStatus: 'notConnect',
      beep: [],
      twemoji: [],
      showMobileNavbar: true,
      showMobileList: true,
      showMobileMessages: false,
      showMobileNotice: false,
      showMobileReminder: false,
      showMobileSettings: false
      /*
      * 0: 未连接,
      * 1: 正在连接,
      * 2: 连接成功,
      * 3: 断开连接,
      * 4: 正在重新连接,
      * 5: 重新连接成功,
      * 6: 重新连接失败,
      * 7: 连接失败
      * */
    },
    computed: {
      hide: function() {
        return this.socketStatus === 'connect';
      },
      socketInfo: function() {
        return {
          'connect_timeout': {
            text: '连接超时，请刷新',
            color: 'red'
          },
          'error': {
            text: '连接失败，请刷新',
            color: 'red'
          },
          'connecting': {
            text: '正在连接...',
            color: 'blue'
          },
          'connect': {
            text: '已连接',
            color: 'green'
          },
          'disconnect':{
            text: '连接已断开，您将不能实时接收信息，请刷新',
            color: 'red'
          },
          'reconnecting': {
            text: '正在重新连接...',
            color: 'blue'
          },
          'reconnect_failed': {
            text: '重新连接失败，您将不能实时接收信息，请刷新',
            color: 'red'
          },
          'connect_failed': { // 重新连接失败
            text: '连接失败，您将不能实时接收信息，请刷新',
            color: 'red'
          },
          'notConnect': {
            text: '未连接',
            color: 'red'
          }
        }[this.socketStatus];
      },
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
          var c = '';
          switch(remind.ty) {
            case 'replyThread': c = '回复';break;
            case 'digestPost': c = '回复被设置精华';break;
            case 'digestThread': c = '文章被设置精华';break;
            case 'bannedThread': c = '文章被删除';break;
            case 'threadWasReturned': c = '文章被退回';break;
            case 'bannedPost': c = '回复被删除';break;
            case 'postWasReturned': c = '回复被退回';break;
            case 'recommend': c = '点赞'; break;
            case '@': c = '@';break;
            default: c = '';
          }
          return {
            tc: format('MM/DD HH:mm', remind.tc),
            c: c
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
      messages: function() {
        for(var i = 0; i < this.messages.length; i++) {
          var message = this.messages[i];
          if(message.ty === 'UTU' && !message.c.ty) {
            message.html = xss(message.c, {
              whiteList: {}
            });
            message.html = message.html.replace(/\[f\/(.*?)]/g, function(r, v1) {
              return '<img class="message-emoji" src="/twemoji/2/svg/'+ v1 +'.svg"/>';
            });
            /*message.html = xss(message.html, {
              whiteList: {
                img: ['src', 'class']
              }
            });*/
          }
        }
      }
    },
    methods: {
      uploadResource: uploadResource,
      fromNow: fromNow,
      format: format,
      selectUser: selectUser,
      sendToUser: function() {
        app.userInput[app.targetUid]=app.userInput[app.targetUid].replace(/\r\n/g,"");
        app.userInput[app.targetUid]=app.userInput[app.targetUid].replace(/\n/g,"");
        if(!app.userInput[app.targetUid]) return screenTopWarning('输入的内容不能为空');
        nkcAPI('/message/user/' + app.targetUid, 'POST', {
          content: app.userInput[app.targetUid],
        })
          .then(function(data) {
            screenTopAlert('发送成功');
            sendMessage(data.newMessage);
            app.userInput[app.targetUid] = '';
            computUserListOrder();
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
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
      closeMessages: closeMessages,
      saveMessageSettings: saveMessageSettings,
      selectExpression: selectExpression,
      openNotice: function() {
        app.targetUid = '';
        app.targetUser = '';
        app.showEmoji = false;
        app.loadingText = '点击加载更多';
        app.contentType = 'notice';
        app.newSystemInfoCount = 0;
        app.showMobileMessages = true;
        addHistory("notice");
        getSystemInfo();
      },
      openRemind: function() {
        app.targetUid = '';
        app.targetUser = '';
        app.showEmoji = false;
        app.loadingText = '点击加载更多';
        app.contentType = 'remind';
        app.newRemindCount = 0;
        app.showMobileMessages = true;
        addHistory("reminder");
        getRemind();
      },
      getSystemInfo: getSystemInfo,
      getRemind: getRemind,
      openMobileList: openMobileList,
      openMobileSettings: openMobileSettings
    },
    updated: function() {
      var newId = this.messages.length > 0? this.messages[this.messages.length - 1]._id: '';
      var oldId = this.latestMessageId;
      if(newId !== oldId) {
        scrollToBottom();
        this.latestMessageId = newId;
      }
      /*var imageDiv = document.getElementsByClassName('ms-single-content-image');
      for(var i = 0; i < imageDiv.length; i++) {
        var el = imageDiv[i];
        el.getElementsByTagName('img')[0].onclick = function() {
          PS = initPhotoSwipe(this.getAttribute('src'));
        }
      }*/
    },
    mounted: function() {
      mounted(this);
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
    obj = {
      user: user,
      latestMessage: data.message,
      newMessageCount: 0
    };
    app.userList.unshift(obj);
    app.uidList.unshift(user.uid);
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
      latestMessage: data,
      newMessageCount: 0
    });
    app.uidList.unshift(app.targetUser.uid);
  }
  app.messages.push(data);
}

function scrollToBottom() {
  var contentBody = document.getElementsByClassName('contentBody')[0];
  if(contentBody) {
    contentBody.scrollTop = contentBody.scrollHeight + 10000;
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
        loadingText = '点击加载更多';
      }
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
      loadingText = '点击加载更多';
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
        loadingText = '点击加载更多';
      }
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
      loadingText = '点击加载更多';
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
      app.loadingText = '点击加载更多';
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
      app.canGetMessage = true;
      app.loadingText = '点击加载更多';
    });
}

function selectUser(uid) {
  addHistory("message");
  app.canGetMessage = true;
  app.showMobileMessages = true;
  app.loadingText = '点击加载更多';
  app.contentType = 'message';
  app.showEmoji = false;
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
        app.userList[i].user = data.targetUser;
      }

    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
}


function mounted(app) {
  loadBasicData();
  if(socket) {
    if(socket.connected) {
      app.socketStatus = 'connect';
    } else if(socket.disconnected) {
      app.socketStatus = 'disconnect';
    }
  }
  socket.on('connect', function() {
    app.socketStatus = 'connect';
  });
  socket.on('connecting', function() {
    app.socketStatus = 'connecting';
  });
  socket.on('disconnect', function() {
    app.socketStatus = 'disconnect';
  });
  socket.on('reconnecting', function() {
    app.socketStatus = 'reconnecting';
  });
  socket.on('reconnect', function() {
    app.socketStatus = 'connect';
  });
  socket.on('connect_failed', function() {
    app.socketStatus = 'connect_failed';
  });
  socket.on('reconnect_failed', function() {
    app.socketStatus = 'reconnect_failed';
  });
  socket.on('error', function(err) {
    console.log(err);
    app.socketStatus = 'error';
  });
  socket.on('connect_timeout', function() {
    app.socketStatus = 'connect_timeout';
  });



  socket.on('message', function(data) {

    var message = data.message;
    var user = data.user;

    var ty = message.ty;

    if(ty === 'STE') {
      beep('notice');
      app.newSystemInfoCount += 1;
      app.systemInfo.unshift(message);
      if(app.showMobileNotice || app.contentType === 'notice') {
        nkcAPI('/message/mark', 'PATCH', {
          type: 'systemInfo'
        })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      }
    } else if(ty === 'STU') {
      beep('reminder');
      app.newRemindCount += 1;
      app.remind.unshift(message);
      if(app.showMobileReminder || app.contentType === 'remind') {
        nkcAPI('/message/mark', 'PATCH', {
          type: 'remind'
        })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      }
    } else {
      beep('message');
      receiveMessage({
        fromUser: user,
        message: message
      });
      computUserListOrder();
      if(app.targetUser) {
        nkcAPI('/message/mark', 'PATCH', {
          type: 'user',
          uid: app.targetUser.uid
        })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      }
    }


  });

  socket.on('userDisconnect', function(data) {
    var uid = data.targetUid;
    var index = app.uidList.indexOf(uid);
    if(index !== -1) {
      app.userList[index].user.online = false;
    }

  });
  socket.on('userConnect', function(data) {
    var uid = data.targetUid;
    var index = app.uidList.indexOf(uid);
    if(index !== -1) {
      app.userList[index].user.online = true;
    }
  });
  socket.on('systemInfo', function(data) {
    beep('notice');
    app.newSystemInfoCount += 1;
    app.systemInfo.unshift(data);
    if(app.showMobileNotice || app.contentType === 'notice') {
      nkcAPI('/message/mark', 'PATCH', {
        type: 'systemInfo'
      })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  });
  socket.on('remind', function(data) {
    beep('reminder');
    app.newRemindCount += 1;
    app.remind.unshift(data);
    if(app.showMobileReminder || app.contentType === 'remind') {
      nkcAPI('/message/mark', 'PATCH', {
        type: 'remind'
      })
        .catch(function(data) {
          screenTopWarning(data.error || data);
        })
    }
  });
}

function loadBasicData() {
  nkcAPI('/message', 'GET', {})
    .then(function(data) {

      app.showMobileNavbar = true;
      app.showMobileList = true;
      app.showMobileMessages = false;
      app.showMobileNotice = false;
      app.showMobileReminder = false;
      app.showMobileSettings = false;

      app.showSettings = false;
      app.showEmoji = false;
      app.targetUid = '';
      app.messages = [];
      app.uploadInfo = '';
      app.uploadInfo = '';
      app.targetUser = '';
      app.lastMessageId = '';
      app.latestMessageId = '';
      app.canGetMessage = true;
      app.contentType = '';
      app.twemoji = data.twemoji;

      var beep = data.user.generalSettings.messageSettings.beep;
      app.beep = [];
      for(var key in beep) {
        if(beep.hasOwnProperty(key) && beep[key]) {
          app.beep.push(key);
        }
      }

      app.uidList = data.uidList;
      app.userList = data.userList;
      app.user = data.user;
      app.systemInfo = data.systemInfo;
      app.newSystemInfoCount = data.newSystemInfoCount;
      app.newRemindCount = data.newRemindCount;
      app.remind = data.remind;

      if(targetUid) {
        selectUser(targetUid);
      }
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })
}

function saveMessageSettings() {
  var beep = {
    usersMessage: false,
    systemInfo: false,
    reminder: false
  };
  for(var i = 0; i < app.beep.length; i++) {
    beep[app.beep[i]] = true;
  }
  nkcAPI('/message/settings', 'PATCH', {beep: beep})
    .then(function() {
      updateBeep(beep);
      screenTopAlert('保存成功');
    })
    .catch(function(data) {
      screenTopWarning(data.error || data);
    })


}

function uploadResource(e) {
  var files = e.target.files;
  var formData = new FormData();
  var targetUid = app.targetUser.uid;
  formData.append('targetUid', targetUid);
  var size = 0;
  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    size += file.size;
    formData.append('file', file);
  }
  if(files.length === 0) return;
  if(size > 200*1024*1024) {
    app.uploadInfo = '文件大小不能超过200MB';
    return setTimeout(function() {
      app.uploadInfo = '';
    }, 3000)
  }
  updateFilePromise('/message/resource', formData, function(e) {
    var num = ((e.loaded/e.total)*100).toFixed(2);
    app.uploadInfo = '文件上传中 ' + num + '%';
    if(e.loaded === e.total) {
      app.uploadInfo = '发送成功';
      setTimeout(function() {
        app.uploadInfo = '';
      }, 2000)
    }
  })
    .then(function(data) {
      if(app.targetUser.uid === data.targetUser.uid) {
        app.messages = app.messages.concat(data.messages);
      }
    })
    .catch(function(data) {
      app.uploadInfo = data.error || data || '发送失败';
      setTimeout(function() {
        app.uploadInfo = '';
      }, 3000)
    })
}


function closeMessages() {
  app.targetUser = '';
  app.targetUid = '';
  app.contentType = '';
  app.showMobileMessages = false;
  // window.history.replaceState({}, 'message', window.location.href.replace(/#.*/, ''))
}
function openMobileList() {
  app.showMobileList = true;
  app.showMobileSettings = false;
}
function openMobileSettings() {
  app.showMobileSettings = true;
  app.showMobileList = false;
}
function selectExpression(tmj) {
  var inputText = app.userInput[app.targetUid] || '';
  var e = app.$refs.input;
  // console.log(textarea.selectionStart);
  var index;
  if (e.selectionStart) {
    index = e.selectionStart;
  } else if (document.selection) {
    e.focus();
    var r = document.selection.createRange();
    var sr = r.duplicate();
    sr.moveToElementText(e);
    sr.setEndPoint('EndToEnd', r);
    index = sr.text.length - r.text.length;
  }
  var emoji = '[f/' + tmj + ']';
  if(index > 1) {
    var str = inputText.substring(0, index);
    var str2 = str + emoji;
    app.userInput[app.targetUid] = inputText.replace(str, str2);
  } else {
    app.userInput[app.targetUid] = emoji + (app.userInput[app.targetUid] || '');
  }

  app.showEmoji = false;
}
// window.onbeforeunload = function(){
//   if(confirm("确定关闭页面?")){
//     return true;
//   }
//   else{
//     return false;
//   }
// }


function addHistory(type) {
  if(app.mobile) {
    if(window.location.href.indexOf('#') === -1) {
      window.history.pushState({}, 'page', window.location.href + '#' + type);
    }
  }
}
window.onpopstate = function(e) {
  if(app.mobile) {
    if(PS) {
      PS.close();
    }
    closeMessages();
  }
};
