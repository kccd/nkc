(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById('data');
window.app = new Vue({
  el: '#container',
  data: {
    socketId: Date.now() + '' + Math.round(Math.random() * 1000),
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
    content: ''
  },
  methods: {
    // 格式化时间
    timeFormat: NKC.methods.timeFormat,
    // 获取链接
    getUrl: NKC.methods.tools.getUrl,
    toast: function toast(c) {
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
        }
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

      urls.reverse();
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
    // 发送消息
    sendMessage: function sendMessage(message) {
      var self = this;
      var type = message ? 'resend' : 'send';
      var focus = $(this.$refs.input).is(':focus');

      if (!message) {
        // 发送一条信息
        var content = self.content;
        var localMessageId = Date.now();
        message = {
          _id: localMessageId,
          contentType: 'html',
          content: content,
          s: self.mUser.uid,
          r: self.tUser.uid,
          messageType: 'UTU'
        };
      } else {// 重发一条消息
      }

      message.status = 'sending'; // sent已发送、sending正在发送、error出错

      message.time = Date.now();
      Promise.resolve().then(function () {
        if (!message.content) throw '请输入聊天内容';
        self.originMessages.push(message);
        self.content = "";
        self.autoResize(true);
        self.scrollToBottom();
        self.keepFocus(true);
        return nkcAPI("/message/user/".concat(message.r), 'POST', {
          content: message.content,
          socketId: self.socketId
        });
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
    insertMessage: function insertMessage(message) {
      if (![this.tUser.uid, this.mUser.uid].includes(message.r)) return;
      this.originMessages.push(message);
      this.scrollToBottom();
    }
  },
  computed: {
    messages: function messages() {
      var originMessages = this.originMessages,
          mUser = this.mUser,
          tUser = this.tUser;
      var messagesId = [];
      var messagesObj = {};
      var messages = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = originMessages[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var m = _step2.value;
          var _id = m._id,
              s = m.s;
          var ownMessage = s === mUser.uid;
          messagesId.push(_id);
          m.position = ownMessage ? 'right' : 'left';
          m.sUser = ownMessage ? mUser : tUser;
          messagesObj[_id] = m;
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

      messagesId = messagesId.sort(function (a, b) {
        return a - b;
      });
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = messagesId[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var id = _step3.value;
          messages.push(messagesObj[id]);
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
    window.addEventListener('click', function () {
      if (self.showStickerPanel) {
        self.switchStickerPanel(false);
      }
    });
    self.scrollToBottom();
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL21lc3NhZ2UvYXBwQ29udGVudExpc3QvYXBwQ29udGVudExpc3QubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBSSxHQUFKLENBQVE7QUFDbkIsRUFBQSxFQUFFLEVBQUUsWUFEZTtBQUVuQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFMLEtBQWEsRUFBYixHQUFrQixJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLEtBQWMsSUFBekIsQ0FEeEI7QUFFSjtBQUNBLElBQUEsY0FBYyxFQUFFLElBQUksQ0FBQyxRQUhqQjtBQUlKO0FBQ0EsSUFBQSxnQkFBZ0IsRUFBRSxLQUxkO0FBTUo7QUFDQSxJQUFBLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FQVjtBQVFKO0FBQ0EsSUFBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBVFI7QUFVSjtBQUNBLElBQUEsS0FBSyxFQUFFLElBQUksQ0FBQyxLQVhSO0FBWUo7QUFDQSxJQUFBLE9BQU8sRUFBRTtBQWJMLEdBRmE7QUFpQm5CLEVBQUEsT0FBTyxFQUFFO0FBQ1A7QUFDQSxJQUFBLFVBQVUsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFVBRmpCO0FBR1A7QUFDQSxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVosQ0FBa0IsTUFKbkI7QUFLUCxJQUFBLEtBTE8saUJBS0QsQ0FMQyxFQUtFO0FBQ1AsTUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLEVBQVosQ0FBZSxJQUFmLENBQW9CLE9BQXBCLEVBQTZCO0FBQzNCLFFBQUEsT0FBTyxFQUFFO0FBRGtC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aWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoJ2RhdGEnKTtcclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiAnI2NvbnRhaW5lcicsXHJcbiAgZGF0YToge1xyXG4gICAgc29ja2V0SWQ6IERhdGUubm93KCkgKyAnJyArIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSoxMDAwKSxcclxuICAgIC8vIOa2iOaBr+WGheWuueWIl+ihqFxyXG4gICAgb3JpZ2luTWVzc2FnZXM6IGRhdGEubWVzc2FnZXMsXHJcbiAgICAvLyDmmK/lkKbmmL7npLrooajmg4XliJfooahcclxuICAgIHNob3dTdGlja2VyUGFuZWw6IGZhbHNlLFxyXG4gICAgLy8g6KGo5oOF5pWw5o2uXHJcbiAgICB0d2Vtb2ppOiBkYXRhLnR3ZW1vamksXHJcbiAgICAvLyDlr7nmlrlcclxuICAgIHRVc2VyOiBkYXRhLnRVc2VyLFxyXG4gICAgLy8g6Ieq5bexXHJcbiAgICBtVXNlcjogZGF0YS5tVXNlcixcclxuICAgIC8vIOi+k+WFpeahhui+k+WFpeeahOWGheWuuVxyXG4gICAgY29udGVudDogJydcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIC8vIOagvOW8j+WMluaXtumXtFxyXG4gICAgdGltZUZvcm1hdDogTktDLm1ldGhvZHMudGltZUZvcm1hdCxcclxuICAgIC8vIOiOt+WPlumTvuaOpVxyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICB0b2FzdChjKSB7XHJcbiAgICAgIE5LQy5tZXRob2RzLnJuLmVtaXQoJ3RvYXN0Jywge1xyXG4gICAgICAgIGNvbnRlbnQ6IGNcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5rua5Yqo5YaF5a655Yiw5bqV6YOoXHJcbiAgICBzY3JvbGxUb0JvdHRvbSgpIHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbGlzdENvbnRlbnQgPSB0aGlzLiRyZWZzLmxpc3RDb250ZW50O1xyXG4gICAgICAgIGxpc3RDb250ZW50LnNjcm9sbFRvcCA9IGxpc3RDb250ZW50LnNjcm9sbEhlaWdodCArIDEwMDAwO1xyXG4gICAgICB9LCAyMDApXHJcbiAgICB9LFxyXG4gICAgLy8g5YiH5o2i6KGo5oOF6Z2i5p2/54q25oCBXHJcbiAgICBzd2l0Y2hTdGlja2VyUGFuZWwoZikge1xyXG4gICAgICB0aGlzLnNob3dTdGlja2VyUGFuZWwgPSBmID09PSB1bmRlZmluZWQ/ICF0aGlzLnNob3dTdGlja2VyUGFuZWw6ICEhZjtcclxuICAgIH0sXHJcbiAgICAvLyDpgInmi6nooajmg4VcclxuICAgIHNlbGVjdFN0aWNrZXIodG1qKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0VGV4dCA9IHRoaXMuY29udGVudDtcclxuICAgICAgY29uc3QgZSA9IHRoaXMuJHJlZnMuaW5wdXQ7XHJcbiAgICAgIGxldCBpbmRleDtcclxuICAgICAgaWYgKGUuc2VsZWN0aW9uU3RhcnQpIHtcclxuICAgICAgICBpbmRleCA9IGUuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgZS5mb2N1cygpO1xyXG4gICAgICAgIGNvbnN0IHIgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICBjb25zdCBzciA9IHIuZHVwbGljYXRlKCk7XHJcbiAgICAgICAgc3IubW92ZVRvRWxlbWVudFRleHQoZSk7XHJcbiAgICAgICAgc3Iuc2V0RW5kUG9pbnQoJ0VuZFRvRW5kJywgcik7XHJcbiAgICAgICAgaW5kZXggPSBzci50ZXh0Lmxlbmd0aCAtIHIudGV4dC5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgZW1vamkgPSAnW2YvJyArIHRtaiArICddJztcclxuXHJcbiAgICAgIGlmKGluZGV4ID4gMSkge1xyXG4gICAgICAgIGNvbnN0IHN0ciA9IGlucHV0VGV4dC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xyXG4gICAgICAgIGNvbnN0IHN0cjIgPSBzdHIgKyBlbW9qaTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSBpbnB1dFRleHQucmVwbGFjZShzdHIsIHN0cjIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuY29udGVudCA9IGVtb2ppICsgKHRoaXMuY29udGVudCB8fCAnJyk7XHJcbiAgICAgIH1cclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVzaXplKCk7XHJcbiAgICAgIH0sIDIwMCk7XHJcblxyXG4gICAgfSxcclxuICAgIC8vIOi+k+WFpeahhuiHquWKqOiwg+aVtOmrmOW6plxyXG4gICAgYXV0b1Jlc2l6ZShpbml0KSB7XHJcbiAgICAgIGNvbnN0IHRleHRBcmVhID0gdGhpcy4kcmVmcy5pbnB1dDtcclxuICAgICAgY29uc3QgbnVtID0gMi44ICogMTI7XHJcbiAgICAgIHRleHRBcmVhLnN0eWxlLmhlaWdodCA9IG51bSArICdweCc7XHJcbiAgICAgIGlmKCFpbml0ICYmIG51bSA8IHRleHRBcmVhLnNjcm9sbEhlaWdodCkge1xyXG4gICAgICAgIHRleHRBcmVhLnN0eWxlLmhlaWdodCA9IHRleHRBcmVhLnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDovpPlhaXmoYbkv53mjIHogZrnhKZcclxuICAgIGtlZXBGb2N1cyhmb2N1cykge1xyXG4gICAgICBpZihmb2N1cykge1xyXG4gICAgICAgIHRoaXMuJHJlZnMuaW5wdXQuZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOa1j+iniOiBiuWkqeWGheWuueS4reeahOWbvueJh1xyXG4gICAgdmlzaXRJbWFnZXModXJsKSB7XHJcbiAgICAgIGxldCB1cmxzID0gW107XHJcbiAgICAgIGZvcihjb25zdCBtIG9mIHRoaXMubWVzc2FnZXMpIHtcclxuICAgICAgICBpZihtLmNvbnRlbnRUeXBlID09PSAnaW1nJykge1xyXG4gICAgICAgICAgdXJscy5wdXNoKHtcclxuICAgICAgICAgICAgbmFtZTogbS5jb250ZW50LmZpbGVuYW1lLFxyXG4gICAgICAgICAgICB1cmw6IG0uY29udGVudC5maWxlVXJsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdXJscy5yZXZlcnNlKCk7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdXJscy5tYXAodSA9PiB1LnVybCkuaW5kZXhPZih1cmwpO1xyXG4gICAgICB1cmxzLm1hcCh1ID0+IHUudXJsID0gbG9jYXRpb24ub3JpZ2luICsgdS51cmwpO1xyXG4gICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCd2aWV3SW1hZ2UnLCB7XHJcbiAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgdXJsc1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIC8vIOiuv+mXrueUqOaIt+S4u+mhtVxyXG4gICAgb3BlblVzZXJIb21lKHVpZCkge1xyXG4gICAgICBOS0MubWV0aG9kcy5ybi5lbWl0KCdvcGVuTmV3UGFnZScsIHtcclxuICAgICAgICBocmVmOiBsb2NhdGlvbi5vcmlnaW4gKyB0aGlzLmdldFVybCgndXNlckhvbWUnLCB1aWQpXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOWPkemAgea2iOaBr1xyXG4gICAgc2VuZE1lc3NhZ2UobWVzc2FnZSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgY29uc3QgdHlwZSA9IG1lc3NhZ2U/ICdyZXNlbmQnOiAnc2VuZCc7XHJcbiAgICAgIGNvbnN0IGZvY3VzID0gJCh0aGlzLiRyZWZzLmlucHV0KS5pcygnOmZvY3VzJyk7XHJcbiAgICAgIGlmKCFtZXNzYWdlKSB7XHJcbiAgICAgICAgLy8g5Y+R6YCB5LiA5p2h5L+h5oGvXHJcbiAgICAgICAgY29uc3Qge2NvbnRlbnR9ID0gc2VsZjtcclxuICAgICAgICBjb25zdCBsb2NhbE1lc3NhZ2VJZCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgbWVzc2FnZSA9IHtcclxuICAgICAgICAgIF9pZDogbG9jYWxNZXNzYWdlSWQsXHJcbiAgICAgICAgICBjb250ZW50VHlwZTogJ2h0bWwnLFxyXG4gICAgICAgICAgY29udGVudCxcclxuICAgICAgICAgIHM6IHNlbGYubVVzZXIudWlkLFxyXG4gICAgICAgICAgcjogc2VsZi50VXNlci51aWQsXHJcbiAgICAgICAgICBtZXNzYWdlVHlwZTogJ1VUVScsXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIOmHjeWPkeS4gOadoea2iOaBr1xyXG5cclxuICAgICAgfVxyXG4gICAgICBtZXNzYWdlLnN0YXR1cyA9ICdzZW5kaW5nJzsgLy8gc2VudOW3suWPkemAgeOAgXNlbmRpbmfmraPlnKjlj5HpgIHjgIFlcnJvcuWHuumUmVxyXG4gICAgICBtZXNzYWdlLnRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBpZighbWVzc2FnZS5jb250ZW50KSB0aHJvdyAn6K+36L6T5YWl6IGK5aSp5YaF5a65JztcclxuICAgICAgICAgIHNlbGYub3JpZ2luTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgIHNlbGYuY29udGVudCA9IFwiXCI7XHJcbiAgICAgICAgICBzZWxmLmF1dG9SZXNpemUodHJ1ZSk7XHJcbiAgICAgICAgICBzZWxmLnNjcm9sbFRvQm90dG9tKCk7XHJcbiAgICAgICAgICBzZWxmLmtlZXBGb2N1cyh0cnVlKTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoYC9tZXNzYWdlL3VzZXIvJHttZXNzYWdlLnJ9YCwgJ1BPU1QnLCB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IG1lc3NhZ2UuY29udGVudCxcclxuICAgICAgICAgICAgc29ja2V0SWQ6IHNlbGYuc29ja2V0SWQsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHNlbGYub3JpZ2luTWVzc2FnZXMuaW5kZXhPZihtZXNzYWdlKTtcclxuICAgICAgICAgIG1lc3NhZ2Uuc3RhdHVzID0gJ3NlbnQnO1xyXG4gICAgICAgICAgaWYoaW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICBWdWUuc2V0KHNlbGYub3JpZ2luTWVzc2FnZXMsIGluZGV4LCBkYXRhLm1lc3NhZ2UyKTtcclxuICAgICAgICAgICAgc2VsZi5zY3JvbGxUb0JvdHRvbSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgbWVzc2FnZS5zdGF0dXMgPSAnZXJyb3InO1xyXG4gICAgICAgICAgc2VsZi50b2FzdChkYXRhLmVycm9yIHx8IGRhdGEubWVzc2FnZSB8fCBkYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIGluc2VydE1lc3NhZ2UobWVzc2FnZSkge1xyXG4gICAgICBpZighW3RoaXMudFVzZXIudWlkLCB0aGlzLm1Vc2VyLnVpZF0uaW5jbHVkZXMobWVzc2FnZS5yKSkgcmV0dXJuO1xyXG4gICAgICB0aGlzLm9yaWdpbk1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGNvbXB1dGVkOiB7XHJcbiAgICBtZXNzYWdlcygpIHtcclxuICAgICAgY29uc3Qge29yaWdpbk1lc3NhZ2VzLCBtVXNlciwgdFVzZXJ9ID0gdGhpcztcclxuICAgICAgbGV0IG1lc3NhZ2VzSWQgPSBbXTtcclxuICAgICAgY29uc3QgbWVzc2FnZXNPYmogPSB7fTtcclxuICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcclxuICAgICAgZm9yKGNvbnN0IG0gb2Ygb3JpZ2luTWVzc2FnZXMpIHtcclxuICAgICAgICBjb25zdCB7X2lkLCBzfSA9IG07XHJcbiAgICAgICAgY29uc3Qgb3duTWVzc2FnZSA9IHMgPT09IG1Vc2VyLnVpZDtcclxuICAgICAgICBtZXNzYWdlc0lkLnB1c2goX2lkKTtcclxuICAgICAgICBtLnBvc2l0aW9uID0gb3duTWVzc2FnZT8gJ3JpZ2h0JzogJ2xlZnQnO1xyXG4gICAgICAgIG0uc1VzZXIgPSBvd25NZXNzYWdlPyBtVXNlcjogdFVzZXI7XHJcbiAgICAgICAgbWVzc2FnZXNPYmpbX2lkXSA9IG07XHJcbiAgICAgIH1cclxuICAgICAgbWVzc2FnZXNJZCA9IG1lc3NhZ2VzSWQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xyXG4gICAgICBmb3IoY29uc3QgaWQgb2YgbWVzc2FnZXNJZCkge1xyXG4gICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZXNPYmpbaWRdKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldXHJcbiAgICAgICAgY29uc3Qge3RpbWV9ID0gbWVzc2FnZTtcclxuICAgICAgICBpZihpID09PSAwKSB7XHJcbiAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAndGltZScsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IHRpbWUsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc3QgbGFzdE1lc3NhZ2UgPSBtZXNzYWdlc1tpIC0gMV07XHJcbiAgICAgICAgICBpZihuZXcgRGF0ZSh0aW1lKS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShsYXN0TWVzc2FnZS50aW1lKS5nZXRUaW1lKCkgPiA2MDAwMCkge1xyXG4gICAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgY29udGVudFR5cGU6ICd0aW1lJyxcclxuICAgICAgICAgICAgICBjb250ZW50OiB0aW1lLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYXJyLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgaWYoc2VsZi5zaG93U3RpY2tlclBhbmVsKSB7XHJcbiAgICAgICAgc2VsZi5zd2l0Y2hTdGlja2VyUGFuZWwoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlbGYuc2Nyb2xsVG9Cb3R0b20oKVxyXG4gIH1cclxufSk7XHJcbiJdfQ==
