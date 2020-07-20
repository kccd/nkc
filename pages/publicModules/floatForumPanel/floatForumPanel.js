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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvZmxvYXRGb3J1bVBhbmVsL2Zsb2F0Rm9ydW1QYW5lbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7QUNBQSxNQUFNLENBQUMsZUFBUCxHQUF5QixJQUFJLEdBQUosQ0FBUTtBQUMvQixFQUFBLEVBQUUsRUFBRSxrQkFEMkI7QUFFL0IsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLEtBQUssRUFBRSxFQURIO0FBRUosSUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUZiO0FBR0osSUFBQSxVQUFVLEVBQUUsS0FIUjtBQUlKLElBQUEsSUFBSSxFQUFFLEtBSkY7QUFLSixJQUFBLElBQUksRUFBRSxLQUxGO0FBTUosSUFBQSxLQUFLLEVBQUUsQ0FOSDtBQU9KLElBQUEsT0FBTyxFQUFFLEtBUEw7QUFRSixJQUFBLE1BQU0sRUFBRSxFQVJKO0FBU0osSUFBQSxXQUFXLEVBQUU7QUFUVCxHQUZ5QjtBQWEvQixFQUFBLE9BYitCLHFCQWFyQjtBQUNSLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxRQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBZjtBQUNBLElBQUEsS0FBSyxDQUFDLEdBQU4sQ0FBVTtBQUNSLE1BQUEsR0FBRyxFQUFFLENBREc7QUFFUixNQUFBLElBQUksRUFBRTtBQUZFLEtBQVY7O0FBS0EsUUFBRyxLQUFLLEdBQUwsSUFBWSxDQUFDLE1BQU0sQ0FBQyxjQUF2QixFQUF1QztBQUNyQyxVQUFHLENBQUMsR0FBRyxDQUFDLE9BQUosQ0FBWSxjQUFoQixFQUFnQztBQUM5QixlQUFPLFVBQVUsQ0FBQyxhQUFELENBQWpCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsUUFBQSxNQUFNLENBQUMsY0FBUCxHQUF3QixJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksY0FBaEIsRUFBeEI7QUFDRDtBQUNGOztBQUVELFNBQUssU0FBTDtBQUVELEdBL0I4QjtBQWdDL0IsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVosQ0FBa0IsTUFEbkI7QUFFUCxJQUFBLFNBRk8sdUJBRUs7QUFDVixVQUFNLElBQUksR0FBRyxDQUFDLG9CQUFkOztBQUNBLFdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBWixFQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBeEIsRUFBZ0MsQ0FBQyxFQUFqQyxFQUFxQztBQUNuQyxZQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBTCxDQUFRLENBQVIsQ0FBWjtBQUNBLFlBQUcsR0FBRyxDQUFDLElBQUosQ0FBUyxpQkFBVCxNQUFnQyxNQUFuQyxFQUEyQztBQUMzQyxhQUFLLFNBQUwsQ0FBZSxJQUFJLENBQUMsRUFBTCxDQUFRLENBQVIsQ0FBZjtBQUNEO0FBQ0YsS0FUTTtBQVVQLElBQUEsS0FWTyxtQkFVQztBQUNOLFdBQUssSUFBTCxHQUFZLEtBQVo7QUFDQSxXQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0EsV0FBSyxJQUFMLEdBQVksS0FBWjtBQUNBLFdBQUssS0FBTCxHQUFhLEVBQWI7QUFDRCxLQWZNO0FBZ0JQLElBQUEsU0FoQk8scUJBZ0JHLEdBaEJILEVBZ0JRO0FBQ2IsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsR0FBRyxDQUFDLEVBQUosQ0FBTyxZQUFQLEVBQXFCLFlBQVc7QUFDOUIsUUFBQSxJQUFJLENBQUMsV0FBTCxHQUFtQixVQUFVLENBQUMsWUFBTTtBQUNsQyxVQUFBLElBQUksQ0FBQyxLQUFMO0FBQ0QsU0FGNEIsRUFFMUIsR0FGMEIsQ0FBN0I7QUFHRCxPQUpEO0FBS0EsTUFBQSxHQUFHLENBQUMsRUFBSixDQUFPLFdBQVA7QUFBQSwyRUFBb0IsaUJBQWUsQ0FBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDbEI7QUFDQSxrQkFBQSxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQU4sQ0FBWjtBQUNBLGtCQUFBLElBQUksQ0FBQyxLQUFMO0FBQ0Esa0JBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFaO0FBRUksa0JBQUEsTUFOYyxHQU1MLElBQUksQ0FBQyxLQU5BO0FBUWxCO0FBQ0Esa0JBQUEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLEVBQ0csSUFESCxDQUNRLFlBQU07QUFDVix3QkFBRyxNQUFNLEtBQUssSUFBSSxDQUFDLEtBQW5CLEVBQTBCLE1BQU0sV0FBTjtBQUMxQix3QkFBRyxDQUFDLElBQUksQ0FBQyxJQUFULEVBQWUsTUFBTSxXQUFOO0FBQ2Ysb0JBQUEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFKLENBQVMsZ0JBQVQsQ0FBTjtBQUNBLG9CQUFBLElBQUksR0FBRyxHQUFHLENBQUMsTUFBSixHQUFhLElBQXBCO0FBQ0Esb0JBQUEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFKLEdBQWEsR0FBbkI7QUFDQSxvQkFBQSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUosRUFBUjtBQUNBLG9CQUFBLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBSixFQUFUO0FBQ0EsMkJBQU8sSUFBSSxDQUFDLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBUDtBQUNELG1CQVZILEVBV0csSUFYSCxDQVdRLFVBQUEsUUFBUSxFQUFJO0FBQUEsd0JBQ1QsS0FEUyxHQUNZLFFBRFosQ0FDVCxLQURTO0FBQUEsd0JBQ0YsVUFERSxHQUNZLFFBRFosQ0FDRixVQURFO0FBRWhCLHdCQUFHLE1BQU0sS0FBSyxJQUFJLENBQUMsS0FBbkIsRUFBMEIsTUFBTSxXQUFOO0FBQzFCLHdCQUFHLENBQUMsSUFBSSxDQUFDLElBQVQsRUFBZSxNQUFNLFdBQU47QUFDZixvQkFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLEtBQWI7QUFDQSxvQkFBQSxJQUFJLENBQUMsVUFBTCxHQUFrQixVQUFsQjtBQUNBLHdCQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBZjtBQUNBLG9CQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBWjtBQUNBLG9CQUFBLEtBQUssQ0FBQyxFQUFOLENBQVMsWUFBVCxFQUF1QixZQUFXO0FBQ2hDLHNCQUFBLElBQUksQ0FBQyxLQUFMO0FBQ0QscUJBRkQ7QUFHQSxvQkFBQSxLQUFLLENBQUMsRUFBTixDQUFTLFdBQVQsRUFBc0IsWUFBVztBQUMvQixzQkFBQSxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQU4sQ0FBWjtBQUNBLHNCQUFBLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBZjtBQUNELHFCQUhEO0FBS0Esd0JBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxRQUFELENBQUQsQ0FBWSxLQUFaLEtBQXNCLEVBQTVDO0FBRUEsd0JBQU0sVUFBVSxHQUFHLEtBQUssRUFBeEI7O0FBRUEsd0JBQUksSUFBSSxHQUFHLFVBQVIsR0FBc0IsYUFBekIsRUFBd0M7QUFDdEMsc0JBQUEsSUFBSSxHQUFHLGFBQWEsR0FBRyxVQUF2QjtBQUNEOztBQUVELG9CQUFBLEtBQUssQ0FBQyxHQUFOLENBQVU7QUFDUixzQkFBQSxHQUFHLEVBQUUsR0FBRyxHQUFHLE1BQU4sR0FBZSxFQURaO0FBRVIsc0JBQUEsSUFBSSxFQUFKO0FBRlEscUJBQVY7QUFJRCxtQkF2Q0gsV0F3Q1MsVUFBQSxHQUFHLEVBQUksQ0FDWjtBQUNELG1CQTFDSDs7QUFUa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBcEI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFxREEsTUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLGlCQUFULEVBQTRCLE1BQTVCO0FBQ0QsS0E3RU07QUE4RVAsSUFBQSxPQTlFTyxtQkE4RUMsQ0E5RUQsRUE4RUk7QUFDVCxhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsUUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLFVBQUEsT0FBTztBQUNSLFNBRlMsRUFFUCxDQUZPLENBQVY7QUFHRCxPQUpNLENBQVA7QUFLRCxLQXBGTTtBQXFGUCxJQUFBLFlBckZPLHdCQXFGTSxHQXJGTixFQXFGVztBQUNoQixVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3RDLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFMLENBQVksR0FBWixDQUFoQjs7QUFDQSxZQUFHLFNBQUgsRUFBYztBQUNaLFVBQUEsT0FBTyxDQUFDLFNBQUQsQ0FBUDtBQUNELFNBRkQsTUFFTztBQUNMLFVBQUEsTUFBTSxjQUFPLEdBQVAsWUFBbUIsS0FBbkIsQ0FBTixDQUNHLElBREgsQ0FDUSxVQUFBLElBQUksRUFBSTtBQUNaLFlBQUEsU0FBUyxHQUFHO0FBQ1YsY0FBQSxLQUFLLGtDQUNBLElBQUksQ0FBQyxLQURMO0FBRUgsZ0JBQUEsYUFBYSxFQUFFLElBQUksQ0FBQztBQUZqQixnQkFESztBQUtWLGNBQUEsVUFBVSxFQUFFLElBQUksQ0FBQztBQUxQLGFBQVo7QUFPQSxZQUFBLElBQUksQ0FBQyxNQUFMLENBQVksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUF2QixJQUE4QixTQUE5QjtBQUNBLFlBQUEsT0FBTyxDQUFDLFNBQUQsQ0FBUDtBQUNELFdBWEgsV0FZUyxVQUFBLEdBQUcsRUFBSTtBQUNaLFlBQUEsTUFBTSxDQUFDLEdBQUQsQ0FBTjtBQUNELFdBZEg7QUFlRDtBQUNGLE9BckJNLENBQVA7QUFzQkQsS0E3R007QUE4R1AsSUFBQSxTQTlHTyx1QkE4R0s7QUFBQSxVQUNILEtBREcsR0FDa0IsSUFEbEIsQ0FDSCxLQURHO0FBQUEsVUFDSSxVQURKLEdBQ2tCLElBRGxCLENBQ0ksVUFESjtBQUVWLE1BQUEsY0FBYyxDQUFDLGNBQWYsQ0FBOEIsS0FBSyxDQUFDLEdBQXBDLEVBQXlDLENBQUMsVUFBMUM7QUFDRCxLQWpITTtBQWtIUCxJQUFBLEtBbEhPLG1CQWtIQyxDQUVQO0FBcEhNO0FBaENzQixDQUFSLENBQXpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwid2luZG93LmZsb2F0Rm9ydW1QYW5lbCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNmbG9hdEZvcnVtUGFuZWxcIixcclxuICBkYXRhOiB7XHJcbiAgICBmb3J1bTogXCJcIixcclxuICAgIHVpZDogTktDLmNvbmZpZ3MudWlkLFxyXG4gICAgc3Vic2NyaWJlZDogZmFsc2UsXHJcbiAgICBvdmVyOiBmYWxzZSxcclxuICAgIHNob3c6IGZhbHNlLFxyXG4gICAgY291bnQ6IDEsXHJcbiAgICBvblBhbmVsOiBmYWxzZSxcclxuICAgIGZvcnVtczoge30sXHJcbiAgICB0aW1lb3V0TmFtZTogXCJcIixcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHBhbmVsID0gJChzZWxmLiRlbCk7XHJcbiAgICBwYW5lbC5jc3Moe1xyXG4gICAgICB0b3A6IDAsXHJcbiAgICAgIGxlZnQ6IDBcclxuICAgIH0pO1xyXG5cclxuICAgIGlmKHRoaXMudWlkICYmICF3aW5kb3cuU3Vic2NyaWJlVHlwZXMpIHtcclxuICAgICAgaWYoIU5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKSB7XHJcbiAgICAgICAgcmV0dXJuIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXkuI7lhbPms6jnm7jlhbPnmoTmqKHlnZdcIik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgd2luZG93LlN1YnNjcmliZVR5cGVzID0gbmV3IE5LQy5tb2R1bGVzLlN1YnNjcmliZVR5cGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5pbml0UGFuZWwoKTtcclxuXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGluaXRQYW5lbCgpIHtcclxuICAgICAgY29uc3QgZG9tcyA9ICQoYFtkYXRhLWZsb2F0LWZpZF1gKTtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGRvbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBkb20gPSBkb21zLmVxKGkpO1xyXG4gICAgICAgIGlmKGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1pbml0XCIpID09PSBcInRydWVcIikgY29udGludWU7XHJcbiAgICAgICAgdGhpcy5pbml0RXZlbnQoZG9tcy5lcShpKSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgdGhpcy5zaG93ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub25QYW5lbCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLm92ZXIgPSBmYWxzZTtcclxuICAgICAgdGhpcy5mb3J1bSA9IFwiXCI7XHJcbiAgICB9LFxyXG4gICAgaW5pdEV2ZW50KGRvbSkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgZG9tLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBzZWxmLnRpbWVvdXROYW1lID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBzZWxmLnJlc2V0KCk7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGRvbS5vbihcIm1vdXNlb3ZlclwiLCBhc3luYyBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgLy8g6byg5qCH5bey5oKs5rWu5Zyo5YWD57Sg5LiKXHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xyXG4gICAgICAgIHNlbGYuY291bnQgKys7XHJcbiAgICAgICAgc2VsZi5vdmVyID0gdHJ1ZTtcclxuICAgICAgICBsZXQgZmlkO1xyXG4gICAgICAgIGxldCBjb3VudF8gPSBzZWxmLmNvdW50O1xyXG4gICAgICAgIGxldCBsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQ7XHJcbiAgICAgICAgLy8g5YGa5LiA5Liq5bu26L+f77yM6L+H5ruk5o6J6byg5qCH5oSP5aSW5YiS6L+H5YWD57Sg55qE5oOF5Ya144CCXHJcbiAgICAgICAgc2VsZi50aW1lb3V0KDMwMClcclxuICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgaWYoY291bnRfICE9PSBzZWxmLmNvdW50KSB0aHJvdyBcInRpbWVvdXQgMVwiO1xyXG4gICAgICAgICAgICBpZighc2VsZi5vdmVyKSB0aHJvdyBcInRpbWVvdXQgMlwiO1xyXG4gICAgICAgICAgICBmaWQgPSBkb20uYXR0cihcImRhdGEtZmxvYXQtZmlkXCIpO1xyXG4gICAgICAgICAgICBsZWZ0ID0gZG9tLm9mZnNldCgpLmxlZnQ7XHJcbiAgICAgICAgICAgIHRvcCA9IGRvbS5vZmZzZXQoKS50b3A7XHJcbiAgICAgICAgICAgIHdpZHRoID0gZG9tLndpZHRoKCk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IGRvbS5oZWlnaHQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Rm9ydW1CeUlkKGZpZCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oZm9ydW1PYmogPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7Zm9ydW0sIHN1YnNjcmliZWR9ID0gZm9ydW1PYmo7XHJcbiAgICAgICAgICAgIGlmKGNvdW50XyAhPT0gc2VsZi5jb3VudCkgdGhyb3cgXCJ0aW1lb3V0IDNcIjtcclxuICAgICAgICAgICAgaWYoIXNlbGYub3ZlcikgdGhyb3cgXCJ0aW1lb3V0IDRcIjtcclxuICAgICAgICAgICAgc2VsZi5mb3J1bSA9IGZvcnVtO1xyXG4gICAgICAgICAgICBzZWxmLnN1YnNjcmliZWQgPSBzdWJzY3JpYmVkO1xyXG4gICAgICAgICAgICBjb25zdCBwYW5lbCA9ICQoc2VsZi4kZWwpO1xyXG4gICAgICAgICAgICBzZWxmLnNob3cgPSB0cnVlO1xyXG4gICAgICAgICAgICBwYW5lbC5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc2VsZi5yZXNldCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGFuZWwub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dE5hbWUpO1xyXG4gICAgICAgICAgICAgIHNlbGYub25QYW5lbCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRXaWR0aCA9ICQoZG9jdW1lbnQpLndpZHRoKCkgLSAxMDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsV2lkdGggPSAyNCAqIDEyO1xyXG5cclxuICAgICAgICAgICAgaWYoKGxlZnQgKyBwYW5lbFdpZHRoKSA+IGRvY3VtZW50V2lkdGgpIHtcclxuICAgICAgICAgICAgICBsZWZ0ID0gZG9jdW1lbnRXaWR0aCAtIHBhbmVsV2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhbmVsLmNzcyh7XHJcbiAgICAgICAgICAgICAgdG9wOiB0b3AgKyBoZWlnaHQgKyAxMCxcclxuICAgICAgICAgICAgICBsZWZ0XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBkb20uYXR0cihcImRhdGEtZmxvYXQtaW5pdFwiLCBcInRydWVcIik7XHJcbiAgICB9LFxyXG4gICAgdGltZW91dCh0KSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgdClcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgZ2V0Rm9ydW1CeUlkKGZpZCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBsZXQgZm9ydW1zT2JqID0gc2VsZi5mb3J1bXNbZmlkXTtcclxuICAgICAgICBpZihmb3J1bXNPYmopIHtcclxuICAgICAgICAgIHJlc29sdmUoZm9ydW1zT2JqKTsgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5rY0FQSShgL2YvJHtmaWR9L2NhcmRgLCBcIkdFVFwiKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBmb3J1bXNPYmogPSB7XHJcbiAgICAgICAgICAgICAgICBmb3J1bToge1xyXG4gICAgICAgICAgICAgICAgICAuLi5kYXRhLmZvcnVtLFxyXG4gICAgICAgICAgICAgICAgICBsYXRlc3RUaHJlYWRzOiBkYXRhLmxhdGVzdFRocmVhZHNcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVkOiBkYXRhLnN1YnNjcmliZWQsXHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBzZWxmLmZvcnVtc1tkYXRhLmZvcnVtLmZpZF0gPSBmb3J1bXNPYmo7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZShmb3J1bXNPYmopO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzdWJzY3JpYmUoKSB7XHJcbiAgICAgIGNvbnN0IHtmb3J1bSwgc3Vic2NyaWJlZH0gPSB0aGlzO1xyXG4gICAgICBTdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVGb3J1bShmb3J1bS5maWQsICFzdWJzY3JpYmVkKTtcclxuICAgIH0sXHJcbiAgICBjbG9zZSgpIHtcclxuXHJcbiAgICB9LFxyXG5cclxuICB9XHJcbn0pOyJdfQ==
