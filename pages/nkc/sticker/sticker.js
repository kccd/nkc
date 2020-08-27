(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById("data");
data.stickers.map(function (s) {
  if (s.reviewed === null) {
    s.status = true;
    s.size = "md";
  } else {
    s.size = "";
  }
});
var app = new Vue({
  el: "#app",
  data: {
    stickers: data.stickers
  },
  mounted: function mounted() {
    floatUserPanel.initPanel();
    NKC.methods.initImageViewer(".sticker-image");
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    format: NKC.methods.format,
    visitUrl: NKC.methods.visitUrl,
    checkString: NKC.methods.checkData.checkString,
    setAll: function setAll(t) {
      this.stickers.map(function (s) {
        if (s.reviewed === null) {
          s.status = !!t;
        }
      });
    },
    submit: function submit(stickers) {
      var self = this;
      stickers = stickers.filter(function (s) {
        return s.reviewed === null;
      });
      sweetQuestion("确定要执行此操作？").then(function () {
        var arr = [];

        var _iterator = _createForOfIteratorHelper(stickers),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var s = _step.value;
            var _id = s._id,
                status = s.status,
                reason = s.reason,
                size = s.size;

            if (!status) {
              self.checkString(reason, {
                name: "原因",
                minLength: 0,
                maxLength: 500
              });
            }

            arr.push({
              _id: _id,
              status: status,
              size: size,
              reason: reason
            });
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return nkcAPI("/nkc/sticker", "POST", {
          stickers: arr,
          type: "review"
        });
      }).then(function () {
        // stickers.map(s => s.reviewed = s.status);
        window.location.reload();
      })["catch"](sweetError);
    },
    submitAll: function submitAll() {
      if (data.t === "unReviewed") {
        this.submit(this.stickers);
      } else if (data.t === "reviewed") {
        this.submitSize(this.stickers);
      }
    },
    submitSize: function submitSize(stickers) {
      sweetQuestion("确定要执行此操作？").then(function () {
        var arr = [];

        var _iterator2 = _createForOfIteratorHelper(stickers),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var sticker = _step2.value;
            if (sticker.reviewed === null) continue;
            var _id = sticker._id,
                size = sticker.size;
            if (!["md", "sm", "xs"].includes(size)) throw "请选择表情大小";
            arr.push({
              _id: _id,
              size: size
            });
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        screenTopAlert("后台处理中，请稍候");
        return nkcAPI("/nkc/sticker", "POST", {
          stickers: arr,
          type: "modifySize"
        });
      }).then(function () {
        window.location.reload();
      })["catch"](sweetError);
    },
    modifySize: function modifySize(size) {
      this.stickers.map(function (s) {
        return s.size = size;
      });
    },
    disableSticker: function disableSticker(s, d) {
      nkcAPI("/nkc/sticker", "POST", {
        stickers: [s],
        disabled: !!d,
        type: "disable"
      }).then(function () {
        s.disabled = !!d;
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9ua2Mvc3RpY2tlci9zdGlja2VyLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFJLENBQUMsUUFBTCxDQUFjLEdBQWQsQ0FBa0IsVUFBQSxDQUFDLEVBQUk7QUFDckIsTUFBRyxDQUFDLENBQUMsUUFBRixLQUFlLElBQWxCLEVBQXdCO0FBQ3RCLElBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBVyxJQUFYO0FBQ0EsSUFBQSxDQUFDLENBQUMsSUFBRixHQUFTLElBQVQ7QUFDRCxHQUhELE1BR087QUFDTCxJQUFBLENBQUMsQ0FBQyxJQUFGLEdBQVMsRUFBVDtBQUNEO0FBQ0YsQ0FQRDtBQVFBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUM7QUFEWCxHQUZZO0FBS2xCLEVBQUEsT0FMa0IscUJBS1I7QUFDUixJQUFBLGNBQWMsQ0FBQyxTQUFmO0FBQ0EsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLGVBQVosQ0FBNEIsZ0JBQTVCO0FBQ0QsR0FSaUI7QUFTbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVosQ0FBa0IsTUFEbkI7QUFFUCxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLE1BRmI7QUFHUCxJQUFBLFFBQVEsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFFBSGY7QUFJUCxJQUFBLFdBQVcsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQVosQ0FBc0IsV0FKNUI7QUFLUCxJQUFBLE1BTE8sa0JBS0Es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QUFFUCxjQUFBLElBQUksRUFBSjtBQUZPLGFBQVQ7QUFJRDtBQVZTO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBV1YsUUFBQSxjQUFjLENBQUMsV0FBRCxDQUFkO0FBQ0EsZUFBTyxNQUFNLENBQUMsY0FBRCxFQUFpQixNQUFqQixFQUF5QjtBQUNwQyxVQUFBLFFBQVEsRUFBRSxHQUQwQjtBQUVwQyxVQUFBLElBQUksRUFBRTtBQUY4QixTQUF6QixDQUFiO0FBSUQsT0FqQkgsRUFrQkcsSUFsQkgsQ0FrQlEsWUFBTTtBQUNWLFFBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7QUFDRCxPQXBCSCxXQXFCUyxVQXJCVDtBQXNCRCxLQTNFTTtBQTRFUCxJQUFBLFVBNUVPLHNCQTRFSSxJQTVFSixFQTRFVTtBQUNmLFdBQUssUUFBTCxDQUFjLEdBQWQsQ0FBa0IsVUFBQSxDQUFDO0FBQUEsZUFBSSxDQUFDLENBQUMsSUFBRixHQUFTLElBQWI7QUFBQSxPQUFuQjtBQUNELEtBOUVNO0FBK0VQLElBQUEsY0EvRU8sMEJBK0VRLENBL0VSLEVBK0VXLENBL0VYLEVBK0VjO0FBQ25CLE1BQUEsTUFBTSxDQUFDLGNBQUQsRUFBaUIsTUFBakIsRUFBeUI7QUFDN0IsUUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUFELENBRG1CO0FBRTdCLFFBQUEsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUZpQjtBQUc3QixRQUFBLElBQUksRUFBRTtBQUh1QixPQUF6QixDQUFOLENBS0csSUFMSCxDQUtRLFlBQU07QUFDVixRQUFBLENBQUMsQ0FBQyxRQUFGLEdBQWEsQ0FBQyxDQUFDLENBQWY7QUFDRCxPQVBILFdBUVMsVUFSVDtBQVNEO0FBekZNO0FBVFMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcbmRhdGEuc3RpY2tlcnMubWFwKHMgPT4ge1xuICBpZihzLnJldmlld2VkID09PSBudWxsKSB7XG4gICAgcy5zdGF0dXMgPSB0cnVlO1xuICAgIHMuc2l6ZSA9IFwibWRcIjtcbiAgfSBlbHNlIHtcbiAgICBzLnNpemUgPSBcIlwiXG4gIH1cbn0pO1xuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XG4gIGVsOiBcIiNhcHBcIixcbiAgZGF0YToge1xuICAgIHN0aWNrZXJzOiBkYXRhLnN0aWNrZXJzXG4gIH0sXG4gIG1vdW50ZWQoKSB7XG4gICAgZmxvYXRVc2VyUGFuZWwuaW5pdFBhbmVsKCk7XG4gICAgTktDLm1ldGhvZHMuaW5pdEltYWdlVmlld2VyKFwiLnN0aWNrZXItaW1hZ2VcIilcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxuICAgIGZvcm1hdDogTktDLm1ldGhvZHMuZm9ybWF0LFxuICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcbiAgICBjaGVja1N0cmluZzogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrU3RyaW5nLFxuICAgIHNldEFsbCh0KSB7XG4gICAgICB0aGlzLnN0aWNrZXJzLm1hcChzID0+IHtcbiAgICAgICAgaWYocy5yZXZpZXdlZCA9PT0gbnVsbCkge1xuICAgICAgICAgIHMuc3RhdHVzID0gISF0O1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gICAgc3VibWl0KHN0aWNrZXJzKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHN0aWNrZXJzID0gc3RpY2tlcnMuZmlsdGVyKHMgPT4gcy5yZXZpZXdlZCA9PT0gbnVsbCk7XG4gICAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5omn6KGM5q2k5pON5L2c77yfXCIpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAgICBmb3IoY29uc3QgcyBvZiBzdGlja2Vycykge1xuICAgICAgICAgICAgY29uc3Qge19pZCwgc3RhdHVzLCByZWFzb24sIHNpemV9ID0gcztcbiAgICAgICAgICAgIGlmKCFzdGF0dXMpIHtcbiAgICAgICAgICAgICAgc2VsZi5jaGVja1N0cmluZyhyZWFzb24sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuWOn+WboFwiLFxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGg6IDUwMFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFyci5wdXNoKHtcbiAgICAgICAgICAgICAgX2lkLFxuICAgICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICAgIHNpemUsXG4gICAgICAgICAgICAgIHJlYXNvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvbmtjL3N0aWNrZXJcIiwgXCJQT1NUXCIsIHtcbiAgICAgICAgICAgIHN0aWNrZXJzOiBhcnIsXG4gICAgICAgICAgICB0eXBlOiBcInJldmlld1wiXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAvLyBzdGlja2Vycy5tYXAocyA9PiBzLnJldmlld2VkID0gcy5zdGF0dXMpO1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXG4gICAgfSxcbiAgICBzdWJtaXRBbGwoKSB7XG4gICAgICBpZihkYXRhLnQgPT09IFwidW5SZXZpZXdlZFwiKSB7XG4gICAgICAgIHRoaXMuc3VibWl0KHRoaXMuc3RpY2tlcnMpO1xuICAgICAgfSBlbHNlIGlmKGRhdGEudCA9PT0gXCJyZXZpZXdlZFwiKSB7XG4gICAgICAgIHRoaXMuc3VibWl0U2l6ZSh0aGlzLnN0aWNrZXJzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN1Ym1pdFNpemUoc3RpY2tlcnMpIHtcbiAgICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHmiafooYzmraTmk43kvZzvvJ9cIilcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICAgIGZvcihjb25zdCBzdGlja2VyIG9mIHN0aWNrZXJzKSB7XG4gICAgICAgICAgICBpZihzdGlja2VyLnJldmlld2VkID09PSBudWxsKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHtfaWQsIHNpemV9ID0gc3RpY2tlcjtcbiAgICAgICAgICAgIGlmKCFbXCJtZFwiLCBcInNtXCIsIFwieHNcIl0uaW5jbHVkZXMoc2l6ZSkpIHRocm93IFwi6K+36YCJ5oup6KGo5oOF5aSn5bCPXCI7XG4gICAgICAgICAgICBhcnIucHVzaCh7XG4gICAgICAgICAgICAgIF9pZCxcbiAgICAgICAgICAgICAgc2l6ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNjcmVlblRvcEFsZXJ0KFwi5ZCO5Y+w5aSE55CG5Lit77yM6K+356iN5YCZXCIpO1xuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvbmtjL3N0aWNrZXJcIiwgXCJQT1NUXCIsIHtcbiAgICAgICAgICAgIHN0aWNrZXJzOiBhcnIsXG4gICAgICAgICAgICB0eXBlOiBcIm1vZGlmeVNpemVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XG4gICAgfSxcbiAgICBtb2RpZnlTaXplKHNpemUpIHtcbiAgICAgIHRoaXMuc3RpY2tlcnMubWFwKHMgPT4gcy5zaXplID0gc2l6ZSk7XG4gICAgfSxcbiAgICBkaXNhYmxlU3RpY2tlcihzLCBkKSB7XG4gICAgICBua2NBUEkoXCIvbmtjL3N0aWNrZXJcIiwgXCJQT1NUXCIsIHtcbiAgICAgICAgc3RpY2tlcnM6IFtzXSxcbiAgICAgICAgZGlzYWJsZWQ6ICEhZCxcbiAgICAgICAgdHlwZTogXCJkaXNhYmxlXCJcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBzLmRpc2FibGVkID0gISFkO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcbiAgICB9XG4gIH1cbn0pOyJdfQ==
