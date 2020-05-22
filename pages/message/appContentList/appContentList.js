(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var data = NKC.methods.getDataById('data');
window.app = new Vue({
  el: '#app',
  data: {
    // socketID
    socketId: Date.now() + '' + Math.round(Math.random() * 1000),
    // 消息类型，UTU, STU, STE
    type: data.type,
    // 消息内容列表
    originMessages: data.messages,
    // 是否显示表情列表
    showStickerPanel: false,
    // 表情数据
    twemoji: data.twemoji,
    // 对方
    tUser: data.tUser,
    // 自己
    mUser: data.mUser,
    // 输入框输入的内容
    content: '',
    // 获取消息内容 锁
    getMessageStatus: 'canLoad' // canLoad, loading, cantLoad

  },
  methods: {
    // 格式化时间
    timeFormat: NKC.methods.timeFormat,
    // 获取链接
    getUrl: NKC.methods.tools.getUrl,
    toast: function toast(c) {
      c = c.error || c.message || c;
      NKC.methods.rn.emit('toast', {
        content: c
      });
    },
    // 滚动内容到底部
    scrollToBottom: function scrollToBottom() {
      var _this = this;

      setTimeout(function () {
        var listContent = _this.$refs.listContent;
        listContent.scrollTop = listContent.scrollHeight + 10000;
      }, 200);
    },
    // 切换表情面板状态
    switchStickerPanel: function switchStickerPanel(f) {
      this.showStickerPanel = f === undefined ? !this.showStickerPanel : !!f;
    },
    // 选择表情
    selectSticker: function selectSticker(tmj) {
      var _this2 = this;

      var inputText = this.content;
      var e = this.$refs.input;
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

      if (index > 1) {
        var str = inputText.substring(0, index);
        var str2 = str + emoji;
        this.content = inputText.replace(str, str2);
      } else {
        this.content = emoji + (this.content || '');
      }

      setTimeout(function () {
        _this2.autoResize();
      }, 200);
    },
    // 输入框自动调整高度
    autoResize: function autoResize(init) {
      var textArea = this.$refs.input;
      var num = 2.8 * 12;
      textArea.style.height = num + 'px';

      if (!init && num < textArea.scrollHeight) {
        textArea.style.height = textArea.scrollHeight + 'px';
      }
    },
    // 输入框保持聚焦
    keepFocus: function keepFocus(focus) {
      if (focus) {
        this.$refs.input.focus();
      }
    },
    // 浏览聊天内容中的图片
    visitImages: function visitImages(url) {
      var urls = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.messages[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var m = _step.value;

          if (m.contentType === 'img') {
            urls.push({
              name: m.content.filename,
              url: m.content.fileUrl
            });
          }
        } // urls.reverse();

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var index = urls.map(function (u) {
        return u.url;
      }).indexOf(url);
      urls.map(function (u) {
        return u.url = location.origin + u.url;
      });
      NKC.methods.rn.emit('viewImage', {
        index: index,
        urls: urls
      });
    },
    // 访问用户主页
    openUserHome: function openUserHome(uid) {
      NKC.methods.rn.emit('openNewPage', {
        href: location.origin + this.getUrl('userHome', uid)
      });
    },
    // 选择本地附件
    selectLocalFiles: function selectLocalFiles() {
      var fileDom = this.$refs.file;
      fileDom.value = null;
      fileDom.click();
    },
    // 选择完本地附件
    selectedLocalFiles: function selectedLocalFiles() {
      var fileDom = this.$refs.file;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = fileDom.files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var file = _step2.value;
          this.sendMessage('sendFile', file);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    },
    // 发送消息
    sendMessage: function sendMessage(type, c) {
      var self = this;
      NKC.methods.rn.emit('getKeyboardStatus', {}, function (data) {
        self.keepFocus(data.keyboardStatus === 'show');
      });
      var message;

      if (['sendText', 'sendFile'].includes(type)) {
        // 发送一条信息
        var localMessageId = Date.now();
        message = {
          _id: localMessageId,
          contentType: 'html',
          s: self.mUser.uid,
          r: self.tUser.uid,
          messageType: 'UTU'
        };
        var formData = new FormData();

        if (type === 'sendText') {
          message.content = c;
        } else {
          message.content = c.name;
          formData.append('file', c);
        }

        formData.append('content', message.content);
        formData.append('socketId', self.socketId);
        message.formData = formData;
      } else {
        // 重发一条消息
        message = c;
      }

      message.status = 'sending'; // sent已发送、sending正在发送、error出错

      message.time = Date.now();
      Promise.resolve().then(function () {
        if (!message.content) throw '请输入聊天内容';

        if (type !== 'resend') {
          self.originMessages.push(message);
        }

        self.content = "";
        self.autoResize(true);
        self.scrollToBottom(); // self.keepFocus(true);

        return nkcUploadFile("/message/user/".concat(message.r), 'POST', message.formData);
      }).then(function (data) {
        var index = self.originMessages.indexOf(message);
        message.status = 'sent';

        if (index >= 0) {
          Vue.set(self.originMessages, index, data.message2);
          self.scrollToBottom();
        }
      })["catch"](function (data) {
        message.status = 'error';
        self.toast(data.error || data.message || data);
      });
    },
    // 获取消息
    getMessage: function getMessage() {
      var _self = self = this,
          firstMessageId = _self.firstMessageId,
          tUser = _self.tUser,
          type = _self.type;

      var url = "/message/data?type=".concat(type);

      if (firstMessageId) {
        url += "&firstMessageId=".concat(firstMessageId);
      }

      if (tUser.uid) {
        url += "&uid=".concat(tUser.uid);
      }

      if (self.getMessageStatus !== 'canLoad') return;
      self.getMessageStatus = 'loading';
      return nkcAPI(url, 'GET').then(function (data) {
        self.originMessages = self.originMessages.concat(data.messages2);

        if (data.messages2.length) {
          self.getMessageStatus = 'canLoad';
        } else {
          self.getMessageStatus = 'cantLoad';
        }
      })["catch"](function (data) {
        self.toast(data);
        self.getMessageStatus = 'canLoad';
      });
    },
    getOriginMessageById: function getOriginMessageById(id) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.originMessages[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var m = _step3.value;
          if (m._id === id) return m;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    },
    // rn接收到新消息通知web
    insertMessage: function insertMessage(message) {
      var messageType = message.messageType,
          r = message.r,
          s = message.s;
      var tUser = this.tUser,
          mUser = this.mUser;

      if (messageType === 'UTU') {
        var usersId = [tUser.uid, mUser.uid];
        if (!usersId.includes(r) || !usersId.includes(s)) return;

        if (this.mUser.uid !== message.s) {
          this.markAsRead();
        }
      } else if (messageType === 'STU') {
        if (r !== mUser.uid) return;
        this.markAsRead();
      } else if (messageType === 'STE') {
        this.markAsRead();
      } else if (messageType === 'friendsApplication') {
        if (r !== mUser.uid) return;
      }

      this.originMessages.push(message);
      this.scrollToBottom();
    },
    // 撤回
    withdrawn: function withdrawn(messageId, targetUser) {
      var self = this;
      Promise.resolve().then(function () {
        if (!targetUser) {
          return nkcAPI('/message/withdrawn', 'PATCH', {
            messageId: messageId
          });
        }
      }).then(function () {
        var originMessage = self.getOriginMessageById(messageId);
        if (originMessage) originMessage.contentType = 'withdrawn';
      })["catch"](self.toast);
    },
    // 标记为已读
    markAsRead: function markAsRead() {
      var _self2 = self = this,
          type = _self2.type,
          tUser = _self2.tUser;

      setTimeout(function () {
        nkcAPI('/message/mark', 'PATCH', {
          type: type,
          uid: tUser.uid
        })["catch"](self.toast);
      }, 1000);
    },
    // 调用原生拍照、录像和录音
    useCamera: function useCamera(type) {
      var name = 'takePictureAndSendToUser';

      if (type === 'video') {
        name = 'takeVideoAndSendToUser';
      } else if (type === 'audio') {
        name = 'recordAudioAndSendToUser';
      }

      NKC.methods.rn.emit(name, {
        uid: this.tUser.uid,
        socketId: null
      });
    },
    // 处理好友添加申请
    newFriendOperation: function newFriendOperation(id, agree) {
      var self = this;
      var message = self.getOriginMessageById(id);
      nkcAPI('/u/' + message.s + '/friends/agree', 'POST', {
        agree: agree
      }).then(function (data) {
        message.content = data.message.content;
      })["catch"](self.toast);
    }
  },
  computed: {
    // 第一条消息的ID，用户加载消息内容列表
    firstMessageId: function firstMessageId() {
      var messages = this.messages;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = messages[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var m = _step4.value;

          if (m.contentType !== 'time') {
            return m._id;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    },
    // 处理过的消息内容列表
    messages: function messages() {
      var originMessages = this.originMessages,
          mUser = this.mUser,
          tUser = this.tUser;
      var now = new Date().getTime();
      var messagesId = [];
      var messagesObj = {};
      var messages = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = originMessages[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var m = _step5.value;
          var _id = m._id,
              s = m.s;
          var ownMessage = s === mUser.uid;
          messagesId.push(_id);
          m.position = ownMessage ? 'right' : 'left';
          m.sUser = ownMessage ? mUser : tUser;
          m.canWithdrawn = m.status === 'sent' && ownMessage && now - new Date(m.time) < 60000;
          messagesObj[_id] = m;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      messagesId = _toConsumableArray(new Set(messagesId));
      messagesId = messagesId.sort(function (a, b) {
        return a - b;
      });
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = messagesId[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var id = _step6.value;
          messages.push(messagesObj[id]);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
            _iterator6["return"]();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      var arr = [];

      for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        var time = message.time;

        if (i === 0) {
          arr.push({
            contentType: 'time',
            content: time
          });
        } else {
          var lastMessage = messages[i - 1];

          if (new Date(time).getTime() - new Date(lastMessage.time).getTime() > 60000) {
            arr.push({
              contentType: 'time',
              content: time
            });
          }
        }

        arr.push(message);
      }

      return arr;
    }
  },
  mounted: function mounted() {
    var self = this;
    var listContent = self.$refs.listContent;
    window.addEventListener('click', function () {
      if (self.showStickerPanel) {
        self.switchStickerPanel(false);
      }
    });
    self.scrollToBottom();

    listContent.onscroll = function () {
      var scrollTop = this.scrollTop;
      if (scrollTop > 20) return;
      listContent.scrollTo = listContent.scrollTop;
      listContent.height = listContent.scrollHeight;
      self.getMessage().then(function () {
        var height = listContent.scrollHeight;
        listContent.scrollTop = height - listContent.height;
      })["catch"](function (data) {
        self.toast(data.error || data.message || data);
      });
    };
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL21lc3NhZ2UvYXBwQ29udGVudExpc3QvYXBwQ29udGVudExpc3QubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFJLEdBQUosQ0FBUTtBQUNuQixFQUFBLEVBQUUsRUFBRSxNQURlO0FBRW5CLEVBQUEsSUFBSSxFQUFFO0FBQ0o7QUFDQSxJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBTCxLQUFhLEVBQWIsR0FBa0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxLQUFjLElBQXpCLENBRnhCO0FBR0o7QUFDQSxJQUFBLElBQUksRUFBRSxJQUFJLENBQUMsSUFKUDtBQUtKO0FBQ0EsSUFBQSxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBTmpCO0FBT0o7QUFDQSxJQUFBLGdCQUFnQixFQUFFLEtBUmQ7QUFTSjtBQUNBLElBQUEsT0FBTyxFQUFFLElBQUksQ0FBQyxPQVZWO0FBV0o7QUFDQSxJQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsS0FaUjtBQWFKO0FBQ0EsSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBZFI7QUFlSjtBQUNBLElBQUEsT0FBTyxFQUFFLEVBaEJMO0FBaUJKO0FBQ0EsSUFBQSxnQkFBZ0IsRUFBRSxTQWxCZCxDQWtCeUI7O0FBbEJ6QixHQUZhO0FBc0JuQixFQUFBLE9BQU8sRUFBRTtBQUNQO0FBQ0EsSUFBQSxVQUFVLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxVQUZqQjtBQUdQO0FBQ0EsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BSm5CO0FBS1AsSUFBQSxLQUxPLGlC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ckMsVUFBRyxJQUFJLENBQUMsZ0JBQVIsRUFBMEI7QUFDeEIsUUFBQSxJQUFJLENBQUMsa0JBQUwsQ0FBd0IsS0FBeEI7QUFDRDtBQUNGLEtBSkQ7QUFLQSxJQUFBLElBQUksQ0FBQyxjQUFMOztBQUNBLElBQUEsV0FBVyxDQUFDLFFBQVosR0FBdUIsWUFBVztBQUNoQyxVQUFNLFNBQVMsR0FBRyxLQUFLLFNBQXZCO0FBQ0EsVUFBRyxTQUFTLEdBQUcsRUFBZixFQUFtQjtBQUNuQixNQUFBLFdBQVcsQ0FBQyxRQUFaLEdBQXVCLFdBQVcsQ0FBQyxTQUFuQztBQUNBLE1BQUEsV0FBVyxDQUFDLE1BQVosR0FBcUIsV0FBVyxDQUFDLFlBQWpDO0FBQ0EsTUFBQSxJQUFJLENBQUMsVUFBTCxHQUNHLElBREgsQ0FDUSxZQUFXO0FBQ2YsWUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLFlBQTNCO0FBQ0EsUUFBQSxXQUFXLENBQUMsU0FBWixHQUF3QixNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQTdDO0FBQ0QsT0FKSCxXQUtTLFVBQVMsSUFBVCxFQUFjO0FBQ25CLFFBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsS0FBTCxJQUFjLElBQUksQ0FBQyxPQUFuQixJQUE4QixJQUF6QztBQUNELE9BUEg7QUFTRCxLQWREO0FBZUQ7QUFuWGtCLENBQVIsQ0FBYiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG53aW5kb3cuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICAvLyBzb2NrZXRJRFxyXG4gICAgc29ja2V0SWQ6IERhdGUubm93KCkgKyAnJyArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSoxMDAwKSxcclxuICAgIC8vIOa2iOaBr+exu+Wei++8jFVUVSwgU1RVLCBTVEVcclxuICAgIHR5cGU6IGRhdGEudHlwZSxcclxuICAgIC8vIOa2iOaBr+WGheWuueWIl+ihqFxyXG4gICAgb3JpZ2luTWVzc2FnZXM6IGRhdGEubWVzc2FnZXMsXHJcbiAgICAvLyDmmK/lkKbmmL7npLrooajmg4XliJfooahcclxuICAgIHNob3dTdGlja2VyUGFuZWw6IGZhbHNlLFxyXG4gICAgLy8g6KGo5oOF5pWw5o2uXHJcbiAgICB0d2Vtb2ppOiBkYXRhLnR3ZW1vamksXHJcbiAgICAvLyDlr7nmlrlcclxuICAgIHRVc2VyOiBkYXRhLnRVc2VyLFxyXG4gICAgLy8g6Ieq5bexXHJcbiAgICBtVXNlcjogZGF0YS5tVXNlcixcclxuICAgIC8vIOi+k+WFpeahhui+k+WFpeeahOWGheWuuVxyXG4gICAgY29udGVudDogJycsXHJcbiAgICAvLyDojrflj5bmtojmga/lhoXlrrkg6ZSBXHJcbiAgICBnZXRNZXNzYWdlU3RhdHVzOiAnY2FuTG9hZCcsIC8vIGNhbkxvYWQsIGxvYWRpbmcsIGNhbnRMb2FkXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICAvLyDmoLzlvI/ljJbml7bpl7RcclxuICAgIHRpbWVGb3JtYXQ6IE5LQy5tZXRob2RzLnRpbWVGb3JtYXQsXHJcbiAgICAvLyDojrflj5bpk77mjqVcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgdG9hc3QoYykge1xyXG4gICAgICBjID0gYy5lcnJvciB8fCBjLm1lc3NhZ2UgfHwgYztcclxuICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgndG9hc3QnLCB7XHJcbiAgICAgICAgY29udGVudDogY1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDmu5rliqjlhoXlrrnliLDlupXpg6hcclxuICAgIHNjcm9sbFRvQm90dG9tKCkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBsaXN0Q29udGVudCA9IHRoaXMuJHJlZnMubGlzdENvbnRlbnQ7XHJcbiAgICAgICAgbGlzdENvbnRlbnQuc2Nyb2xsVG9wID0gbGlzdENvbnRlbnQuc2Nyb2xsSGVpZ2h0ICsgMTAwMDA7XHJcbiAgICAgIH0sIDIwMClcclxuICAgIH0sXHJcbiAgICAvLyDliIfmjaLooajmg4XpnaLmnb/nirbmgIFcclxuICAgIHN3aXRjaFN0aWNrZXJQYW5lbChmKSB7XHJcbiAgICAgIHRoaXMuc2hvd1N0aWNrZXJQYW5lbCA9IGYgPT09IHVuZGVmaW5lZD8gIXRoaXMuc2hvd1N0aWNrZXJQYW5lbDogISFmO1xyXG4gICAgfSxcclxuICAgIC8vIOmAieaLqeihqOaDhVxyXG4gICAgc2VsZWN0U3RpY2tlcih0bWopIHtcclxuICAgICAgY29uc3QgaW5wdXRUZXh0ID0gdGhpcy5jb250ZW50O1xyXG4gICAgICBjb25zdCBlID0gdGhpcy4kcmVmcy5pbnB1dDtcclxuICAgICAgbGV0IGluZGV4O1xyXG4gICAgICBpZiAoZS5zZWxlY3Rpb25TdGFydCkge1xyXG4gICAgICAgIGluZGV4ID0gZS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcclxuICAgICAgICBlLmZvY3VzKCk7XHJcbiAgICAgICAgY29uc3QgciA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICAgIGNvbnN0IHNyID0gci5kdXBsaWNhdGUoKTtcclxuICAgICAgICBzci5tb3ZlVG9FbGVtZW50VGV4dChlKTtcclxuICAgICAgICBzci5zZXRFbmRQb2ludCgnRW5kVG9FbmQnLCByKTtcclxuICAgICAgICBpbmRleCA9IHNyLnRleHQubGVuZ3RoIC0gci50ZXh0Lmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBlbW9qaSA9ICdbZi8nICsgdG1qICsgJ10nO1xyXG5cclxuICAgICAgaWYoaW5kZXggPiAxKSB7XHJcbiAgICAgICAgY29uc3Qgc3RyID0gaW5wdXRUZXh0LnN1YnN0cmluZygwLCBpbmRleCk7XHJcbiAgICAgICAgY29uc3Qgc3RyMiA9IHN0ciArIGVtb2ppO1xyXG4gICAgICAgIHRoaXMuY29udGVudCA9IGlucHV0VGV4dC5yZXBsYWNlKHN0ciwgc3RyMik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50ID0gZW1vamkgKyAodGhpcy5jb250ZW50IHx8ICcnKTtcclxuICAgICAgfVxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmF1dG9SZXNpemUoKTtcclxuICAgICAgfSwgMjAwKTtcclxuXHJcbiAgICB9LFxyXG4gICAgLy8g6L6T5YWl5qGG6Ieq5Yqo6LCD5pW06auY5bqmXHJcbiAgICBhdXRvUmVzaXplKGluaXQpIHtcclxuICAgICAgY29uc3QgdGV4dEFyZWEgPSB0aGlzLiRyZWZzLmlucHV0O1xyXG4gICAgICBjb25zdCBudW0gPSAyLjggKiAxMjtcclxuICAgICAgdGV4dEFyZWEuc3R5bGUuaGVpZ2h0ID0gbnVtICsgJ3B4JztcclxuICAgICAgaWYoIWluaXQgJiYgbnVtIDwgdGV4dEFyZWEuc2Nyb2xsSGVpZ2h0KSB7XHJcbiAgICAgICAgdGV4dEFyZWEuc3R5bGUuaGVpZ2h0ID0gdGV4dEFyZWEuc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOi+k+WFpeahhuS/neaMgeiBmueEplxyXG4gICAga2VlcEZvY3VzKGZvY3VzKSB7XHJcbiAgICAgIGlmKGZvY3VzKSB7XHJcbiAgICAgICAgdGhpcy4kcmVmcy5pbnB1dC5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5rWP6KeI6IGK5aSp5YaF5a655Lit55qE5Zu+54mHXHJcbiAgICB2aXNpdEltYWdlcyh1cmwpIHtcclxuICAgICAgbGV0IHVybHMgPSBbXTtcclxuICAgICAgZm9yKGNvbnN0IG0gb2YgdGhpcy5tZXNzYWdlcykge1xyXG4gICAgICAgIGlmKG0uY29udGVudFR5cGUgPT09ICdpbWcnKSB7XHJcbiAgICAgICAgICB1cmxzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBtLmNvbnRlbnQuZmlsZW5hbWUsXHJcbiAgICAgICAgICAgIHVybDogbS5jb250ZW50LmZpbGVVcmxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyB1cmxzLnJldmVyc2UoKTtcclxuICAgICAgY29uc3QgaW5kZXggPSB1cmxzLm1hcCh1ID0+IHUudXJsKS5pbmRleE9mKHVybCk7XHJcbiAgICAgIHVybHMubWFwKHUgPT4gdS51cmwgPSBsb2NhdGlvbi5vcmlnaW4gKyB1LnVybCk7XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ3ZpZXdJbWFnZScsIHtcclxuICAgICAgICBpbmRleCxcclxuICAgICAgICB1cmxzXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgLy8g6K6/6Zeu55So5oi35Li76aG1XHJcbiAgICBvcGVuVXNlckhvbWUodWlkKSB7XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ29wZW5OZXdQYWdlJywge1xyXG4gICAgICAgIGhyZWY6IGxvY2F0aW9uLm9yaWdpbiArIHRoaXMuZ2V0VXJsKCd1c2VySG9tZScsIHVpZClcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6YCJ5oup5pys5Zyw6ZmE5Lu2XHJcbiAgICBzZWxlY3RMb2NhbEZpbGVzKCkge1xyXG4gICAgICBjb25zdCBmaWxlRG9tID0gdGhpcy4kcmVmcy5maWxlO1xyXG4gICAgICBmaWxlRG9tLnZhbHVlID0gbnVsbDtcclxuICAgICAgZmlsZURvbS5jbGljaygpO1xyXG4gICAgfSxcclxuICAgIC8vIOmAieaLqeWujOacrOWcsOmZhOS7tlxyXG4gICAgc2VsZWN0ZWRMb2NhbEZpbGVzKCkge1xyXG4gICAgICBjb25zdCBmaWxlRG9tID0gdGhpcy4kcmVmcy5maWxlO1xyXG4gICAgICBmb3IoY29uc3QgZmlsZSBvZiBmaWxlRG9tLmZpbGVzKSB7XHJcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSgnc2VuZEZpbGUnLCBmaWxlKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWPkemAgea2iOaBr1xyXG4gICAgc2VuZE1lc3NhZ2UodHlwZSwgYykge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgnZ2V0S2V5Ym9hcmRTdGF0dXMnLCB7fSwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHNlbGYua2VlcEZvY3VzKGRhdGEua2V5Ym9hcmRTdGF0dXMgPT09ICdzaG93Jyk7XHJcbiAgICAgIH0pXHJcbiAgICAgIGxldCBtZXNzYWdlXHJcblxyXG4gICAgICBpZihbJ3NlbmRUZXh0JywgJ3NlbmRGaWxlJ10uaW5jbHVkZXModHlwZSkpIHtcclxuICAgICAgICAvLyDlj5HpgIHkuIDmnaHkv6Hmga9cclxuICAgICAgICBjb25zdCBsb2NhbE1lc3NhZ2VJZCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgbWVzc2FnZSA9IHtcclxuICAgICAgICAgIF9pZDogbG9jYWxNZXNzYWdlSWQsXHJcbiAgICAgICAgICBjb250ZW50VHlwZTogJ2h0bWwnLFxyXG4gICAgICAgICAgczogc2VsZi5tVXNlci51aWQsXHJcbiAgICAgICAgICByOiBzZWxmLnRVc2VyLnVpZCxcclxuICAgICAgICAgIG1lc3NhZ2VUeXBlOiAnVVRVJyxcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICBpZih0eXBlID09PSAnc2VuZFRleHQnKSB7XHJcbiAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBjO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBjLm5hbWU7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBjKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdjb250ZW50JywgbWVzc2FnZS5jb250ZW50KTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3NvY2tldElkJywgc2VsZi5zb2NrZXRJZCk7XHJcbiAgICAgICAgbWVzc2FnZS5mb3JtRGF0YSA9IGZvcm1EYXRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIOmHjeWPkeS4gOadoea2iOaBr1xyXG4gICAgICAgIG1lc3NhZ2UgPSBjO1xyXG4gICAgICB9XHJcbiAgICAgIG1lc3NhZ2Uuc3RhdHVzID0gJ3NlbmRpbmcnOyAvLyBzZW505bey5Y+R6YCB44CBc2VuZGluZ+ato+WcqOWPkemAgeOAgWVycm9y5Ye66ZSZXHJcbiAgICAgIG1lc3NhZ2UudGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFtZXNzYWdlLmNvbnRlbnQpIHRocm93ICfor7fovpPlhaXogYrlpKnlhoXlrrknO1xyXG4gICAgICAgICAgaWYodHlwZSAhPT0gJ3Jlc2VuZCcpIHtcclxuICAgICAgICAgICAgc2VsZi5vcmlnaW5NZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2VsZi5jb250ZW50ID0gXCJcIjtcclxuICAgICAgICAgIHNlbGYuYXV0b1Jlc2l6ZSh0cnVlKTtcclxuICAgICAgICAgIHNlbGYuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgICAgICAgIC8vIHNlbGYua2VlcEZvY3VzKHRydWUpO1xyXG5cclxuICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKGAvbWVzc2FnZS91c2VyLyR7bWVzc2FnZS5yfWAsICdQT1NUJywgbWVzc2FnZS5mb3JtRGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgaW5kZXggPSBzZWxmLm9yaWdpbk1lc3NhZ2VzLmluZGV4T2YobWVzc2FnZSk7XHJcbiAgICAgICAgICBtZXNzYWdlLnN0YXR1cyA9ICdzZW50JztcclxuICAgICAgICAgIGlmKGluZGV4ID49IDApIHtcclxuICAgICAgICAgICAgVnVlLnNldChzZWxmLm9yaWdpbk1lc3NhZ2VzLCBpbmRleCwgZGF0YS5tZXNzYWdlMik7XHJcbiAgICAgICAgICAgIHNlbGYuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgIG1lc3NhZ2Uuc3RhdHVzID0gJ2Vycm9yJztcclxuICAgICAgICAgIHNlbGYudG9hc3QoZGF0YS5lcnJvciB8fCBkYXRhLm1lc3NhZ2UgfHwgZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bmtojmga9cclxuICAgIGdldE1lc3NhZ2UoKSB7XHJcbiAgICAgIGNvbnN0IHtmaXJzdE1lc3NhZ2VJZCwgdFVzZXIsIHR5cGV9ID0gc2VsZiA9IHRoaXM7XHJcbiAgICAgIGxldCB1cmwgPSBgL21lc3NhZ2UvZGF0YT90eXBlPSR7dHlwZX1gO1xyXG4gICAgICBpZihmaXJzdE1lc3NhZ2VJZCkge1xyXG4gICAgICAgIHVybCArPSBgJmZpcnN0TWVzc2FnZUlkPSR7Zmlyc3RNZXNzYWdlSWR9YDtcclxuICAgICAgfVxyXG4gICAgICBpZih0VXNlci51aWQpIHtcclxuICAgICAgICB1cmwgKz0gYCZ1aWQ9JHt0VXNlci51aWR9YDtcclxuICAgICAgfVxyXG4gICAgICBpZihzZWxmLmdldE1lc3NhZ2VTdGF0dXMgIT09ICdjYW5Mb2FkJykgcmV0dXJuO1xyXG4gICAgICBzZWxmLmdldE1lc3NhZ2VTdGF0dXMgPSAnbG9hZGluZyc7XHJcbiAgICAgIHJldHVybiBua2NBUEkodXJsLCAnR0VUJylcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYub3JpZ2luTWVzc2FnZXMgPSBzZWxmLm9yaWdpbk1lc3NhZ2VzLmNvbmNhdChkYXRhLm1lc3NhZ2VzMik7XHJcbiAgICAgICAgICBpZihkYXRhLm1lc3NhZ2VzMi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZi5nZXRNZXNzYWdlU3RhdHVzID0gJ2NhbkxvYWQnO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5nZXRNZXNzYWdlU3RhdHVzID0gJ2NhbnRMb2FkJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYudG9hc3QoZGF0YSk7XHJcbiAgICAgICAgICBzZWxmLmdldE1lc3NhZ2VTdGF0dXMgPSAnY2FuTG9hZCc7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0T3JpZ2luTWVzc2FnZUJ5SWQoaWQpIHtcclxuICAgICAgZm9yKGNvbnN0IG0gb2YgdGhpcy5vcmlnaW5NZXNzYWdlcykge1xyXG4gICAgICAgIGlmKG0uX2lkID09PSBpZCkgcmV0dXJuIG07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBybuaOpeaUtuWIsOaWsOa2iOaBr+mAmuefpXdlYlxyXG4gICAgaW5zZXJ0TWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgICAgIGNvbnN0IHttZXNzYWdlVHlwZSwgciwgc30gPSBtZXNzYWdlO1xyXG4gICAgICBjb25zdCB7dFVzZXIsIG1Vc2VyfSA9IHRoaXM7XHJcblxyXG4gICAgICBpZihtZXNzYWdlVHlwZSA9PT0gJ1VUVScpIHtcclxuICAgICAgICBjb25zdCB1c2Vyc0lkID0gW3RVc2VyLnVpZCwgbVVzZXIudWlkXTtcclxuICAgICAgICBpZighdXNlcnNJZC5pbmNsdWRlcyhyKSB8fCAhdXNlcnNJZC5pbmNsdWRlcyhzKSkgcmV0dXJuO1xyXG4gICAgICAgIGlmKHRoaXMubVVzZXIudWlkICE9PSBtZXNzYWdlLnMpIHtcclxuICAgICAgICAgIHRoaXMubWFya0FzUmVhZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmKG1lc3NhZ2VUeXBlID09PSAnU1RVJykge1xyXG4gICAgICAgIGlmKHIgIT09IG1Vc2VyLnVpZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMubWFya0FzUmVhZCgpO1xyXG4gICAgICB9IGVsc2UgaWYobWVzc2FnZVR5cGUgPT09ICdTVEUnKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrQXNSZWFkKCk7XHJcbiAgICAgIH0gZWxzZSBpZihtZXNzYWdlVHlwZSA9PT0gJ2ZyaWVuZHNBcHBsaWNhdGlvbicpIHtcclxuICAgICAgICBpZihyICE9PSBtVXNlci51aWQpIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm9yaWdpbk1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgIH0sXHJcbiAgICAvLyDmkqTlm55cclxuICAgIHdpdGhkcmF3bihtZXNzYWdlSWQsIHRhcmdldFVzZXIpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIXRhcmdldFVzZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL21lc3NhZ2Uvd2l0aGRyYXduJywgJ1BBVENIJywge21lc3NhZ2VJZH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcmlnaW5NZXNzYWdlID0gc2VsZi5nZXRPcmlnaW5NZXNzYWdlQnlJZChtZXNzYWdlSWQpO1xyXG4gICAgICAgICAgaWYob3JpZ2luTWVzc2FnZSkgb3JpZ2luTWVzc2FnZS5jb250ZW50VHlwZSA9ICd3aXRoZHJhd24nO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHNlbGYudG9hc3QpXHJcbiAgICB9LFxyXG4gICAgLy8g5qCH6K6w5Li65bey6K+7XHJcbiAgICBtYXJrQXNSZWFkKCkge1xyXG4gICAgICBjb25zdCB7dHlwZSwgdFVzZXJ9ID0gc2VsZiA9IHRoaXM7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIG5rY0FQSSgnL21lc3NhZ2UvbWFyaycsICdQQVRDSCcsIHtcclxuICAgICAgICAgIHR5cGUsXHJcbiAgICAgICAgICB1aWQ6IHRVc2VyLnVpZFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goc2VsZi50b2FzdClcclxuICAgICAgfSwgMTAwMCk7XHJcblxyXG4gICAgfSxcclxuICAgIC8vIOiwg+eUqOWOn+eUn+aLjeeFp+OAgeW9leWDj+WSjOW9lemfs1xyXG4gICAgdXNlQ2FtZXJhKHR5cGUpIHtcclxuICAgICAgbGV0IG5hbWUgPSAndGFrZVBpY3R1cmVBbmRTZW5kVG9Vc2VyJztcclxuICAgICAgaWYodHlwZSA9PT0gJ3ZpZGVvJykge1xyXG4gICAgICAgIG5hbWUgPSAndGFrZVZpZGVvQW5kU2VuZFRvVXNlcic7XHJcbiAgICAgIH0gZWxzZSBpZih0eXBlID09PSAnYXVkaW8nKSB7XHJcbiAgICAgICAgbmFtZSA9ICdyZWNvcmRBdWRpb0FuZFNlbmRUb1VzZXInO1xyXG4gICAgICB9XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQobmFtZSwge1xyXG4gICAgICAgIHVpZDogdGhpcy50VXNlci51aWQsXHJcbiAgICAgICAgc29ja2V0SWQ6IG51bGxcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5aSE55CG5aW95Y+L5re75Yqg55Sz6K+3XHJcbiAgICBuZXdGcmllbmRPcGVyYXRpb24oaWQsIGFncmVlKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBjb25zdCBtZXNzYWdlID0gc2VsZi5nZXRPcmlnaW5NZXNzYWdlQnlJZChpZCk7XHJcbiAgICAgIG5rY0FQSSgnL3UvJyArIG1lc3NhZ2UucyArICcvZnJpZW5kcy9hZ3JlZScsICdQT1NUJywge1xyXG4gICAgICAgIGFncmVlLFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIG1lc3NhZ2UuY29udGVudCA9IGRhdGEubWVzc2FnZS5jb250ZW50O1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHNlbGYudG9hc3QpXHJcbiAgICB9XHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgLy8g56ys5LiA5p2h5raI5oGv55qESUTvvIznlKjmiLfliqDovb3mtojmga/lhoXlrrnliJfooahcclxuICAgIGZpcnN0TWVzc2FnZUlkKCkge1xyXG4gICAgICBjb25zdCB7bWVzc2FnZXN9ID0gdGhpcztcclxuICAgICAgZm9yKGNvbnN0IG0gb2YgbWVzc2FnZXMpIHtcclxuICAgICAgICBpZihtLmNvbnRlbnRUeXBlICE9PSAndGltZScpIHtcclxuICAgICAgICAgIHJldHVybiBtLl9pZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlpITnkIbov4fnmoTmtojmga/lhoXlrrnliJfooahcclxuICAgIG1lc3NhZ2VzKCkge1xyXG4gICAgICBjb25zdCB7b3JpZ2luTWVzc2FnZXMsIG1Vc2VyLCB0VXNlcn0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgbGV0IG1lc3NhZ2VzSWQgPSBbXTtcclxuICAgICAgY29uc3QgbWVzc2FnZXNPYmogPSB7fTtcclxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcclxuICAgICAgZm9yKGNvbnN0IG0gb2Ygb3JpZ2luTWVzc2FnZXMpIHtcclxuICAgICAgICBjb25zdCB7X2lkLCBzfSA9IG07XHJcbiAgICAgICAgY29uc3Qgb3duTWVzc2FnZSA9IHMgPT09IG1Vc2VyLnVpZDtcclxuICAgICAgICBtZXNzYWdlc0lkLnB1c2goX2lkKTtcclxuICAgICAgICBtLnBvc2l0aW9uID0gb3duTWVzc2FnZT8gJ3JpZ2h0JzogJ2xlZnQnO1xyXG4gICAgICAgIG0uc1VzZXIgPSBvd25NZXNzYWdlPyBtVXNlcjogdFVzZXI7XHJcbiAgICAgICAgbS5jYW5XaXRoZHJhd24gPSBtLnN0YXR1cyA9PT0gJ3NlbnQnICYmIG93bk1lc3NhZ2UgJiYgKG5vdyAtIG5ldyBEYXRlKG0udGltZSkgPCA2MDAwMCk7XHJcbiAgICAgICAgbWVzc2FnZXNPYmpbX2lkXSA9IG07XHJcbiAgICAgIH1cclxuICAgICAgbWVzc2FnZXNJZCA9IFsuLi5uZXcgU2V0KG1lc3NhZ2VzSWQpXTtcclxuICAgICAgbWVzc2FnZXNJZCA9IG1lc3NhZ2VzSWQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xyXG4gICAgICBmb3IoY29uc3QgaWQgb2YgbWVzc2FnZXNJZCkge1xyXG4gICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZXNPYmpbaWRdKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldXHJcbiAgICAgICAgY29uc3Qge3RpbWV9ID0gbWVzc2FnZTtcclxuICAgICAgICBpZihpID09PSAwKSB7XHJcbiAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAndGltZScsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IHRpbWUsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc3QgbGFzdE1lc3NhZ2UgPSBtZXNzYWdlc1tpIC0gMV07XHJcbiAgICAgICAgICBpZihuZXcgRGF0ZSh0aW1lKS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShsYXN0TWVzc2FnZS50aW1lKS5nZXRUaW1lKCkgPiA2MDAwMCkge1xyXG4gICAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgY29udGVudFR5cGU6ICd0aW1lJyxcclxuICAgICAgICAgICAgICBjb250ZW50OiB0aW1lLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYXJyLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IGxpc3RDb250ZW50ID0gc2VsZi4kcmVmcy5saXN0Q29udGVudDtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgaWYoc2VsZi5zaG93U3RpY2tlclBhbmVsKSB7XHJcbiAgICAgICAgc2VsZi5zd2l0Y2hTdGlja2VyUGFuZWwoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlbGYuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgIGxpc3RDb250ZW50Lm9uc2Nyb2xsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsVG9wO1xyXG4gICAgICBpZihzY3JvbGxUb3AgPiAyMCkgcmV0dXJuO1xyXG4gICAgICBsaXN0Q29udGVudC5zY3JvbGxUbyA9IGxpc3RDb250ZW50LnNjcm9sbFRvcDtcclxuICAgICAgbGlzdENvbnRlbnQuaGVpZ2h0ID0gbGlzdENvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICBzZWxmLmdldE1lc3NhZ2UoKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY29uc3QgaGVpZ2h0ID0gbGlzdENvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgbGlzdENvbnRlbnQuc2Nyb2xsVG9wID0gaGVpZ2h0IC0gbGlzdENvbnRlbnQuaGVpZ2h0O1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgc2VsZi50b2FzdChkYXRhLmVycm9yIHx8IGRhdGEubWVzc2FnZSB8fCBkYXRhKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXX0=
