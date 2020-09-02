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
    initEvent: function initEvent(dom) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'right';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2Zsb2F0Rm9ydW1QYW5lbC9mbG9hdEZvcnVtUGFuZWwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUEsTUFBTSxDQUFDLGVBQVAsR0FBeUIsSUFBSSxHQUFKLENBQVE7QUFDL0IsRUFBQSxFQUFFLEVBQUUsa0JBRDJCO0FBRS9CLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUUsRUFESDtBQUVKLElBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FGYjtBQUdKLElBQUEsVUFBVSxFQUFFLEtBSFI7QUFJSixJQUFBLElBQUksRUFBRSxLQUpGO0FBS0osSUFBQSxJQUFJLEVBQUUsS0FMRjtBQU1KLElBQUEsS0FBSyxFQUFFLENBTkg7QUFPSixJQUFBLE9BQU8sRUFBRSxLQVBMO0FBUUosSUFBQSxNQUFNLEVBQUUsRUFSSjtBQVNKLElBQUEsV0FBVyxFQUFFO0FBVFQsR0FGeUI7QUFhL0IsRUFBQSxPQWIrQixxQkFhckI7QUFDUixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsUUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQWY7QUFDQSxJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVU7QUFDUixNQUFBLEdBQUcsRUFBRSxDQURHO0FBRVIsTUFBQSxJQUFJLEVBQUU7QUFGRSxLQUFWOztBQUtBLFFBQUcsS0FBSyxHQUFMLElBQVksQ0FBQyxNQUFNLENBQUMsY0FBdkIsRUFBdUM7QUFDckMsVUFBRyxDQUFDLEdBQUcsQ0FBQyxPQUFKLENBQVksY0FBaEIsRUFBZ0M7QUFDOUIsZUFBTyxVQUFVLENBQUMsYUFBRCxDQUFqQjtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLGNBQWhCLEVB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SE07QUF1SFAsSUFBQSxTQXZITyx1QkF1SEs7QUFBQSxVQUNILEtBREcsR0FDa0IsSUFEbEIsQ0FDSCxLQURHO0FBQUEsVUFDSSxVQURKLEdBQ2tCLElBRGxCLENBQ0ksVUFESjtBQUVWLE1BQUEsY0FBYyxDQUFDLGNBQWYsQ0FBOEIsS0FBSyxDQUFDLEdBQXBDLEVBQXlDLENBQUMsVUFBMUM7QUFDRCxLQTFITTtBQTJIUCxJQUFBLEtBM0hPLG1CQTJIQyxDQUVQO0FBN0hNO0FBaENzQixDQUFSLENBQXpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LmZsb2F0Rm9ydW1QYW5lbCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNmbG9hdEZvcnVtUGFuZWxcIixcclxuICBkYXRhOiB7XHJcbiAgICBmb3J1bTogXCJcIixcclxuICAgIHVpZDogTktDLmNvbmZpZ3MudWlkLFxyXG4gICAgc3Vic2NyaWJlZDogZmFsc2UsXHJcbiAgICBvdmVyOiBmYWxzZSxcclxuICAgIHNob3c6IGZhbHNlLFxyXG4gICAgY291bnQ6IDEsXHJcbiAgICBvblBhbmVsOiBmYWxzZSxcclxuICAgIGZvcnVtczoge30sXHJcbiAgICB0aW1lb3V0TmFtZTogXCJcIixcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHBhbmVsID0gJChzZWxmLiRlbCk7XHJcbiAgICBwYW5lbC5jc3Moe1xyXG4gICAgICB0b3A6IDAsXHJcbiAgICAgIGxlZnQ6IDBcclxuICAgIH0pO1xyXG5cclxuICAgIGlmKHRoaXMudWlkICYmICF3aW5kb3cuU3Vic2NyaWJlVHlwZXMpIHtcclxuICAgICAgaWYoIU5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgICAgICAgcmV0dXJuIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXkuI7lhbPms6jnm7jlhbPnmoTmqKHlnZdcIik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2luZG93LlN1YnNjcmliZVR5cGVzID0gbmV3IE5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXRQYW5lbCgpO1xyXG5cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgaW5pdFBhbmVsKCkge1xyXG4gICAgICBjb25zdCBkb21zID0gJChgW2RhdGEtZmxvYXQtZmlkXWApO1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZG9tcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRvbSA9IGRvbXMuZXEoaSk7XHJcbiAgICAgICAgaWYoZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIikgPT09IFwidHJ1ZVwiKSBjb250aW51ZTtcclxuICAgICAgICBsZXQgcG9zaXRpb24gPSBkb20uYXR0cihcImRhdGEtZmxvYXQtcG9zaXRpb25cIik7XHJcbiAgICAgICAgdGhpcy5pbml0RXZlbnQoZG9tcy5lcShpKSwgcG9zaXRpb24pO1xyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcmVzZXQoKSB7XHJcbiAgICAgIHRoaXMuc2hvdyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm9uUGFuZWwgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vdmVyID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuZm9ydW0gPSBcIlwiO1xyXG4gICAgfSxcclxuICAgIGluaXRFdmVudChkb20sIHBvc2l0aW9uID0gJ3JpZ2h0Jykge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgZG9tLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBzZWxmLnRpbWVvdXROYW1lID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnJlc2V0KCk7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGRvbS5vbihcIm1vdXNlb3ZlclwiLCBhc3luYyBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgLy8g6byg5qCH5bey5oKs5rWu5Zyo5YWD57Sg5LiKXHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xyXG4gICAgICAgIHNlbGYuY291bnQgKys7XHJcbiAgICAgICAgc2VsZi5vdmVyID0gdHJ1ZTtcclxuICAgICAgICBsZXQgZmlkO1xyXG4gICAgICAgIGxldCBjb3VudF8gPSBzZWxmLmNvdW50O1xyXG4gICAgICAgIGxldCBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQ7XHJcbiAgICAgICAgLy8g5YGa5LiA5Liq5bu26L+f77yM6L+H5ruk5o6J6byg5qCH5oSP5aSW5YiS6L+H5YWD57Sg55qE5oOF5Ya144CCXHJcbiAgICAgICAgc2VsZi50aW1lb3V0KDMwMClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgaWYoY291bnRfICE9PSBzZWxmLmNvdW50KSB0aHJvdyBcInRpbWVvdXQgMVwiO1xyXG4gICAgICAgICAgICBpZighc2VsZi5vdmVyKSB0aHJvdyBcInRpbWVvdXQgMlwiO1xyXG4gICAgICAgICAgICBmaWQgPSBkb20uYXR0cihcImRhdGEtZmxvYXQtZmlkXCIpO1xyXG4gICAgICAgICAgICBsZWZ0ID0gZG9tLm9mZnNldCgpLmxlZnQ7XHJcbiAgICAgICAgICAgIHRvcCA9IGRvbS5vZmZzZXQoKS50b3A7XHJcbiAgICAgICAgICAgIHdpZHRoID0gZG9tLndpZHRoKCk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IGRvbS5oZWlnaHQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Rm9ydW1CeUlkKGZpZCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oZm9ydW1PYmogPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7Zm9ydW0sIHN1YnNjcmliZWR9ID0gZm9ydW1PYmo7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDNcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDRcIjtcclxuICAgICAgICAgICAgc2VsZi5mb3J1bSA9IGZvcnVtO1xyXG4gICAgICAgICAgICBzZWxmLnN1YnNjcmliZWQgPSBzdWJzY3JpYmVkO1xyXG4gICAgICAgICAgICBjb25zdCBwYW5lbCA9ICQoc2VsZi4kZWwpO1xyXG4gICAgICAgICAgICBzZWxmLnNob3cgPSB0cnVlO1xyXG4gICAgICAgICAgICBwYW5lbC5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc2VsZi5yZXNldCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGFuZWwub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xyXG4gICAgICAgICAgICAgIHNlbGYub25QYW5lbCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRXaWR0aCA9ICQoZG9jdW1lbnQpLndpZHRoKCkgLSAxMDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsV2lkdGggPSAyNCAqIDEyO1xyXG5cclxuICAgICAgICAgICAgaWYocG9zaXRpb24gPT09ICdib3R0b20nKSB7XHJcbiAgICAgICAgICAgICAgdG9wICs9IGhlaWdodCArIDEwO1xyXG4gICAgICAgICAgICAgIGxlZnQgLT0gKHdpZHRoICsgMTApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGxlZnQgKz0gd2lkdGggKyAxMDtcclxuICAgICAgICAgICAgICB0b3AgKz0gaGVpZ2h0ICsgMTA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKChsZWZ0ICsgcGFuZWxXaWR0aCkgPiBkb2N1bWVudFdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgbGVmdCA9IGRvY3VtZW50V2lkdGggLSBwYW5lbFdpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwYW5lbC5jc3Moe1xyXG4gICAgICAgICAgICAgIHRvcCxcclxuICAgICAgICAgICAgICBsZWZ0XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBkb20uYXR0cihcImRhdGEtZmxvYXQtaW5pdFwiLCBcInRydWVcIik7XHJcbiAgICB9LFxyXG4gICAgdGltZW91dCh0KSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgdClcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0Rm9ydW1CeUlkKGZpZCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBsZXQgZm9ydW1zT2JqID0gc2VsZi5mb3J1bXNbZmlkXTtcclxuICAgICAgICBpZihmb3J1bXNPYmopIHtcclxuICAgICAgICAgIHJlc29sdmUoZm9ydW1zT2JqKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmtjQVBJKGAvZi8ke2ZpZH0vY2FyZGAsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIGZvcnVtc09iaiA9IHtcclxuICAgICAgICAgICAgICAgIGZvcnVtOiB7XHJcbiAgICAgICAgICAgICAgICAgIC4uLmRhdGEuZm9ydW0sXHJcbiAgICAgICAgICAgICAgICAgIGxhdGVzdFRocmVhZHM6IGRhdGEubGF0ZXN0VGhyZWFkc1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN1YnNjcmliZWQ6IGRhdGEuc3Vic2NyaWJlZCxcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHNlbGYuZm9ydW1zW2RhdGEuZm9ydW0uZmlkXSA9IGZvcnVtc09iajtcclxuICAgICAgICAgICAgICByZXNvbHZlKGZvcnVtc09iaik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHN1YnNjcmliZSgpIHtcclxuICAgICAgY29uc3Qge2ZvcnVtLCBzdWJzY3JpYmVkfSA9IHRoaXM7XHJcbiAgICAgIFN1YnNjcmliZVR5cGVzLnN1YnNjcmliZUZvcnVtKGZvcnVtLmZpZCwgIXN1YnNjcmliZWQpO1xyXG4gICAgfSxcclxuICAgIGNsb3NlKCkge1xyXG5cclxuICAgIH0sXHJcblxyXG4gIH1cclxufSk7XHJcbiJdfQ==
