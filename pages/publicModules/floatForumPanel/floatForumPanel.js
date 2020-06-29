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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2Zsb2F0Rm9ydW1QYW5lbC9mbG9hdEZvcnVtUGFuZWwubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsTUFBTSxDQUFDLGVBQVAsR0FBeUIsSUFBSSxHQUFKLENBQVE7QUFDL0IsRUFBQSxFQUFFLEVBQUUsa0JBRDJCO0FBRS9CLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxLQUFLLEVBQUUsRUFESDtBQUVKLElBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FGYjtBQUdKLElBQUEsVUFBVSxFQUFFLEtBSFI7QUFJSixJQUFBLElBQUksRUFBRSxLQUpGO0FBS0osSUFBQSxJQUFJLEVBQUUsS0FMRjtBQU1KLElBQUEsS0FBSyxFQUFFLENBTkg7QUFPSixJQUFBLE9BQU8sRUFBRSxLQVBMO0FBUUosSUFBQSxNQUFNLEVBQUUsRUFSSjtBQVNKLElBQUEsV0FBVyxFQUFFO0FBVFQsR0FGeUI7QUFhL0IsRUFBQSxPQWIrQixxQkFhckI7QUFDUixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsUUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQWY7QUFDQSxJQUFBLEtBQUssQ0FBQyxHQUFOLENBQVU7QUFDUixNQUFBLEdBQUcsRUFBRSxDQURHO0FBRVIsTUFBQSxJQUFJLEVBQUU7QUFGRSxLQUFWOztBQUtBLFFBQUcsS0FBSyxHQUFMLElBQVksQ0FBQyxNQUFNLENBQUMsY0FBdkIsRUFBdUM7QUFDckMsVUFBRyxDQUFDLEdBQUcsQ0FBQyxPQUFKLENBQVksY0FBaEIsRUFBZ0M7QUFDOUIsZUFBTyxVQUFVLENBQUMsYUFBRCxDQUFqQjtBQUNELE9BRkQsTUFFTztBQUNMLFFBQUEsTUFBTSxDQUFDLGNBQVAsR0FBd0IsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLGNBQWhCLEVBQXhCO0FB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R0FyRk4sRUFxRlc7QUFDaEIsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN0QyxZQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQVosQ0FBaEI7O0FBQ0EsWUFBRyxTQUFILEVBQWM7QUFDWixVQUFBLE9BQU8sQ0FBQyxTQUFELENBQVA7QUFDRCxTQUZELE1BRU87QUFDTCxVQUFBLE1BQU0sY0FBTyxHQUFQLFlBQW1CLEtBQW5CLENBQU4sQ0FDRyxJQURILENBQ1EsVUFBQSxJQUFJLEVBQUk7QUFDWixZQUFBLFNBQVMsR0FBRztBQUNWLGNBQUEsS0FBSyxFQUFFLElBQUksQ0FBQyxLQURGO0FBRVYsY0FBQSxVQUFVLEVBQUUsSUFBSSxDQUFDO0FBRlAsYUFBWjtBQUlBLFlBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQXZCLElBQThCLFNBQTlCO0FBQ0EsWUFBQSxPQUFPLENBQUMsU0FBRCxDQUFQO0FBQ0QsV0FSSCxXQVNTLFVBQUEsR0FBRyxFQUFJO0FBQ1osWUFBQSxNQUFNLENBQUMsR0FBRCxDQUFOO0FBQ0QsV0FYSDtBQVlEO0FBQ0YsT0FsQk0sQ0FBUDtBQW1CRCxLQTFHTTtBQTJHUCxJQUFBLFNBM0dPLHVCQTJHSztBQUFBLFVBQ0gsS0FERyxHQUNrQixJQURsQixDQUNILEtBREc7QUFBQSxVQUNJLFVBREosR0FDa0IsSUFEbEIsQ0FDSSxVQURKO0FBRVYsTUFBQSxjQUFjLENBQUMsY0FBZixDQUE4QixLQUFLLENBQUMsR0FBcEMsRUFBeUMsQ0FBQyxVQUExQztBQUNELEtBOUdNO0FBK0dQLElBQUEsS0EvR08sbUJBK0dDLENBRVA7QUFqSE07QUFoQ3NCLENBQVIsQ0FBekIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuZmxvYXRGb3J1bVBhbmVsID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2Zsb2F0Rm9ydW1QYW5lbFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIGZvcnVtOiBcIlwiLFxyXG4gICAgdWlkOiBOS0MuY29uZmlncy51aWQsXHJcbiAgICBzdWJzY3JpYmVkOiBmYWxzZSxcclxuICAgIG92ZXI6IGZhbHNlLFxyXG4gICAgc2hvdzogZmFsc2UsXHJcbiAgICBjb3VudDogMSxcclxuICAgIG9uUGFuZWw6IGZhbHNlLFxyXG4gICAgZm9ydW1zOiB7fSxcclxuICAgIHRpbWVvdXROYW1lOiBcIlwiLFxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgY29uc3QgcGFuZWwgPSAkKHNlbGYuJGVsKTtcclxuICAgIHBhbmVsLmNzcyh7XHJcbiAgICAgIHRvcDogMCxcclxuICAgICAgbGVmdDogMFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYodGhpcy51aWQgJiYgIXdpbmRvdy5TdWJzY3JpYmVUeXBlcykge1xyXG4gICAgICBpZighTktDLm1vZHVsZXMuU3Vic2NyaWJlVHlwZXMpIHtcclxuICAgICAgICByZXR1cm4gc3dlZXRFcnJvcihcIuacquW8leWFpeS4juWFs+azqOebuOWFs+eahOaooeWdl1wiKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB3aW5kb3cuU3Vic2NyaWJlVHlwZXMgPSBuZXcgTktDLm1vZHVsZXMuU3Vic2NyaWJlVHlwZXMoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmluaXRQYW5lbCgpO1xyXG5cclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgaW5pdFBhbmVsKCkge1xyXG4gICAgICBjb25zdCBkb21zID0gJChgW2RhdGEtZmxvYXQtZmlkXWApO1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZG9tcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGRvbSA9IGRvbXMuZXEoaSk7XHJcbiAgICAgICAgaWYoZG9tLmF0dHIoXCJkYXRhLWZsb2F0LWluaXRcIikgPT09IFwidHJ1ZVwiKSBjb250aW51ZTtcclxuICAgICAgICB0aGlzLmluaXRFdmVudChkb21zLmVxKGkpKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJlc2V0KCkge1xyXG4gICAgICB0aGlzLnNob3cgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vblBhbmVsID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub3ZlciA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmZvcnVtID0gXCJcIjtcclxuICAgIH0sXHJcbiAgICBpbml0RXZlbnQoZG9tKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBkb20ub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNlbGYudGltZW91dE5hbWUgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHNlbGYucmVzZXQoKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgICB9KTtcclxuICAgICAgZG9tLm9uKFwibW91c2VvdmVyXCIsIGFzeW5jIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAvLyDpvKDmoIflt7Lmgqzmta7lnKjlhYPntKDkuIpcclxuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0TmFtZSk7XHJcbiAgICAgICAgc2VsZi5jb3VudCArKztcclxuICAgICAgICBzZWxmLm92ZXIgPSB0cnVlO1xyXG4gICAgICAgIGxldCBmaWQ7XHJcbiAgICAgICAgbGV0IGNvdW50XyA9IHNlbGYuY291bnQ7XHJcbiAgICAgICAgbGV0IGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodDtcclxuICAgICAgICAvLyDlgZrkuIDkuKrlu7bov5/vvIzov4fmu6TmjonpvKDmoIfmhI/lpJbliJLov4flhYPntKDnmoTmg4XlhrXjgIJcclxuICAgICAgICBzZWxmLnRpbWVvdXQoMzAwKVxyXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBpZihjb3VudF8gIT09IHNlbGYuY291bnQpIHRocm93IFwidGltZW91dCAxXCI7XHJcbiAgICAgICAgICAgIGlmKCFzZWxmLm92ZXIpIHRocm93IFwidGltZW91dCAyXCI7XHJcbiAgICAgICAgICAgIGZpZCA9IGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1maWRcIik7XHJcbiAgICAgICAgICAgIGxlZnQgPSBkb20ub2Zmc2V0KCkubGVmdDtcclxuICAgICAgICAgICAgdG9wID0gZG9tLm9mZnNldCgpLnRvcDtcclxuICAgICAgICAgICAgd2lkdGggPSBkb20ud2lkdGgoKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gZG9tLmhlaWdodCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRGb3J1bUJ5SWQoZmlkKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihmb3J1bU9iaiA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtmb3J1bSwgc3Vic2NyaWJlZH0gPSBmb3J1bU9iajtcclxuICAgICAgICAgICAgaWYoY291bnRfICE9PSBzZWxmLmNvdW50KSB0aHJvdyBcInRpbWVvdXQgM1wiO1xyXG4gICAgICAgICAgICBpZighc2VsZi5vdmVyKSB0aHJvdyBcInRpbWVvdXQgNFwiO1xyXG4gICAgICAgICAgICBzZWxmLmZvcnVtID0gZm9ydW07XHJcbiAgICAgICAgICAgIHNlbGYuc3Vic2NyaWJlZCA9IHN1YnNjcmliZWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsID0gJChzZWxmLiRlbCk7XHJcbiAgICAgICAgICAgIHNlbGYuc2hvdyA9IHRydWU7XHJcbiAgICAgICAgICAgIHBhbmVsLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBzZWxmLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBwYW5lbC5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0TmFtZSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5vblBhbmVsID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkb2N1bWVudFdpZHRoID0gJChkb2N1bWVudCkud2lkdGgoKSAtIDEwO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc3QgcGFuZWxXaWR0aCA9IDI0ICogMTI7XHJcblxyXG4gICAgICAgICAgICBpZigobGVmdCArIHBhbmVsV2lkdGgpID4gZG9jdW1lbnRXaWR0aCkge1xyXG4gICAgICAgICAgICAgIGxlZnQgPSBkb2N1bWVudFdpZHRoIC0gcGFuZWxXaWR0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcGFuZWwuY3NzKHtcclxuICAgICAgICAgICAgICB0b3A6IHRvcCArIGhlaWdodCArIDEwLFxyXG4gICAgICAgICAgICAgIGxlZnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIGRvbS5hdHRyKFwiZGF0YS1mbG9hdC1pbml0XCIsIFwidHJ1ZVwiKTtcclxuICAgIH0sXHJcbiAgICB0aW1lb3V0KHQpIHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCB0KVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBnZXRGb3J1bUJ5SWQoZmlkKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxldCBmb3J1bXNPYmogPSBzZWxmLmZvcnVtc1tmaWRdO1xyXG4gICAgICAgIGlmKGZvcnVtc09iaikge1xyXG4gICAgICAgICAgcmVzb2x2ZShmb3J1bXNPYmopOyBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmtjQVBJKGAvZi8ke2ZpZH0vY2FyZGAsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIGZvcnVtc09iaiA9IHtcclxuICAgICAgICAgICAgICAgIGZvcnVtOiBkYXRhLmZvcnVtLFxyXG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlZDogZGF0YS5zdWJzY3JpYmVkXHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBzZWxmLmZvcnVtc1tkYXRhLmZvcnVtLmZpZF0gPSBmb3J1bXNPYmo7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZShmb3J1bXNPYmopO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBzdWJzY3JpYmUoKSB7XHJcbiAgICAgIGNvbnN0IHtmb3J1bSwgc3Vic2NyaWJlZH0gPSB0aGlzO1xyXG4gICAgICBTdWJzY3JpYmVUeXBlcy5zdWJzY3JpYmVGb3J1bShmb3J1bS5maWQsICFzdWJzY3JpYmVkKTtcclxuICAgIH0sXHJcbiAgICBjbG9zZSgpIHtcclxuXHJcbiAgICB9LFxyXG5cclxuICB9XHJcbn0pOyJdfQ==
