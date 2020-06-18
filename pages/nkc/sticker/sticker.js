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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL25rYy9zdGlja2VyL3N0aWNrZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQUksQ0FBQyxRQUFMLENBQWMsR0FBZCxDQUFrQixVQUFBLENBQUMsRUFBSTtBQUNyQixNQUFHLENBQUMsQ0FBQyxRQUFGLEtBQWUsSUFBbEIsRUFBd0I7QUFDdEIsSUFBQSxDQUFDLENBQUMsTUFBRixHQUFXLElBQVg7QUFDQSxJQUFBLENBQUMsQ0FBQyxJQUFGLEdBQVMsSUFBVDtBQUNELEdBSEQsTUFHTztBQUNMLElBQUEsQ0FBQyxDQUFDLElBQUYsR0FBUyxFQUFUO0FBQ0Q7QUFDRixDQVBEO0FBUUEsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbEIsRUFBQSxFQUFFLEVBQUUsTUFEYztBQUVsQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsUUFBUSxFQUFFLElBQUksQ0FBQztBQURYLEdBRlk7QUFLbEIsRUFBQSxPQUxrQixxQkFLUjtBQUNSLElBQUEsY0FBYyxDQUFDLFNBQWY7QUFDQSxJQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksZUFBWixDQUE0QixnQkFBNUI7QUFDRCxHQVJpQjtBQVNsQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWixDQUFrQixNQURuQjtBQUVQLElBQUEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksTUFGYjtBQUdQLElBQUEsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFIZjtBQUlQLElBQUEsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixXQUo1QjtB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Y0FBQSxHQUFHLEVBQUgsR0FETztBQUVQLGNBQUEsSUFBSSxFQUFKO0FBRk8sYUFBVDtBQUlEO0FBVlM7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFXVixRQUFBLGNBQWMsQ0FBQyxXQUFELENBQWQ7QUFDQSxlQUFPLE1BQU0sQ0FBQyxjQUFELEVBQWlCLE1BQWpCLEVBQXlCO0FBQ3BDLFVBQUEsUUFBUSxFQUFFLEdBRDBCO0FBRXBDLFVBQUEsSUFBSSxFQUFFO0FBRjhCLFNBQXpCLENBQWI7QUFJRCxPQWpCSCxFQWtCRyxJQWxCSCxDQWtCUSxZQUFNO0FBQ1YsUUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNELE9BcEJILFdBcUJTLFVBckJUO0FBc0JELEtBM0VNO0FBNEVQLElBQUEsVUE1RU8sc0JBNEVJLElBNUVKLEVBNEVVO0FBQ2YsV0FBSyxRQUFMLENBQWMsR0FBZCxDQUFrQixVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxJQUFGLEdBQVMsSUFBYjtBQUFBLE9BQW5CO0FBQ0QsS0E5RU07QUErRVAsSUFBQSxjQS9FTywwQkErRVEsQ0EvRVIsRUErRVcsQ0EvRVgsRUErRWM7QUFDbkIsTUFBQSxNQUFNLENBQUMsY0FBRCxFQUFpQixNQUFqQixFQUF5QjtBQUM3QixRQUFBLFFBQVEsRUFBRSxDQUFDLENBQUQsQ0FEbUI7QUFFN0IsUUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBRmlCO0FBRzdCLFFBQUEsSUFBSSxFQUFFO0FBSHVCLE9BQXpCLENBQU4sQ0FLRyxJQUxILENBS1EsWUFBTTtBQUNWLFFBQUEsQ0FBQyxDQUFDLFFBQUYsR0FBYSxDQUFDLENBQUMsQ0FBZjtBQUNELE9BUEgsV0FRUyxVQVJUO0FBU0Q7QUF6Rk07QUFUUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5kYXRhLnN0aWNrZXJzLm1hcChzID0+IHtcclxuICBpZihzLnJldmlld2VkID09PSBudWxsKSB7XHJcbiAgICBzLnN0YXR1cyA9IHRydWU7XHJcbiAgICBzLnNpemUgPSBcIm1kXCI7XHJcbiAgfSBlbHNlIHtcclxuICAgIHMuc2l6ZSA9IFwiXCJcclxuICB9XHJcbn0pO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgc3RpY2tlcnM6IGRhdGEuc3RpY2tlcnNcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBmbG9hdFVzZXJQYW5lbC5pbml0UGFuZWwoKTtcclxuICAgIE5LQy5tZXRob2RzLmluaXRJbWFnZVZpZXdlcihcIi5zdGlja2VyLWltYWdlXCIpXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGZvcm1hdDogTktDLm1ldGhvZHMuZm9ybWF0LFxyXG4gICAgdmlzaXRVcmw6IE5LQy5tZXRob2RzLnZpc2l0VXJsLFxyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIHNldEFsbCh0KSB7XHJcbiAgICAgIHRoaXMuc3RpY2tlcnMubWFwKHMgPT4ge1xyXG4gICAgICAgIGlmKHMucmV2aWV3ZWQgPT09IG51bGwpIHtcclxuICAgICAgICAgIHMuc3RhdHVzID0gISF0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBzdWJtaXQoc3RpY2tlcnMpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHN0aWNrZXJzID0gc3RpY2tlcnMuZmlsdGVyKHMgPT4gcy5yZXZpZXdlZCA9PT0gbnVsbCk7XHJcbiAgICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHmiafooYzmraTmk43kvZzvvJ9cIilcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBzIG9mIHN0aWNrZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtfaWQsIHN0YXR1cywgcmVhc29uLCBzaXplfSA9IHM7XHJcbiAgICAgICAgICAgIGlmKCFzdGF0dXMpIHtcclxuICAgICAgICAgICAgICBzZWxmLmNoZWNrU3RyaW5nKHJlYXNvbiwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCLljp/lm6BcIixcclxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcclxuICAgICAgICAgICAgICAgIG1heExlbmd0aDogNTAwXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgIF9pZCxcclxuICAgICAgICAgICAgICBzdGF0dXMsXHJcbiAgICAgICAgICAgICAgc2l6ZSxcclxuICAgICAgICAgICAgICByZWFzb25cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKFwiL25rYy9zdGlja2VyXCIsIFwiUE9TVFwiLCB7XHJcbiAgICAgICAgICAgIHN0aWNrZXJzOiBhcnIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwicmV2aWV3XCJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgLy8gc3RpY2tlcnMubWFwKHMgPT4gcy5yZXZpZXdlZCA9IHMuc3RhdHVzKTtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdEFsbCgpIHtcclxuICAgICAgaWYoZGF0YS50ID09PSBcInVuUmV2aWV3ZWRcIikge1xyXG4gICAgICAgIHRoaXMuc3VibWl0KHRoaXMuc3RpY2tlcnMpO1xyXG4gICAgICB9IGVsc2UgaWYoZGF0YS50ID09PSBcInJldmlld2VkXCIpIHtcclxuICAgICAgICB0aGlzLnN1Ym1pdFNpemUodGhpcy5zdGlja2Vycyk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzdWJtaXRTaXplKHN0aWNrZXJzKSB7XHJcbiAgICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHmiafooYzmraTmk43kvZzvvJ9cIilcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBzdGlja2VyIG9mIHN0aWNrZXJzKSB7XHJcbiAgICAgICAgICAgIGlmKHN0aWNrZXIucmV2aWV3ZWQgPT09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBjb25zdCB7X2lkLCBzaXplfSA9IHN0aWNrZXI7XHJcbiAgICAgICAgICAgIGlmKCFbXCJtZFwiLCBcInNtXCIsIFwieHNcIl0uaW5jbHVkZXMoc2l6ZSkpIHRocm93IFwi6K+36YCJ5oup6KGo5oOF5aSn5bCPXCI7XHJcbiAgICAgICAgICAgIGFyci5wdXNoKHtcclxuICAgICAgICAgICAgICBfaWQsXHJcbiAgICAgICAgICAgICAgc2l6ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNjcmVlblRvcEFsZXJ0KFwi5ZCO5Y+w5aSE55CG5Lit77yM6K+356iN5YCZXCIpO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9ua2Mvc3RpY2tlclwiLCBcIlBPU1RcIiwge1xyXG4gICAgICAgICAgICBzdGlja2VyczogYXJyLFxyXG4gICAgICAgICAgICB0eXBlOiBcIm1vZGlmeVNpemVcIlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgbW9kaWZ5U2l6ZShzaXplKSB7XHJcbiAgICAgIHRoaXMuc3RpY2tlcnMubWFwKHMgPT4gcy5zaXplID0gc2l6ZSk7XHJcbiAgICB9LFxyXG4gICAgZGlzYWJsZVN0aWNrZXIocywgZCkge1xyXG4gICAgICBua2NBUEkoXCIvbmtjL3N0aWNrZXJcIiwgXCJQT1NUXCIsIHtcclxuICAgICAgICBzdGlja2VyczogW3NdLFxyXG4gICAgICAgIGRpc2FibGVkOiAhIWQsXHJcbiAgICAgICAgdHlwZTogXCJkaXNhYmxlXCJcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzLmRpc2FibGVkID0gISFkO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXX0=
