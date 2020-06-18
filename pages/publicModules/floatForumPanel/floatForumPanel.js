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
      dom.on("mouseover", /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(e) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvZmxvYXRGb3J1bVBhbmVsL2Zsb2F0Rm9ydW1QYW5lbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxNQUFNLENBQUMsZUFBUCxHQUF5QixJQUFJLEdBQUosQ0FBUTtBQUMvQixFQUFBLEVBQUUsRUFBRSxrQkFEMkI7QUFFL0IsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLEtBQUssRUFBRSxFQURIO0FBRUosSUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUZiO0FBR0osSUFBQSxVQUFVLEVBQUUsS0FIUjtBQUlKLElBQUEsSUFBSSxFQUFFLEtBSkY7QUFLSixJQUFBLElBQUksRUFBRSxLQUxGO0FBTUosSUFBQSxLQUFLLEVBQUUsQ0FOSDtBQU9KLElBQUEsT0FBTyxFQUFFLEtBUEw7QUFRSixJQUFBLE1BQU0sRUFBRSxFQVJKO0FBU0osSUFBQSxXQUFXLEVBQUU7QUFUVCxHQUZ5QjtBQWEvQixFQUFBLE9BYitCLHFCQWFyQjtBQUNSLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxRQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBZjtBQUNBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVTtBQUNSLE1BQUEsR0FBRyxFQUFFLENBREc7QUFFUixNQUFBLElBQUksRUFBRTtBQUZFLEtBQVY7O0FBS0EsUUFBRyxLQUFLLEdBQUwsSUFBWSxDQUFDLE1BQU0sQ0FBQyxjQUF2QixFQUF1QztBQUNyQyxVQUFHLENBQUMsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFoQixFQUFnQztBQUM5QixlQUFPLFVBQVUsQ0FBQyxhQUFELENBQWpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsUUFBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixJQUFJLEdBQUcsQ0FBQyxPQUFK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UCxJQUFBLFlBckZPLHdCQXFGTSxHQXJGTixFQXFGVztBQUNoQixVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFMLENBQVksR0FBWixDQUFoQjs7QUFDQSxZQUFHLFNBQUgsRUFBYztBQUNaLFVBQUEsT0FBTyxDQUFDLFNBQUQsQ0FBUDtBQUNELFNBRkQsTUFFTztBQUNMLFVBQUEsTUFBTSxjQUFPLEdBQVAsWUFBbUIsS0FBbkIsQ0FBTixDQUNHLElBREgsQ0FDUSxVQUFBLElBQUksRUFBSTtBQUNaLFlBQUEsU0FBUyxHQUFHO0FBQ1YsY0FBQSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBREY7QUFFVixjQUFBLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFGUCxhQUFaO0FBSUEsWUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBdkIsSUFBOEIsU0FBOUI7QUFDQSxZQUFBLE9BQU8sQ0FBQyxTQUFELENBQVA7QUFDRCxXQVJILFdBU1MsVUFBQSxHQUFHLEVBQUk7QUFDWixZQUFBLE1BQU0sQ0FBQyxHQUFELENBQU47QUFDRCxXQVhIO0FBWUQ7QUFDRixPQWxCTSxDQUFQO0FBbUJELEtBMUdNO0FBMkdQLElBQUEsU0EzR08sdUJBMkdLO0FBQUEsVUFDSCxLQURHLEdBQ2tCLElBRGxCLENBQ0gsS0FERztBQUFBLFVBQ0ksVUFESixHQUNrQixJQURsQixDQUNJLFVBREo7QUFFVixNQUFBLGNBQWMsQ0FBQyxjQUFmLENBQThCLEtBQUssQ0FBQyxHQUFwQyxFQUF5QyxDQUFDLFVBQTFDO0FBQ0QsS0E5R007QUErR1AsSUFBQSxLQS9HTyxtQkErR0MsQ0FFUDtBQWpITTtBQWhDc0IsQ0FBUixDQUF6QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5mbG9hdEZvcnVtUGFuZWwgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjZmxvYXRGb3J1bVBhbmVsXCIsXHJcbiAgZGF0YToge1xyXG4gICAgZm9ydW06IFwiXCIsXHJcbiAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcclxuICAgIHN1YnNjcmliZWQ6IGZhbHNlLFxyXG4gICAgb3ZlcjogZmFsc2UsXHJcbiAgICBzaG93OiBmYWxzZSxcclxuICAgIGNvdW50OiAxLFxyXG4gICAgb25QYW5lbDogZmFsc2UsXHJcbiAgICBmb3J1bXM6IHt9LFxyXG4gICAgdGltZW91dE5hbWU6IFwiXCIsXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBjb25zdCBwYW5lbCA9ICQoc2VsZi4kZWwpO1xyXG4gICAgcGFuZWwuY3NzKHtcclxuICAgICAgdG9wOiAwLFxyXG4gICAgICBsZWZ0OiAwXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZih0aGlzLnVpZCAmJiAhd2luZG93LlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgICAgIGlmKCFOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcykge1xyXG4gICAgICAgIHJldHVybiBzd2VldEVycm9yKFwi5pyq5byV5YWl5LiO5YWz5rOo55u45YWz55qE5qih5Z2XXCIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHdpbmRvdy5TdWJzY3JpYmVUeXBlcyA9IG5ldyBOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuaW5pdFBhbmVsKCk7XHJcblxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBpbml0UGFuZWwoKSB7XHJcbiAgICAgIGNvbnN0IGRvbXMgPSAkKGBbZGF0YS1mbG9hdC1maWRdYCk7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBkb21zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZG9tID0gZG9tcy5lcShpKTtcclxuICAgICAgICBpZihkb20uYXR0cihcImRhdGEtZmxvYXQtaW5pdFwiKSA9PT0gXCJ0cnVlXCIpIGNvbnRpbnVlO1xyXG4gICAgICAgIHRoaXMuaW5pdEV2ZW50KGRvbXMuZXEoaSkpO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcmVzZXQoKSB7XHJcbiAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9uUGFuZWwgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vdmVyID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZm9ydW0gPSBcIlwiO1xyXG4gICAgfSxcclxuICAgIGluaXRFdmVudChkb20pIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGRvbS5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VsZi50aW1lb3V0TmFtZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5yZXNldCgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBkb20ub24oXCJtb3VzZW92ZXJcIiwgYXN5bmMgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIC8vIOm8oOagh+W3suaCrOa1ruWcqOWFg+e0oOS4ilxyXG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICBzZWxmLmNvdW50ICsrO1xyXG4gICAgICAgIHNlbGYub3ZlciA9IHRydWU7XHJcbiAgICAgICAgbGV0IGZpZDtcclxuICAgICAgICBsZXQgY291bnRfID0gc2VsZi5jb3VudDtcclxuICAgICAgICBsZXQgbGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0O1xyXG4gICAgICAgIC8vIOWBmuS4gOS4quW7tui/n++8jOi/h+a7pOaOiem8oOagh+aEj+WkluWIkui/h+WFg+e0oOeahOaDheWGteOAglxyXG4gICAgICAgIHNlbGYudGltZW91dCgzMDApXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDFcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDJcIjtcclxuICAgICAgICAgICAgZmlkID0gZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWZpZFwiKTtcclxuICAgICAgICAgICAgbGVmdCA9IGRvbS5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgICAgICB0b3AgPSBkb20ub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgICAgICB3aWR0aCA9IGRvbS53aWR0aCgpO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBkb20uaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldEZvcnVtQnlJZChmaWQpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGZvcnVtT2JqID0+IHtcclxuICAgICAgICAgICAgY29uc3Qge2ZvcnVtLCBzdWJzY3JpYmVkfSA9IGZvcnVtT2JqO1xyXG4gICAgICAgICAgICBpZihjb3VudF8gIT09IHNlbGYuY291bnQpIHRocm93IFwidGltZW91dCAzXCI7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLm92ZXIpIHRocm93IFwidGltZW91dCA0XCI7XHJcbiAgICAgICAgICAgIHNlbGYuZm9ydW0gPSBmb3J1bTtcclxuICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmVkID0gc3Vic2NyaWJlZDtcclxuICAgICAgICAgICAgY29uc3QgcGFuZWwgPSAkKHNlbGYuJGVsKTtcclxuICAgICAgICAgICAgc2VsZi5zaG93ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcGFuZWwub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHNlbGYucmVzZXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHBhbmVsLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICAgICAgICBzZWxmLm9uUGFuZWwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50V2lkdGggPSAkKGRvY3VtZW50KS53aWR0aCgpIC0gMTA7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBwYW5lbFdpZHRoID0gMjQgKiAxMjtcclxuXHJcbiAgICAgICAgICAgIGlmKChsZWZ0ICsgcGFuZWxXaWR0aCkgPiBkb2N1bWVudFdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgbGVmdCA9IGRvY3VtZW50V2lkdGggLSBwYW5lbFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYW5lbC5jc3Moe1xyXG4gICAgICAgICAgICAgIHRvcDogdG9wICsgaGVpZ2h0ICsgMTAsXHJcbiAgICAgICAgICAgICAgbGVmdFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIiwgXCJ0cnVlXCIpO1xyXG4gICAgfSxcclxuICAgIHRpbWVvdXQodCkge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIHQpXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGdldEZvcnVtQnlJZChmaWQpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbGV0IGZvcnVtc09iaiA9IHNlbGYuZm9ydW1zW2ZpZF07XHJcbiAgICAgICAgaWYoZm9ydW1zT2JqKSB7XHJcbiAgICAgICAgICByZXNvbHZlKGZvcnVtc09iaik7IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBua2NBUEkoYC9mLyR7ZmlkfS9jYXJkYCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgZm9ydW1zT2JqID0ge1xyXG4gICAgICAgICAgICAgICAgZm9ydW06IGRhdGEuZm9ydW0sXHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVkOiBkYXRhLnN1YnNjcmliZWRcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNlbGYuZm9ydW1zW2RhdGEuZm9ydW0uZmlkXSA9IGZvcnVtc09iajtcclxuICAgICAgICAgICAgICByZXNvbHZlKGZvcnVtc09iaik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHN1YnNjcmliZSgpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtLCBzdWJzY3JpYmVkfSA9IHRoaXM7XHJcbiAgICAgIFN1YnNjcmliZVR5cGVzLnN1YnNjcmliZUZvcnVtKGZvcnVtLmZpZCwgIXN1YnNjcmliZWQpO1xyXG4gICAgfSxcclxuICAgIGNsb3NlKCkge1xyXG5cclxuICAgIH0sXHJcblxyXG4gIH1cclxufSk7Il19
