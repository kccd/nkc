(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

      var _iterator = _createForOfIteratorHelper(this.messages),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var m = _step.value;

          if (m.contentType === 'img') {
            urls.push({
              name: m.content.filename,
              url: m.content.fileUrl
            });
          }
        } // urls.reverse();

      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
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
        NKC.methods.visitUrl(NKC.methods.tools.getUrl('userHome', message.s), true);
      } else {
        NKC.methods.visitUrl(NKC.methods.tools.getUrl('messageUserDetail', message.s), true);
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

      var _iterator2 = _createForOfIteratorHelper(fileDom.files),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var file = _step2.value;
          this.sendMessage('sendFile', file);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
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
      var _iterator3 = _createForOfIteratorHelper(this.originMessages),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var m = _step3.value;
          if (m._id === id) return m;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
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
          return nkcAPI('/message/withdrawn', 'PUT', {
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
        nkcAPI('/message/mark', 'PUT', {
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

      var _iterator4 = _createForOfIteratorHelper(this.originMessages),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var m = _step4.value;

          if (m.contentType === 'voice') {
            m.content.playStatus = 'unPlay';
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  },
  computed: {
    // 第一条消息的ID，用户加载消息内容列表
    firstMessageId: function firstMessageId() {
      var messages = this.messages;

      var _iterator5 = _createForOfIteratorHelper(messages),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var m = _step5.value;

          if (m.contentType !== 'time') {
            return m._id;
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
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

      var _iterator6 = _createForOfIteratorHelper(originMessages),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
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
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      messagesId = _toConsumableArray(new Set(messagesId));
      messagesId = messagesId.sort(function (a, b) {
        return a - b;
      });

      var _iterator7 = _createForOfIteratorHelper(messagesId),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var id = _step7.value;
          messages.push(messagesObj[id]);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL21lc3NhZ2UvYXBwQ29udGVudExpc3QvYXBwQ29udGVudExpc3QubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFKLEVBQWQ7QUFFQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSjtBQUNBLElBQUEsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFMLEtBQWEsRUFBYixHQUFrQixJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLEtBQWMsSUFBekIsQ0FGeEI7QUFHSjtBQUNBLElBQUEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUpQO0FBS0o7QUFDQSxJQUFBLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFOakI7QUFPSjtBQUNBLElBQUEsZ0JBQWdCLEVBQUUsS0FSZDtBQVNKO0FBQ0EsSUFBQSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BVlY7QUFXSjtBQUNBLElBQUEsS0FBSyxFQUFFLElBQUksQ0FBQyxLQVpSO0FBYUo7QUFDQSxJQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsS0FkUjtBQWVKO0FBQ0EsSUFBQSxPQUFPLEVBQUUsRUFoQkw7QUFpQko7QUFDQSxJQUFBLGdCQUFnQixFQUFFLFNBbEJkO0FBa0J5QjtBQUM3QjtBQUNBLElBQUEsS0FBSyxFQUFFLElBQUksS0FBSjtBQXBCSCxHQUZhO0FBd0JuQixFQUFBLE9BQU8sRUFBRTtBQUNQO0FBQ0EsSUFBQSxVQUFVLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxVQUZqQjtBQUdQ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Q0FBQyxnQkFBUixFQUEwQjtBQUN4QixRQUFBLElBQUksQ0FBQyxrQkFBTCxDQUF3QixLQUF4QjtBQUNEO0FBQ0YsS0FKRDtBQUtBLElBQUEsSUFBSSxDQUFDLGNBQUw7O0FBQ0EsSUFBQSxXQUFXLENBQUMsUUFBWixHQUF1QixZQUFXO0FBQ2hDLFVBQU0sU0FBUyxHQUFHLEtBQUssU0FBdkI7QUFDQSxVQUFHLFNBQVMsR0FBRyxFQUFmLEVBQW1CO0FBQ25CLE1BQUEsV0FBVyxDQUFDLFFBQVosR0FBdUIsV0FBVyxDQUFDLFNBQW5DO0FBQ0EsTUFBQSxXQUFXLENBQUMsTUFBWixHQUFxQixXQUFXLENBQUMsWUFBakM7QUFDQSxNQUFBLElBQUksQ0FBQyxVQUFMLEdBQ0csSUFESCxDQUNRLFlBQVc7QUFDZixZQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsWUFBM0I7QUFDQSxRQUFBLFdBQVcsQ0FBQyxTQUFaLEdBQXdCLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBN0M7QUFDRCxPQUpILFdBS1MsVUFBUyxJQUFULEVBQWM7QUFDbkIsUUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxLQUFMLElBQWMsSUFBSSxDQUFDLE9BQW5CLElBQThCLElBQXpDO0FBQ0QsT0FQSDtBQVNELEtBZEQ7O0FBZ0JBLElBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxnQkFBWCxDQUE0QixPQUE1QixFQUFxQyxZQUFNO0FBQ3pDLE1BQUEsSUFBSSxDQUFDLGFBQUw7QUFDRCxLQUZEO0FBR0Q7QUF2WmtCLENBQVIsQ0FBYiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZCgnZGF0YScpO1xyXG5jb25zdCBhdWRpbyA9IG5ldyBBdWRpbygpO1xyXG5cclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2FwcCcsXHJcbiAgZGF0YToge1xyXG4gICAgLy8gc29ja2V0SURcclxuICAgIHNvY2tldElkOiBEYXRlLm5vdygpICsgJycgKyBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkqMTAwMCksXHJcbiAgICAvLyDmtojmga/nsbvlnovvvIxVVFUsIFNUVSwgU1RFXHJcbiAgICB0eXBlOiBkYXRhLnR5cGUsXHJcbiAgICAvLyDmtojmga/lhoXlrrnliJfooahcclxuICAgIG9yaWdpbk1lc3NhZ2VzOiBkYXRhLm1lc3NhZ2VzLFxyXG4gICAgLy8g5piv5ZCm5pi+56S66KGo5oOF5YiX6KGoXHJcbiAgICBzaG93U3RpY2tlclBhbmVsOiBmYWxzZSxcclxuICAgIC8vIOihqOaDheaVsOaNrlxyXG4gICAgdHdlbW9qaTogZGF0YS50d2Vtb2ppLFxyXG4gICAgLy8g5a+55pa5XHJcbiAgICB0VXNlcjogZGF0YS50VXNlcixcclxuICAgIC8vIOiHquW3sVxyXG4gICAgbVVzZXI6IGRhdGEubVVzZXIsXHJcbiAgICAvLyDovpPlhaXmoYbovpPlhaXnmoTlhoXlrrlcclxuICAgIGNvbnRlbnQ6ICcnLFxyXG4gICAgLy8g6I635Y+W5raI5oGv5YaF5a65IOmUgVxyXG4gICAgZ2V0TWVzc2FnZVN0YXR1czogJ2NhbkxvYWQnLCAvLyBjYW5Mb2FkLCBsb2FkaW5nLCBjYW50TG9hZFxyXG4gICAgLy8g6K+t6Z+z5pKt5pS+5Zmo5a6e5L6LXHJcbiAgICBhdWRpbzogbmV3IEF1ZGlvKCksXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICAvLyDmoLzlvI/ljJbml7bpl7RcclxuICAgIHRpbWVGb3JtYXQ6IE5LQy5tZXRob2RzLnRpbWVGb3JtYXQsXHJcbiAgICAvLyDojrflj5bpk77mjqVcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgdG9hc3QoYykge1xyXG4gICAgICBjID0gYy5lcnJvciB8fCBjLm1lc3NhZ2UgfHwgYztcclxuICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgndG9hc3QnLCB7XHJcbiAgICAgICAgY29udGVudDogY1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDmu5rliqjlhoXlrrnliLDlupXpg6hcclxuICAgIHNjcm9sbFRvQm90dG9tKCkge1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBsaXN0Q29udGVudCA9IHRoaXMuJHJlZnMubGlzdENvbnRlbnQ7XHJcbiAgICAgICAgbGlzdENvbnRlbnQuc2Nyb2xsVG9wID0gbGlzdENvbnRlbnQuc2Nyb2xsSGVpZ2h0ICsgMTAwMDA7XHJcbiAgICAgIH0sIDIwMClcclxuICAgIH0sXHJcbiAgICAvLyDliIfmjaLooajmg4XpnaLmnb/nirbmgIFcclxuICAgIHN3aXRjaFN0aWNrZXJQYW5lbChmKSB7XHJcbiAgICAgIHRoaXMuc2hvd1N0aWNrZXJQYW5lbCA9IGYgPT09IHVuZGVmaW5lZD8gIXRoaXMuc2hvd1N0aWNrZXJQYW5lbDogISFmO1xyXG4gICAgfSxcclxuICAgIC8vIOmAieaLqeihqOaDhVxyXG4gICAgc2VsZWN0U3RpY2tlcih0bWopIHtcclxuICAgICAgY29uc3QgaW5wdXRUZXh0ID0gdGhpcy5jb250ZW50O1xyXG4gICAgICBjb25zdCBlID0gdGhpcy4kcmVmcy5pbnB1dDtcclxuICAgICAgbGV0IGluZGV4O1xyXG4gICAgICBpZiAoZS5zZWxlY3Rpb25TdGFydCkge1xyXG4gICAgICAgIGluZGV4ID0gZS5zZWxlY3Rpb25TdGFydDtcclxuICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcclxuICAgICAgICBlLmZvY3VzKCk7XHJcbiAgICAgICAgY29uc3QgciA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xyXG4gICAgICAgIGNvbnN0IHNyID0gci5kdXBsaWNhdGUoKTtcclxuICAgICAgICBzci5tb3ZlVG9FbGVtZW50VGV4dChlKTtcclxuICAgICAgICBzci5zZXRFbmRQb2ludCgnRW5kVG9FbmQnLCByKTtcclxuICAgICAgICBpbmRleCA9IHNyLnRleHQubGVuZ3RoIC0gci50ZXh0Lmxlbmd0aDtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBlbW9qaSA9ICdbZi8nICsgdG1qICsgJ10nO1xyXG5cclxuICAgICAgaWYoaW5kZXggPiAxKSB7XHJcbiAgICAgICAgY29uc3Qgc3RyID0gaW5wdXRUZXh0LnN1YnN0cmluZygwLCBpbmRleCk7XHJcbiAgICAgICAgY29uc3Qgc3RyMiA9IHN0ciArIGVtb2ppO1xyXG4gICAgICAgIHRoaXMuY29udGVudCA9IGlucHV0VGV4dC5yZXBsYWNlKHN0ciwgc3RyMik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50ID0gZW1vamkgKyAodGhpcy5jb250ZW50IHx8ICcnKTtcclxuICAgICAgfVxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICB0aGlzLmF1dG9SZXNpemUoKTtcclxuICAgICAgfSwgMjAwKTtcclxuXHJcbiAgICB9LFxyXG4gICAgLy8g6L6T5YWl5qGG6Ieq5Yqo6LCD5pW06auY5bqmXHJcbiAgICBhdXRvUmVzaXplKGluaXQpIHtcclxuICAgICAgY29uc3QgdGV4dEFyZWEgPSB0aGlzLiRyZWZzLmlucHV0O1xyXG4gICAgICBjb25zdCBudW0gPSAyLjggKiAxMjtcclxuICAgICAgdGV4dEFyZWEuc3R5bGUuaGVpZ2h0ID0gbnVtICsgJ3B4JztcclxuICAgICAgaWYoIWluaXQgJiYgbnVtIDwgdGV4dEFyZWEuc2Nyb2xsSGVpZ2h0KSB7XHJcbiAgICAgICAgdGV4dEFyZWEuc3R5bGUuaGVpZ2h0ID0gdGV4dEFyZWEuc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOi+k+WFpeahhuS/neaMgeiBmueEplxyXG4gICAga2VlcEZvY3VzKGZvY3VzKSB7XHJcbiAgICAgIGlmKGZvY3VzKSB7XHJcbiAgICAgICAgdGhpcy4kcmVmcy5pbnB1dC5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5rWP6KeI6IGK5aSp5YaF5a655Lit55qE5Zu+54mHXHJcbiAgICB2aXNpdEltYWdlcyh1cmwpIHtcclxuICAgICAgbGV0IHVybHMgPSBbXTtcclxuICAgICAgZm9yKGNvbnN0IG0gb2YgdGhpcy5tZXNzYWdlcykge1xyXG4gICAgICAgIGlmKG0uY29udGVudFR5cGUgPT09ICdpbWcnKSB7XHJcbiAgICAgICAgICB1cmxzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBtLmNvbnRlbnQuZmlsZW5hbWUsXHJcbiAgICAgICAgICAgIHVybDogbS5jb250ZW50LmZpbGVVcmxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyB1cmxzLnJldmVyc2UoKTtcclxuICAgICAgY29uc3QgaW5kZXggPSB1cmxzLm1hcCh1ID0+IHUudXJsKS5pbmRleE9mKHVybCk7XHJcbiAgICAgIHVybHMubWFwKHUgPT4gdS51cmwgPSBsb2NhdGlvbi5vcmlnaW4gKyB1LnVybCk7XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ3ZpZXdJbWFnZScsIHtcclxuICAgICAgICBpbmRleCxcclxuICAgICAgICB1cmxzXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgLy8g6K6/6Zeu55So5oi35Li76aG1XHJcbiAgICBvcGVuVXNlckhvbWUobWVzc2FnZSkge1xyXG4gICAgICBpZihtZXNzYWdlLm1lc3NhZ2VUeXBlICE9PSAnVVRVJykgcmV0dXJuO1xyXG4gICAgICBpZihOS0MuY29uZmlncy51aWQgPT09IG1lc3NhZ2Uucykge1xyXG4gICAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCgndXNlckhvbWUnLCBtZXNzYWdlLnMpLCB0cnVlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChOS0MubWV0aG9kcy50b29scy5nZXRVcmwoJ21lc3NhZ2VVc2VyRGV0YWlsJywgbWVzc2FnZS5zKSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDpgInmi6nmnKzlnLDpmYTku7ZcclxuICAgIHNlbGVjdExvY2FsRmlsZXMoKSB7XHJcbiAgICAgIGNvbnN0IGZpbGVEb20gPSB0aGlzLiRyZWZzLmZpbGU7XHJcbiAgICAgIGZpbGVEb20udmFsdWUgPSBudWxsO1xyXG4gICAgICBmaWxlRG9tLmNsaWNrKCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6YCJ5oup5a6M5pys5Zyw6ZmE5Lu2XHJcbiAgICBzZWxlY3RlZExvY2FsRmlsZXMoKSB7XHJcbiAgICAgIGNvbnN0IGZpbGVEb20gPSB0aGlzLiRyZWZzLmZpbGU7XHJcbiAgICAgIGZvcihjb25zdCBmaWxlIG9mIGZpbGVEb20uZmlsZXMpIHtcclxuICAgICAgICB0aGlzLnNlbmRNZXNzYWdlKCdzZW5kRmlsZScsIGZpbGUpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Y+R6YCB5raI5oGvXHJcbiAgICBzZW5kTWVzc2FnZSh0eXBlLCBjKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCdnZXRLZXlib2FyZFN0YXR1cycsIHt9LCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgc2VsZi5rZWVwRm9jdXMoZGF0YS5rZXlib2FyZFN0YXR1cyA9PT0gJ3Nob3cnKTtcclxuICAgICAgfSlcclxuICAgICAgbGV0IG1lc3NhZ2VcclxuXHJcbiAgICAgIGlmKFsnc2VuZFRleHQnLCAnc2VuZEZpbGUnXS5pbmNsdWRlcyh0eXBlKSkge1xyXG4gICAgICAgIC8vIOWPkemAgeS4gOadoeS/oeaBr1xyXG4gICAgICAgIGNvbnN0IGxvY2FsTWVzc2FnZUlkID0gRGF0ZS5ub3coKTtcclxuICAgICAgICBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgX2lkOiBsb2NhbE1lc3NhZ2VJZCxcclxuICAgICAgICAgIGNvbnRlbnRUeXBlOiAnaHRtbCcsXHJcbiAgICAgICAgICBzOiBzZWxmLm1Vc2VyLnVpZCxcclxuICAgICAgICAgIHI6IHNlbGYudFVzZXIudWlkLFxyXG4gICAgICAgICAgbWVzc2FnZVR5cGU6ICdVVFUnLFxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGlmKHR5cGUgPT09ICdzZW5kVGV4dCcpIHtcclxuICAgICAgICAgIG1lc3NhZ2UuY29udGVudCA9IGM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1lc3NhZ2UuY29udGVudCA9IGMubmFtZTtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2NvbnRlbnQnLCBtZXNzYWdlLmNvbnRlbnQpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc29ja2V0SWQnLCBzZWxmLnNvY2tldElkKTtcclxuICAgICAgICBtZXNzYWdlLmZvcm1EYXRhID0gZm9ybURhdGE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8g6YeN5Y+R5LiA5p2h5raI5oGvXHJcbiAgICAgICAgbWVzc2FnZSA9IGM7XHJcbiAgICAgIH1cclxuICAgICAgbWVzc2FnZS5zdGF0dXMgPSAnc2VuZGluZyc7IC8vIHNlbnTlt7Llj5HpgIHjgIFzZW5kaW5n5q2j5Zyo5Y+R6YCB44CBZXJyb3Llh7rplJlcclxuICAgICAgbWVzc2FnZS50aW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIW1lc3NhZ2UuY29udGVudCkgdGhyb3cgJ+ivt+i+k+WFpeiBiuWkqeWGheWuuSc7XHJcbiAgICAgICAgICBpZih0eXBlICE9PSAncmVzZW5kJykge1xyXG4gICAgICAgICAgICBzZWxmLm9yaWdpbk1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzZWxmLmNvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgICAgc2VsZi5hdXRvUmVzaXplKHRydWUpO1xyXG4gICAgICAgICAgc2VsZi5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgICAgICAgLy8gc2VsZi5rZWVwRm9jdXModHJ1ZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoYC9tZXNzYWdlL3VzZXIvJHttZXNzYWdlLnJ9YCwgJ1BPU1QnLCBtZXNzYWdlLmZvcm1EYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHNlbGYub3JpZ2luTWVzc2FnZXMuaW5kZXhPZihtZXNzYWdlKTtcclxuICAgICAgICAgIG1lc3NhZ2Uuc3RhdHVzID0gJ3NlbnQnO1xyXG4gICAgICAgICAgaWYoaW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICBWdWUuc2V0KHNlbGYub3JpZ2luTWVzc2FnZXMsIGluZGV4LCBkYXRhLm1lc3NhZ2UyKTtcclxuICAgICAgICAgICAgc2VsZi5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgbWVzc2FnZS5zdGF0dXMgPSAnZXJyb3InO1xyXG4gICAgICAgICAgc2VsZi50b2FzdChkYXRhLmVycm9yIHx8IGRhdGEubWVzc2FnZSB8fCBkYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIC8vIOiOt+WPlua2iOaBr1xyXG4gICAgZ2V0TWVzc2FnZSgpIHtcclxuICAgICAgY29uc3Qge2ZpcnN0TWVzc2FnZUlkLCB0VXNlciwgdHlwZX0gPSBzZWxmID0gdGhpcztcclxuICAgICAgbGV0IHVybCA9IGAvbWVzc2FnZS9kYXRhP3R5cGU9JHt0eXBlfWA7XHJcbiAgICAgIGlmKGZpcnN0TWVzc2FnZUlkKSB7XHJcbiAgICAgICAgdXJsICs9IGAmZmlyc3RNZXNzYWdlSWQ9JHtmaXJzdE1lc3NhZ2VJZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKHRVc2VyLnVpZCkge1xyXG4gICAgICAgIHVybCArPSBgJnVpZD0ke3RVc2VyLnVpZH1gO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKHNlbGYuZ2V0TWVzc2FnZVN0YXR1cyAhPT0gJ2NhbkxvYWQnKSByZXR1cm47XHJcbiAgICAgIHNlbGYuZ2V0TWVzc2FnZVN0YXR1cyA9ICdsb2FkaW5nJztcclxuICAgICAgcmV0dXJuIG5rY0FQSSh1cmwsICdHRVQnKVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZi5vcmlnaW5NZXNzYWdlcyA9IHNlbGYub3JpZ2luTWVzc2FnZXMuY29uY2F0KGRhdGEubWVzc2FnZXMyKTtcclxuICAgICAgICAgIGlmKGRhdGEubWVzc2FnZXMyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxmLmdldE1lc3NhZ2VTdGF0dXMgPSAnY2FuTG9hZCc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmdldE1lc3NhZ2VTdGF0dXMgPSAnY2FudExvYWQnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZi50b2FzdChkYXRhKTtcclxuICAgICAgICAgIHNlbGYuZ2V0TWVzc2FnZVN0YXR1cyA9ICdjYW5Mb2FkJztcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBnZXRPcmlnaW5NZXNzYWdlQnlJZChpZCkge1xyXG4gICAgICBmb3IoY29uc3QgbSBvZiB0aGlzLm9yaWdpbk1lc3NhZ2VzKSB7XHJcbiAgICAgICAgaWYobS5faWQgPT09IGlkKSByZXR1cm4gbTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIHJu5o6l5pS25Yiw5paw5raI5oGv6YCa55+ld2ViXHJcbiAgICBpbnNlcnRNZXNzYWdlKG1lc3NhZ2UpIHtcclxuICAgICAgY29uc3Qge21lc3NhZ2VUeXBlLCByLCBzfSA9IG1lc3NhZ2U7XHJcbiAgICAgIGNvbnN0IHt0VXNlciwgbVVzZXJ9ID0gdGhpcztcclxuXHJcbiAgICAgIGlmKG1lc3NhZ2VUeXBlID09PSAnVVRVJykge1xyXG4gICAgICAgIGNvbnN0IHVzZXJzSWQgPSBbdFVzZXIudWlkLCBtVXNlci51aWRdO1xyXG4gICAgICAgIGlmKCF1c2Vyc0lkLmluY2x1ZGVzKHIpIHx8ICF1c2Vyc0lkLmluY2x1ZGVzKHMpKSByZXR1cm47XHJcbiAgICAgICAgaWYodGhpcy5tVXNlci51aWQgIT09IG1lc3NhZ2Uucykge1xyXG4gICAgICAgICAgdGhpcy5tYXJrQXNSZWFkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYobWVzc2FnZVR5cGUgPT09ICdTVFUnKSB7XHJcbiAgICAgICAgaWYociAhPT0gbVVzZXIudWlkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5tYXJrQXNSZWFkKCk7XHJcbiAgICAgIH0gZWxzZSBpZihtZXNzYWdlVHlwZSA9PT0gJ1NURScpIHtcclxuICAgICAgICB0aGlzLm1hcmtBc1JlYWQoKTtcclxuICAgICAgfSBlbHNlIGlmKG1lc3NhZ2VUeXBlID09PSAnZnJpZW5kc0FwcGxpY2F0aW9uJykge1xyXG4gICAgICAgIGlmKHIgIT09IG1Vc2VyLnVpZCkgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMub3JpZ2luTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcclxuICAgICAgdGhpcy5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgfSxcclxuICAgIC8vIOaSpOWbnlxyXG4gICAgd2l0aGRyYXduKG1lc3NhZ2VJZCwgdGFyZ2V0VXNlcikge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBpZighdGFyZ2V0VXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gbmtjQVBJKCcvbWVzc2FnZS93aXRoZHJhd24nLCAnUFVUJywge21lc3NhZ2VJZH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBvcmlnaW5NZXNzYWdlID0gc2VsZi5nZXRPcmlnaW5NZXNzYWdlQnlJZChtZXNzYWdlSWQpO1xyXG4gICAgICAgICAgaWYob3JpZ2luTWVzc2FnZSkgb3JpZ2luTWVzc2FnZS5jb250ZW50VHlwZSA9ICd3aXRoZHJhd24nO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHNlbGYudG9hc3QpXHJcbiAgICB9LFxyXG4gICAgLy8g5qCH6K6w5Li65bey6K+7XHJcbiAgICBtYXJrQXNSZWFkKCkge1xyXG4gICAgICBjb25zdCB7dHlwZSwgdFVzZXJ9ID0gc2VsZiA9IHRoaXM7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIG5rY0FQSSgnL21lc3NhZ2UvbWFyaycsICdQVVQnLCB7XHJcbiAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgdWlkOiB0VXNlci51aWRcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKHNlbGYudG9hc3QpXHJcbiAgICAgIH0sIDEwMDApO1xyXG5cclxuICAgIH0sXHJcbiAgICAvLyDosIPnlKjljp/nlJ/mi43nhafjgIHlvZXlg4/lkozlvZXpn7NcclxuICAgIHVzZUNhbWVyYSh0eXBlKSB7XHJcbiAgICAgIGxldCBuYW1lID0gJ3Rha2VQaWN0dXJlQW5kU2VuZFRvVXNlcic7XHJcbiAgICAgIGlmKHR5cGUgPT09ICd2aWRlbycpIHtcclxuICAgICAgICBuYW1lID0gJ3Rha2VWaWRlb0FuZFNlbmRUb1VzZXInO1xyXG4gICAgICB9IGVsc2UgaWYodHlwZSA9PT0gJ2F1ZGlvJykge1xyXG4gICAgICAgIG5hbWUgPSAncmVjb3JkQXVkaW9BbmRTZW5kVG9Vc2VyJztcclxuICAgICAgfVxyXG4gICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KG5hbWUsIHtcclxuICAgICAgICB1aWQ6IHRoaXMudFVzZXIudWlkLFxyXG4gICAgICAgIHNvY2tldElkOiBudWxsXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOWkhOeQhuWlveWPi+a3u+WKoOeUs+ivt1xyXG4gICAgbmV3RnJpZW5kT3BlcmF0aW9uKGlkLCBhZ3JlZSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgY29uc3QgbWVzc2FnZSA9IHNlbGYuZ2V0T3JpZ2luTWVzc2FnZUJ5SWQoaWQpO1xyXG4gICAgICBua2NBUEkoJy91LycgKyBtZXNzYWdlLnMgKyAnL2ZyaWVuZHMvYWdyZWUnLCAnUE9TVCcsIHtcclxuICAgICAgICBhZ3JlZSxcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBkYXRhLm1lc3NhZ2UuY29udGVudDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzZWxmLnRvYXN0KVxyXG4gICAgfSxcclxuICAgIC8vIOaSreaUvuivremfs1xyXG4gICAgcGxheVZvaWNlKG1lc3NhZ2UpIHtcclxuICAgICAgY29uc3Qge2F1ZGlvLCBzdG9wUGxheVZvaWNlLCBnZXRPcmlnaW5NZXNzYWdlQnlJZH0gPSB0aGlzO1xyXG4gICAgICBpZihtZXNzYWdlLmNvbnRlbnQucGxheVN0YXR1cyA9PT0gJ3BsYXlpbmcnKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0b3BQbGF5Vm9pY2UoKTtcclxuICAgICAgfVxyXG4gICAgICBzdG9wUGxheVZvaWNlKCk7XHJcbiAgICAgIGF1ZGlvLnNyYyA9IG1lc3NhZ2UuY29udGVudC5maWxlVXJsICsgYCZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBhdWRpby5wbGF5KCk7XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luTWVzc2FnZSA9IGdldE9yaWdpbk1lc3NhZ2VCeUlkKG1lc3NhZ2UuX2lkKTtcclxuICAgICAgICBvcmlnaW5NZXNzYWdlLmNvbnRlbnQucGxheVN0YXR1cyA9ICdwbGF5aW5nJztcclxuICAgICAgfSwgMjAwKTtcclxuICAgIH0sXHJcbiAgICAvLyDlgZzmraLmkq3mlL7or63pn7NcclxuICAgIHN0b3BQbGF5Vm9pY2UoKSB7XHJcbiAgICAgIGNvbnN0IHthdWRpb30gPSB0aGlzO1xyXG4gICAgICB0cnl7XHJcbiAgICAgICAgYXVkaW8ucGF1c2UoKVxyXG4gICAgICB9IGNhdGNoKGVycikge31cclxuICAgICAgZm9yKGNvbnN0IG0gb2YgdGhpcy5vcmlnaW5NZXNzYWdlcykge1xyXG4gICAgICAgIGlmKG0uY29udGVudFR5cGUgPT09ICd2b2ljZScpIHtcclxuICAgICAgICAgIG0uY29udGVudC5wbGF5U3RhdHVzID0gJ3VuUGxheSc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIC8vIOesrOS4gOadoea2iOaBr+eahElE77yM55So5oi35Yqg6L295raI5oGv5YaF5a655YiX6KGoXHJcbiAgICBmaXJzdE1lc3NhZ2VJZCgpIHtcclxuICAgICAgY29uc3Qge21lc3NhZ2VzfSA9IHRoaXM7XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIG1lc3NhZ2VzKSB7XHJcbiAgICAgICAgaWYobS5jb250ZW50VHlwZSAhPT0gJ3RpbWUnKSB7XHJcbiAgICAgICAgICByZXR1cm4gbS5faWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5aSE55CG6L+H55qE5raI5oGv5YaF5a655YiX6KGoXHJcbiAgICBtZXNzYWdlcygpIHtcclxuICAgICAgY29uc3Qge29yaWdpbk1lc3NhZ2VzLCBtVXNlciwgdFVzZXJ9ID0gdGhpcztcclxuICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgIGxldCBtZXNzYWdlc0lkID0gW107XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2VzT2JqID0ge307XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIG9yaWdpbk1lc3NhZ2VzKSB7XHJcbiAgICAgICAgY29uc3Qge19pZCwgc30gPSBtO1xyXG4gICAgICAgIGNvbnN0IG93bk1lc3NhZ2UgPSBzID09PSBtVXNlci51aWQ7XHJcbiAgICAgICAgbWVzc2FnZXNJZC5wdXNoKF9pZCk7XHJcbiAgICAgICAgbS5wb3NpdGlvbiA9IG93bk1lc3NhZ2U/ICdyaWdodCc6ICdsZWZ0JztcclxuICAgICAgICBtLnNVc2VyID0gb3duTWVzc2FnZT8gbVVzZXI6IHRVc2VyO1xyXG4gICAgICAgIG0uY2FuV2l0aGRyYXduID0gbS5zdGF0dXMgPT09ICdzZW50JyAmJiBvd25NZXNzYWdlICYmIChub3cgLSBuZXcgRGF0ZShtLnRpbWUpIDwgNjAwMDApO1xyXG5cclxuICAgICAgICBtZXNzYWdlc09ialtfaWRdID0gbTtcclxuICAgICAgfVxyXG4gICAgICBtZXNzYWdlc0lkID0gWy4uLm5ldyBTZXQobWVzc2FnZXNJZCldO1xyXG4gICAgICBtZXNzYWdlc0lkID0gbWVzc2FnZXNJZC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XHJcbiAgICAgIGZvcihjb25zdCBpZCBvZiBtZXNzYWdlc0lkKSB7XHJcbiAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlc09ialtpZF0pO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGFyciA9IFtdO1xyXG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXNbaV1cclxuICAgICAgICBjb25zdCB7dGltZX0gPSBtZXNzYWdlO1xyXG4gICAgICAgIGlmKGkgPT09IDApIHtcclxuICAgICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgICAgY29udGVudFR5cGU6ICd0aW1lJyxcclxuICAgICAgICAgICAgY29udGVudDogdGltZSxcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBsYXN0TWVzc2FnZSA9IG1lc3NhZ2VzW2kgLSAxXTtcclxuICAgICAgICAgIGlmKG5ldyBEYXRlKHRpbWUpLmdldFRpbWUoKSAtIG5ldyBEYXRlKGxhc3RNZXNzYWdlLnRpbWUpLmdldFRpbWUoKSA+IDYwMDAwKSB7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ3RpbWUnLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IHRpbWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBhcnIucHVzaChtZXNzYWdlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3QgbGlzdENvbnRlbnQgPSBzZWxmLiRyZWZzLmxpc3RDb250ZW50O1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICBpZihzZWxmLnNob3dTdGlja2VyUGFuZWwpIHtcclxuICAgICAgICBzZWxmLnN3aXRjaFN0aWNrZXJQYW5lbChmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgbGlzdENvbnRlbnQub25zY3JvbGwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxUb3A7XHJcbiAgICAgIGlmKHNjcm9sbFRvcCA+IDIwKSByZXR1cm47XHJcbiAgICAgIGxpc3RDb250ZW50LnNjcm9sbFRvID0gbGlzdENvbnRlbnQuc2Nyb2xsVG9wO1xyXG4gICAgICBsaXN0Q29udGVudC5oZWlnaHQgPSBsaXN0Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgIHNlbGYuZ2V0TWVzc2FnZSgpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjb25zdCBoZWlnaHQgPSBsaXN0Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICBsaXN0Q29udGVudC5zY3JvbGxUb3AgPSBoZWlnaHQgLSBsaXN0Q29udGVudC5oZWlnaHQ7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSl7XHJcbiAgICAgICAgICBzZWxmLnRvYXN0KGRhdGEuZXJyb3IgfHwgZGF0YS5tZXNzYWdlIHx8IGRhdGEpO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbGYuYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCAoKSA9PiB7XHJcbiAgICAgIHNlbGYuc3RvcFBsYXlWb2ljZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuIl19
