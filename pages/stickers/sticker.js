(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById("data");
data.ownStickers.map(function (s) {
  s.selected = false;
});
var app = new Vue({
  el: "#app",
  data: {
    ownStickers: data.ownStickers,
    hotStickers: data.hotStickers,
    management: false
  },
  computed: {
    selectedStickers: function selectedStickers() {
      return this.ownStickers.filter(function (s) {
        return !!s.selected;
      });
    }
  },
  mounted: function mounted() {
    NKC.methods.initStickerViewer();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    visitUrl: NKC.methods.visitUrl,
    switchManagement: function switchManagement() {
      this.management = !this.management;
      this.changeStickersStatus(false);
    },
    showReason: function showReason(s) {
      sweetInfo(s.reason);
    },
    moveSticker: function moveSticker() {
      var selectedStickers = this.selectedStickers;
      if (!selectedStickers.length) return;
      var body = {
        type: "move",
        stickersId: selectedStickers.map(function (s) {
          return s._id;
        })
      };
      nkcAPI("/sticker", "POST", body).then(function () {
        window.location.reload();
      })["catch"](sweetError);
    },
    removeSticker: function removeSticker() {
      var selectedStickers = this.selectedStickers;
      if (!selectedStickers.length) return;
      sweetQuestion("\u786E\u5B9A\u8981\u5220\u9664\u5DF2\u9009\u4E2D\u7684".concat(selectedStickers.length, "\u4E2A\u8868\u60C5\uFF1F")).then(function () {
        var body = {
          type: "delete",
          stickersId: selectedStickers.map(function (s) {
            return s._id;
          })
        };
        return nkcAPI("/sticker", "POST", body);
      }).then(function () {
        window.location.reload();
      })["catch"](sweetError);
    },
    select: function select(s) {
      s.selected = !s.selected;
    },
    changeStickersStatus: function changeStickersStatus(select) {
      this.ownStickers.map(function (s) {
        return s.selected = !!select;
      });
    },
    selectAll: function selectAll() {
      var count = 0,
          select = true;

      var _iterator = _createForOfIteratorHelper(this.ownStickers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;
          if (s.selected) count++;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (count === this.ownStickers.length) {
        select = false;
      }

      this.changeStickersStatus(select);
    },
    shareSticker: function shareSticker() {
      var selectedStickers = this.selectedStickers;
      if (!selectedStickers.length) return;
      var body = {
        type: "share",
        stickersId: selectedStickers.map(function (s) {
          return s._id;
        })
      };
      nkcAPI("/sticker", "POST", body).then(function () {
        window.location.reload();
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3N0aWNrZXJzL3N0aWNrZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLFVBQUEsQ0FBQyxFQUFJO0FBQ3hCLEVBQUEsQ0FBQyxDQUFDLFFBQUYsR0FBYSxLQUFiO0FBQ0QsQ0FGRDtBQUdBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FEZDtBQUVKLElBQUEsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUZkO0FBR0osSUFBQSxVQUFVLEVBQUU7QUFIUixHQUZZO0FBT2xCLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxnQkFEUSw4QkFDVztBQUNqQixhQUFPLEtBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUjtBQUFBLE9BQXpCLENBQVA7QUFDRDtBQUhPLEdBUFE7QUFZbEIsRUFBQSxPQVprQixxQkFZUjtBQUNSLElBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxpQkFBWjtBQUNELEdBZGlCO0FBZWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUZmO0FBR1AsSUFBQSxnQkFITyw4QkFHWTtBQUNqQixXQUFLLFVBQUwsR0FBa0IsQ0FBQyxLQUFLLFVB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QU0sQ0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixJQUFyQixDQUFOLENBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCO0FBQ0QsT0FISCxXQUlTLFVBSlQ7QUFLRDtBQW5FTTtBQWZTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbmRhdGEub3duU3RpY2tlcnMubWFwKHMgPT4ge1xyXG4gIHMuc2VsZWN0ZWQgPSBmYWxzZVxyXG59KTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIG93blN0aWNrZXJzOiBkYXRhLm93blN0aWNrZXJzLFxyXG4gICAgaG90U3RpY2tlcnM6IGRhdGEuaG90U3RpY2tlcnMsXHJcbiAgICBtYW5hZ2VtZW50OiBmYWxzZVxyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIHNlbGVjdGVkU3RpY2tlcnMoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm93blN0aWNrZXJzLmZpbHRlcihzID0+ICEhcy5zZWxlY3RlZCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgTktDLm1ldGhvZHMuaW5pdFN0aWNrZXJWaWV3ZXIoKTtcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgdmlzaXRVcmw6IE5LQy5tZXRob2RzLnZpc2l0VXJsLFxyXG4gICAgc3dpdGNoTWFuYWdlbWVudCgpIHtcclxuICAgICAgdGhpcy5tYW5hZ2VtZW50ID0gIXRoaXMubWFuYWdlbWVudDtcclxuICAgICAgdGhpcy5jaGFuZ2VTdGlja2Vyc1N0YXR1cyhmYWxzZSk7XHJcbiAgICB9LFxyXG4gICAgc2hvd1JlYXNvbihzKSB7XHJcbiAgICAgIHN3ZWV0SW5mbyhzLnJlYXNvbik7XHJcbiAgICB9LFxyXG4gICAgbW92ZVN0aWNrZXIoKSB7XHJcbiAgICAgIGNvbnN0IHtzZWxlY3RlZFN0aWNrZXJzfSA9IHRoaXM7XHJcbiAgICAgIGlmKCFzZWxlY3RlZFN0aWNrZXJzLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgIHR5cGU6IFwibW92ZVwiLFxyXG4gICAgICAgIHN0aWNrZXJzSWQ6IHNlbGVjdGVkU3RpY2tlcnMubWFwKHMgPT4gcy5faWQpXHJcbiAgICAgIH07XHJcbiAgICAgIG5rY0FQSShcIi9zdGlja2VyXCIsIFwiUE9TVFwiLCBib2R5KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVTdGlja2VyKCkge1xyXG4gICAgICBjb25zdCB7c2VsZWN0ZWRTdGlja2Vyc30gPSB0aGlzO1xyXG4gICAgICBpZighc2VsZWN0ZWRTdGlja2Vycy5sZW5ndGgpIHJldHVybjtcclxuICAgICAgc3dlZXRRdWVzdGlvbihg56Gu5a6a6KaB5Yig6Zmk5bey6YCJ5Lit55qEJHtzZWxlY3RlZFN0aWNrZXJzLmxlbmd0aH3kuKrooajmg4XvvJ9gKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJvZHkgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZGVsZXRlXCIsXHJcbiAgICAgICAgICAgIHN0aWNrZXJzSWQ6IHNlbGVjdGVkU3RpY2tlcnMubWFwKHMgPT4gcy5faWQpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9zdGlja2VyXCIsIFwiUE9TVFwiLCBib2R5KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBzZWxlY3Qocykge1xyXG4gICAgICBzLnNlbGVjdGVkID0gIXMuc2VsZWN0ZWQ7XHJcbiAgICB9LFxyXG4gICAgY2hhbmdlU3RpY2tlcnNTdGF0dXMoc2VsZWN0KSB7XHJcbiAgICAgIHRoaXMub3duU3RpY2tlcnMubWFwKHMgPT4gcy5zZWxlY3RlZCA9ICEhc2VsZWN0KTtcclxuICAgIH0sXHJcbiAgICBzZWxlY3RBbGwoKSB7XHJcbiAgICAgIGxldCBjb3VudCA9IDAsIHNlbGVjdCA9IHRydWU7XHJcbiAgICAgIGZvcihjb25zdCBzIG9mIHRoaXMub3duU3RpY2tlcnMpIHtcclxuICAgICAgICBpZihzLnNlbGVjdGVkKSBjb3VudCArKztcclxuICAgICAgfVxyXG4gICAgICBpZihjb3VudCA9PT0gdGhpcy5vd25TdGlja2Vycy5sZW5ndGgpIHtcclxuICAgICAgICBzZWxlY3QgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmNoYW5nZVN0aWNrZXJzU3RhdHVzKHNlbGVjdCk7XHJcbiAgICB9LFxyXG4gICAgc2hhcmVTdGlja2VyKCkge1xyXG4gICAgICBjb25zdCB7c2VsZWN0ZWRTdGlja2Vyc30gPSB0aGlzO1xyXG4gICAgICBpZighc2VsZWN0ZWRTdGlja2Vycy5sZW5ndGgpIHJldHVybjtcclxuICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICB0eXBlOiBcInNoYXJlXCIsXHJcbiAgICAgICAgc3RpY2tlcnNJZDogc2VsZWN0ZWRTdGlja2Vycy5tYXAocyA9PiBzLl9pZClcclxuICAgICAgfTtcclxuICAgICAgbmtjQVBJKFwiL3N0aWNrZXJcIiwgXCJQT1NUXCIsIGJvZHkpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
