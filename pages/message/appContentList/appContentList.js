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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9tZXNzYWdlL2FwcENvbnRlbnRMaXN0L2FwcENvbnRlbnRMaXN0Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sS0FBSyxHQUFHLElBQUksS0FBSixFQUFkO0FBRUEsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFJLEdBQUosQ0FBUTtBQUNuQixFQUFBLEVBQUUsRUFBRSxNQURlO0FBRW5CLEVBQUEsSUFBSSxFQUFFO0FBQ0o7QUFDQSxJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBTCxLQUFhLEVBQWIsR0FBa0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxLQUFjLElBQXpCLENBRnhCO0FBR0o7QUFDQSxJQUFBLElBQUksRUFBRSxJQUFJLENBQUMsSUFKUDtBQUtKO0FBQ0EsSUFBQSxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBTmpCO0FBT0o7QUFDQSxJQUFBLGdCQUFnQixFQUFFLEtBUmQ7QUFTSjtBQUNBLElBQUEsT0FBTyxFQUFFLElBQUksQ0FBQyxPQVZWO0FBV0o7QUFDQSxJQUFBLEtBQUssRUFBRSxJQUFJLENBQUMsS0FaUjtBQWFKO0FBQ0EsSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBZFI7QUFlSjtBQUNBLElBQUEsT0FBTyxFQUFFLEVBaEJMO0FBaUJKO0FBQ0EsSUFBQSxnQkFBZ0IsRUFBRSxTQWxCZDtBQWtCeUI7QUFDN0I7QUFDQSxJQUFBLEtBQUssRUFBRSxJQUFJLEtBQUo7QUFwQkgsR0FGYTtBQXdCbkIsRUFBQSxPQUFPLEVBQUU7QUFDUDtBQUNBLElBQUEsVUFBVSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFGakI7QUFHUDtBQUNBLElBQUEsTUFBTSxFQUFF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eEIsUUFBQSxJQUFJLENBQUMsa0JBQUwsQ0FBd0IsS0FBeEI7QUFDRDtBQUNGLEtBSkQ7QUFLQSxJQUFBLElBQUksQ0FBQyxjQUFMOztBQUNBLElBQUEsV0FBVyxDQUFDLFFBQVosR0FBdUIsWUFBVztBQUNoQyxVQUFNLFNBQVMsR0FBRyxLQUFLLFNBQXZCO0FBQ0EsVUFBRyxTQUFTLEdBQUcsRUFBZixFQUFtQjtBQUNuQixNQUFBLFdBQVcsQ0FBQyxRQUFaLEdBQXVCLFdBQVcsQ0FBQyxTQUFuQztBQUNBLE1BQUEsV0FBVyxDQUFDLE1BQVosR0FBcUIsV0FBVyxDQUFDLFlBQWpDO0FBQ0EsTUFBQSxJQUFJLENBQUMsVUFBTCxHQUNHLElBREgsQ0FDUSxZQUFXO0FBQ2YsWUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLFlBQTNCO0FBQ0EsUUFBQSxXQUFXLENBQUMsU0FBWixHQUF3QixNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQTdDO0FBQ0QsT0FKSCxXQUtTLFVBQVMsSUFBVCxFQUFjO0FBQ25CLFFBQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsS0FBTCxJQUFjLElBQUksQ0FBQyxPQUFuQixJQUE4QixJQUF6QztBQUNELE9BUEg7QUFTRCxLQWREOztBQWdCQSxJQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsZ0JBQVgsQ0FBNEIsT0FBNUIsRUFBcUMsWUFBTTtBQUN6QyxNQUFBLElBQUksQ0FBQyxhQUFMO0FBQ0QsS0FGRDtBQUdEO0FBdlprQixDQUFSLENBQWIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxuY29uc3QgYXVkaW8gPSBuZXcgQXVkaW8oKTtcclxuXHJcbndpbmRvdy5hcHAgPSBuZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIGRhdGE6IHtcclxuICAgIC8vIHNvY2tldElEXHJcbiAgICBzb2NrZXRJZDogRGF0ZS5ub3coKSArICcnICsgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKjEwMDApLFxyXG4gICAgLy8g5raI5oGv57G75Z6L77yMVVRVLCBTVFUsIFNURVxyXG4gICAgdHlwZTogZGF0YS50eXBlLFxyXG4gICAgLy8g5raI5oGv5YaF5a655YiX6KGoXHJcbiAgICBvcmlnaW5NZXNzYWdlczogZGF0YS5tZXNzYWdlcyxcclxuICAgIC8vIOaYr+WQpuaYvuekuuihqOaDheWIl+ihqFxyXG4gICAgc2hvd1N0aWNrZXJQYW5lbDogZmFsc2UsXHJcbiAgICAvLyDooajmg4XmlbDmja5cclxuICAgIHR3ZW1vamk6IGRhdGEudHdlbW9qaSxcclxuICAgIC8vIOWvueaWuVxyXG4gICAgdFVzZXI6IGRhdGEudFVzZXIsXHJcbiAgICAvLyDoh6rlt7FcclxuICAgIG1Vc2VyOiBkYXRhLm1Vc2VyLFxyXG4gICAgLy8g6L6T5YWl5qGG6L6T5YWl55qE5YaF5a65XHJcbiAgICBjb250ZW50OiAnJyxcclxuICAgIC8vIOiOt+WPlua2iOaBr+WGheWuuSDplIFcclxuICAgIGdldE1lc3NhZ2VTdGF0dXM6ICdjYW5Mb2FkJywgLy8gY2FuTG9hZCwgbG9hZGluZywgY2FudExvYWRcclxuICAgIC8vIOivremfs+aSreaUvuWZqOWunuS+i1xyXG4gICAgYXVkaW86IG5ldyBBdWRpbygpLFxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgLy8g5qC85byP5YyW5pe26Ze0XHJcbiAgICB0aW1lRm9ybWF0OiBOS0MubWV0aG9kcy50aW1lRm9ybWF0LFxyXG4gICAgLy8g6I635Y+W6ZO+5o6lXHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHRvYXN0KGMpIHtcclxuICAgICAgYyA9IGMuZXJyb3IgfHwgYy5tZXNzYWdlIHx8IGM7XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ3RvYXN0Jywge1xyXG4gICAgICAgIGNvbnRlbnQ6IGNcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5rua5Yqo5YaF5a655Yiw5bqV6YOoXHJcbiAgICBzY3JvbGxUb0JvdHRvbSgpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbGlzdENvbnRlbnQgPSB0aGlzLiRyZWZzLmxpc3RDb250ZW50O1xyXG4gICAgICAgIGxpc3RDb250ZW50LnNjcm9sbFRvcCA9IGxpc3RDb250ZW50LnNjcm9sbEhlaWdodCArIDEwMDAwO1xyXG4gICAgICB9LCAyMDApXHJcbiAgICB9LFxyXG4gICAgLy8g5YiH5o2i6KGo5oOF6Z2i5p2/54q25oCBXHJcbiAgICBzd2l0Y2hTdGlja2VyUGFuZWwoZikge1xyXG4gICAgICB0aGlzLnNob3dTdGlja2VyUGFuZWwgPSBmID09PSB1bmRlZmluZWQ/ICF0aGlzLnNob3dTdGlja2VyUGFuZWw6ICEhZjtcclxuICAgIH0sXHJcbiAgICAvLyDpgInmi6nooajmg4VcclxuICAgIHNlbGVjdFN0aWNrZXIodG1qKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0VGV4dCA9IHRoaXMuY29udGVudDtcclxuICAgICAgY29uc3QgZSA9IHRoaXMuJHJlZnMuaW5wdXQ7XHJcbiAgICAgIGxldCBpbmRleDtcclxuICAgICAgaWYgKGUuc2VsZWN0aW9uU3RhcnQpIHtcclxuICAgICAgICBpbmRleCA9IGUuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgZS5mb2N1cygpO1xyXG4gICAgICAgIGNvbnN0IHIgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICBjb25zdCBzciA9IHIuZHVwbGljYXRlKCk7XHJcbiAgICAgICAgc3IubW92ZVRvRWxlbWVudFRleHQoZSk7XHJcbiAgICAgICAgc3Iuc2V0RW5kUG9pbnQoJ0VuZFRvRW5kJywgcik7XHJcbiAgICAgICAgaW5kZXggPSBzci50ZXh0Lmxlbmd0aCAtIHIudGV4dC5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgZW1vamkgPSAnW2YvJyArIHRtaiArICddJztcclxuXHJcbiAgICAgIGlmKGluZGV4ID4gMSkge1xyXG4gICAgICAgIGNvbnN0IHN0ciA9IGlucHV0VGV4dC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xyXG4gICAgICAgIGNvbnN0IHN0cjIgPSBzdHIgKyBlbW9qaTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSBpbnB1dFRleHQucmVwbGFjZShzdHIsIHN0cjIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY29udGVudCA9IGVtb2ppICsgKHRoaXMuY29udGVudCB8fCAnJyk7XHJcbiAgICAgIH1cclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVzaXplKCk7XHJcbiAgICAgIH0sIDIwMCk7XHJcblxyXG4gICAgfSxcclxuICAgIC8vIOi+k+WFpeahhuiHquWKqOiwg+aVtOmrmOW6plxyXG4gICAgYXV0b1Jlc2l6ZShpbml0KSB7XHJcbiAgICAgIGNvbnN0IHRleHRBcmVhID0gdGhpcy4kcmVmcy5pbnB1dDtcclxuICAgICAgY29uc3QgbnVtID0gMi44ICogMTI7XHJcbiAgICAgIHRleHRBcmVhLnN0eWxlLmhlaWdodCA9IG51bSArICdweCc7XHJcbiAgICAgIGlmKCFpbml0ICYmIG51bSA8IHRleHRBcmVhLnNjcm9sbEhlaWdodCkge1xyXG4gICAgICAgIHRleHRBcmVhLnN0eWxlLmhlaWdodCA9IHRleHRBcmVhLnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDovpPlhaXmoYbkv53mjIHogZrnhKZcclxuICAgIGtlZXBGb2N1cyhmb2N1cykge1xyXG4gICAgICBpZihmb2N1cykge1xyXG4gICAgICAgIHRoaXMuJHJlZnMuaW5wdXQuZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOa1j+iniOiBiuWkqeWGheWuueS4reeahOWbvueJh1xyXG4gICAgdmlzaXRJbWFnZXModXJsKSB7XHJcbiAgICAgIGxldCB1cmxzID0gW107XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIHRoaXMubWVzc2FnZXMpIHtcclxuICAgICAgICBpZihtLmNvbnRlbnRUeXBlID09PSAnaW1nJykge1xyXG4gICAgICAgICAgdXJscy5wdXNoKHtcclxuICAgICAgICAgICAgbmFtZTogbS5jb250ZW50LmZpbGVuYW1lLFxyXG4gICAgICAgICAgICB1cmw6IG0uY29udGVudC5maWxlVXJsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gdXJscy5yZXZlcnNlKCk7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdXJscy5tYXAodSA9PiB1LnVybCkuaW5kZXhPZih1cmwpO1xyXG4gICAgICB1cmxzLm1hcCh1ID0+IHUudXJsID0gbG9jYXRpb24ub3JpZ2luICsgdS51cmwpO1xyXG4gICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCd2aWV3SW1hZ2UnLCB7XHJcbiAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgdXJsc1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIC8vIOiuv+mXrueUqOaIt+S4u+mhtVxyXG4gICAgb3BlblVzZXJIb21lKG1lc3NhZ2UpIHtcclxuICAgICAgaWYobWVzc2FnZS5tZXNzYWdlVHlwZSAhPT0gJ1VUVScpIHJldHVybjtcclxuICAgICAgaWYoTktDLmNvbmZpZ3MudWlkID09PSBtZXNzYWdlLnMpIHtcclxuICAgICAgICBOS0MubWV0aG9kcy52aXNpdFVybChOS0MubWV0aG9kcy50b29scy5nZXRVcmwoJ3VzZXJIb21lJywgbWVzc2FnZS5zKSwgdHJ1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsKCdtZXNzYWdlVXNlckRldGFpbCcsIG1lc3NhZ2UucyksIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6YCJ5oup5pys5Zyw6ZmE5Lu2XHJcbiAgICBzZWxlY3RMb2NhbEZpbGVzKCkge1xyXG4gICAgICBjb25zdCBmaWxlRG9tID0gdGhpcy4kcmVmcy5maWxlO1xyXG4gICAgICBmaWxlRG9tLnZhbHVlID0gbnVsbDtcclxuICAgICAgZmlsZURvbS5jbGljaygpO1xyXG4gICAgfSxcclxuICAgIC8vIOmAieaLqeWujOacrOWcsOmZhOS7tlxyXG4gICAgc2VsZWN0ZWRMb2NhbEZpbGVzKCkge1xyXG4gICAgICBjb25zdCBmaWxlRG9tID0gdGhpcy4kcmVmcy5maWxlO1xyXG4gICAgICBmb3IoY29uc3QgZmlsZSBvZiBmaWxlRG9tLmZpbGVzKSB7XHJcbiAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSgnc2VuZEZpbGUnLCBmaWxlKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWPkemAgea2iOaBr1xyXG4gICAgc2VuZE1lc3NhZ2UodHlwZSwgYykge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgTktDLm1ldGhvZHMucm4uZW1pdCgnZ2V0S2V5Ym9hcmRTdGF0dXMnLCB7fSwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHNlbGYua2VlcEZvY3VzKGRhdGEua2V5Ym9hcmRTdGF0dXMgPT09ICdzaG93Jyk7XHJcbiAgICAgIH0pXHJcbiAgICAgIGxldCBtZXNzYWdlXHJcblxyXG4gICAgICBpZihbJ3NlbmRUZXh0JywgJ3NlbmRGaWxlJ10uaW5jbHVkZXModHlwZSkpIHtcclxuICAgICAgICAvLyDlj5HpgIHkuIDmnaHkv6Hmga9cclxuICAgICAgICBjb25zdCBsb2NhbE1lc3NhZ2VJZCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgbWVzc2FnZSA9IHtcclxuICAgICAgICAgIF9pZDogbG9jYWxNZXNzYWdlSWQsXHJcbiAgICAgICAgICBjb250ZW50VHlwZTogJ2h0bWwnLFxyXG4gICAgICAgICAgczogc2VsZi5tVXNlci51aWQsXHJcbiAgICAgICAgICByOiBzZWxmLnRVc2VyLnVpZCxcclxuICAgICAgICAgIG1lc3NhZ2VUeXBlOiAnVVRVJyxcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICBpZih0eXBlID09PSAnc2VuZFRleHQnKSB7XHJcbiAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBjO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtZXNzYWdlLmNvbnRlbnQgPSBjLm5hbWU7XHJcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBjKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdjb250ZW50JywgbWVzc2FnZS5jb250ZW50KTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3NvY2tldElkJywgc2VsZi5zb2NrZXRJZCk7XHJcbiAgICAgICAgbWVzc2FnZS5mb3JtRGF0YSA9IGZvcm1EYXRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIOmHjeWPkeS4gOadoea2iOaBr1xyXG4gICAgICAgIG1lc3NhZ2UgPSBjO1xyXG4gICAgICB9XHJcbiAgICAgIG1lc3NhZ2Uuc3RhdHVzID0gJ3NlbmRpbmcnOyAvLyBzZW505bey5Y+R6YCB44CBc2VuZGluZ+ato+WcqOWPkemAgeOAgWVycm9y5Ye66ZSZXHJcbiAgICAgIG1lc3NhZ2UudGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFtZXNzYWdlLmNvbnRlbnQpIHRocm93ICfor7fovpPlhaXogYrlpKnlhoXlrrknO1xyXG4gICAgICAgICAgaWYodHlwZSAhPT0gJ3Jlc2VuZCcpIHtcclxuICAgICAgICAgICAgc2VsZi5vcmlnaW5NZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2VsZi5jb250ZW50ID0gXCJcIjtcclxuICAgICAgICAgIHNlbGYuYXV0b1Jlc2l6ZSh0cnVlKTtcclxuICAgICAgICAgIHNlbGYuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgICAgICAgIC8vIHNlbGYua2VlcEZvY3VzKHRydWUpO1xyXG5cclxuICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKGAvbWVzc2FnZS91c2VyLyR7bWVzc2FnZS5yfWAsICdQT1NUJywgbWVzc2FnZS5mb3JtRGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgaW5kZXggPSBzZWxmLm9yaWdpbk1lc3NhZ2VzLmluZGV4T2YobWVzc2FnZSk7XHJcbiAgICAgICAgICBtZXNzYWdlLnN0YXR1cyA9ICdzZW50JztcclxuICAgICAgICAgIGlmKGluZGV4ID49IDApIHtcclxuICAgICAgICAgICAgVnVlLnNldChzZWxmLm9yaWdpbk1lc3NhZ2VzLCBpbmRleCwgZGF0YS5tZXNzYWdlMik7XHJcbiAgICAgICAgICAgIHNlbGYuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgIG1lc3NhZ2Uuc3RhdHVzID0gJ2Vycm9yJztcclxuICAgICAgICAgIHNlbGYudG9hc3QoZGF0YS5lcnJvciB8fCBkYXRhLm1lc3NhZ2UgfHwgZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bmtojmga9cclxuICAgIGdldE1lc3NhZ2UoKSB7XHJcbiAgICAgIGNvbnN0IHtmaXJzdE1lc3NhZ2VJZCwgdFVzZXIsIHR5cGV9ID0gc2VsZiA9IHRoaXM7XHJcbiAgICAgIGxldCB1cmwgPSBgL21lc3NhZ2UvZGF0YT90eXBlPSR7dHlwZX1gO1xyXG4gICAgICBpZihmaXJzdE1lc3NhZ2VJZCkge1xyXG4gICAgICAgIHVybCArPSBgJmZpcnN0TWVzc2FnZUlkPSR7Zmlyc3RNZXNzYWdlSWR9YDtcclxuICAgICAgfVxyXG4gICAgICBpZih0VXNlci51aWQpIHtcclxuICAgICAgICB1cmwgKz0gYCZ1aWQ9JHt0VXNlci51aWR9YDtcclxuICAgICAgfVxyXG4gICAgICBpZihzZWxmLmdldE1lc3NhZ2VTdGF0dXMgIT09ICdjYW5Mb2FkJykgcmV0dXJuO1xyXG4gICAgICBzZWxmLmdldE1lc3NhZ2VTdGF0dXMgPSAnbG9hZGluZyc7XHJcbiAgICAgIHJldHVybiBua2NBUEkodXJsLCAnR0VUJylcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYub3JpZ2luTWVzc2FnZXMgPSBzZWxmLm9yaWdpbk1lc3NhZ2VzLmNvbmNhdChkYXRhLm1lc3NhZ2VzMik7XHJcbiAgICAgICAgICBpZihkYXRhLm1lc3NhZ2VzMi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZi5nZXRNZXNzYWdlU3RhdHVzID0gJ2NhbkxvYWQnO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5nZXRNZXNzYWdlU3RhdHVzID0gJ2NhbnRMb2FkJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYudG9hc3QoZGF0YSk7XHJcbiAgICAgICAgICBzZWxmLmdldE1lc3NhZ2VTdGF0dXMgPSAnY2FuTG9hZCc7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0T3JpZ2luTWVzc2FnZUJ5SWQoaWQpIHtcclxuICAgICAgZm9yKGNvbnN0IG0gb2YgdGhpcy5vcmlnaW5NZXNzYWdlcykge1xyXG4gICAgICAgIGlmKG0uX2lkID09PSBpZCkgcmV0dXJuIG07XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBybuaOpeaUtuWIsOaWsOa2iOaBr+mAmuefpXdlYlxyXG4gICAgaW5zZXJ0TWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgICAgIGNvbnN0IHttZXNzYWdlVHlwZSwgciwgc30gPSBtZXNzYWdlO1xyXG4gICAgICBjb25zdCB7dFVzZXIsIG1Vc2VyfSA9IHRoaXM7XHJcblxyXG4gICAgICBpZihtZXNzYWdlVHlwZSA9PT0gJ1VUVScpIHtcclxuICAgICAgICBjb25zdCB1c2Vyc0lkID0gW3RVc2VyLnVpZCwgbVVzZXIudWlkXTtcclxuICAgICAgICBpZighdXNlcnNJZC5pbmNsdWRlcyhyKSB8fCAhdXNlcnNJZC5pbmNsdWRlcyhzKSkgcmV0dXJuO1xyXG4gICAgICAgIGlmKHRoaXMubVVzZXIudWlkICE9PSBtZXNzYWdlLnMpIHtcclxuICAgICAgICAgIHRoaXMubWFya0FzUmVhZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmKG1lc3NhZ2VUeXBlID09PSAnU1RVJykge1xyXG4gICAgICAgIGlmKHIgIT09IG1Vc2VyLnVpZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMubWFya0FzUmVhZCgpO1xyXG4gICAgICB9IGVsc2UgaWYobWVzc2FnZVR5cGUgPT09ICdTVEUnKSB7XHJcbiAgICAgICAgdGhpcy5tYXJrQXNSZWFkKCk7XHJcbiAgICAgIH0gZWxzZSBpZihtZXNzYWdlVHlwZSA9PT0gJ2ZyaWVuZHNBcHBsaWNhdGlvbicpIHtcclxuICAgICAgICBpZihyICE9PSBtVXNlci51aWQpIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm9yaWdpbk1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgIH0sXHJcbiAgICAvLyDmkqTlm55cclxuICAgIHdpdGhkcmF3bihtZXNzYWdlSWQsIHRhcmdldFVzZXIpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIXRhcmdldFVzZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5rY0FQSSgnL21lc3NhZ2Uvd2l0aGRyYXduJywgJ1BVVCcsIHttZXNzYWdlSWR9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgb3JpZ2luTWVzc2FnZSA9IHNlbGYuZ2V0T3JpZ2luTWVzc2FnZUJ5SWQobWVzc2FnZUlkKTtcclxuICAgICAgICAgIGlmKG9yaWdpbk1lc3NhZ2UpIG9yaWdpbk1lc3NhZ2UuY29udGVudFR5cGUgPSAnd2l0aGRyYXduJztcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzZWxmLnRvYXN0KVxyXG4gICAgfSxcclxuICAgIC8vIOagh+iusOS4uuW3suivu1xyXG4gICAgbWFya0FzUmVhZCgpIHtcclxuICAgICAgY29uc3Qge3R5cGUsIHRVc2VyfSA9IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBua2NBUEkoJy9tZXNzYWdlL21hcmsnLCAnUFVUJywge1xyXG4gICAgICAgICAgdHlwZSxcclxuICAgICAgICAgIHVpZDogdFVzZXIudWlkXHJcbiAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChzZWxmLnRvYXN0KVxyXG4gICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICB9LFxyXG4gICAgLy8g6LCD55So5Y6f55Sf5ouN54Wn44CB5b2V5YOP5ZKM5b2V6Z+zXHJcbiAgICB1c2VDYW1lcmEodHlwZSkge1xyXG4gICAgICBsZXQgbmFtZSA9ICd0YWtlUGljdHVyZUFuZFNlbmRUb1VzZXInO1xyXG4gICAgICBpZih0eXBlID09PSAndmlkZW8nKSB7XHJcbiAgICAgICAgbmFtZSA9ICd0YWtlVmlkZW9BbmRTZW5kVG9Vc2VyJztcclxuICAgICAgfSBlbHNlIGlmKHR5cGUgPT09ICdhdWRpbycpIHtcclxuICAgICAgICBuYW1lID0gJ3JlY29yZEF1ZGlvQW5kU2VuZFRvVXNlcic7XHJcbiAgICAgIH1cclxuICAgICAgTktDLm1ldGhvZHMucm4uZW1pdChuYW1lLCB7XHJcbiAgICAgICAgdWlkOiB0aGlzLnRVc2VyLnVpZCxcclxuICAgICAgICBzb2NrZXRJZDogbnVsbFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDlpITnkIblpb3lj4vmt7vliqDnlLPor7dcclxuICAgIG5ld0ZyaWVuZE9wZXJhdGlvbihpZCwgYWdyZWUpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBzZWxmLmdldE9yaWdpbk1lc3NhZ2VCeUlkKGlkKTtcclxuICAgICAgbmtjQVBJKCcvdS8nICsgbWVzc2FnZS5zICsgJy9mcmllbmRzL2FncmVlJywgJ1BPU1QnLCB7XHJcbiAgICAgICAgYWdyZWUsXHJcbiAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgbWVzc2FnZS5jb250ZW50ID0gZGF0YS5tZXNzYWdlLmNvbnRlbnQ7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc2VsZi50b2FzdClcclxuICAgIH0sXHJcbiAgICAvLyDmkq3mlL7or63pn7NcclxuICAgIHBsYXlWb2ljZShtZXNzYWdlKSB7XHJcbiAgICAgIGNvbnN0IHthdWRpbywgc3RvcFBsYXlWb2ljZSwgZ2V0T3JpZ2luTWVzc2FnZUJ5SWR9ID0gdGhpcztcclxuICAgICAgaWYobWVzc2FnZS5jb250ZW50LnBsYXlTdGF0dXMgPT09ICdwbGF5aW5nJykge1xyXG4gICAgICAgIHJldHVybiBzdG9wUGxheVZvaWNlKCk7XHJcbiAgICAgIH1cclxuICAgICAgc3RvcFBsYXlWb2ljZSgpO1xyXG4gICAgICBhdWRpby5zcmMgPSBtZXNzYWdlLmNvbnRlbnQuZmlsZVVybCArIGAmdD0ke0RhdGUubm93KCl9YDtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgYXVkaW8ucGxheSgpO1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbk1lc3NhZ2UgPSBnZXRPcmlnaW5NZXNzYWdlQnlJZChtZXNzYWdlLl9pZCk7XHJcbiAgICAgICAgb3JpZ2luTWVzc2FnZS5jb250ZW50LnBsYXlTdGF0dXMgPSAncGxheWluZyc7XHJcbiAgICAgIH0sIDIwMCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5YGc5q2i5pKt5pS+6K+t6Z+zXHJcbiAgICBzdG9wUGxheVZvaWNlKCkge1xyXG4gICAgICBjb25zdCB7YXVkaW99ID0gdGhpcztcclxuICAgICAgdHJ5e1xyXG4gICAgICAgIGF1ZGlvLnBhdXNlKClcclxuICAgICAgfSBjYXRjaChlcnIpIHt9XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIHRoaXMub3JpZ2luTWVzc2FnZXMpIHtcclxuICAgICAgICBpZihtLmNvbnRlbnRUeXBlID09PSAndm9pY2UnKSB7XHJcbiAgICAgICAgICBtLmNvbnRlbnQucGxheVN0YXR1cyA9ICd1blBsYXknO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICAvLyDnrKzkuIDmnaHmtojmga/nmoRJRO+8jOeUqOaIt+WKoOi9vea2iOaBr+WGheWuueWIl+ihqFxyXG4gICAgZmlyc3RNZXNzYWdlSWQoKSB7XHJcbiAgICAgIGNvbnN0IHttZXNzYWdlc30gPSB0aGlzO1xyXG4gICAgICBmb3IoY29uc3QgbSBvZiBtZXNzYWdlcykge1xyXG4gICAgICAgIGlmKG0uY29udGVudFR5cGUgIT09ICd0aW1lJykge1xyXG4gICAgICAgICAgcmV0dXJuIG0uX2lkO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWkhOeQhui/h+eahOa2iOaBr+WGheWuueWIl+ihqFxyXG4gICAgbWVzc2FnZXMoKSB7XHJcbiAgICAgIGNvbnN0IHtvcmlnaW5NZXNzYWdlcywgbVVzZXIsIHRVc2VyfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICBsZXQgbWVzc2FnZXNJZCA9IFtdO1xyXG4gICAgICBjb25zdCBtZXNzYWdlc09iaiA9IHt9O1xyXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IFtdO1xyXG4gICAgICBmb3IoY29uc3QgbSBvZiBvcmlnaW5NZXNzYWdlcykge1xyXG4gICAgICAgIGNvbnN0IHtfaWQsIHN9ID0gbTtcclxuICAgICAgICBjb25zdCBvd25NZXNzYWdlID0gcyA9PT0gbVVzZXIudWlkO1xyXG4gICAgICAgIG1lc3NhZ2VzSWQucHVzaChfaWQpO1xyXG4gICAgICAgIG0ucG9zaXRpb24gPSBvd25NZXNzYWdlPyAncmlnaHQnOiAnbGVmdCc7XHJcbiAgICAgICAgbS5zVXNlciA9IG93bk1lc3NhZ2U/IG1Vc2VyOiB0VXNlcjtcclxuICAgICAgICBtLmNhbldpdGhkcmF3biA9IG0uc3RhdHVzID09PSAnc2VudCcgJiYgb3duTWVzc2FnZSAmJiAobm93IC0gbmV3IERhdGUobS50aW1lKSA8IDYwMDAwKTtcclxuXHJcbiAgICAgICAgbWVzc2FnZXNPYmpbX2lkXSA9IG07XHJcbiAgICAgIH1cclxuICAgICAgbWVzc2FnZXNJZCA9IFsuLi5uZXcgU2V0KG1lc3NhZ2VzSWQpXTtcclxuICAgICAgbWVzc2FnZXNJZCA9IG1lc3NhZ2VzSWQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xyXG4gICAgICBmb3IoY29uc3QgaWQgb2YgbWVzc2FnZXNJZCkge1xyXG4gICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZXNPYmpbaWRdKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldXHJcbiAgICAgICAgY29uc3Qge3RpbWV9ID0gbWVzc2FnZTtcclxuICAgICAgICBpZihpID09PSAwKSB7XHJcbiAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAndGltZScsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IHRpbWUsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc3QgbGFzdE1lc3NhZ2UgPSBtZXNzYWdlc1tpIC0gMV07XHJcbiAgICAgICAgICBpZihuZXcgRGF0ZSh0aW1lKS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShsYXN0TWVzc2FnZS50aW1lKS5nZXRUaW1lKCkgPiA2MDAwMCkge1xyXG4gICAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgY29udGVudFR5cGU6ICd0aW1lJyxcclxuICAgICAgICAgICAgICBjb250ZW50OiB0aW1lLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYXJyLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IGxpc3RDb250ZW50ID0gc2VsZi4kcmVmcy5saXN0Q29udGVudDtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgaWYoc2VsZi5zaG93U3RpY2tlclBhbmVsKSB7XHJcbiAgICAgICAgc2VsZi5zd2l0Y2hTdGlja2VyUGFuZWwoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlbGYuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgIGxpc3RDb250ZW50Lm9uc2Nyb2xsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsVG9wO1xyXG4gICAgICBpZihzY3JvbGxUb3AgPiAyMCkgcmV0dXJuO1xyXG4gICAgICBsaXN0Q29udGVudC5zY3JvbGxUbyA9IGxpc3RDb250ZW50LnNjcm9sbFRvcDtcclxuICAgICAgbGlzdENvbnRlbnQuaGVpZ2h0ID0gbGlzdENvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICBzZWxmLmdldE1lc3NhZ2UoKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY29uc3QgaGVpZ2h0ID0gbGlzdENvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgICAgICAgbGlzdENvbnRlbnQuc2Nyb2xsVG9wID0gaGVpZ2h0IC0gbGlzdENvbnRlbnQuaGVpZ2h0O1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgc2VsZi50b2FzdChkYXRhLmVycm9yIHx8IGRhdGEubWVzc2FnZSB8fCBkYXRhKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxmLmF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xyXG4gICAgICBzZWxmLnN0b3BQbGF5Vm9pY2UoKTtcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcbiJdfQ==
