(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

window.floatUserPanel = new Vue({
  el: "#floatUserPanel",
  data: {
    user: "",
    uid: NKC.configs.uid,
    over: false,
    show: false,
    count: 1,
    onPanel: false,
    users: {},
    timeoutName: ""
  },
  mounted: function mounted() {
    var self = this;
    var panel = $(self.$el);
    panel.css({
      top: 0,
      left: 0
    });
    panel.css({
      top: 300,
      left: 300
    });

    if (this.uid && !window.SubscribeTypes) {
      if (!NKC.modules.SubscribeTypes) {
        return sweetError("未引入与关注相关的模块");
      } else {
        window.SubscribeTypes = new NKC.modules.SubscribeTypes();
      }
    }

    this.initPanel();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    format: NKC.methods.format,
    fromNow: NKC.methods.fromNow,
    initPanel: function initPanel() {
      var doms = $("[data-float-uid]");

      for (var i = 0; i < doms.length; i++) {
        var dom = doms.eq(i);
        if (dom.attr("data-float-init") === "true") continue;
        this.initEvent(doms.eq(i));
      }
    },
    reset: function reset() {
      this.show = false;
      this.onPanel = false;
      this.over = false;
      this.user = "";
    },
    initEvent: function initEvent(dom) {
      var self = this;
      dom.on("mouseleave", function () {
        self.timeoutName = setTimeout(function () {
          self.reset();
        }, 200);
      });
      dom.on("mouseover", /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
          var uid, count_, left, top, width, height;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // 鼠标已悬浮在元素上
                  clearTimeout(self.timeoutName);
                  self.count++;
                  self.over = true;
                  count_ = self.count;
                  // 做一个延迟，过滤掉鼠标意外划过元素的情况。
                  self.timeout(300).then(function () {
                    if (count_ !== self.count) throw "timeout 1";
                    if (!self.over) throw "timeout 2";
                    uid = dom.attr("data-float-uid");
                    left = dom.offset().left;
                    top = dom.offset().top;
                    width = dom.width();
                    height = dom.height();
                    return self.getUserById(uid);
                  }).then(function (userObj) {
                    var user = userObj.user,
                        subscribed = userObj.subscribed;
                    if (count_ !== self.count) throw "timeout 3";
                    if (!self.over) throw "timeout 4";
                    self.user = user;
                    self.subscribed = subscribed;
                    var panel = $(self.$el);
                    self.show = true;
                    panel.on("mouseleave", function () {
                      self.reset();
                    });
                    panel.on("mouseover", function () {
                      clearTimeout(self.timeoutName);
                      self.onPanel = true;
                    });
                    var documentWidth = $(document).width() - 10;
                    var panelWidth = 26 * 12;

                    if (left + panelWidth > documentWidth) {
                      left = documentWidth - panelWidth;
                    }

                    panel.css({
                      top: top + height + 10,
                      left: left
                    });
                  })["catch"](function (err) {// console.log(err);
                  });

                case 5:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
      dom.attr("data-float-init", "true");
    },
    timeout: function timeout(t) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve();
        }, t);
      });
    },
    getUserById: function getUserById(id) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var userObj = self.users[id];

        if (userObj) {
          resolve(userObj);
        } else {
          nkcAPI("/u/".concat(id, "?from=panel"), "GET").then(function (data) {
            if (data.targetUser.hidden) return;
            var userObj = {
              subscribed: data.subscribed,
              user: data.targetUser
            };
            self.users[data.targetUser.uid] = userObj;
            resolve(userObj);
          })["catch"](function (err) {
            console.log(err);
            reject(err);
          });
        }
      });
    },
    subscribe: function subscribe() {
      var user = this.user,
          subscribed = this.subscribed;
      SubscribeTypes.subscribeUser(user.uid, !subscribed);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2Zsb2F0VXNlclBhbmVsL2Zsb2F0VXNlclBhbmVsLjIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsSUFBSSxHQUFKLENBQVE7QUFDOUIsRUFBQSxFQUFFLEVBQUUsaUJBRDBCO0FBRTlCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxJQUFJLEVBQUUsRUFERjtBQUVKLElBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FGYjtBQUdKLElBQUEsSUFBSSxFQUFFLEtBSEY7QUFJSixJQUFBLElBQUksRUFBRSxLQUpGO0FBS0osSUFBQSxLQUFLLEVBQUUsQ0FMSDtBQU1KLElBQUEsT0FBTyxFQUFFLEtBTkw7QUFPSixJQUFBLEtBQUssRUFBRSxFQVBIO0FBUUosSUFBQSxXQUFXLEVBQUU7QUFSVCxHQUZ3QjtBQVk5QixFQUFBLE9BWjhCLHFCQVlwQjtBQUNSLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxRQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBZjtBQUNBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVTtBQUNSLE1BQUEsR0FBRyxFQUFFLENBREc7QUFFUixNQUFBLElBQUksRUFBRTtBQUZFLEtBQVY7QUFJQSxJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVU7QUFDUixNQUFBLEdBQUcsRUFBRSxHQURHO0FBRVIsTUFBQSxJQUFJLEVBQUU7QUFGRSxLQUFWOztBQUlBLFFBQUcsS0FBSyxHQUFMLElBQVksQ0FBQyxNQUFNLENBQUMsY0FBdkIsRUFBdUM7QUFDckMsVUFBRyxDQUFDLEdBQUcsQ0FBQyxPQUFKLENBQVksY0FBaEIsRUFBZ0M7QUFDOUIsZUFBTyxVQUFVLENBQUMsYUFBRCxDQUFqQjtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEs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VUFESDtBQUVWLE1BQUEsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsSUFBSSxDQUFDLEdBQWxDLEVBQXVDLENBQUMsVUFBeEM7QUFDRDtBQWxITTtBQWxDcUIsQ0FBUixDQUF4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5mbG9hdFVzZXJQYW5lbCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNmbG9hdFVzZXJQYW5lbFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIHVzZXI6IFwiXCIsXHJcbiAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcclxuICAgIG92ZXI6IGZhbHNlLFxyXG4gICAgc2hvdzogZmFsc2UsXHJcbiAgICBjb3VudDogMSxcclxuICAgIG9uUGFuZWw6IGZhbHNlLFxyXG4gICAgdXNlcnM6IHt9LFxyXG4gICAgdGltZW91dE5hbWU6IFwiXCIsXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBjb25zdCBwYW5lbCA9ICQoc2VsZi4kZWwpO1xyXG4gICAgcGFuZWwuY3NzKHtcclxuICAgICAgdG9wOiAwLFxyXG4gICAgICBsZWZ0OiAwXHJcbiAgICB9KTtcclxuICAgIHBhbmVsLmNzcyh7XHJcbiAgICAgIHRvcDogMzAwLFxyXG4gICAgICBsZWZ0OiAzMDBcclxuICAgIH0pO1xyXG4gICAgaWYodGhpcy51aWQgJiYgIXdpbmRvdy5TdWJzY3JpYmVUeXBlcykge1xyXG4gICAgICBpZighTktDLm1vZHVsZXMuU3Vic2NyaWJlVHlwZXMpIHtcclxuICAgICAgICByZXR1cm4gc3dlZXRFcnJvcihcIuacquW8leWFpeS4juWFs+azqOebuOWFs+eahOaooeWdl1wiKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB3aW5kb3cuU3Vic2NyaWJlVHlwZXMgPSBuZXcgTktDLm1vZHVsZXMuU3Vic2NyaWJlVHlwZXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdFBhbmVsKCk7XHJcblxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBmb3JtYXQ6IE5LQy5tZXRob2RzLmZvcm1hdCxcclxuICAgIGZyb21Ob3c6IE5LQy5tZXRob2RzLmZyb21Ob3csXHJcbiAgICBpbml0UGFuZWwoKSB7XHJcbiAgICAgIGNvbnN0IGRvbXMgPSAkKGBbZGF0YS1mbG9hdC11aWRdYCk7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBkb21zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZG9tID0gZG9tcy5lcShpKTtcclxuICAgICAgICBpZihkb20uYXR0cihcImRhdGEtZmxvYXQtaW5pdFwiKSA9PT0gXCJ0cnVlXCIpIGNvbnRpbnVlO1xyXG4gICAgICAgIHRoaXMuaW5pdEV2ZW50KGRvbXMuZXEoaSkpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcmVzZXQoKSB7XHJcbiAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9uUGFuZWwgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vdmVyID0gZmFsc2U7XHJcbiAgICAgIHRoaXMudXNlciA9IFwiXCI7XHJcbiAgICB9LFxyXG4gICAgaW5pdEV2ZW50KGRvbSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgZG9tLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBzZWxmLnRpbWVvdXROYW1lID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnJlc2V0KCk7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGRvbS5vbihcIm1vdXNlb3ZlclwiLCBhc3luYyBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgLy8g6byg5qCH5bey5oKs5rWu5Zyo5YWD57Sg5LiKXHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xyXG4gICAgICAgIHNlbGYuY291bnQgKys7XHJcbiAgICAgICAgc2VsZi5vdmVyID0gdHJ1ZTtcclxuICAgICAgICBsZXQgdWlkO1xyXG4gICAgICAgIGxldCBjb3VudF8gPSBzZWxmLmNvdW50O1xyXG4gICAgICAgIGxldCBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQ7XHJcbiAgICAgICAgLy8g5YGa5LiA5Liq5bu26L+f77yM6L+H5ruk5o6J6byg5qCH5oSP5aSW5YiS6L+H5YWD57Sg55qE5oOF5Ya144CCXHJcbiAgICAgICAgc2VsZi50aW1lb3V0KDMwMClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgaWYoY291bnRfICE9PSBzZWxmLmNvdW50KSB0aHJvdyBcInRpbWVvdXQgMVwiO1xyXG4gICAgICAgICAgICBpZighc2VsZi5vdmVyKSB0aHJvdyBcInRpbWVvdXQgMlwiO1xyXG4gICAgICAgICAgICB1aWQgPSBkb20uYXR0cihcImRhdGEtZmxvYXQtdWlkXCIpO1xyXG4gICAgICAgICAgICBsZWZ0ID0gZG9tLm9mZnNldCgpLmxlZnQ7XHJcbiAgICAgICAgICAgIHRvcCA9IGRvbS5vZmZzZXQoKS50b3A7XHJcbiAgICAgICAgICAgIHdpZHRoID0gZG9tLndpZHRoKCk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IGRvbS5oZWlnaHQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0VXNlckJ5SWQodWlkKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbih1c2VyT2JqID0+IHtcclxuICAgICAgICAgICAgY29uc3Qge3VzZXIsIHN1YnNjcmliZWR9ID0gdXNlck9iajtcclxuICAgICAgICAgICAgaWYoY291bnRfICE9PSBzZWxmLmNvdW50KSB0aHJvdyBcInRpbWVvdXQgM1wiO1xyXG4gICAgICAgICAgICBpZighc2VsZi5vdmVyKSB0aHJvdyBcInRpbWVvdXQgNFwiO1xyXG4gICAgICAgICAgICBzZWxmLnVzZXIgPSB1c2VyO1xyXG4gICAgICAgICAgICBzZWxmLnN1YnNjcmliZWQgPSBzdWJzY3JpYmVkO1xyXG4gICAgICAgICAgICBjb25zdCBwYW5lbCA9ICQoc2VsZi4kZWwpO1xyXG4gICAgICAgICAgICBzZWxmLnNob3cgPSB0cnVlO1xyXG4gICAgICAgICAgICBwYW5lbC5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc2VsZi5yZXNldCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGFuZWwub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xyXG4gICAgICAgICAgICAgIHNlbGYub25QYW5lbCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRXaWR0aCA9ICQoZG9jdW1lbnQpLndpZHRoKCkgLSAxMDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsV2lkdGggPSAyNiAqIDEyO1xyXG5cclxuICAgICAgICAgICAgaWYoKGxlZnQgKyBwYW5lbFdpZHRoKSA+IGRvY3VtZW50V2lkdGgpIHtcclxuICAgICAgICAgICAgICBsZWZ0ID0gZG9jdW1lbnRXaWR0aCAtIHBhbmVsV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhbmVsLmNzcyh7XHJcbiAgICAgICAgICAgICAgdG9wOiB0b3AgKyBoZWlnaHQgKyAxMCxcclxuICAgICAgICAgICAgICBsZWZ0XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBkb20uYXR0cihcImRhdGEtZmxvYXQtaW5pdFwiLCBcInRydWVcIik7XHJcbiAgICB9LFxyXG4gICAgdGltZW91dCh0KSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgdClcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0VXNlckJ5SWQoaWQpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbGV0IHVzZXJPYmogPSBzZWxmLnVzZXJzW2lkXTtcclxuICAgICAgICBpZih1c2VyT2JqKSB7XHJcbiAgICAgICAgICByZXNvbHZlKHVzZXJPYmopO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBua2NBUEkoYC91LyR7aWR9P2Zyb209cGFuZWxgLCBcIkdFVFwiKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBpZihkYXRhLnRhcmdldFVzZXIuaGlkZGVuKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgY29uc3QgdXNlck9iaiA9IHtcclxuICAgICAgICAgICAgICAgIHN1YnNjcmliZWQ6IGRhdGEuc3Vic2NyaWJlZCxcclxuICAgICAgICAgICAgICAgIHVzZXI6IGRhdGEudGFyZ2V0VXNlclxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgc2VsZi51c2Vyc1tkYXRhLnRhcmdldFVzZXIudWlkXSA9IHVzZXJPYmo7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZSh1c2VyT2JqKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzdWJzY3JpYmUoKSB7XHJcbiAgICAgIGNvbnN0IHt1c2VyLCBzdWJzY3JpYmVkfSA9IHRoaXM7XHJcbiAgICAgIFN1YnNjcmliZVR5cGVzLnN1YnNjcmliZVVzZXIodXNlci51aWQsICFzdWJzY3JpYmVkKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXX0=
