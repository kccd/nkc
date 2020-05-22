(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var data = NKC.methods.getDataById('data');
var audio = new Audio();
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
    getMessageStatus: 'canLoad',
    // canLoad, loading, cantLoad
    // 语音播放器实例
    audio: new Audio()
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
    openUserHome: function openUserHome(message) {
      if (message.messageType !== 'UTU') return;

      if (NKC.configs.uid === message.s) {
        NKC.methods.rn.emit('openNewPage', {
          href: window.location.origin + NKC.methods.tools.getUrl('userHome', message.s)
        });
      } else {
        NKC.methods.rn.emit('openNewPage', {
          href: window.location.origin + NKC.methods.tools.getUrl('messageUserDetail', message.s)
        });
      }
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
    },
    // 播放语音
    playVoice: function playVoice(message) {
      var audio = this.audio,
          stopPlayVoice = this.stopPlayVoice,
          getOriginMessageById = this.getOriginMessageById;

      if (message.content.playStatus === 'playing') {
        return stopPlayVoice();
      }

      stopPlayVoice();
      audio.src = message.content.fileUrl + "&t=".concat(Date.now());
      setTimeout(function () {
        audio.play();
        var originMessage = getOriginMessageById(message._id);
        originMessage.content.playStatus = 'playing';
      }, 200);
    },
    // 停止播放语音
    stopPlayVoice: function stopPlayVoice() {
      var audio = this.audio;

      try {
        audio.pause();
      } catch (err) {}

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.originMessages[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var m = _step4.value;

          if (m.contentType === 'voice') {
            m.content.playStatus = 'unPlay';
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
    }
  },
  computed: {
    // 第一条消息的ID，用户加载消息内容列表
    firstMessageId: function firstMessageId() {
      var messages = this.messages;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = messages[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var m = _step5.value;

          if (m.contentType !== 'time') {
            return m._id;
          }
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
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = originMessages[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var m = _step6.value;
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

      messagesId = _toConsumableArray(new Set(messagesId));
      messagesId = messagesId.sort(function (a, b) {
        return a - b;
      });
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = messagesId[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var id = _step7.value;
          messages.push(messagesObj[id]);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
            _iterator7["return"]();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
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

    self.audio.addEventListener('ended', function () {
      self.stopPlayVoice();
    });
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL21lc3NhZ2UvYXBwQ29udGVudExpc3QvYXBwQ29udGVudExpc3QubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFKLEVBQWQ7QUFFQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSjtBQUNBLElBQUEsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFMLEtBQWEsRUFBYixHQUFrQixJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLEtBQWMsSUFBekIsQ0FGeEI7QUFHSjtBQUNBLElBQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUpQO0FBS0o7QUFDQSxJQUFBLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFOakI7QUFPSjtBQUNBLElBQUEsZ0JBQWdCLEVBQUUsS0FSZDtBQVNKO0FBQ0EsSUFBQSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BVlY7QUFXSjtBQUNBLElBQUEsS0FBSyxFQUFFLElBQUksQ0FBQyxLQVpSO0FBYUo7QUFDQSxJQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsS0FkUjtBQWVKO0FBQ0EsSUFBQSxPQUFPLEVBQUUsRUFoQkw7QUFpQko7QUFDQSxJQUFBLGdCQUFnQixFQUFFLFNBbEJkO0FBa0J5QjtBQUM3QjtBQUNBLElBQUEsS0FBSyxFQUFFLElBQUksS0FBSjtBQXBCSCxHQUZhO0FBd0JuQixFQUFBLE9BQU8sRUFBRTtBQUNQO0FBQ0EsSUFBQSxVQUFVLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxVQUZqQjtBQUdQO0FBQ0Es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Q0FBQyxNQUE3QztBQUNELE9BSkgsV0FLUyxVQUFTLElBQVQsRUFBYztBQUNuQixRQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLEtBQUwsSUFBYyxJQUFJLENBQUMsT0FBbkIsSUFBOEIsSUFBekM7QUFDRCxPQVBIO0FBU0QsS0FkRDs7QUFnQkEsSUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLGdCQUFYLENBQTRCLE9BQTVCLEVBQXFDLFlBQU07QUFDekMsTUFBQSxJQUFJLENBQUMsYUFBTDtBQUNELEtBRkQ7QUFHRDtBQTNaa0IsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKCdkYXRhJyk7XHJcbmNvbnN0IGF1ZGlvID0gbmV3IEF1ZGlvKCk7XHJcblxyXG53aW5kb3cuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6ICcjYXBwJyxcclxuICBkYXRhOiB7XHJcbiAgICAvLyBzb2NrZXRJRFxyXG4gICAgc29ja2V0SWQ6IERhdGUubm93KCkgKyAnJyArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSoxMDAwKSxcclxuICAgIC8vIOa2iOaBr+exu+Wei++8jFVUVSwgU1RVLCBTVEVcclxuICAgIHR5cGU6IGRhdGEudHlwZSxcclxuICAgIC8vIOa2iOaBr+WGheWuueWIl+ihqFxyXG4gICAgb3JpZ2luTWVzc2FnZXM6IGRhdGEubWVzc2FnZXMsXHJcbiAgICAvLyDmmK/lkKbmmL7npLrooajmg4XliJfooahcclxuICAgIHNob3dTdGlja2VyUGFuZWw6IGZhbHNlLFxyXG4gICAgLy8g6KGo5oOF5pWw5o2uXHJcbiAgICB0d2Vtb2ppOiBkYXRhLnR3ZW1vamksXHJcbiAgICAvLyDlr7nmlrlcclxuICAgIHRVc2VyOiBkYXRhLnRVc2VyLFxyXG4gICAgLy8g6Ieq5bexXHJcbiAgICBtVXNlcjogZGF0YS5tVXNlcixcclxuICAgIC8vIOi+k+WFpeahhui+k+WFpeeahOWGheWuuVxyXG4gICAgY29udGVudDogJycsXHJcbiAgICAvLyDojrflj5bmtojmga/lhoXlrrkg6ZSBXHJcbiAgICBnZXRNZXNzYWdlU3RhdHVzOiAnY2FuTG9hZCcsIC8vIGNhbkxvYWQsIGxvYWRpbmcsIGNhbnRMb2FkXHJcbiAgICAvLyDor63pn7Pmkq3mlL7lmajlrp7kvotcclxuICAgIGF1ZGlvOiBuZXcgQXVkaW8oKSxcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIC8vIOagvOW8j+WMluaXtumXtFxyXG4gICAgdGltZUZvcm1hdDogTktDLm1ldGhvZHMudGltZUZvcm1hdCxcclxuICAgIC8vIOiOt+WPlumTvuaOpVxyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICB0b2FzdChjKSB7XHJcbiAgICAgIGMgPSBjLmVycm9yIHx8IGMubWVzc2FnZSB8fCBjO1xyXG4gICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCd0b2FzdCcsIHtcclxuICAgICAgICBjb250ZW50OiBjXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOa7muWKqOWGheWuueWIsOW6lemDqFxyXG4gICAgc2Nyb2xsVG9Cb3R0b20oKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxpc3RDb250ZW50ID0gdGhpcy4kcmVmcy5saXN0Q29udGVudDtcclxuICAgICAgICBsaXN0Q29udGVudC5zY3JvbGxUb3AgPSBsaXN0Q29udGVudC5zY3JvbGxIZWlnaHQgKyAxMDAwMDtcclxuICAgICAgfSwgMjAwKVxyXG4gICAgfSxcclxuICAgIC8vIOWIh+aNouihqOaDhemdouadv+eKtuaAgVxyXG4gICAgc3dpdGNoU3RpY2tlclBhbmVsKGYpIHtcclxuICAgICAgdGhpcy5zaG93U3RpY2tlclBhbmVsID0gZiA9PT0gdW5kZWZpbmVkPyAhdGhpcy5zaG93U3RpY2tlclBhbmVsOiAhIWY7XHJcbiAgICB9LFxyXG4gICAgLy8g6YCJ5oup6KGo5oOFXHJcbiAgICBzZWxlY3RTdGlja2VyKHRtaikge1xyXG4gICAgICBjb25zdCBpbnB1dFRleHQgPSB0aGlzLmNvbnRlbnQ7XHJcbiAgICAgIGNvbnN0IGUgPSB0aGlzLiRyZWZzLmlucHV0O1xyXG4gICAgICBsZXQgaW5kZXg7XHJcbiAgICAgIGlmIChlLnNlbGVjdGlvblN0YXJ0KSB7XHJcbiAgICAgICAgaW5kZXggPSBlLnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xyXG4gICAgICAgIGUuZm9jdXMoKTtcclxuICAgICAgICBjb25zdCByID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgY29uc3Qgc3IgPSByLmR1cGxpY2F0ZSgpO1xyXG4gICAgICAgIHNyLm1vdmVUb0VsZW1lbnRUZXh0KGUpO1xyXG4gICAgICAgIHNyLnNldEVuZFBvaW50KCdFbmRUb0VuZCcsIHIpO1xyXG4gICAgICAgIGluZGV4ID0gc3IudGV4dC5sZW5ndGggLSByLnRleHQubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGVtb2ppID0gJ1tmLycgKyB0bWogKyAnXSc7XHJcblxyXG4gICAgICBpZihpbmRleCA+IDEpIHtcclxuICAgICAgICBjb25zdCBzdHIgPSBpbnB1dFRleHQuc3Vic3RyaW5nKDAsIGluZGV4KTtcclxuICAgICAgICBjb25zdCBzdHIyID0gc3RyICsgZW1vamk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50ID0gaW5wdXRUZXh0LnJlcGxhY2Uoc3RyLCBzdHIyKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSBlbW9qaSArICh0aGlzLmNvbnRlbnQgfHwgJycpO1xyXG4gICAgICB9XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXV0b1Jlc2l6ZSgpO1xyXG4gICAgICB9LCAyMDApO1xyXG5cclxuICAgIH0sXHJcbiAgICAvLyDovpPlhaXmoYboh6rliqjosIPmlbTpq5jluqZcclxuICAgIGF1dG9SZXNpemUoaW5pdCkge1xyXG4gICAgICBjb25zdCB0ZXh0QXJlYSA9IHRoaXMuJHJlZnMuaW5wdXQ7XHJcbiAgICAgIGNvbnN0IG51bSA9IDIuOCAqIDEyO1xyXG4gICAgICB0ZXh0QXJlYS5zdHlsZS5oZWlnaHQgPSBudW0gKyAncHgnO1xyXG4gICAgICBpZighaW5pdCAmJiBudW0gPCB0ZXh0QXJlYS5zY3JvbGxIZWlnaHQpIHtcclxuICAgICAgICB0ZXh0QXJlYS5zdHlsZS5oZWlnaHQgPSB0ZXh0QXJlYS5zY3JvbGxIZWlnaHQgKyAncHgnO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6L6T5YWl5qGG5L+d5oyB6IGa54SmXHJcbiAgICBrZWVwRm9jdXMoZm9jdXMpIHtcclxuICAgICAgaWYoZm9jdXMpIHtcclxuICAgICAgICB0aGlzLiRyZWZzLmlucHV0LmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDmtY/op4jogYrlpKnlhoXlrrnkuK3nmoTlm77niYdcclxuICAgIHZpc2l0SW1hZ2VzKHVybCkge1xyXG4gICAgICBsZXQgdXJscyA9IFtdO1xyXG4gICAgICBmb3IoY29uc3QgbSBvZiB0aGlzLm1lc3NhZ2VzKSB7XHJcbiAgICAgICAgaWYobS5jb250ZW50VHlwZSA9PT0gJ2ltZycpIHtcclxuICAgICAgICAgIHVybHMucHVzaCh7XHJcbiAgICAgICAgICAgIG5hbWU6IG0uY29udGVudC5maWxlbmFtZSxcclxuICAgICAgICAgICAgdXJsOiBtLmNvbnRlbnQuZmlsZVVybFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIHVybHMucmV2ZXJzZSgpO1xyXG4gICAgICBjb25zdCBpbmRleCA9IHVybHMubWFwKHUgPT4gdS51cmwpLmluZGV4T2YodXJsKTtcclxuICAgICAgdXJscy5tYXAodSA9PiB1LnVybCA9IGxvY2F0aW9uLm9yaWdpbiArIHUudXJsKTtcclxuICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgndmlld0ltYWdlJywge1xyXG4gICAgICAgIGluZGV4LFxyXG4gICAgICAgIHVybHNcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICAvLyDorr/pl67nlKjmiLfkuLvpobVcclxuICAgIG9wZW5Vc2VySG9tZShtZXNzYWdlKSB7XHJcbiAgICAgIGlmKG1lc3NhZ2UubWVzc2FnZVR5cGUgIT09ICdVVFUnKSByZXR1cm47XHJcbiAgICAgIGlmKE5LQy5jb25maWdzLnVpZCA9PT0gbWVzc2FnZS5zKSB7XHJcbiAgICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgnb3Blbk5ld1BhZ2UnLCB7XHJcbiAgICAgICAgICBocmVmOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsKCd1c2VySG9tZScsIG1lc3NhZ2UucylcclxuICAgICAgICB9KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ29wZW5OZXdQYWdlJywge1xyXG4gICAgICAgICAgaHJlZjogd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCgnbWVzc2FnZVVzZXJEZXRhaWwnLCBtZXNzYWdlLnMpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmAieaLqeacrOWcsOmZhOS7tlxyXG4gICAgc2VsZWN0TG9jYWxGaWxlcygpIHtcclxuICAgICAgY29uc3QgZmlsZURvbSA9IHRoaXMuJHJlZnMuZmlsZTtcclxuICAgICAgZmlsZURvbS52YWx1ZSA9IG51bGw7XHJcbiAgICAgIGZpbGVEb20uY2xpY2soKTtcclxuICAgIH0sXHJcbiAgICAvLyDpgInmi6nlrozmnKzlnLDpmYTku7ZcclxuICAgIHNlbGVjdGVkTG9jYWxGaWxlcygpIHtcclxuICAgICAgY29uc3QgZmlsZURvbSA9IHRoaXMuJHJlZnMuZmlsZTtcclxuICAgICAgZm9yKGNvbnN0IGZpbGUgb2YgZmlsZURvbS5maWxlcykge1xyXG4gICAgICAgIHRoaXMuc2VuZE1lc3NhZ2UoJ3NlbmRGaWxlJywgZmlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlj5HpgIHmtojmga9cclxuICAgIHNlbmRNZXNzYWdlKHR5cGUsIGMpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ2dldEtleWJvYXJkU3RhdHVzJywge30sIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBzZWxmLmtlZXBGb2N1cyhkYXRhLmtleWJvYXJkU3RhdHVzID09PSAnc2hvdycpO1xyXG4gICAgICB9KVxyXG4gICAgICBsZXQgbWVzc2FnZVxyXG5cclxuICAgICAgaWYoWydzZW5kVGV4dCcsICdzZW5kRmlsZSddLmluY2x1ZGVzKHR5cGUpKSB7XHJcbiAgICAgICAgLy8g5Y+R6YCB5LiA5p2h5L+h5oGvXHJcbiAgICAgICAgY29uc3QgbG9jYWxNZXNzYWdlSWQgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIG1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICBfaWQ6IGxvY2FsTWVzc2FnZUlkLFxyXG4gICAgICAgICAgY29udGVudFR5cGU6ICdodG1sJyxcclxuICAgICAgICAgIHM6IHNlbGYubVVzZXIudWlkLFxyXG4gICAgICAgICAgcjogc2VsZi50VXNlci51aWQsXHJcbiAgICAgICAgICBtZXNzYWdlVHlwZTogJ1VUVScsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ3NlbmRUZXh0Jykge1xyXG4gICAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gYztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gYy5uYW1lO1xyXG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgYyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnY29udGVudCcsIG1lc3NhZ2UuY29udGVudCk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdzb2NrZXRJZCcsIHNlbGYuc29ja2V0SWQpO1xyXG4gICAgICAgIG1lc3NhZ2UuZm9ybURhdGEgPSBmb3JtRGF0YTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyDph43lj5HkuIDmnaHmtojmga9cclxuICAgICAgICBtZXNzYWdlID0gYztcclxuICAgICAgfVxyXG4gICAgICBtZXNzYWdlLnN0YXR1cyA9ICdzZW5kaW5nJzsgLy8gc2VudOW3suWPkemAgeOAgXNlbmRpbmfmraPlnKjlj5HpgIHjgIFlcnJvcuWHuumUmVxyXG4gICAgICBtZXNzYWdlLnRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBpZighbWVzc2FnZS5jb250ZW50KSB0aHJvdyAn6K+36L6T5YWl6IGK5aSp5YaF5a65JztcclxuICAgICAgICAgIGlmKHR5cGUgIT09ICdyZXNlbmQnKSB7XHJcbiAgICAgICAgICAgIHNlbGYub3JpZ2luTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNlbGYuY29udGVudCA9IFwiXCI7XHJcbiAgICAgICAgICBzZWxmLmF1dG9SZXNpemUodHJ1ZSk7XHJcbiAgICAgICAgICBzZWxmLnNjcm9sbFRvQm90dG9tKCk7XHJcbiAgICAgICAgICAvLyBzZWxmLmtlZXBGb2N1cyh0cnVlKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZShgL21lc3NhZ2UvdXNlci8ke21lc3NhZ2Uucn1gLCAnUE9TVCcsIG1lc3NhZ2UuZm9ybURhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGluZGV4ID0gc2VsZi5vcmlnaW5NZXNzYWdlcy5pbmRleE9mKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgbWVzc2FnZS5zdGF0dXMgPSAnc2VudCc7XHJcbiAgICAgICAgICBpZihpbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgIFZ1ZS5zZXQoc2VsZi5vcmlnaW5NZXNzYWdlcywgaW5kZXgsIGRhdGEubWVzc2FnZTIpO1xyXG4gICAgICAgICAgICBzZWxmLnNjcm9sbFRvQm90dG9tKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgICAgICBtZXNzYWdlLnN0YXR1cyA9ICdlcnJvcic7XHJcbiAgICAgICAgICBzZWxmLnRvYXN0KGRhdGEuZXJyb3IgfHwgZGF0YS5tZXNzYWdlIHx8IGRhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgLy8g6I635Y+W5raI5oGvXHJcbiAgICBnZXRNZXNzYWdlKCkge1xyXG4gICAgICBjb25zdCB7Zmlyc3RNZXNzYWdlSWQsIHRVc2VyLCB0eXBlfSA9IHNlbGYgPSB0aGlzO1xyXG4gICAgICBsZXQgdXJsID0gYC9tZXNzYWdlL2RhdGE/dHlwZT0ke3R5cGV9YDtcclxuICAgICAgaWYoZmlyc3RNZXNzYWdlSWQpIHtcclxuICAgICAgICB1cmwgKz0gYCZmaXJzdE1lc3NhZ2VJZD0ke2ZpcnN0TWVzc2FnZUlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgaWYodFVzZXIudWlkKSB7XHJcbiAgICAgICAgdXJsICs9IGAmdWlkPSR7dFVzZXIudWlkfWA7XHJcbiAgICAgIH1cclxuICAgICAgaWYoc2VsZi5nZXRNZXNzYWdlU3RhdHVzICE9PSAnY2FuTG9hZCcpIHJldHVybjtcclxuICAgICAgc2VsZi5nZXRNZXNzYWdlU3RhdHVzID0gJ2xvYWRpbmcnO1xyXG4gICAgICByZXR1cm4gbmtjQVBJKHVybCwgJ0dFVCcpXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBzZWxmLm9yaWdpbk1lc3NhZ2VzID0gc2VsZi5vcmlnaW5NZXNzYWdlcy5jb25jYXQoZGF0YS5tZXNzYWdlczIpO1xyXG4gICAgICAgICAgaWYoZGF0YS5tZXNzYWdlczIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZ2V0TWVzc2FnZVN0YXR1cyA9ICdjYW5Mb2FkJztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuZ2V0TWVzc2FnZVN0YXR1cyA9ICdjYW50TG9hZCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnRvYXN0KGRhdGEpO1xyXG4gICAgICAgICAgc2VsZi5nZXRNZXNzYWdlU3RhdHVzID0gJ2NhbkxvYWQnO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGdldE9yaWdpbk1lc3NhZ2VCeUlkKGlkKSB7XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIHRoaXMub3JpZ2luTWVzc2FnZXMpIHtcclxuICAgICAgICBpZihtLl9pZCA9PT0gaWQpIHJldHVybiBtO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8gcm7mjqXmlLbliLDmlrDmtojmga/pgJrnn6V3ZWJcclxuICAgIGluc2VydE1lc3NhZ2UobWVzc2FnZSkge1xyXG4gICAgICBjb25zdCB7bWVzc2FnZVR5cGUsIHIsIHN9ID0gbWVzc2FnZTtcclxuICAgICAgY29uc3Qge3RVc2VyLCBtVXNlcn0gPSB0aGlzO1xyXG5cclxuICAgICAgaWYobWVzc2FnZVR5cGUgPT09ICdVVFUnKSB7XHJcbiAgICAgICAgY29uc3QgdXNlcnNJZCA9IFt0VXNlci51aWQsIG1Vc2VyLnVpZF07XHJcbiAgICAgICAgaWYoIXVzZXJzSWQuaW5jbHVkZXMocikgfHwgIXVzZXJzSWQuaW5jbHVkZXMocykpIHJldHVybjtcclxuICAgICAgICBpZih0aGlzLm1Vc2VyLnVpZCAhPT0gbWVzc2FnZS5zKSB7XHJcbiAgICAgICAgICB0aGlzLm1hcmtBc1JlYWQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZihtZXNzYWdlVHlwZSA9PT0gJ1NUVScpIHtcclxuICAgICAgICBpZihyICE9PSBtVXNlci51aWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLm1hcmtBc1JlYWQoKTtcclxuICAgICAgfSBlbHNlIGlmKG1lc3NhZ2VUeXBlID09PSAnU1RFJykge1xyXG4gICAgICAgIHRoaXMubWFya0FzUmVhZCgpO1xyXG4gICAgICB9IGVsc2UgaWYobWVzc2FnZVR5cGUgPT09ICdmcmllbmRzQXBwbGljYXRpb24nKSB7XHJcbiAgICAgICAgaWYociAhPT0gbVVzZXIudWlkKSByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5vcmlnaW5NZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5pKk5ZueXHJcbiAgICB3aXRoZHJhd24obWVzc2FnZUlkLCB0YXJnZXRVc2VyKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCF0YXJnZXRVc2VyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBua2NBUEkoJy9tZXNzYWdlL3dpdGhkcmF3bicsICdQQVRDSCcsIHttZXNzYWdlSWR9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3JpZ2luTWVzc2FnZSA9IHNlbGYuZ2V0T3JpZ2luTWVzc2FnZUJ5SWQobWVzc2FnZUlkKTtcclxuICAgICAgICAgIGlmKG9yaWdpbk1lc3NhZ2UpIG9yaWdpbk1lc3NhZ2UuY29udGVudFR5cGUgPSAnd2l0aGRyYXduJztcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzZWxmLnRvYXN0KVxyXG4gICAgfSxcclxuICAgIC8vIOagh+iusOS4uuW3suivu1xyXG4gICAgbWFya0FzUmVhZCgpIHtcclxuICAgICAgY29uc3Qge3R5cGUsIHRVc2VyfSA9IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBua2NBUEkoJy9tZXNzYWdlL21hcmsnLCAnUEFUQ0gnLCB7XHJcbiAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgdWlkOiB0VXNlci51aWRcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKHNlbGYudG9hc3QpXHJcbiAgICAgIH0sIDEwMDApO1xyXG5cclxuICAgIH0sXHJcbiAgICAvLyDosIPnlKjljp/nlJ/mi43nhafjgIHlvZXlg4/lkozlvZXpn7NcclxuICAgIHVzZUNhbWVyYSh0eXBlKSB7XHJcbiAgICAgIGxldCBuYW1lID0gJ3Rha2VQaWN0dXJlQW5kU2VuZFRvVXNlcic7XHJcbiAgICAgIGlmKHR5cGUgPT09ICd2aWRlbycpIHtcclxuICAgICAgICBuYW1lID0gJ3Rha2VWaWRlb0FuZFNlbmRUb1VzZXInO1xyXG4gICAgICB9IGVsc2UgaWYodHlwZSA9PT0gJ2F1ZGlvJykge1xyXG4gICAgICAgIG5hbWUgPSAncmVjb3JkQXVkaW9BbmRTZW5kVG9Vc2VyJztcclxuICAgICAgfVxyXG4gICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KG5hbWUsIHtcclxuICAgICAgICB1aWQ6IHRoaXMudFVzZXIudWlkLFxyXG4gICAgICAgIHNvY2tldElkOiBudWxsXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOWkhOeQhuWlveWPi+a3u+WKoOeUs+ivt1xyXG4gICAgbmV3RnJpZW5kT3BlcmF0aW9uKGlkLCBhZ3JlZSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgY29uc3QgbWVzc2FnZSA9IHNlbGYuZ2V0T3JpZ2luTWVzc2FnZUJ5SWQoaWQpO1xyXG4gICAgICBua2NBUEkoJy91LycgKyBtZXNzYWdlLnMgKyAnL2ZyaWVuZHMvYWdyZWUnLCAnUE9TVCcsIHtcclxuICAgICAgICBhZ3JlZSxcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBkYXRhLm1lc3NhZ2UuY29udGVudDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzZWxmLnRvYXN0KVxyXG4gICAgfSxcclxuICAgIC8vIOaSreaUvuivremfs1xyXG4gICAgcGxheVZvaWNlKG1lc3NhZ2UpIHtcclxuICAgICAgY29uc3Qge2F1ZGlvLCBzdG9wUGxheVZvaWNlLCBnZXRPcmlnaW5NZXNzYWdlQnlJZH0gPSB0aGlzO1xyXG4gICAgICBpZihtZXNzYWdlLmNvbnRlbnQucGxheVN0YXR1cyA9PT0gJ3BsYXlpbmcnKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0b3BQbGF5Vm9pY2UoKTtcclxuICAgICAgfVxyXG4gICAgICBzdG9wUGxheVZvaWNlKCk7XHJcbiAgICAgIGF1ZGlvLnNyYyA9IG1lc3NhZ2UuY29udGVudC5maWxlVXJsICsgYCZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBhdWRpby5wbGF5KCk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luTWVzc2FnZSA9IGdldE9yaWdpbk1lc3NhZ2VCeUlkKG1lc3NhZ2UuX2lkKTtcclxuICAgICAgICBvcmlnaW5NZXNzYWdlLmNvbnRlbnQucGxheVN0YXR1cyA9ICdwbGF5aW5nJztcclxuICAgICAgfSwgMjAwKTtcclxuICAgIH0sXHJcbiAgICAvLyDlgZzmraLmkq3mlL7or63pn7NcclxuICAgIHN0b3BQbGF5Vm9pY2UoKSB7XHJcbiAgICAgIGNvbnN0IHthdWRpb30gPSB0aGlzO1xyXG4gICAgICB0cnl7XHJcbiAgICAgICAgYXVkaW8ucGF1c2UoKVxyXG4gICAgICB9IGNhdGNoKGVycikge31cclxuICAgICAgZm9yKGNvbnN0IG0gb2YgdGhpcy5vcmlnaW5NZXNzYWdlcykge1xyXG4gICAgICAgIGlmKG0uY29udGVudFR5cGUgPT09ICd2b2ljZScpIHtcclxuICAgICAgICAgIG0uY29udGVudC5wbGF5U3RhdHVzID0gJ3VuUGxheSc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIC8vIOesrOS4gOadoea2iOaBr+eahElE77yM55So5oi35Yqg6L295raI5oGv5YaF5a655YiX6KGoXHJcbiAgICBmaXJzdE1lc3NhZ2VJZCgpIHtcclxuICAgICAgY29uc3Qge21lc3NhZ2VzfSA9IHRoaXM7XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIG1lc3NhZ2VzKSB7XHJcbiAgICAgICAgaWYobS5jb250ZW50VHlwZSAhPT0gJ3RpbWUnKSB7XHJcbiAgICAgICAgICByZXR1cm4gbS5faWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5aSE55CG6L+H55qE5raI5oGv5YaF5a655YiX6KGoXHJcbiAgICBtZXNzYWdlcygpIHtcclxuICAgICAgY29uc3Qge29yaWdpbk1lc3NhZ2VzLCBtVXNlciwgdFVzZXJ9ID0gdGhpcztcclxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgIGxldCBtZXNzYWdlc0lkID0gW107XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2VzT2JqID0ge307XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIG9yaWdpbk1lc3NhZ2VzKSB7XHJcbiAgICAgICAgY29uc3Qge19pZCwgc30gPSBtO1xyXG4gICAgICAgIGNvbnN0IG93bk1lc3NhZ2UgPSBzID09PSBtVXNlci51aWQ7XHJcbiAgICAgICAgbWVzc2FnZXNJZC5wdXNoKF9pZCk7XHJcbiAgICAgICAgbS5wb3NpdGlvbiA9IG93bk1lc3NhZ2U/ICdyaWdodCc6ICdsZWZ0JztcclxuICAgICAgICBtLnNVc2VyID0gb3duTWVzc2FnZT8gbVVzZXI6IHRVc2VyO1xyXG4gICAgICAgIG0uY2FuV2l0aGRyYXduID0gbS5zdGF0dXMgPT09ICdzZW50JyAmJiBvd25NZXNzYWdlICYmIChub3cgLSBuZXcgRGF0ZShtLnRpbWUpIDwgNjAwMDApO1xyXG5cclxuICAgICAgICBtZXNzYWdlc09ialtfaWRdID0gbTtcclxuICAgICAgfVxyXG4gICAgICBtZXNzYWdlc0lkID0gWy4uLm5ldyBTZXQobWVzc2FnZXNJZCldO1xyXG4gICAgICBtZXNzYWdlc0lkID0gbWVzc2FnZXNJZC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XHJcbiAgICAgIGZvcihjb25zdCBpZCBvZiBtZXNzYWdlc0lkKSB7XHJcbiAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlc09ialtpZF0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGFyciA9IFtdO1xyXG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXNbaV1cclxuICAgICAgICBjb25zdCB7dGltZX0gPSBtZXNzYWdlO1xyXG4gICAgICAgIGlmKGkgPT09IDApIHtcclxuICAgICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgICAgY29udGVudFR5cGU6ICd0aW1lJyxcclxuICAgICAgICAgICAgY29udGVudDogdGltZSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBsYXN0TWVzc2FnZSA9IG1lc3NhZ2VzW2kgLSAxXTtcclxuICAgICAgICAgIGlmKG5ldyBEYXRlKHRpbWUpLmdldFRpbWUoKSAtIG5ldyBEYXRlKGxhc3RNZXNzYWdlLnRpbWUpLmdldFRpbWUoKSA+IDYwMDAwKSB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ3RpbWUnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IHRpbWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBhcnIucHVzaChtZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3QgbGlzdENvbnRlbnQgPSBzZWxmLiRyZWZzLmxpc3RDb250ZW50O1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBpZihzZWxmLnNob3dTdGlja2VyUGFuZWwpIHtcclxuICAgICAgICBzZWxmLnN3aXRjaFN0aWNrZXJQYW5lbChmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgbGlzdENvbnRlbnQub25zY3JvbGwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxUb3A7XHJcbiAgICAgIGlmKHNjcm9sbFRvcCA+IDIwKSByZXR1cm47XHJcbiAgICAgIGxpc3RDb250ZW50LnNjcm9sbFRvID0gbGlzdENvbnRlbnQuc2Nyb2xsVG9wO1xyXG4gICAgICBsaXN0Q29udGVudC5oZWlnaHQgPSBsaXN0Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgIHNlbGYuZ2V0TWVzc2FnZSgpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjb25zdCBoZWlnaHQgPSBsaXN0Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICBsaXN0Q29udGVudC5zY3JvbGxUb3AgPSBoZWlnaHQgLSBsaXN0Q29udGVudC5oZWlnaHQ7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICBzZWxmLnRvYXN0KGRhdGEuZXJyb3IgfHwgZGF0YS5tZXNzYWdlIHx8IGRhdGEpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCAoKSA9PiB7XHJcbiAgICAgIHNlbGYuc3RvcFBsYXlWb2ljZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuIl19
