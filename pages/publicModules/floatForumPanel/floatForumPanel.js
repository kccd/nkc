(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
        var position = dom.attr("data-float-position");
        this.initEvent(doms.eq(i), position);
      }
    },
    reset: function reset() {
      this.show = false;
      this.onPanel = false;
      this.over = false;
      this.forum = "";
    },
    initEvent: function initEvent(dom, position) {
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

                    if (!position || position === "bottom") {
                      panel.css({
                        top: top + height + 10,
                        left: left
                      });
                    } else if (position === "right") {
                      panel.css({
                        top: top + height,
                        left: left + width + 10
                      });
                    } else {
                      panel.css({
                        top: top + height + 10,
                        left: left
                      });
                    }
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
              forum: _objectSpread(_objectSpread({}, data.forum), {}, {
                latestThreads: data.latestThreads
              }),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2Zsb2F0Rm9ydW1QYW5lbC9mbG9hdEZvcnVtUGFuZWwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUEsTUFBTSxDQUFDLGVBQVAsR0FBeUIsSUFBSSxHQUFKLENBQVE7QUFDL0IsRUFBQSxFQUFFLEVBQUUsa0JBRDJCO0FBRS9CLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUUsRUFESDtBQUVKLElBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FGYjtBQUdKLElBQUEsVUFBVSxFQUFFLEtBSFI7QUFJSixJQUFBLElBQUksRUFBRSxLQUpGO0FBS0osSUFBQSxJQUFJLEVBQUUsS0FMRjtBQU1KLElBQUEsS0FBSyxFQUFFLENBTkg7QUFPSixJQUFBLE9BQU8sRUFBRSxLQVBMO0FBUUosSUFBQSxNQUFNLEVBQUUsRUFSSjtBQVNKLElBQUEsV0FBVyxFQUFFO0FBVFQsR0FGeUI7QUFhL0IsRUFBQSxPQWIrQixxQkFhckI7QUFDUixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsUUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQWY7QUFDQSxJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVU7QUFDUixNQUFBLEdBQUcsRUFBRSxDQURHO0FBRVIsTUFBQSxJQUFJLEVBQUU7QUFGRSxLQUFWOztBQUtBLFFBQUcsS0FBSyxHQUFMLElBQVksQ0FBQyxNQUFNLENBQUMsY0FBdkIsRUFBdUM7QUFDckMsVUFBRyxDQUFDLEdBQUcsQ0FBQyxPQUFKLENBQVksY0FBaEIsRUFBZ0M7QUFDOUIsZUFBTyxVQUFVLENBQUMsYUFBRCxDQUFqQjtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLGNBQWhCLEVB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SUFBOEIsU0FBOUI7QUFDQSxZQUFBLE9BQU8sQ0FBQyxTQUFELENBQVA7QUFDRCxXQVhILFdBWVMsVUFBQSxHQUFHLEVBQUk7QUFDWixZQUFBLE1BQU0sQ0FBQyxHQUFELENBQU47QUFDRCxXQWRIO0FBZUQ7QUFDRixPQXJCTSxDQUFQO0FBc0JELEtBMUhNO0FBMkhQLElBQUEsU0EzSE8sdUJBMkhLO0FBQUEsVUFDSCxLQURHLEdBQ2tCLElBRGxCLENBQ0gsS0FERztBQUFBLFVBQ0ksVUFESixHQUNrQixJQURsQixDQUNJLFVBREo7QUFFVixNQUFBLGNBQWMsQ0FBQyxjQUFmLENBQThCLEtBQUssQ0FBQyxHQUFwQyxFQUF5QyxDQUFDLFVBQTFDO0FBQ0QsS0E5SE07QUErSFAsSUFBQSxLQS9ITyxtQkErSEMsQ0FFUDtBQWpJTTtBQWhDc0IsQ0FBUixDQUF6QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIndpbmRvdy5mbG9hdEZvcnVtUGFuZWwgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjZmxvYXRGb3J1bVBhbmVsXCIsXHJcbiAgZGF0YToge1xyXG4gICAgZm9ydW06IFwiXCIsXHJcbiAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcclxuICAgIHN1YnNjcmliZWQ6IGZhbHNlLFxyXG4gICAgb3ZlcjogZmFsc2UsXHJcbiAgICBzaG93OiBmYWxzZSxcclxuICAgIGNvdW50OiAxLFxyXG4gICAgb25QYW5lbDogZmFsc2UsXHJcbiAgICBmb3J1bXM6IHt9LFxyXG4gICAgdGltZW91dE5hbWU6IFwiXCIsXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBjb25zdCBwYW5lbCA9ICQoc2VsZi4kZWwpO1xyXG4gICAgcGFuZWwuY3NzKHtcclxuICAgICAgdG9wOiAwLFxyXG4gICAgICBsZWZ0OiAwXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZih0aGlzLnVpZCAmJiAhd2luZG93LlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgICAgIGlmKCFOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcykge1xyXG4gICAgICAgIHJldHVybiBzd2VldEVycm9yKFwi5pyq5byV5YWl5LiO5YWz5rOo55u45YWz55qE5qih5Z2XXCIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHdpbmRvdy5TdWJzY3JpYmVUeXBlcyA9IG5ldyBOS0MubW9kdWxlcy5TdWJzY3JpYmVUeXBlcygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuaW5pdFBhbmVsKCk7XHJcblxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBpbml0UGFuZWwoKSB7XHJcbiAgICAgIGNvbnN0IGRvbXMgPSAkKGBbZGF0YS1mbG9hdC1maWRdYCk7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBkb21zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZG9tID0gZG9tcy5lcShpKTtcclxuICAgICAgICBpZihkb20uYXR0cihcImRhdGEtZmxvYXQtaW5pdFwiKSA9PT0gXCJ0cnVlXCIpIGNvbnRpbnVlO1xyXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1wb3NpdGlvblwiKTtcclxuICAgICAgICB0aGlzLmluaXRFdmVudChkb21zLmVxKGkpLCBwb3NpdGlvbik7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub25QYW5lbCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm92ZXIgPSBmYWxzZTtcclxuICAgICAgdGhpcy5mb3J1bSA9IFwiXCI7XHJcbiAgICB9LFxyXG4gICAgaW5pdEV2ZW50KGRvbSwgcG9zaXRpb24pIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGRvbS5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VsZi50aW1lb3V0TmFtZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgc2VsZi5yZXNldCgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBkb20ub24oXCJtb3VzZW92ZXJcIiwgYXN5bmMgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIC8vIOm8oOagh+W3suaCrOa1ruWcqOWFg+e0oOS4ilxyXG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICBzZWxmLmNvdW50ICsrO1xyXG4gICAgICAgIHNlbGYub3ZlciA9IHRydWU7XHJcbiAgICAgICAgbGV0IGZpZDtcclxuICAgICAgICBsZXQgY291bnRfID0gc2VsZi5jb3VudDtcclxuICAgICAgICBsZXQgbGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0O1xyXG4gICAgICAgIC8vIOWBmuS4gOS4quW7tui/n++8jOi/h+a7pOaOiem8oOagh+aEj+WkluWIkui/h+WFg+e0oOeahOaDheWGteOAglxyXG4gICAgICAgIHNlbGYudGltZW91dCgzMDApXHJcbiAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDFcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDJcIjtcclxuICAgICAgICAgICAgZmlkID0gZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWZpZFwiKTtcclxuICAgICAgICAgICAgbGVmdCA9IGRvbS5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgICAgICB0b3AgPSBkb20ub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgICAgICB3aWR0aCA9IGRvbS53aWR0aCgpO1xyXG4gICAgICAgICAgICBoZWlnaHQgPSBkb20uaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldEZvcnVtQnlJZChmaWQpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGZvcnVtT2JqID0+IHtcclxuICAgICAgICAgICAgY29uc3Qge2ZvcnVtLCBzdWJzY3JpYmVkfSA9IGZvcnVtT2JqO1xyXG4gICAgICAgICAgICBpZihjb3VudF8gIT09IHNlbGYuY291bnQpIHRocm93IFwidGltZW91dCAzXCI7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLm92ZXIpIHRocm93IFwidGltZW91dCA0XCI7XHJcbiAgICAgICAgICAgIHNlbGYuZm9ydW0gPSBmb3J1bTtcclxuICAgICAgICAgICAgc2VsZi5zdWJzY3JpYmVkID0gc3Vic2NyaWJlZDtcclxuICAgICAgICAgICAgY29uc3QgcGFuZWwgPSAkKHNlbGYuJGVsKTtcclxuICAgICAgICAgICAgc2VsZi5zaG93ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcGFuZWwub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHNlbGYucmVzZXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHBhbmVsLm9uKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXROYW1lKTtcclxuICAgICAgICAgICAgICBzZWxmLm9uUGFuZWwgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50V2lkdGggPSAkKGRvY3VtZW50KS53aWR0aCgpIC0gMTA7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBwYW5lbFdpZHRoID0gMjQgKiAxMjtcclxuXHJcbiAgICAgICAgICAgIGlmKChsZWZ0ICsgcGFuZWxXaWR0aCkgPiBkb2N1bWVudFdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgbGVmdCA9IGRvY3VtZW50V2lkdGggLSBwYW5lbFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZighcG9zaXRpb24gfHwgcG9zaXRpb24gPT09IFwiYm90dG9tXCIpIHtcclxuICAgICAgICAgICAgICBwYW5lbC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AgKyBoZWlnaHQgKyAxMCxcclxuICAgICAgICAgICAgICAgIGxlZnRcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKHBvc2l0aW9uID09PSBcInJpZ2h0XCIpIHtcclxuICAgICAgICAgICAgICBwYW5lbC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AgKyBoZWlnaHQsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0ICsgd2lkdGggKyAxMFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBhbmVsLmNzcyh7XHJcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCArIGhlaWdodCArIDEwLFxyXG4gICAgICAgICAgICAgICAgbGVmdFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1pbml0XCIsIFwidHJ1ZVwiKTtcclxuICAgIH0sXHJcbiAgICB0aW1lb3V0KHQpIHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCB0KVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBnZXRGb3J1bUJ5SWQoZmlkKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxldCBmb3J1bXNPYmogPSBzZWxmLmZvcnVtc1tmaWRdO1xyXG4gICAgICAgIGlmKGZvcnVtc09iaikge1xyXG4gICAgICAgICAgcmVzb2x2ZShmb3J1bXNPYmopOyBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmtjQVBJKGAvZi8ke2ZpZH0vY2FyZGAsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIGZvcnVtc09iaiA9IHtcclxuICAgICAgICAgICAgICAgIGZvcnVtOiB7XHJcbiAgICAgICAgICAgICAgICAgIC4uLmRhdGEuZm9ydW0sXHJcbiAgICAgICAgICAgICAgICAgIGxhdGVzdFRocmVhZHM6IGRhdGEubGF0ZXN0VGhyZWFkc1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN1YnNjcmliZWQ6IGRhdGEuc3Vic2NyaWJlZCxcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNlbGYuZm9ydW1zW2RhdGEuZm9ydW0uZmlkXSA9IGZvcnVtc09iajtcclxuICAgICAgICAgICAgICByZXNvbHZlKGZvcnVtc09iaik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHN1YnNjcmliZSgpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtLCBzdWJzY3JpYmVkfSA9IHRoaXM7XHJcbiAgICAgIFN1YnNjcmliZVR5cGVzLnN1YnNjcmliZUZvcnVtKGZvcnVtLmZpZCwgIXN1YnNjcmliZWQpO1xyXG4gICAgfSxcclxuICAgIGNsb3NlKCkge1xyXG5cclxuICAgIH0sXHJcblxyXG4gIH1cclxufSk7Il19
