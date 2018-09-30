var app;

var winWidth = $(window).width();

var xss = window.filterXSS;

var data = document.getElementById('data').innerText;

data = JSON.parse(data);

var targetUser = data.targetUser;

var timeout;
var mobile = winWidth < 1100;

var pageName = 'message';

if(mobile) {
  document.getElementsByTagName('body')[0].style.backgroundColor = '#ffffff';
}

$(function() {

  app = new Vue({
    el: '#app',
    data: {
      mobile: mobile,
      userList: [],
      target: '',
      targetUser: '',
      socketStatus: '',
      messages: [],
      sendFailedMessages: [],
      showEmoji: false,
      user: '',
      uploadInfo: '',
      twemoji: [],
      userInput: {},
      oldLastMessageId: '',
      showSettings: false,
      showSearch: false,
      searchText: '',
      searchUsers: [],
      beep: [],
      timeOut: '',
      contentBody: {
        scrollTo: 0,
        height: 0
      },
      info: '',
      canGetMessage: true,

      // 手机适应
      showMobileNavbar: true,
      showMobileList: true,
      showMobileSettings: false,

    },
    watch: {
      messages: function() {
        for(var i = 0; i < this.messages.length; i++) {
          var message = this.messages[i];

          message.canWithdrawn = (!message.withdrawn && !message.status && new Date(message.tc) > (Date.now() - 60*1000));

          if(message.ty === 'UTU' && !message.c.ty) {
            message.html = xss(message.c, {
              whiteList: {}
            });
            // 替换换行符
            message.html = message.html.replace(/\n/g, '<br/>');
            // 替换空格
            message.html = message.html.replace(/\s/g, '&nbsp;');
            // 替换表情
            message.html = message.html.replace(/\[f\/(.*?)]/g, function(r, v1) {
              return '<img class="message-emoji" src="/twemoji/2/svg/'+ v1 +'.svg"/>';
            });
            // 处理链接
            message.html = common.URLifyHTML(message.html);
          }

        }
      }
    },
    computed: {
      firstMessageId: function() {
        var id;
        for(var i = 0; i < this.messages.length; i++) {
          var message = this.messages[i];
          if(!message.status) {
            id = message._id;
            break;
          }
        }
        return id;
      },
      lastMessageId: function() {
        var id;
        for(var i = this.messages.length - 1; i >= 0; i--) {
          var message = this.messages[i];
          if(!message.status) {
            id = message._id;
            break;
          }
        }
        return id;
      },
      // 最新信息id 包含未发送成功的信息
      lastId: function() {
        var id;
        if(this.messages.length !== 0) {
          id = this.messages[this.messages.length - 1]._id;
        }
        return id;
      },
      socketInfo: function () {
        if(!this.socketStatus) {
          return {
            text: '暂未连接'
          }
        }
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
          'disconnect': {
            text: '连接已断开，请刷新',
            color: 'red'
          },
          'reconnecting': {
            text: '正在重新连接...',
            color: 'blue'
          },
          'reconnect_failed': {
            text: '重新连接失败，请刷新',
            color: 'red'
          },
          'connect_failed': { // 重新连接失败
            text: '连接失败，请刷新',
            color: 'red'
          },
          'notConnect': {
            text: '未连接',
            color: 'red'
          }
        }[this.socketStatus];
      },
    },

    methods: {

      format: format,

      // 手机
      openMobileList: function() {
        this.showMobileList = true;
        this.showMobileSettings = false;
      },
      openMobileSettings: function() {
        this.showMobileList = false;
        this.showMobileSettings = true;
      },

      // 信息框滚动到底部
      scrollToBottom: function() {
        var contentBody = this.$refs.content;
        // var contentBody = document.getElementsByClassName('ms-right-body')[0];
        if(contentBody) {
          contentBody.scrollTop = contentBody.scrollHeight + 10000;
        }
      },

      // 更新用户列表
      updateUserList: function(options) {
        var user = options.user;
        var message = options.message;
        var o = {
          'STE': 'notice',
          'STU': 'reminder'
        };
        if(message.ty !== 'UTU') {
          for(var i = 0; i < app.userList.length; i++) {
            var li = app.userList[i];
            if(li.type === message.ty) {
              li.message = message;
              li.time = message.tc;
              if(app.target === o[li.type]) {
                li.count = 0;
              } else {
                li.count ++;
              }
              app.userList.splice(i, 1);
              app.userList.unshift(li);
              break;
            }
          }
          return;
        }
        var li, index = -1;
        for(var i = 0; i < app.userList.length; i++) {
          var list = app.userList[i];
          if((message.s === app.user.uid && list.user && message.r === list.user.uid) ||
            (message.r === app.user.uid && list.user && message.s === list.user.uid)
          ){
            index = i;
            li = list;
            break;
          }
        }
        if(!li) {
          li = {
            type: 'UTU',
            count: 0,
            user: user
          }
        }
        li.message = message;
        li.time = message.tc;
        if(app.targetUser && app.targetUser.uid === li.user.uid) {
          li.count = 0;
        } else if(message.s === app.user.uid) {
          // 接收到自己在其他客户端所发送的信息
        } else {
          li.count ++;
        }
        if(index !== -1) {
          app.userList.splice(index, 1);
        }
        app.userList.unshift(li);
      },

      // 初始化数据
      initialization: function() {
        this.targetUser = '';
        this.target = '';
        this.messages = [];
        this.info = '';
        this.showEmoji = false;
        this.showSettings = false;
        this.showSearch = false;
        this.searchText = '';
        this.canGetMessage = true;
        this.searchUsers = [];
        this.showMobileNavbar = true;
        this.showMobileList = true;
      },

      // 获取聊天记录
      getMessage: function() {
        if(!app.canGetMessage) return Promise.reject();
        app.canGetMessage = false;
        app.info = '加载中~';
        var url;
        if(this.target === 'user') {
          url = '/message/user/' + this.targetUser.uid;
        } else if(this.target === 'notice') {
          url = '/message/systemInfo';
        } else {
          url = '/message/remind'
        }
        if(this.firstMessageId) {
          url += '?firstMessageId=' + this.firstMessageId
        }
        return nkcAPI(url, 'GET', {})
          .then(function(data) {
            if(data.messages.length === 0) {
              app.info = '没有了~';
              return Promise.reject();
            }
            app.info = '';
            app.messages = data.messages.concat(app.messages);
            app.canGetMessage = true;

            var contentBody = app.$refs.content;
            if(contentBody && app.target){
              contentBody.onscroll = function() {
                var scrollTop = this.scrollTop;
                if(scrollTop > 20) return;
                app.contentBody.scrollTo = contentBody.scrollTop;
                app.contentBody.height = contentBody.scrollHeight;
                app.getMessage()
                  .then(function() {
                    var height = contentBody.scrollHeight;
                    contentBody.scrollTop = height - app.contentBody.height;
                  })
                  .catch(function(){

                  })

              }
            }

            return Promise.resolve();
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
            app.canGetMessage = true;
          })
      },

      // 系统提醒类型
      extendReminder: function(message) {
        if(!message) return '';
        var c;
        switch(message.c.type) {
          case 'replyThread': c = '回复';break;
          case 'replyPost': c = '回复';break;
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
        return c;
      },

      // 从本地获取用户输入框信息
      getInputTextFromLocal: function() {
        var userInput = localStorage.userInput;
        try{
          userInput = JSON.parse(userInput);
          app.userInput = userInput;
        } catch(err) {
          app.userInput = {};
        }
      },
      // 报错用户输入框信息到本地
      saveUserInputToLocal: function() {
        var userInput = app.userInput;
        localStorage.userInput = JSON.stringify(userInput);
      },

      // 获取用户列表
      getUserList: function() {
        return new Promise(function(resolve, reject) {
          nkcAPI('/message?t=' + Date.now(), 'GET', {})
            .then(function(data) {
              app.userList = data.userList;
              app.user = data.user;
              app.twemoji = data.twemoji;
              var beep = data.user.generalSettings.messageSettings.beep;
              app.beep = [];
              for(var key in beep) {
                if(beep.hasOwnProperty(key) && beep[key]) {
                  app.beep.push(key);
                }
              }
              resolve();
            })
            .catch(function(data) {
              screenTopWarning(data.error || data);
            })

        });
      },

      // 保存设置
      saveMessageSettings: function() {
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
      },

      // 用户列表按时间排序
      computeUserListOrder: function() {
        var userList = [];
        for(var i = 0; i < app.userList.length; i++) {
          var o = app.userList[i];
          if(userList.length === 0) {
            userList.push(o);
            continue;
          }
          var inserted = false;
          for(var j = 0; j < userList.length; j++) {
            var m = userList[j];
            if(new Date(o.time).getTime() > new Date(m.time).getTime()) {
              userList.splice(j, 0, o);
              inserted = true;
              break;
            }
          }
          if(!inserted) {
            userList.push(o);
          }
        }
        app.userList = userList;
      },

      // 选择用户列表中的某个用户
      selectUser: function(item) {
        this.initialization();
        addHistory(item.type);
        if(item.type === 'UTU') {
          app.target = 'user';
          app.targetUser = item.user;
          this.getInputTextFromLocal();
          this.getMessage()
            .then(function() {
              item.count = 0;
              app.scrollToBottom();
            })
            .catch(function() {

            })
        } else if(item.type === 'STE') {
          app.target = 'notice';
          this.getMessage()
            .then(function() {
              item.count = 0;
              app.scrollToBottom();
            })
            .catch(function() {

            })
        } else {
          app.target = 'reminder';
          this.getMessage()
            .then(function() {
              item.count = 0;
              app.scrollToBottom();
            })
            .catch(function() {

            })
        }

      },

      // 选择表情
      selectExpression: function(tmj) {
        var inputText = app.userInput[app.targetUser.uid] || '';
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
          app.userInput[app.targetUser.uid] = inputText.replace(str, str2);
        } else {
          app.userInput[app.targetUser.uid] = emoji + (app.userInput[app.targetUser.uid] || '');
        }

        app.showEmoji = false;

      },

      // 上传数据
      uploadResourceData: function(message) {
        uploadFilePromise('/message/resource', message.formData, function(e) {
          // 上传百分比
          message.loaded = ((e.loaded/e.total)*100).toFixed(1);
          // 上传成功
          if(e.loaded === e.total) {
            message.loaded = '100';
          }
        })
          .then(function(data) {
            Vue.set(app.messages, app.messages.indexOf(message), data.messages[0]);
            app.updateUserList({
              user: app.targetUser,
              message: data.messages[0]
            });
            app.computeUserListOrder();
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
            message.status = 'failed';
          })
      },

      // 上传资源
      uploadResource: function(e, again) {
        var message;
        if(!again) {

          var files = e.target.files;
          if(files.length === 0) return;
          var targetUid = app.targetUser.uid;
          for(var i = 0; i < files.length; i++) {
            var file = files[i];
            if(file.size > 200*1024*1024) {
              app.uploadInfo = '文件大小不能超过200MB';
              return setTimeout(function() {
                app.uploadInfo = '';
              }, 3000)
            }
            var formData = new FormData();
            formData.append('targetUid', targetUid);
            formData.append('socketId', socket.id);
            formData.append('file', file);
            var localMessageId = Date.now() + Math.random();

            message = {
              _id: localMessageId,
              status: 'sending',
              loaded: '',
              ty: 'UTU',
              r: app.targetUser.uid,
              s: app.user.uid,
              vd: false,
              tc: new Date(),
              c: {
                ty: 'file',
                na: file.name,
                id: ''
              },
              formData: formData
            };

            app.messages.push(message);
            app.uploadResourceData(message);

          }

        } else {
          e.status = 'sending';
          e.loaded = '';
          e.tc = new Date();
          app.messages.splice(app.messages.indexOf(e), 1);
          app.messages.push(e);
          app.uploadResourceData(e);
        }

      },

      // 发送信息
      sendToUser: function(message) {
        var resend = !!message;
        var content;
        if(!message) {
          content = app.userInput[app.targetUser.uid];
          // content = content.replace(/\r\n/g,"");
          // content = content.replace(/\n/g,"");
          if(!content) return screenTopWarning('输入的内容不能为空');
          var localMessageId = Date.now();
          message = {
            _id: localMessageId,
            c: content,
            status: 'sending',
            s: this.user.uid,
            r: this.targetUser.uid,
            ty: 'UTU',
            vd: false,
            toc: new Date()
          };
        } else {
          content = message.c;
          message.status = 'sending';
          var index = app.messages.indexOf(message);
          Vue.set(app.messages, index, message);
        }
        nkcAPI('/message/user/' + app.targetUser.uid, 'POST', {
          content: content,
          socketId: socket.id
        })
          .then(function(data) {
            // 发送成功 标记信息为已发送
            var index = app.messages.indexOf(message);
            Vue.set(app.messages, index, data.message);
            app.updateUserList({
              user: app.targetUser,
              message: data.message
            });
            app.computeUserListOrder();
          })
          .catch(function(data) {
            // 发送失败 标记信息为发送失败 点击重发
            screenTopWarning(data.error || data);
            var index = app.messages.indexOf(message);
            app.messages[index].status = 'failed';
            Vue.set(app.messages, index, app.messages[index]);
          });

        // 不是重发 插入信息、清空输入框、将输入框的数据存入本地
        if(!resend) {
          app.messages.push(message);
          app.userInput[app.targetUser.uid] = '';
          app.saveUserInputToLocal();
        }
      },

      /*
      *    socket重新连接成功
      * 1. 保存所有未发送成功的信息
      * 2. 更新用户列表
      * 3. 更新与当前用户的聊天记录
      * 4. 清0当前用户在用户列表上的新信息条数
      * 5. 插入 1 所保存的未发送成功的信息
      * */
      connect: function() {
        app.getUserList()
          .then(function() {
            if(app.target) {
              var url = '/message/newMessages?target=' + app.target;
              if(app.target === 'user' && app.targetUser) {
                url += '&uid=' + app.targetUser.uid;
                if(app.lastMessageId) {
                  url += '&lastMessageId=' + app.lastMessageId;
                }
              }
              return nkcAPI(url, 'GET', {})
                .then(function(data) {
                  var messages = data.messages;
                  if(messages.length === 0) return;
                  var name = 'message';
                  if(messages[0].ty === 'STU') {
                    name = 'reminder';
                  } else if(messages[0].ty === 'STE') {
                    name = 'notice';
                  }
                  beep(name);
                  if(app.target === 'user' && data.target === 'user' && app.targetUser.uid === data.targetUser.uid) {
                    app.messages = app.messages.concat(messages);
                    nkcAPI('/message/mark', 'PATCH', {
                      type: 'user',
                      uid: app.targetUser.uid
                    })
                      .catch(function(data) {
                        screenTopWarning(data.error || data);
                      });
                  } else if(app.target === data.target) {
                    app.messages = app.messages.concat(messages);
                    nkcAPI('/message/mark', 'PATCH', {
                      type: app.target === 'notice'? 'systemInfo': 'remind'
                    })
                      .catch(function(data) {
                        screenTopWarning(data.error || data);
                      });
                  }
                });
            }
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })

        /*clearTimeout(timeout);
        this.sendFailedMessages = [];
        for(var i = 0; i < this.messages.length; i++) {
          var message = this.messages[i];
          if (message.status) {
            this.sendFailedMessages.push(message);
          }
        }
        this.messages = [];
        this.canGetMessage = true;
        var this_ = this;
        timeout = setTimeout(function(){
          this_.getUserList();
          if(!this_.target) return;
          this_.getMessage()
            .then(function() {
              // 清空当前用户的新信息条数
              for(var i = 0; i < this_.userList.length; i++) {
                var li = this_.userList[i];
                if(li.user && this_.targetUser && li.user.uid === this_.targetUser.uid) {
                  li.count = 0;
                }
              }
              // 插入未发送成功的信息
              this_.messages = this_.messages.concat(this_.sendFailedMessages);
            });
        }, 2000);*/
      },

      // 搜索用户
      searchUser: function() {
        if(!app.searchText) {
          return screenTopWarning('请输入用户名');
        }
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

      // 撤回信息
      withdrawn: function(message) {
        nkcAPI('/message/withdrawn', 'PATCH', {messageId: message._id})
          .then(function() {
            message.withdrawn = true;
            Vue.set(app.messages, app.messages.indexOf(message), message);
          })
          .catch(function(data) {
            Vue.set(app.messages, app.messages.indexOf(message), message);
            screenTopWarning(data.error || data);
          })
      }

    },
    beforeUpdate: function() {

    },
    updated: function() {
      if(app.oldLastMessageId !== app.lastId) {
        app.scrollToBottom();
        app.oldLastMessageId = app.lastId;
      }
    },

    mounted: function() {
      this.getUserList()
        .then(function() {
          if(targetUser) {
            app.selectUser({
              type: 'UTU',
              user: targetUser
            });
          }
        });
      if(socket) {
        if(socket.connected) {
          this.socketStatus = 'connect';
        } else if(socket.disconnected) {
          this.socketStatus = 'disconnect';
        }
      }

      var vm = this;
      socket.on('connect', function() {
        vm.socketStatus = 'connect';
      });
      socket.on('connecting', function() {
        vm.socketStatus = 'connecting';
      });
      socket.on('disconnect', function(reason) {
        vm.socketStatus = 'disconnect';
      });
      socket.on('reconnecting', function() {
        vm.socketStatus = 'reconnecting';
      });
      socket.on('reconnect', function() {
        app.connect();
        vm.socketStatus = 'connect';
      });
      socket.on('connect_failed', function() {
        vm.socketStatus = 'connect_failed';
      });
      socket.on('reconnect_failed', function() {
        vm.socketStatus = 'reconnect_failed';
      });
      socket.on('error', function(err) {
        console.log(err);
        vm.socketStatus = 'error';
      });
      socket.on('connect_timeout', function() {
        vm.socketStatus = 'connect_timeout';
      });



      socket.on('message', function(data) {

        var message = data.message;
        var user = data.user;
        var targetUser = data.targetUser;
        var ty = message.ty;

        if(ty === 'STE') {
          beep('notice');
          app.updateUserList({message: message});
          if(app.target === 'notice') {
            app.messages.push(message);
            nkcAPI('/message/mark', 'PATCH', {
              type: 'systemInfo'
            })
              .catch(function(data) {
                screenTopWarning(data.error || data);
              })
          }
        } else if(ty === 'STU') {
          beep('reminder');
          app.updateUserList({message: message});
          if(app.target === 'reminder') {
            app.messages.push(message);
            nkcAPI('/message/mark', 'PATCH', {
              type: 'remind'
            })
              .catch(function(data) {
                screenTopWarning(data.error || data);
              })
          }
        } else {

          var socketId = message.socketId;
          if(socketId === socket.id) return;

          // 插入数据
          if(app.target === 'user' && app.targetUser) {
            if(app.targetUser.uid === user.uid) {
              nkcAPI('/message/mark', 'PATCH', {
                type: 'user',
                uid: app.targetUser.uid
              })
                .catch(function(data) {
                  screenTopWarning(data.error || data);
                });
              app.messages.push(message);
            } else if(app.targetUser.uid === targetUser.uid) {
              app.messages.push(message);
            }
          }

          if(user.uid !== app.user.uid) {
            beep('message');
          } else {
            user = targetUser;
          }

          // 更新用户列表
          app.updateUserList({
            user: user,
            message: message
          });

        }


      });

      socket.on('userDisconnect', function(data) {
        var uid = data.targetUid;
        for(var i = 0; i < app.userList.length; i++) {
          var li = app.userList[i];
          if(li.user && li.user.uid === uid) {
            li.user.online = false;
          }
        }
      });
      socket.on('userConnect', function(data) {
        var uid = data.targetUid;
        for(var i = 0; i < app.userList.length; i++) {
          var li = app.userList[i];
          if(li.user && li.user.uid === uid) {
            li.user.online = true;
          }
        }
      });

      socket.on('withdrawn', function(data) {
        var messageId = data.messageId;
        if(app.targetUser && (data.uid === app.targetUser.uid || data.uid === app.user.uid)) {
          for(var i = 0; i < app.messages.length; i++){
            var message = app.messages[i];
            if(message._id === messageId) {
              message.withdrawn = true;
              message.c = '';
              break;
            }
          }
        }
        for(var i = 0; i < app.userList.length; i++) {
          var li = app.userList[i];
          if(li.message && li.message._id === messageId) {
            li.message.withdrawn = true;
            li.message.c = '';
            break;
          }
        }
      });
    }
  })
});


function addHistory(type) {
  if(app.mobile) {
    if(window.location.href.indexOf('#') === -1) {
      window.history.pushState({}, 'page', window.location.href + '#' + type);
    }
  }
}
window.onpopstate = function(e) {
  if(app.mobile) {
    app.initialization();
  }
};
