(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

window.floatForumPanel = new Vue({
  el: "#floatForumPanel",
  data: {
    forum: "",
    uid: NKC.configs.uid,
    subscribed: false,
    over: false,
    show: false,
    count: 1,
    onPanel: false,
    forums: {},
    timeoutName: ""
  },
  mounted: function mounted() {
    var self = this;
    var panel = $(self.$el);
    panel.css({
      top: 0,
      left: 0
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
    initPanel: function initPanel() {
      var doms = $("[data-float-fid]");

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
      this.forum = "";
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
          var fid, count_, left, top, width, height;
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
                    fid = dom.attr("data-float-fid");
                    left = dom.offset().left;
                    top = dom.offset().top;
                    width = dom.width();
                    height = dom.height();
                    return self.getForumById(fid);
                  }).then(function (forumObj) {
                    var forum = forumObj.forum,
                        subscribed = forumObj.subscribed;
                    if (count_ !== self.count) throw "timeout 3";
                    if (!self.over) throw "timeout 4";
                    self.forum = forum;
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
                    var panelWidth = 24 * 12;

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
    getForumById: function getForumById(fid) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var forumsObj = self.forums[fid];

        if (forumsObj) {
          resolve(forumsObj);
        } else {
          nkcAPI("/f/".concat(fid, "/card"), "GET").then(function (data) {
            forumsObj = {
              forum: data.forum,
              subscribed: data.subscribed
            };
            self.forums[data.forum.fid] = forumsObj;
            resolve(forumsObj);
          })["catch"](function (err) {
            reject(err);
          });
        }
      });
    },
    subscribe: function subscribe() {
      var forum = this.forum,
          subscribed = this.subscribed;
      SubscribeTypes.subscribeForum(forum.fid, !subscribed);
    },
    close: function close() {}
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvZmxvYXRGb3J1bVBhbmVsL2Zsb2F0Rm9ydW1QYW5lbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxNQUFNLENBQUMsZUFBUCxHQUF5QixJQUFJLEdBQUosQ0FBUTtBQUMvQixFQUFBLEVBQUUsRUFBRSxrQkFEMkI7QUFFL0IsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLEtBQUssRUFBRSxFQURIO0FBRUosSUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUZiO0FBR0osSUFBQSxVQUFVLEVBQUUsS0FIUjtBQUlKLElBQUEsSUFBSSxFQUFFLEtBSkY7QUFLSixJQUFBLElBQUksRUFBRSxLQUxGO0FBTUosSUFBQSxLQUFLLEVBQUUsQ0FOSDtBQU9KLElBQUEsT0FBTyxFQUFFLEtBUEw7QUFRSixJQUFBLE1BQU0sRUFBRSxFQVJKO0FBU0osSUFBQSxXQUFXLEVBQUU7QUFUVCxHQUZ5QjtBQWEvQixFQUFBLE9BYitCLHFCQWFyQjtBQUNSLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxRQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBZjtBQUNBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVTtBQUNSLE1BQUEsR0FBRyxFQUFFLENBREc7QUFFUixNQUFBLElBQUksRUFBRTtBQUZFLEtBQVY7O0FBS0EsUUFBRyxLQUFLLEdBQUwsSUFBWSxDQUFDLE1BQU0sQ0FBQyxjQUF2QixFQUF1QztBQUNyQyxVQUFHLENBQUMsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFoQixFQUFnQztBQUM5QixlQUFPLFVBQVUsQ0FBQyxhQUFELENBQWpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsUUFBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixJQUFJLEdBQUcsQ0FBQyxPQUFK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ZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LmZsb2F0Rm9ydW1QYW5lbCA9IG5ldyBWdWUoe1xuICBlbDogXCIjZmxvYXRGb3J1bVBhbmVsXCIsXG4gIGRhdGE6IHtcbiAgICBmb3J1bTogXCJcIixcbiAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcbiAgICBzdWJzY3JpYmVkOiBmYWxzZSxcbiAgICBvdmVyOiBmYWxzZSxcbiAgICBzaG93OiBmYWxzZSxcbiAgICBjb3VudDogMSxcbiAgICBvblBhbmVsOiBmYWxzZSxcbiAgICBmb3J1bXM6IHt9LFxuICAgIHRpbWVvdXROYW1lOiBcIlwiLFxuICB9LFxuICBtb3VudGVkKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHBhbmVsID0gJChzZWxmLiRlbCk7XG4gICAgcGFuZWwuY3NzKHtcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IDBcbiAgICB9KTtcblxuICAgIGlmKHRoaXMudWlkICYmICF3aW5kb3cuU3Vic2NyaWJlVHlwZXMpIHtcbiAgICAgIGlmKCFOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcykge1xuICAgICAgICByZXR1cm4gc3dlZXRFcnJvcihcIuacquW8leWFpeS4juWFs+azqOebuOWFs+eahOaooeWdl1wiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5TdWJzY3JpYmVUeXBlcyA9IG5ldyBOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcygpO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmluaXRQYW5lbCgpO1xuXG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcbiAgICBpbml0UGFuZWwoKSB7XG4gICAgICBjb25zdCBkb21zID0gJChgW2RhdGEtZmxvYXQtZmlkXWApO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGRvbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZG9tID0gZG9tcy5lcShpKTtcbiAgICAgICAgaWYoZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIikgPT09IFwidHJ1ZVwiKSBjb250aW51ZTtcbiAgICAgICAgdGhpcy5pbml0RXZlbnQoZG9tcy5lcShpKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNldCgpIHtcbiAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xuICAgICAgdGhpcy5vblBhbmVsID0gZmFsc2U7XG4gICAgICB0aGlzLm92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuZm9ydW0gPSBcIlwiO1xuICAgIH0sXG4gICAgaW5pdEV2ZW50KGRvbSkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBkb20ub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnRpbWVvdXROYW1lID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgc2VsZi5yZXNldCgpO1xuICAgICAgICB9LCAyMDApO1xuICAgICAgfSk7XG4gICAgICBkb20ub24oXCJtb3VzZW92ZXJcIiwgYXN5bmMgZnVuY3Rpb24oZSkge1xuICAgICAgICAvLyDpvKDmoIflt7Lmgqzmta7lnKjlhYPntKDkuIpcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xuICAgICAgICBzZWxmLmNvdW50ICsrO1xuICAgICAgICBzZWxmLm92ZXIgPSB0cnVlO1xuICAgICAgICBsZXQgZmlkO1xuICAgICAgICBsZXQgY291bnRfID0gc2VsZi5jb3VudDtcbiAgICAgICAgbGV0IGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodDtcbiAgICAgICAgLy8g5YGa5LiA5Liq5bu26L+f77yM6L+H5ruk5o6J6byg5qCH5oSP5aSW5YiS6L+H5YWD57Sg55qE5oOF5Ya144CCXG4gICAgICAgIHNlbGYudGltZW91dCgzMDApXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYoY291bnRfICE9PSBzZWxmLmNvdW50KSB0aHJvdyBcInRpbWVvdXQgMVwiO1xuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDJcIjtcbiAgICAgICAgICAgIGZpZCA9IGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1maWRcIik7XG4gICAgICAgICAgICBsZWZ0ID0gZG9tLm9mZnNldCgpLmxlZnQ7XG4gICAgICAgICAgICB0b3AgPSBkb20ub2Zmc2V0KCkudG9wO1xuICAgICAgICAgICAgd2lkdGggPSBkb20ud2lkdGgoKTtcbiAgICAgICAgICAgIGhlaWdodCA9IGRvbS5oZWlnaHQoKTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldEZvcnVtQnlJZChmaWQpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oZm9ydW1PYmogPT4ge1xuICAgICAgICAgICAgY29uc3Qge2ZvcnVtLCBzdWJzY3JpYmVkfSA9IGZvcnVtT2JqO1xuICAgICAgICAgICAgaWYoY291bnRfICE9PSBzZWxmLmNvdW50KSB0aHJvdyBcInRpbWVvdXQgM1wiO1xuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDRcIjtcbiAgICAgICAgICAgIHNlbGYuZm9ydW0gPSBmb3J1bTtcbiAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlZCA9IHN1YnNjcmliZWQ7XG4gICAgICAgICAgICBjb25zdCBwYW5lbCA9ICQoc2VsZi4kZWwpO1xuICAgICAgICAgICAgc2VsZi5zaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIHBhbmVsLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc2VsZi5yZXNldCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwYW5lbC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xuICAgICAgICAgICAgICBzZWxmLm9uUGFuZWwgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50V2lkdGggPSAkKGRvY3VtZW50KS53aWR0aCgpIC0gMTA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsV2lkdGggPSAyNCAqIDEyO1xuXG4gICAgICAgICAgICBpZigobGVmdCArIHBhbmVsV2lkdGgpID4gZG9jdW1lbnRXaWR0aCkge1xuICAgICAgICAgICAgICBsZWZ0ID0gZG9jdW1lbnRXaWR0aCAtIHBhbmVsV2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhbmVsLmNzcyh7XG4gICAgICAgICAgICAgIHRvcDogdG9wICsgaGVpZ2h0ICsgMTAsXG4gICAgICAgICAgICAgIGxlZnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBkb20uYXR0cihcImRhdGEtZmxvYXQtaW5pdFwiLCBcInRydWVcIik7XG4gICAgfSxcbiAgICB0aW1lb3V0KHQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSwgdClcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0Rm9ydW1CeUlkKGZpZCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgZm9ydW1zT2JqID0gc2VsZi5mb3J1bXNbZmlkXTtcbiAgICAgICAgaWYoZm9ydW1zT2JqKSB7XG4gICAgICAgICAgcmVzb2x2ZShmb3J1bXNPYmopOyBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBua2NBUEkoYC9mLyR7ZmlkfS9jYXJkYCwgXCJHRVRcIilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICBmb3J1bXNPYmogPSB7XG4gICAgICAgICAgICAgICAgZm9ydW06IGRhdGEuZm9ydW0sXG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlZDogZGF0YS5zdWJzY3JpYmVkXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHNlbGYuZm9ydW1zW2RhdGEuZm9ydW0uZmlkXSA9IGZvcnVtc09iajtcbiAgICAgICAgICAgICAgcmVzb2x2ZShmb3J1bXNPYmopO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHN1YnNjcmliZSgpIHtcbiAgICAgIGNvbnN0IHtmb3J1bSwgc3Vic2NyaWJlZH0gPSB0aGlzO1xuICAgICAgU3Vic2NyaWJlVHlwZXMuc3Vic2NyaWJlRm9ydW0oZm9ydW0uZmlkLCAhc3Vic2NyaWJlZCk7XG4gICAgfSxcbiAgICBjbG9zZSgpIHtcblxuICAgIH0sXG5cbiAgfVxufSk7Il19
