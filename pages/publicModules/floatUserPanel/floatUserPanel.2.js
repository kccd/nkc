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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvZmxvYXRVc2VyUGFuZWwvZmxvYXRVc2VyUGFuZWwuMi5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixJQUFJLEdBQUosQ0FBUTtBQUM5QixFQUFBLEVBQUUsRUFBRSxpQkFEMEI7QUFFOUIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLElBQUksRUFBRSxFQURGO0FBRUosSUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUZiO0FBR0osSUFBQSxJQUFJLEVBQUUsS0FIRjtBQUlKLElBQUEsSUFBSSxFQUFFLEtBSkY7QUFLSixJQUFBLEtBQUssRUFBRSxDQUxIO0FBTUosSUFBQSxPQUFPLEVBQUUsS0FOTDtBQU9KLElBQUEsS0FBSyxFQUFFLEVBUEg7QUFRSixJQUFBLFdBQVcsRUFBRTtBQVJULEdBRndCO0FBWTlCLEVBQUEsT0FaOEIscUJBWXBCO0FBQ1IsUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLFFBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBTixDQUFmO0FBQ0EsSUFBQSxLQUFLLENBQUMsR0FBTixDQUFVO0FBQ1IsTUFBQSxHQUFHLEVBQUUsQ0FERztBQUVSLE1BQUEsSUFBSSxFQUFFO0FBRkUsS0FBVjtBQUlBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVTtBQUNSLE1BQUEsR0FBRyxFQUFFLEdBREc7QUFFUixNQUFBLElBQUksRUFBRTtBQUZFLEtBQVY7O0FBSUEsUUFBRyxLQUFLLEdBQUwsSUFBWSxDQUFDLE1BQU0sQ0FBQyxjQUF2QixFQUF1QztBQUNyQyxVQUFHLENBQUMsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFoQixFQUFnQztBQUM5QixlQUFPLFVBQVUsQ0FBQyxhQUFELENBQWpCO0FBQ0Qs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QUFFVixNQUFBLGNBQWMsQ0FBQyxhQUFmLENBQTZCLElBQUksQ0FBQyxHQUFsQyxFQUF1QyxDQUFDLFVBQXhDO0FBQ0Q7QUFqSE07QUFsQ3FCLENBQVIsQ0FBeEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuZmxvYXRVc2VyUGFuZWwgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjZmxvYXRVc2VyUGFuZWxcIixcclxuICBkYXRhOiB7XHJcbiAgICB1c2VyOiBcIlwiLFxyXG4gICAgdWlkOiBOS0MuY29uZmlncy51aWQsXHJcbiAgICBvdmVyOiBmYWxzZSxcclxuICAgIHNob3c6IGZhbHNlLCBcclxuICAgIGNvdW50OiAxLFxyXG4gICAgb25QYW5lbDogZmFsc2UsXHJcbiAgICB1c2Vyczoge30sXHJcbiAgICB0aW1lb3V0TmFtZTogXCJcIixcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHBhbmVsID0gJChzZWxmLiRlbCk7XHJcbiAgICBwYW5lbC5jc3Moe1xyXG4gICAgICB0b3A6IDAsXHJcbiAgICAgIGxlZnQ6IDBcclxuICAgIH0pO1xyXG4gICAgcGFuZWwuY3NzKHtcclxuICAgICAgdG9wOiAzMDAsXHJcbiAgICAgIGxlZnQ6IDMwMFxyXG4gICAgfSk7XHJcbiAgICBpZih0aGlzLnVpZCAmJiAhd2luZG93LlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgICAgIGlmKCFOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcykge1xyXG4gICAgICAgIHJldHVybiBzd2VldEVycm9yKFwi5pyq5byV5YWl5LiO5YWz5rOo55u45YWz55qE5qih5Z2XXCIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHdpbmRvdy5TdWJzY3JpYmVUeXBlcyA9IG5ldyBOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbml0UGFuZWwoKTtcclxuXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGZvcm1hdDogTktDLm1ldGhvZHMuZm9ybWF0LFxyXG4gICAgZnJvbU5vdzogTktDLm1ldGhvZHMuZnJvbU5vdyxcclxuICAgIGluaXRQYW5lbCgpIHtcclxuICAgICAgY29uc3QgZG9tcyA9ICQoYFtkYXRhLWZsb2F0LXVpZF1gKTtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGRvbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkb20gPSBkb21zLmVxKGkpO1xyXG4gICAgICAgIGlmKGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1pbml0XCIpID09PSBcInRydWVcIikgY29udGludWU7XHJcbiAgICAgICAgdGhpcy5pbml0RXZlbnQoZG9tcy5lcShpKSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub25QYW5lbCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm92ZXIgPSBmYWxzZTtcclxuICAgICAgdGhpcy51c2VyID0gXCJcIjtcclxuICAgIH0sXHJcbiAgICBpbml0RXZlbnQoZG9tKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBkb20ub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNlbGYudGltZW91dE5hbWUgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHNlbGYucmVzZXQoKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgICB9KTtcclxuICAgICAgZG9tLm9uKFwibW91c2VvdmVyXCIsIGFzeW5jIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAvLyDpvKDmoIflt7Lmgqzmta7lnKjlhYPntKDkuIpcclxuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0TmFtZSk7XHJcbiAgICAgICAgc2VsZi5jb3VudCArKztcclxuICAgICAgICBzZWxmLm92ZXIgPSB0cnVlO1xyXG4gICAgICAgIGxldCB1aWQ7XHJcbiAgICAgICAgbGV0IGNvdW50XyA9IHNlbGYuY291bnQ7XHJcbiAgICAgICAgbGV0IGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodDtcclxuICAgICAgICAvLyDlgZrkuIDkuKrlu7bov5/vvIzov4fmu6TmjonpvKDmoIfmhI/lpJbliJLov4flhYPntKDnmoTmg4XlhrXjgIJcclxuICAgICAgICBzZWxmLnRpbWVvdXQoMzAwKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBpZihjb3VudF8gIT09IHNlbGYuY291bnQpIHRocm93IFwidGltZW91dCAxXCI7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLm92ZXIpIHRocm93IFwidGltZW91dCAyXCI7XHJcbiAgICAgICAgICAgIHVpZCA9IGRvbS5hdHRyKFwiZGF0YS1mbG9hdC11aWRcIik7XHJcbiAgICAgICAgICAgIGxlZnQgPSBkb20ub2Zmc2V0KCkubGVmdDtcclxuICAgICAgICAgICAgdG9wID0gZG9tLm9mZnNldCgpLnRvcDtcclxuICAgICAgICAgICAgd2lkdGggPSBkb20ud2lkdGgoKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gZG9tLmhlaWdodCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRVc2VyQnlJZCh1aWQpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKHVzZXJPYmogPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7dXNlciwgc3Vic2NyaWJlZH0gPSB1c2VyT2JqO1xyXG4gICAgICAgICAgICBpZihjb3VudF8gIT09IHNlbGYuY291bnQpIHRocm93IFwidGltZW91dCAzXCI7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLm92ZXIpIHRocm93IFwidGltZW91dCA0XCI7XHJcbiAgICAgICAgICAgIHNlbGYudXNlciA9IHVzZXI7XHJcbiAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlZCA9IHN1YnNjcmliZWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsID0gJChzZWxmLiRlbCk7XHJcbiAgICAgICAgICAgIHNlbGYuc2hvdyA9IHRydWU7XHJcbiAgICAgICAgICAgIHBhbmVsLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBzZWxmLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBwYW5lbC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0TmFtZSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5vblBhbmVsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkb2N1bWVudFdpZHRoID0gJChkb2N1bWVudCkud2lkdGgoKSAtIDEwO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc3QgcGFuZWxXaWR0aCA9IDI2ICogMTI7XHJcblxyXG4gICAgICAgICAgICBpZigobGVmdCArIHBhbmVsV2lkdGgpID4gZG9jdW1lbnRXaWR0aCkge1xyXG4gICAgICAgICAgICAgIGxlZnQgPSBkb2N1bWVudFdpZHRoIC0gcGFuZWxXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFuZWwuY3NzKHtcclxuICAgICAgICAgICAgICB0b3A6IHRvcCArIGhlaWdodCArIDEwLFxyXG4gICAgICAgICAgICAgIGxlZnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1pbml0XCIsIFwidHJ1ZVwiKTtcclxuICAgIH0sXHJcbiAgICB0aW1lb3V0KHQpIHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCB0KVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBnZXRVc2VyQnlJZChpZCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBsZXQgdXNlck9iaiA9IHNlbGYudXNlcnNbaWRdO1xyXG4gICAgICAgIGlmKHVzZXJPYmopIHtcclxuICAgICAgICAgIHJlc29sdmUodXNlck9iaik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5rY0FQSShgL3UvJHtpZH0/ZnJvbT1wYW5lbGAsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHVzZXJPYmogPSB7XHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVkOiBkYXRhLnN1YnNjcmliZWQsXHJcbiAgICAgICAgICAgICAgICB1c2VyOiBkYXRhLnRhcmdldFVzZXJcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNlbGYudXNlcnNbZGF0YS50YXJnZXRVc2VyLnVpZF0gPSB1c2VyT2JqO1xyXG4gICAgICAgICAgICAgIHJlc29sdmUodXNlck9iaik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gICAgXHJcbiAgICAgIH0pOyAgICAgIFxyXG4gICAgfSxcclxuICAgIHN1YnNjcmliZSgpIHtcclxuICAgICAgY29uc3Qge3VzZXIsIHN1YnNjcmliZWR9ID0gdGhpcztcclxuICAgICAgU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlVXNlcih1c2VyLnVpZCwgIXN1YnNjcmliZWQpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
