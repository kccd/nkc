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
      dom.on("mouseover",
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(e) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvZmxvYXRVc2VyUGFuZWwvZmxvYXRVc2VyUGFuZWwuMi5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixJQUFJLEdBQUosQ0FBUTtBQUM5QixFQUFBLEVBQUUsRUFBRSxpQkFEMEI7QUFFOUIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLElBQUksRUFBRSxFQURGO0FBRUosSUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUZiO0FBR0osSUFBQSxJQUFJLEVBQUUsS0FIRjtBQUlKLElBQUEsSUFBSSxFQUFFLEtBSkY7QUFLSixJQUFBLEtBQUssRUFBRSxDQUxIO0FBTUosSUFBQSxPQUFPLEVBQUUsS0FOTDtBQU9KLElBQUEsS0FBSyxFQUFFLEVBUEg7QUFRSixJQUFBLFdBQVcsRUFBRTtBQVJULEdBRndCO0FBWTlCLEVBQUEsT0FaOEIscUJBWXBCO0FBQ1IsUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLFFBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBTixDQUFmO0FBQ0EsSUFBQSxLQUFLLENBQUMsR0FBTixDQUFVO0FBQ1IsTUFBQSxHQUFHLEVBQUUsQ0FERztBQUVSLE1BQUEsSUFBSSxFQUFFO0FBRkUsS0FBVjtBQUlBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVTtBQUNSLE1BQUEsR0FBRyxFQUFFLEdBREc7QUFFUixNQUFBLElBQUksRUFBRTtBQUZFLEtBQVY7O0FBSUEsUUFBRyxLQUFLLEdBQUwsSUFBWSxDQUFDLE1BQU0sQ0FBQyxjQUF2QixFQUF1QztBQUNyQyxVQUFHLENBQUMsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFoQixFQUFnQztBQUM5QixlQUFPLFVBQVUsQ0FBQyxhQUFELENBQWpCO0FBQ0Qs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Q0gsSUFERztBQUFBLFVBQ0csVUFESCxHQUNpQixJQURqQixDQUNHLFVBREg7QUFFVixNQUFBLGNBQWMsQ0FBQyxhQUFmLENBQTZCLElBQUksQ0FBQyxHQUFsQyxFQUF1QyxDQUFDLFVBQXhDO0FBQ0Q7QUFsSE07QUFsQ3FCLENBQVIsQ0FBeEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuZmxvYXRVc2VyUGFuZWwgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjZmxvYXRVc2VyUGFuZWxcIixcclxuICBkYXRhOiB7XHJcbiAgICB1c2VyOiBcIlwiLFxyXG4gICAgdWlkOiBOS0MuY29uZmlncy51aWQsXHJcbiAgICBvdmVyOiBmYWxzZSxcclxuICAgIHNob3c6IGZhbHNlLFxyXG4gICAgY291bnQ6IDEsXHJcbiAgICBvblBhbmVsOiBmYWxzZSxcclxuICAgIHVzZXJzOiB7fSxcclxuICAgIHRpbWVvdXROYW1lOiBcIlwiLFxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3QgcGFuZWwgPSAkKHNlbGYuJGVsKTtcclxuICAgIHBhbmVsLmNzcyh7XHJcbiAgICAgIHRvcDogMCxcclxuICAgICAgbGVmdDogMFxyXG4gICAgfSk7XHJcbiAgICBwYW5lbC5jc3Moe1xyXG4gICAgICB0b3A6IDMwMCxcclxuICAgICAgbGVmdDogMzAwXHJcbiAgICB9KTtcclxuICAgIGlmKHRoaXMudWlkICYmICF3aW5kb3cuU3Vic2NyaWJlVHlwZXMpIHtcclxuICAgICAgaWYoIU5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgICAgICAgcmV0dXJuIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXkuI7lhbPms6jnm7jlhbPnmoTmqKHlnZdcIik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2luZG93LlN1YnNjcmliZVR5cGVzID0gbmV3IE5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXRQYW5lbCgpO1xyXG5cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgZm9ybWF0OiBOS0MubWV0aG9kcy5mb3JtYXQsXHJcbiAgICBmcm9tTm93OiBOS0MubWV0aG9kcy5mcm9tTm93LFxyXG4gICAgaW5pdFBhbmVsKCkge1xyXG4gICAgICBjb25zdCBkb21zID0gJChgW2RhdGEtZmxvYXQtdWlkXWApO1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZG9tcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRvbSA9IGRvbXMuZXEoaSk7XHJcbiAgICAgICAgaWYoZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIikgPT09IFwidHJ1ZVwiKSBjb250aW51ZTtcclxuICAgICAgICB0aGlzLmluaXRFdmVudChkb21zLmVxKGkpKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJlc2V0KCkge1xyXG4gICAgICB0aGlzLnNob3cgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vblBhbmVsID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub3ZlciA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnVzZXIgPSBcIlwiO1xyXG4gICAgfSxcclxuICAgIGluaXRFdmVudChkb20pIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGRvbS5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VsZi50aW1lb3V0TmFtZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5yZXNldCgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBkb20ub24oXCJtb3VzZW92ZXJcIiwgYXN5bmMgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIC8vIOm8oOagh+W3suaCrOa1ruWcqOWFg+e0oOS4ilxyXG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICBzZWxmLmNvdW50ICsrO1xyXG4gICAgICAgIHNlbGYub3ZlciA9IHRydWU7XHJcbiAgICAgICAgbGV0IHVpZDtcclxuICAgICAgICBsZXQgY291bnRfID0gc2VsZi5jb3VudDtcclxuICAgICAgICBsZXQgbGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0O1xyXG4gICAgICAgIC8vIOWBmuS4gOS4quW7tui/n++8jOi/h+a7pOaOiem8oOagh+aEj+WkluWIkui/h+WFg+e0oOeahOaDheWGteOAglxyXG4gICAgICAgIHNlbGYudGltZW91dCgzMDApXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDFcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDJcIjtcclxuICAgICAgICAgICAgdWlkID0gZG9tLmF0dHIoXCJkYXRhLWZsb2F0LXVpZFwiKTtcclxuICAgICAgICAgICAgbGVmdCA9IGRvbS5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgICAgICB0b3AgPSBkb20ub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgICAgICB3aWR0aCA9IGRvbS53aWR0aCgpO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBkb20uaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldFVzZXJCeUlkKHVpZCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4odXNlck9iaiA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHt1c2VyLCBzdWJzY3JpYmVkfSA9IHVzZXJPYmo7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDNcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDRcIjtcclxuICAgICAgICAgICAgc2VsZi51c2VyID0gdXNlcjtcclxuICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmVkID0gc3Vic2NyaWJlZDtcclxuICAgICAgICAgICAgY29uc3QgcGFuZWwgPSAkKHNlbGYuJGVsKTtcclxuICAgICAgICAgICAgc2VsZi5zaG93ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcGFuZWwub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHNlbGYucmVzZXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHBhbmVsLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICAgICAgICBzZWxmLm9uUGFuZWwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50V2lkdGggPSAkKGRvY3VtZW50KS53aWR0aCgpIC0gMTA7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwYW5lbFdpZHRoID0gMjYgKiAxMjtcclxuXHJcbiAgICAgICAgICAgIGlmKChsZWZ0ICsgcGFuZWxXaWR0aCkgPiBkb2N1bWVudFdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgbGVmdCA9IGRvY3VtZW50V2lkdGggLSBwYW5lbFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYW5lbC5jc3Moe1xyXG4gICAgICAgICAgICAgIHRvcDogdG9wICsgaGVpZ2h0ICsgMTAsXHJcbiAgICAgICAgICAgICAgbGVmdFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIiwgXCJ0cnVlXCIpO1xyXG4gICAgfSxcclxuICAgIHRpbWVvdXQodCkge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIHQpXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGdldFVzZXJCeUlkKGlkKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxldCB1c2VyT2JqID0gc2VsZi51c2Vyc1tpZF07XHJcbiAgICAgICAgaWYodXNlck9iaikge1xyXG4gICAgICAgICAgcmVzb2x2ZSh1c2VyT2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmtjQVBJKGAvdS8ke2lkfT9mcm9tPXBhbmVsYCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YS50YXJnZXRVc2VyLmhpZGRlbikgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHVzZXJPYmogPSB7XHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVkOiBkYXRhLnN1YnNjcmliZWQsXHJcbiAgICAgICAgICAgICAgICB1c2VyOiBkYXRhLnRhcmdldFVzZXJcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNlbGYudXNlcnNbZGF0YS50YXJnZXRVc2VyLnVpZF0gPSB1c2VyT2JqO1xyXG4gICAgICAgICAgICAgIHJlc29sdmUodXNlck9iaik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgc3Vic2NyaWJlKCkge1xyXG4gICAgICBjb25zdCB7dXNlciwgc3Vic2NyaWJlZH0gPSB0aGlzO1xyXG4gICAgICBTdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVVc2VyKHVzZXIudWlkLCAhc3Vic2NyaWJlZCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIl19
