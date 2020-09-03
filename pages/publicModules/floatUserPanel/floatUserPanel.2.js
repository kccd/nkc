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
        var position = dom.attr("data-float-position");
        this.initEvent(doms.eq(i), position);
      }
    },
    reset: function reset() {
      this.show = false;
      this.onPanel = false;
      this.over = false;
      this.user = "";
    },
    initEvent: function initEvent(dom) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "right";
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

                    if (position === 'bottom') {
                      top += height + 10;
                      left -= width + 10;
                    } else {
                      left += width + 10;
                      top += height + 10;
                    }

                    if (left + panelWidth > documentWidth) {
                      left = documentWidth - panelWidth;
                    }

                    panel.css({
                      top: top,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2Zsb2F0VXNlclBhbmVsL2Zsb2F0VXNlclBhbmVsLjIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsSUFBSSxHQUFKLENBQVE7QUFDOUIsRUFBQSxFQUFFLEVBQUUsaUJBRDBCO0FBRTlCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxJQUFJLEVBQUUsRUFERjtBQUVKLElBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FGYjtBQUdKLElBQUEsSUFBSSxFQUFFLEtBSEY7QUFJSixJQUFBLElBQUksRUFBRSxLQUpGO0FBS0osSUFBQSxLQUFLLEVBQUUsQ0FMSDtBQU1KLElBQUEsT0FBTyxFQUFFLEtBTkw7QUFPSixJQUFBLEtBQUssRUFBRSxFQVBIO0FBUUosSUFBQSxXQUFXLEVBQUU7QUFSVCxHQUZ3QjtBQVk5QixFQUFBLE9BWjhCLHFCQVlwQjtBQUNSLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxRQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBZjtBQUNBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVTtBQUNSLE1BQUEsR0FBRyxFQUFFLENBREc7QUFFUixNQUFBLElBQUksRUFBRTtBQUZFLEtBQVY7QUFJQSxJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVU7QUFDUixNQUFBLEdBQUcsRUFBRSxHQURHO0FBRVIsTUFBQSxJQUFJLEVBQUU7QUFGRSxLQUFWOztBQUlBLFFBQUcsS0FBSyxHQUFMLElBQVksQ0FBQyxNQUFNLENBQUMsY0FBdkIsRUFBdUM7QUFDckMsVUFBRyxDQUFDLEdBQUcsQ0FBQyxPQUFKLENBQVksY0FBaEIsRUFBZ0M7QUFDOUIsZUFBTyxVQUFVLENBQUMsYUFBRCxDQUFqQjtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEs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QTNCLElBQWtDLE9BQWxDO0FBQ0EsWUFBQSxPQUFPLENBQUMsT0FBRCxDQUFQO0FBQ0QsV0FUSCxXQVVTLFVBQUEsR0FBRyxFQUFJO0FBQ1osWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7QUFDQSxZQUFBLE1BQU0sQ0FBQyxHQUFELENBQU47QUFDRCxXQWJIO0FBY0Q7QUFDRixPQXBCTSxDQUFQO0FBcUJELEtBdkhNO0FBd0hQLElBQUEsU0F4SE8sdUJBd0hLO0FBQUEsVUFDSCxJQURHLEdBQ2lCLElBRGpCLENBQ0gsSUFERztBQUFBLFVBQ0csVUFESCxHQUNpQixJQURqQixDQUNHLFVBREg7QUFFVixNQUFBLGNBQWMsQ0FBQyxhQUFmLENBQTZCLElBQUksQ0FBQyxHQUFsQyxFQUF1QyxDQUFDLFVBQXhDO0FBQ0Q7QUEzSE07QUFsQ3FCLENBQVIsQ0FBeEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuZmxvYXRVc2VyUGFuZWwgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjZmxvYXRVc2VyUGFuZWxcIixcclxuICBkYXRhOiB7XHJcbiAgICB1c2VyOiBcIlwiLFxyXG4gICAgdWlkOiBOS0MuY29uZmlncy51aWQsXHJcbiAgICBvdmVyOiBmYWxzZSxcclxuICAgIHNob3c6IGZhbHNlLFxyXG4gICAgY291bnQ6IDEsXHJcbiAgICBvblBhbmVsOiBmYWxzZSxcclxuICAgIHVzZXJzOiB7fSxcclxuICAgIHRpbWVvdXROYW1lOiBcIlwiLFxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3QgcGFuZWwgPSAkKHNlbGYuJGVsKTtcclxuICAgIHBhbmVsLmNzcyh7XHJcbiAgICAgIHRvcDogMCxcclxuICAgICAgbGVmdDogMFxyXG4gICAgfSk7XHJcbiAgICBwYW5lbC5jc3Moe1xyXG4gICAgICB0b3A6IDMwMCxcclxuICAgICAgbGVmdDogMzAwXHJcbiAgICB9KTtcclxuICAgIGlmKHRoaXMudWlkICYmICF3aW5kb3cuU3Vic2NyaWJlVHlwZXMpIHtcclxuICAgICAgaWYoIU5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgICAgICAgcmV0dXJuIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXkuI7lhbPms6jnm7jlhbPnmoTmqKHlnZdcIik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2luZG93LlN1YnNjcmliZVR5cGVzID0gbmV3IE5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXRQYW5lbCgpO1xyXG5cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgZm9ybWF0OiBOS0MubWV0aG9kcy5mb3JtYXQsXHJcbiAgICBmcm9tTm93OiBOS0MubWV0aG9kcy5mcm9tTm93LFxyXG4gICAgaW5pdFBhbmVsKCkge1xyXG4gICAgICBjb25zdCBkb21zID0gJChgW2RhdGEtZmxvYXQtdWlkXWApO1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZG9tcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRvbSA9IGRvbXMuZXEoaSk7XHJcbiAgICAgICAgaWYoZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIikgPT09IFwidHJ1ZVwiKSBjb250aW51ZTtcclxuICAgICAgICBsZXQgcG9zaXRpb24gPSBkb20uYXR0cihcImRhdGEtZmxvYXQtcG9zaXRpb25cIik7XHJcbiAgICAgICAgdGhpcy5pbml0RXZlbnQoZG9tcy5lcShpKSwgcG9zaXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcmVzZXQoKSB7XHJcbiAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9uUGFuZWwgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vdmVyID0gZmFsc2U7XHJcbiAgICAgIHRoaXMudXNlciA9IFwiXCI7XHJcbiAgICB9LFxyXG4gICAgaW5pdEV2ZW50KGRvbSwgcG9zaXRpb24gPSBcInJpZ2h0XCIpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGRvbS5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VsZi50aW1lb3V0TmFtZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5yZXNldCgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBkb20ub24oXCJtb3VzZW92ZXJcIiwgYXN5bmMgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIC8vIOm8oOagh+W3suaCrOa1ruWcqOWFg+e0oOS4ilxyXG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICBzZWxmLmNvdW50ICsrO1xyXG4gICAgICAgIHNlbGYub3ZlciA9IHRydWU7XHJcbiAgICAgICAgbGV0IHVpZDtcclxuICAgICAgICBsZXQgY291bnRfID0gc2VsZi5jb3VudDtcclxuICAgICAgICBsZXQgbGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0O1xyXG4gICAgICAgIC8vIOWBmuS4gOS4quW7tui/n++8jOi/h+a7pOaOiem8oOagh+aEj+WkluWIkui/h+WFg+e0oOeahOaDheWGteOAglxyXG4gICAgICAgIHNlbGYudGltZW91dCgzMDApXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDFcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDJcIjtcclxuICAgICAgICAgICAgdWlkID0gZG9tLmF0dHIoXCJkYXRhLWZsb2F0LXVpZFwiKTtcclxuICAgICAgICAgICAgbGVmdCA9IGRvbS5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgICAgICB0b3AgPSBkb20ub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgICAgICB3aWR0aCA9IGRvbS53aWR0aCgpO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBkb20uaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldFVzZXJCeUlkKHVpZCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4odXNlck9iaiA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHt1c2VyLCBzdWJzY3JpYmVkfSA9IHVzZXJPYmo7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDNcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDRcIjtcclxuICAgICAgICAgICAgc2VsZi51c2VyID0gdXNlcjtcclxuICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmVkID0gc3Vic2NyaWJlZDtcclxuICAgICAgICAgICAgY29uc3QgcGFuZWwgPSAkKHNlbGYuJGVsKTtcclxuICAgICAgICAgICAgc2VsZi5zaG93ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcGFuZWwub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHNlbGYucmVzZXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHBhbmVsLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICAgICAgICBzZWxmLm9uUGFuZWwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50V2lkdGggPSAkKGRvY3VtZW50KS53aWR0aCgpIC0gMTA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwYW5lbFdpZHRoID0gMjYgKiAxMjtcclxuXHJcbiAgICAgICAgICAgIGlmKHBvc2l0aW9uID09PSAnYm90dG9tJykge1xyXG4gICAgICAgICAgICAgIHRvcCArPSBoZWlnaHQgKyAxMDtcclxuICAgICAgICAgICAgICBsZWZ0IC09ICh3aWR0aCArIDEwKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBsZWZ0ICs9IHdpZHRoICsgMTA7XHJcbiAgICAgICAgICAgICAgdG9wICs9IGhlaWdodCArIDEwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZigobGVmdCArIHBhbmVsV2lkdGgpID4gZG9jdW1lbnRXaWR0aCkge1xyXG4gICAgICAgICAgICAgIGxlZnQgPSBkb2N1bWVudFdpZHRoIC0gcGFuZWxXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFuZWwuY3NzKHtcclxuICAgICAgICAgICAgICB0b3AsXHJcbiAgICAgICAgICAgICAgbGVmdFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIiwgXCJ0cnVlXCIpO1xyXG4gICAgfSxcclxuICAgIHRpbWVvdXQodCkge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIHQpXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGdldFVzZXJCeUlkKGlkKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxldCB1c2VyT2JqID0gc2VsZi51c2Vyc1tpZF07XHJcbiAgICAgICAgaWYodXNlck9iaikge1xyXG4gICAgICAgICAgcmVzb2x2ZSh1c2VyT2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmtjQVBJKGAvdS8ke2lkfT9mcm9tPXBhbmVsYCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YS50YXJnZXRVc2VyLmhpZGRlbikgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHVzZXJPYmogPSB7XHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVkOiBkYXRhLnN1YnNjcmliZWQsXHJcbiAgICAgICAgICAgICAgICB1c2VyOiBkYXRhLnRhcmdldFVzZXJcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNlbGYudXNlcnNbZGF0YS50YXJnZXRVc2VyLnVpZF0gPSB1c2VyT2JqO1xyXG4gICAgICAgICAgICAgIHJlc29sdmUodXNlck9iaik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc3Vic2NyaWJlKCkge1xyXG4gICAgICBjb25zdCB7dXNlciwgc3Vic2NyaWJlZH0gPSB0aGlzO1xyXG4gICAgICBTdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVVc2VyKHVzZXIudWlkLCAhc3Vic2NyaWJlZCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIl19
