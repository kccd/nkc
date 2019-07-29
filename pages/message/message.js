var app;

var winWidth = $(window).width();

var xss = window.filterXSS;

var data = document.getElementById('data').innerText;
var templates = NKC.methods.getDataById("templatesData").templates;


data = JSON.parse(data);

var targetUser = data.targetUser;

var grades = data.grades;
var messageSettings = data.messageSettings;
var userDigestThreadCount = data.userDigestThreadCount;
var timeout;

var mobile = winWidth < 1100;

var pageName = 'message';

if(mobile) {
  $("body").css("background-color", "#ffffff");
}

$(function() {

  app = new Vue({
    el: '#app',
    data: {
      voiceHisIndex: '',
      locationData: '',
      mobile: mobile,
      userList: [],
      target: '',
      targetUser: '',
      messageSettings: messageSettings,
      userDigestThreadCount: userDigestThreadCount,
      systemInfoViewed: false,
      targetUserSendLimit: "",
      targetUserGrade: "",
      selectedUserListItem: "",
      socketStatus: '',
      messages: [],
      blackListUid: [],
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
      friends: [],
      categories: [],
      beep: [],
      timeOut: '',
      contentBody: {
        scrollTo: 0,
        height: 0
      },
      info: '',
      canGetMessage: true,
      listType: 'messages',// messages, friends, categories
      friend: '',
      category: '',
      editCategory: false,

      showFriendNotes: false,
      showPermissionSettings: false,
      friendImageProgress: '',
      onlyReceiveFromFriends: false,

      // 手机适应
      showMobileNavbar: true,
      showMobileList: true,
      showMobileSettings: false,
      showMobileContacts: false,
      showMobileGroups: false,
      voiceImg: {
        playRight: "/default/playRight.gif",
        playLeft: "/default/playLeft.gif",
        stopRight: "/default/stopRight.png",
        stopLeft: "/default/stopLeft.png"
      },

      messageTypes: templates,
      messageLimit: {
        timeLimit: false,
        xsfLimit: false,
        digestLimit: false,
        gradeLimit: 0
      },
      grades: grades

    },
    beforeCreate: function() {
      var templatesDom = $(".templates-dom");
      var mobileTemplatesDom = $(".mobile-templates-dom");
      for(var i = 0; i < templates.length; i++) {
        var messageType = templates[i];

        // 电脑屏幕
        var typeDiv = $("<div v-if='target === \""+ messageType._id +"\"'></div>");
        var typeBody = $("<div style='height: 100%'></div>");
        typeBody.append($("<div class='ms-header'>"+messageType.name+"</div>"));
        var templateBody = $("<div class='ms-notice' ref='content'></div>");
        var templateTran = $("<transition name='fade'><div class='ms-loading-info'>{{info}}</div></transition>");
        templateBody.append(templateTran.clone());
        var templateBodyContent = $("<div class='ms-notice-body' v-for='item in messages'><div class='ms-notice-time'>{{format('YYYY/MM/DD HH:mm:ss', item.tc)}}</div></div>");
        var content = $("<div class='ms-notice-content'></div>");

        // 手机屏幕
        var mobileMessageBody = $("<div class='mobile-messages-body' v-if='target === \""+messageType._id+"\"' ref='content'>" +
          "<div class='noSelectUser' v-if='messages.length === 0'><div class='fa' style='font-size:1.5rem;'>暂无消息</div></div>" +
        "</div>");
        var mobileMessageBodyDiv = $("<div v-else style='padding: 1rem;'></div>");

        for(var j = 0; j < messageType.templates.length; j++) {
          var template = messageType.templates[j];
          var type = template.type;
          var dom = template.dom;
          var div = $("<div v-if='item.c.type === \""+ type +"\"'>"+dom+"</div>");
          content.append(div);
        }

        templateBodyContent.append(content);
        templateBody.append(templateBodyContent.clone());
        typeBody.append(templateBody);
        typeDiv.append(typeBody);
        templatesDom.append(typeDiv);


        mobileMessageBodyDiv.append(templateTran);
        mobileMessageBodyDiv.append(templateBodyContent);
        mobileMessageBody.append(mobileMessageBodyDiv);
        mobileTemplatesDom.append(mobileMessageBody);

      }
    },
    watch: {
      messages: function() {
        for(var i = 0; i < this.messages.length; i++) {
          var message = this.messages[i];

          message.canWithdrawn = (!message.withdrawn && !message.status && new Date(message.tc) > (Date.now() - 60*1000));

          if((message.ty === 'UTU' || message.ty === "STE") && !message.c.ty) {
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
      showCustomizeLimitInfo: function() {
        if(this.systemInfoViewed) return;
        var targetUser = this.targetUser;
        var targetUserSendLimit = this.targetUserSendLimit;
        var targetUserGrade = this.targetUserGrade;

        if(!targetUser || !targetUserGrade) return;
        var isFriend = false;
        for(var i = 0; i < this.friends.length; i++) {
          if(this.friends[i].tUid === targetUser.uid) {
            isFriend = true;
            break;
          }
        }
        if(isFriend) return;
        if(!targetUserSendLimit.status) return;
        if(
          (targetUserSendLimit.timeLimit && new Date(this.user.toc).getTime() > Date.now() - 30*24*60*60*1000) ||
          (targetUserSendLimit.digestLimit && this.userDigestThreadCount === 0) ||
          (targetUserSendLimit.xsfLimit && this.user.xsf <= 0) ||
          (targetUserSendLimit.gradeLimit > this.user.grade._id)
        ) return true;
      },
      showSystemLimitInfo: function() {
        if(this.systemInfoViewed) return;
        var targetUser = this.targetUser;
        var targetUserSendLimit = this.targetUserSendLimit;
        var targetUserGrade = this.targetUserGrade;
        var messageSettings = this.messageSettings;
        if(!targetUser || !targetUserGrade) return;
        var isFriend = false;
        for(var i = 0; i < this.friends.length; i++) {
          if(this.friends[i].tUid === targetUser.uid) {
            isFriend = true;
            break;
          }
        }
        if(isFriend) return;
        if(targetUserSendLimit.status) return;
        if(
          messageSettings.gradeLimit.indexOf(this.user.grade._id) !== -1 &&
          messageSettings.gradeProtect.indexOf(targetUserGrade._id) !== -1
        ) return true;
      },
      friendsByOrder: function() {
        var str = '0123456789abcdefghijklmnopqrstuvwxyz*';
        var initials = str.split('');
        var initialsObj = {};
        for(var i = 0; i < initials.length; i++) {
          initialsObj[initials[i]] = [];
        }
        var friends = app.friends.concat();
        for(var i = 0; i < friends.length; i++) {
          var friend = friends[i];
          var name = friend.info.name || friend.targetUser.username;
          var k = slugify(name);
          k = k?k[0]: '*';
          initialsObj[k].push(friend);
        }
        var results = [];
        for(var i in initialsObj) {
          if(i !== '*' && initialsObj[i].length !== 0) {
            results.push({
              letter: i.toUpperCase(),
              friends: initialsObj[i]
            })
          }
        }
        if(initialsObj['*'].length !== 0) {
          results.push({
            letter: '*',
            friends: initialsObj['*']
          })
        }
        return results;
      },
      newMessageCount: function() {
        var n = 0;
        for(var i = 0; i < this.userList.length; i++) {
          if(this.userList[i].count > 0) n += this.userList[i].count;
        }
        return n>99?99:n;
      },
      friendsId: function() {
        var arr = [];
        for(var j = 0; j < this.friends.length; j++) {
          arr.push(this.friends[j].uid);
        }
        return arr;
      },
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

      format: NKC.methods.format,
      fromNow: NKC.methods.fromNow,
      secondToMinute: secondToMinute,
      startPlayAudio: startPlayAudio,
      stopPlayAudio: stopPlayAudio,
      restartPlayAudio: restartPlayAudio,
      stopOrStartPlay: stopOrStartPlay,
      stopPlayType: stopPlayType,

      // 初始化手机页面
      initMobile: function(type) {
        app.showMobileNavbar = true;
        app.showMobileList = false;
        app.showMobileSettings = false;
        app.showMobileContacts = false;
        app.showMobileGroups = false;
        app[type] = true;
      },


      // 向分组内添加好友
      addFriendToSelectedFriends: function(friend) {
        if(app.category.friendsId.indexOf(friend.targetUser.uid) === -1) {
          app.category.friendsId.push(friend.targetUser.uid);
          app.category.friends.push(friend);
        }
      },

      // 向分组内移除好友
      removeFriendFromSelectedFriends: function(friend) {
        var index = app.category.friendsId.indexOf(friend.targetUser.uid);
        if(index !== -1) {
          app.category.friendsId.splice(index, 1);
          app.category.friends.splice(index, 1);
        }
      },

      // 添加分组
      addFriendCategory: function() {
        var category = {
          _id: '',
          name: '',
          description: '',
          friendsId: [],
          friends: []
        };
        app.selectCategory(category);
        app.editCategory = true;
      },

      // 删除分组
      deleteCategory: function(category) {
        if(!confirm('确认要删除分组“'+category.name+'”？')) return;
        nkcAPI('/friend_category/' + category._id, 'DELETE', {})
          .then(function() {
            // socket同步信息之后会将此分类移除
            // app.categories.splice(app.categories.indexOf(category), 1);
            app.initialization();
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      },
      // 取消分组编辑，复原数据
      cancelEditCategory: function() {
        app.editCategory = false;
        app.category = app.category.category_;
      },
      // 开始分组编辑，备份分组数据
      editCategoryBegin: function() {
        var category = app.category;
        app.category = JSON.parse(JSON.stringify(app.category));
        app.category.category_ = category;
        app.editCategory = true;
      },

      // 保存分组
      // 将分组数据上传至服务器，将备份数据（vue公用数据）更新为最新数据
      saveCategory: function() {
        var category = app.category;
        var category_ = app.category.category_;
        if(!category || !app.editCategory) return;
        var method = 'POST', url = '/friend_category';
        if(category._id) {
          method = 'PATCH';
          url += '/' + category._id;
        }
        nkcAPI(url, method, {
          name: category.name,
          description: category.description,
          friendsId: category.friendsId
        })
          .then(function(data) {
            var newCategory = app.extendCategoryFriends(data.category);
            /*if(category._id) {
              Vue.set(app.categories, app.categories.indexOf(category_), newCategory);
            } else {
              app.categories.unshift(newCategory);
            }*/
            app.category = newCategory;
            app.editCategory = false;
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          });
      },

      // 删除好友
      deleteFriend: function(type) {
        if(type !== true) {
          if(confirm('确认要删除该好友？') === false) return;
        }
        nkcAPI('/friend/' + app.friend.tUid, 'DELETE', {})
          .then(function(data) {
            app.friend = {targetUser: app.friend.targetUser};
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      },

      // 加入用户到黑名单列表
      addToBlackList: function() {
        if(confirm("确认要将该用户加入黑名单？") === false) return;
        var isFriend = true;
        var tUid = app.friend.tUid;
        if(!tUid) {
          tUid = app.friend.targetUser.uid;
          isFriend = false;
        }
        nkcAPI("/message/blackList", "POST", {
          tUid: tUid,
          type: "add"
        })
          .then(function(data) {
            app.blackListUid = data.blackListUid;
            for(var i = 0; i < app.userList.length; i++) {
              var item = app.userList[i];
              if(item.type === "UTU" && item.user && item.user.uid === tUid) {
                app.removeChat(item);
              }
            }
            if(isFriend) {
              app.deleteFriend(true);
            }
            screenTopAlert("已将用户加入到黑名单，可在资料设置处查看黑名单列表。");
          })
          .catch(function(data) {
            screenTopWarning(data);
          })
      },

      // 将用户从黑名单列表中移除
      removeFromBlackList: function() {
        if(confirm("确认要将用户从黑名单中移除？") === false) return;
        nkcAPI("/message/blackList", "POST", {
          tUid: app.friend.tUid || app.friend.targetUser.uid,
          type: "remove"
        })
          .then(function(data) {
            app.blackListUid = data.blackListUid;
            screenTopAlert("已将用户从黑名单中移除。");
          })
          .catch(function(data) {
            screenTopWarning(data);
          })
      },


      // 从已创建的聊天列表中移除聊天
      removeChat: function(item) {
        var type = item.type;
        nkcAPI('/message/chat/' + (item.user?item.user.uid: item.type), 'DELETE', {})
          .then(function() {

          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      },
      // 添加好友
      addFriend: openFrameOfAddFriend,
      // 添加好友电话号码
      addFriendsPhone: function() {
        if(app.friend.info.phone.length >= 5) {
          return screenTopWarning('最多只能为好友添加5个联系电话');
        }
        app.friend.info.phone.push('');
      },
      // 移除好友电话号码
      removeFriendsPhone: function(index) {
        app.friend.info.phone.splice(index, 1);
      },

      // 上传好友图片
      uploadFriendNoteImage: function(e) {
        var input = e.target;
        var files = input.files;
        if(files.length === 0) return;
        var file = files[0];
        var formDate = new FormData();
        formDate.append('file', file);
        uploadFilePromise('/friend/' + app.friend.tUid + '/image', formDate, function(r) {
          app.friendImageProgress = ((r.loaded/r.total)*100).toFixed(0);
          if(r.loaded === r.total) {
            setTimeout(function() {
              app.friendImageProgress = '';
            }, 2000)
          }
        })
          .then(function(data) {
            input.value = null;
            if(data.friend._id === app.friend._id) {
              app.friend.info.image = true;
              if(app.$refs.friendImage) {
                app.$refs.friendImage.src = '/friend/' + app.friend.tUid + '/image?t=' + Date.now();
              }

            }
          })
      },

      // 保存好友设置
      saveFriendSettings: function() {
        if(!app.friend) return;
        var locationInput = document.getElementById('location');
        app.friend.info.location = locationInput.value;
        nkcAPI('/message/settings/' + app.friend.tUid, 'PATCH', {
          info: app.friend.info,
          cid: app.friend.cid
        })
          .then(function() {
            screenTopAlert('保存成功');
            var friend = app.friend.friend;
            delete app.friend.friend;
            Vue.set(app.friends, app.friends.indexOf(friend), app.friend);
            for(var i = 0; i < app.userList.length; i++) {
              if(app.userList[i].friend && app.userList[i].friend._id === app.friend._id) {
                app.userList[i].friend = app.friend;
                break;
              }
            }
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      },

      // 处理好友添加申请
      postApplication: function(agree, message) {
        var uid = message.uid;
        var url;
        if(agree) {
          url = '/u/' + uid + '/friends/agree';
        } else {
          url = '/u/' + uid + '/friends/disagree';
        }
        nkcAPI(url, 'POST', {})
          .then(function() {
            message.agree = agree;
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          })
      },

      /*// 手机
      openMobileList: function() {
        app.initMobile('showMobileList');
      },
      openMobileSettings: function() {
        app.initMobile('showMobileSettings');
      },*/

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
          var systemType;
          for(var i = 0; i < app.userList.length; i++) {
            var li = app.userList[i];
            if(li.type === message.ty) {
              systemType = li;
              break;
            }
          }
          if(systemType) {
            systemType.message = message;
            systemType.time = message.tc;
            app.userList.splice(app.userList.indexOf(systemType), 1);
            app.userList.unshift(li);
          } else {
            systemType = {
              type: message.ty,
              message: message,
              time: message.tc,
              count: 0
            };
            if(message.ty === "STU") {
              systemType.name = message.c.messageType.name;
              systemType.content = message.c.messageType.content;
            }
            app.userList.unshift(systemType);
          }
          if(app.target === systemType.type) {
            systemType.count = 0;
          } else {
            systemType.count ++;
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
          var friend;
          for(var i = 0; i < app.friends.length; i++){
            var f = app.friends[i];
            if(f.tUid === user.uid) {
              friend = f;
              break;
            }
          }
          li = {
            type: 'UTU',
            count: 0,
            user: user,
            friend: friend
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
        /*this.showMobileNavbar = true;
        this.showMobileList = true;*/
        this.showFriendNotes = false;
        this.showPermissionSettings =false;
        this.friendImageProgress = '';
        this.friend = '';
        this.category = '';
        this.selectCategoryFriendsId = [];
        this.editCategory = false;
        this.systemInfoViewed = false;
        this.targetUserSendLimit = "";
        this.targetUserGrade = "";
      },

      // 获取聊天记录
      getMessage: function() {
        if(!app.canGetMessage) return Promise.reject();
        app.canGetMessage = false;
        app.info = '加载中~';
        var uid = this.targetUser && this.targetUser.uid? this.targetUser.uid: "";
        var url = "/message/data?type=" + this.target + (uid?"&uid="+uid: "");
        if(this.firstMessageId) {
          url += '&firstMessageId=' + this.firstMessageId + '&t=' + Date.now();
        } else {
          url += '&t=' + Date.now();
        }
        var target = app.target;
        return nkcAPI(url, 'GET', {})
          .then(function(data) {
            if(app.target !== target) return;
            if(data.messages.length === 0) {
              app.info = '没有了~';
              return Promise.reject();
            }
            app.info = '';
            app.messages = data.messages.concat(app.messages);
            app.targetUserSendLimit = data.targetUserSendLimit;
            app.targetUserGrade = data.targetUserGrade;
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
          case 'xsf': c = '学术分';break;
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

      // 拓展分类中的好友
      extendCategoryFriends: function(category) {
        var friendsId = [];
        var friends = [];
        for(var j = 0; j < category.friendsId.length; j++) {
          var friendId = category.friendsId[j];
          for(var n = 0; n < app.friends.length; n++) {
            var friend = app.friends[n];
            if(friend.targetUser.uid === friendId) {
              friendsId.push(friend.targetUser.uid);
              friends.push(friend);
              break;
            }
          }
        }
        category.friendsId = friendsId;
        category.friends = friends;
        return category;
      },

      // 获取用户列表
      getUserList: function() {
        return new Promise(function(resolve, reject) {
          nkcAPI('/message?t=' + Date.now(), 'GET', {})
            .then(function(data) {
              app.userList = data.userList;
              app.friends = data.usersFriends;
              app.blackListUid = data.blackListUid;
              // 拓展好友
              for(var i = 0; i < data.categories.length; i++) {
                data.categories[i] = app.extendCategoryFriends(data.categories[i]);
              }

              app.categories = data.categories;

              app.user = data.user;
              app.twemoji = data.twemoji;
              var messageSettings = data.user.generalSettings.messageSettings;
              var beep = messageSettings.beep;
              app.onlyReceiveFromFriends = messageSettings.onlyReceiveFromFriends;
              app.messageLimit = messageSettings.limit;
              app.messageLimitArr = [];
              if(app.messageLimit.timeLimit) {
                app.messageLimitArr.push("time");
              }
              if(app.messageLimit.xsfLimit) {
                app.messageLimitArr.push("xsf");
              }
              if(app.messageLimit.digestLimit) {
                app.messageLimitArr.push("digest");
              }
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
          STE: false,
          reminder: false
        };
        for(var i = 0; i < app.beep.length; i++) {
          beep[app.beep[i]] = true;
        }

        // 短消息防骚扰
        var messageLimit = this.messageLimit;
        var messageLimitArr = this.messageLimitArr;

        messageLimit.timeLimit = messageLimitArr.indexOf("time") !== -1;
        messageLimit.digestLimit = messageLimitArr.indexOf("digest") !== -1;
        messageLimit.xsfLimit = messageLimitArr.indexOf("xsf") !== -1;

        if(
          messageLimit.status &&
          !messageLimit.timeLimit &&
          !messageLimit.digestLimit &&
          !messageLimit.xsfLimit &&
          Number(messageLimit.gradeLimit) < 2
        ) {
          return screenTopWarning("请至少勾选一项防骚扰设置");
        }

        nkcAPI('/message/settings', 'PATCH', {
          beep: beep,
          onlyReceiveFromFriends: app.onlyReceiveFromFriends,
          limit: messageLimit
        })
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
        this.selectedUserListItem = item;
        if(item.type === 'UTU') {
          app.target = item.type;
          app.targetUser = item.user;
          app.targetUser.friend = item.friend;
          this.getInputTextFromLocal();
          this.getMessage()
            .then(function() {
              app.scrollToBottom();
              if(item.count === 0) return;
              nkcAPI('/message/mark', 'PATCH', {
                type: 'UTU',
                uid: app.targetUser.uid
              })
                .then(function() {
                  item.count = 0;
                })
                .catch(function(data) {
                  screenTopWarning(data.error || data);
                });
            })
            .catch(function() {

            })
            // 判断是否存在于列表中，不存在则创建
            var created = false;
            for(var i = 0; i < app.userList.length; i++) {
              if(app.userList[i].type === 'UTU' && app.userList[i].user.uid === item.user.uid) created = true;
            }
            if(!created) {
              var friend;
              for(var i = 0; i < app.friends.length; i++){
                var f = app.friends[i];
                if(f.tUid === item.user.uid) {
                  friend = f;
                  break;
                }
              }
              app.userList.unshift({
                type: 'UTU',
                count: 0,
                user: item.user,
                friend: friend
              });
            }
        } else if(item.type === 'STE') {
          app.target = item.type;
          this.getMessage()
            .then(function() {
              app.scrollToBottom();
              if(item.count === 0) return;
              nkcAPI('/message/mark', 'PATCH', {
                type: 'STE'
              })
                .then(function() {
                  item.count = 0;
                })
                .catch(function(data) {
                  screenTopWarning(data.error || data);
                });
            })
            .catch(function() {

            })
        /*} else if(item.type === 'STU'){
          app.target = item.type;
          this.getMessage()
            .then(function() {
              app.scrollToBottom();
              if(item.count === 0) return;
              nkcAPI('/message/mark', 'PATCH', {
                type: 'remind'
              })
                .then(function() {
                  item.count = 0;
                })
                .catch(function(data) {
                  screenTopWarning(data.error || data);
                });
            })
            .catch(function() {

            })*/
        } else if(item.type === 'newFriends'){
          app.target = 'newFriends';
          this.getMessage()
            .then(function() {
              app.scrollToBottom();
            })
            .catch(function() {

            })
        } else {
          app.target = item.type;
          this.getMessage()
            .then(function() {
              app.scrollToBottom();
              if(item.count === 0) return;
              nkcAPI('/message/mark', 'PATCH', {
                type: item.type
              })
                .then(function() {
                  item.count = 0;
                })
                .catch(function(data) {
                  screenTopWarning(data.error || data);
                });
            })
            .catch(function() {

            })
        }

      },

      selectCategory: function(c) {
        this.initialization();
        addHistory('category');
        app.target = 'category';
        // var c_ = JSON.parse(JSON.stringify(c));
        // if(!c_.friends) c_.friends = '';
        if(!c.friends) c.friends = '';
        app.category = c;
      },

      selectFriend: function(friend) {
        this.initialization();
        addHistory('friend');
        app.target = 'friend';
        if(!friend._id) {
          for(var i = 0; i < app.friends.length; i ++) {
            var f = app.friends[i];
            if(f.tUid === friend.targetUser.uid) {
              friend = f;
              break;
            }
          }
        }
        var friend_ = JSON.parse(JSON.stringify(friend));
        friend_.friend = friend;
        app.friend = friend_;

        /*nkcAPI('/u/' + app.user.uid + '/friends/' + friend.tUid, 'GET', {})
          .then(function(data) {
            app.friend = data.friend;
          })
          .catch(function(data) {
            screenTopWarning(data.error || data);
          });*/
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
              if(app.target === 'UTU' && app.targetUser) {
                url += '&uid=' + app.targetUser.uid;
                if(app.lastMessageId) {
                  url += '&lastMessageId=' + app.lastMessageId;
                }
              }
              return nkcAPI(url, 'GET', {})
                .then(function(data) {
                  var messages = data.messages;
                  if(messages.length === 0) return;
                  beep("notice");
                  if(app.target === 'UTU' && data.target === 'UTU' && app.targetUser.uid === data.targetUser.uid) {
                    app.messages = app.messages.concat(messages);
                    nkcAPI('/message/mark', 'PATCH', {
                      type: 'STU',
                      uid: app.targetUser.uid
                    })
                      .catch(function(data) {
                        screenTopWarning(data.error || data);
                      });
                  } else if(app.target === data.target) {
                    app.messages = app.messages.concat(messages);
                    nkcAPI('/message/mark', 'PATCH', {
                      type: app.target
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
      if(this.showFriendNotes) { // 若处于编辑好友备注
        var locationElement = document.getElementById('country');
        if(locationElement && locationElement.innerText === '--') { // 若未初始化过地区，则初始化
          $('.bs-chinese-region').chineseRegion('source',app.locationData);
          $('#location').val($('#location').attr('data'));
        }
      }
    },

    mounted: function() {
      this.getUserList()
        .then(function() {
          // 通过名片进入信息页面
          if(targetUser) {
            app.selectUser({
              type: 'UTU',
              user: targetUser
            });
          } else {
            var hasNewMessage = false;
            // 判断是否有新信息
            for(var i = 0; i < app.userList.length; i++) {
              var li = app.userList[i];
              if(li.count !== 0) {
                hasNewMessage = true;
                app.selectUser(li);
                break;
              }
            }
            // 若没有新信息则打开第一个人
            if(!hasNewMessage && app.userList.length > 0) {
              var li = app.userList[0];
              app.selectUser(li);
            }
            /*var hasNewMessage = false;
            // 判断是否有新信息
            for(var i = 0; i < app.userList.length; i++) {
              var li = app.userList[i];
              if(li.count !== 0 && li.type === 'UTU') {
                hasNewMessage = true;
                app.selectUser({
                  type: 'UTU',
                  user: li.user
                });
                break;
              }
            }
            // 若没有新信息则打开第一个人
            if(!hasNewMessage && app.userList.length > 0) {
              var li = app.userList[0];
              app.selectUser({
                type: 'UTU',
                user: li.user
              });
            }*/
          }
        });

      $.getJSON('/location.json',function(data){
        for (var i = 0; i < data.length; i++) {
          var area = {id:data[i].id,name:data[i].cname,level:data[i].level,parentId:data[i].upid};
          data[i] = area;
        }
        app.locationData = data;

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
          if(app.target === 'STE') {
            app.messages.push(message);
            nkcAPI('/message/mark', 'PATCH', {
              type: 'STE'
            })
              .catch(function(data) {
                screenTopWarning(data.error || data);
              })
          }
        } else if(ty === 'STU') {
          beep('notice');
          app.updateUserList({message: message});
          if(app.target === 'STU') {
            app.messages.push(message);
            nkcAPI('/message/mark', 'PATCH', {
              type: 'STU'
            })
              .catch(function(data) {
                screenTopWarning(data.error || data);
              })
          }
        } else if(ty === 'UTU') {

          var socketId = message.socketId;
          if(socketId === socket.id) return;

          // 插入数据
          if(app.target === 'UTU' && app.targetUser) {
            if(app.targetUser.uid === user.uid) {
              nkcAPI('/message/mark', 'PATCH', {
                type: 'UTU',
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

        } else if(ty === 'friendsApplication') {
          app.getUserList().then(function() {
            if(message.agree !== false) {
              beep('message');
            }
          });
          if(app.target === 'newFriends' && app.user.uid !== message.uid) {
            var insert = false;
            for(var i = 0; i < app.messages.length; i++) {
              var m = app.messages[i];
              if(m._id === message._id) {
                m.toc = message.toc;
                m.description = message.description;
                m.agree = message.agree;
                insert = true;
                break;
              }
            }
            if(!insert) {
              app.messages.push(message);
            }
          }
        } else if(ty === 'deleteFriend') {
          var deleterId = message.deleterId;
          var deletedId = message.deletedId;
          var targetUid;
          if(deleterId === app.user.uid) {
            targetUid = deletedId;
          } else if(deletedId === app.user.uid) {
            targetUid = deleterId;
          } else {
            return;
          }
          for(var i = 0; i < app.friends.length; i++) {
            var f = app.friends[i];
            if(f.tUid === targetUid) {
              app.friends.splice(i, 1);
              break;
            }
          }
          for(var i = 0; i < app.userList.length; i++) {
            var li = app.userList[i];
            if(li.type === 'UTU' && li.user.uid === targetUid) {
              app.userList.splice(i, 1);
              break;
            }
          }
        } else if(ty === 'modifyFriend') {

          var friend = message.friend;
          if(app.user.uid !== friend.uid) return;
          for(var i = 0; i < app.friends.length; i++) {
            var f = app.friends[i];
            if(f.tUid === friend.tUid) {
              Vue.set(app.friends, i, friend);
              break;
            }
          }
          for(var i = 0; i < app.userList.length; i++) {
            var li = app.userList[i];
            if(li.friend && li.friend.tUid === friend.tUid) {
              li.friend = friend;
              break;
            }
          }

        } else if(ty === 'removeChat') {
          var deletedId = message.deletedId;
          var systemType = false;
          if(['STU', 'STE', 'newFriends'].indexOf(deletedId) !== -1) {
            systemType = true;
          }
          for(var i = 0; i < app.userList.length; i++) {
            var li = app.userList[i];
            // 系统类型、用户
            if((systemType && li.type === deletedId) || (li.user && li.user.uid === deletedId)) {
              app.userList.splice(i, 1);
              if(li.type === 'UTU' && deletedId === app.targetUser.uid) {
                app.initialization();
              }
              break;
            }
          }
        } else if(ty === 'markAsRead') {
          var targetUid = message.targetUid;
          var uid = message.uid;
          if(app.user.uid !== uid) return;
          var messageType = message.messageType;
          if(messageType === 'UTU') {
            for(var i = 0; i < app.userList.length; i++) {
              var li = app.userList[i];
              if(li.type === 'UTU' && li.user.uid === targetUid) {
                li.count = 0;
                break;
              }
            }
          } else if (messageType === 'STE') {
            for(var i = 0; i < app.userList.length; i++) {
              var li = app.userList[i];
              if(li.type === 'STE') {
                li.count = 0;
                break;
              }
            }
          } else {
            for(var i = 0; i < app.userList.length; i++) {
              var li = app.userList[i];
              if(li.type === messageType) {
                li.count = 0;
                break;
              }
            }
          }
        } else if(ty === 'editFriendCategory') {
          var category = message.category;
          if(app.user.uid !== category.uid) return;
          var editType = message.editType;
          if(editType === 'add') {
            var existing = false;
            for(var i = 0; i < app.categories.length; i++) {
              var c = app.categories[i];
              if(c._id === category._id) {
                existing = true;
                break;
              }
            }
            if(!existing) {
              category = app.extendCategoryFriends(category);
              app.categories.unshift(category);
            }
          } else if(editType === 'remove') {
            for(var i = 0; i < app.categories.length; i++) {
              var c = app.categories[i];
              if(c._id === category._id) {
                if(app.category._id === category._id) app.initialization();
                app.categories.splice(i, 1);
                break;
              }
            }
          } else if(editType === 'modify') {

            for(var i = 0; i < app.categories.length; i++) {
              var c = app.categories[i];
              if(c._id !== category._id) continue;
              category = app.extendCategoryFriends(category);
              Vue.set(app.categories, i, category);
              if(app.category._id === category._id) {
                app.category = category;
              }
              break;
            }

          }
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
        for(var i = 0; i < app.friends.length; i++) {
          var li = app.friends[i];
          if(li.targetUser && li.targetUser.uid === uid) {
            li.targetUser.online = false;
          }
        }
      });
      socket.on('userConnect', function(data) {
        var uid = data.targetUid;
        for(var i = 0; i < app.userList.length; i++) {
          var li = app.userList[i];
          if(li.user && li.user.uid === uid) {
            li.user.online = true;
            li.user.onlineType = data.onlineType;
          }
        }
        for(var i = 0; i < app.friends.length; i++) {
          var li = app.friends[i];
          if(li.targetUser && li.targetUser.uid === uid) {
            li.targetUser.online = true;
            li.targetUser.onlineType = data.onlineType;
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

// 秒数转分钟
function secondToMinute(sec) {
  if(!sec){
    return "";
  }
  var m = parseInt(sec / 60);
  var s = Math.ceil(sec % 60);
  var timeStamp;
  if(m < 1){
    timeStamp = s + "";
  }else{
    timeStamp = m + "\' " + s + "";
  }
  return timeStamp;
}

// 播放音频
function startPlayAudio(id) {
  if(app.voiceHisIndex && id !== app.voiceHisIndex) {
    stopPlayType(app.voiceHisIndex);
    restartPlayAudio(app.voiceHisIndex);
  }
  app.voiceHisIndex = id;
  audioId = 'audio'+id;
  document.getElementById(audioId).play();
}

// 停止播放
function stopPlayAudio(id) {
  audioId = 'audio'+id;
  document.getElementById(audioId).pause();
}

// 重置播放
function restartPlayAudio(id) {
  audioId = 'audio'+id;
  document.getElementById(audioId).load();
}

//
function stopOrStartPlay(id) {
  if(!app.messages[id].c.playType) {
    app.messages[id].c.playType = true;
    Vue.set(app.messages, id, app.messages[id]);
    startPlayAudio(id);
  }else{
    app.messages[id].c.playType = false;
    Vue.set(app.messages, id, app.messages[id]);
    restartPlayAudio(id);
  }
}

// 
function stopPlayType(id) {
  app.messages[id].c.playType = false;
  Vue.set(app.messages, id, app.messages[id]);
}

// 
function startPlayType(id) {
  app.messages[id].c.playType = true;
  Vue.set(app.messages, id, app.messages[id]);
}

function closeFrameOfAddFriend() {
  var dom = $('#addFriend');
  dom.hide();
  dom.find('.input').hide();
  dom.find('.success').hide();
  dom.find('textarea').val('');
}
function openFrameOfAddFriend(user) {
  var username = user.username;
  var description = user.description;
  var uid = user.uid;
  var dom = $('#addFriend');
  dom.attr('data-uid', uid);
  dom.find('.avatar img').attr('src', '/avatar/' + uid);
  dom.find('.content .username').text(username);
  dom.find('.content .description').text(description);
  dom.find('.input').show();
  dom.find('.success').hide();
  dom.show();
}

function addFriendByUid() {
  var dom = $('#addFriend');
  var uid = dom.attr('data-uid');
  var description = dom.find('textarea').val();
  nkcAPI('/u/' + uid + '/friends', 'POST', {
    description: description
  })
    .then(function (data) {
      dom.find('.input').hide();
      dom.find('.success').show();
    })
    .catch(function (data) {
      screenTopWarning(data.error || data);
    })
}