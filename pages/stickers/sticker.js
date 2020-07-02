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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zdGlja2Vycy9zdGlja2VyLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7QUFDQSxJQUFJLENBQUMsV0FBTCxDQUFpQixHQUFqQixDQUFxQixVQUFBLENBQUMsRUFBSTtBQUN4QixFQUFBLENBQUMsQ0FBQyxRQUFGLEdBQWEsS0FBYjtBQUNELENBRkQ7QUFHQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBRGQ7QUFFSixJQUFBLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FGZDtBQUdKLElBQUEsVUFBVSxFQUFFO0FBSFIsR0FGWTtBQU9sQixFQUFBLFFBQVEsRUFBRTtBQUNSLElBQUEsZ0JBRFEsOEJBQ1c7QUFDakIsYUFBTyxLQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBd0IsVUFBQSxDQUFDO0FBQUEsZUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVI7QUFBQSxPQUF6QixDQUFQO0FBQ0Q7QUFITyxHQVBRO0FBWWxCLEVBQUEsT0Faa0IscUJBWVI7QUFDUixJQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksaUJBQVo7QUFDRCxHQWRpQjtBQWVsQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBWixDQUFrQixNQURuQjtBQUVQLElBQUEsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFGZjtBQUdQLElBQUEsZ0JBSE8sOEJBR1k7QUFDakIsV0FBSyxVQUFMLEdBQWtCLENBQUMsS0FBSyxVQUF4QjtBQUNBLFdBQUssb0JBQUws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QWIsRUFBcUIsSUFBckIsQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNELE9BSEgsV0FJUyxVQUpUO0FBS0Q7QUFuRU07QUFmUyxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xuZGF0YS5vd25TdGlja2Vycy5tYXAocyA9PiB7XG4gIHMuc2VsZWN0ZWQgPSBmYWxzZVxufSk7XG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcbiAgZWw6IFwiI2FwcFwiLFxuICBkYXRhOiB7XG4gICAgb3duU3RpY2tlcnM6IGRhdGEub3duU3RpY2tlcnMsXG4gICAgaG90U3RpY2tlcnM6IGRhdGEuaG90U3RpY2tlcnMsXG4gICAgbWFuYWdlbWVudDogZmFsc2VcbiAgfSxcbiAgY29tcHV0ZWQ6IHtcbiAgICBzZWxlY3RlZFN0aWNrZXJzKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3duU3RpY2tlcnMuZmlsdGVyKHMgPT4gISFzLnNlbGVjdGVkKTtcbiAgICB9XG4gIH0sXG4gIG1vdW50ZWQoKSB7XG4gICAgTktDLm1ldGhvZHMuaW5pdFN0aWNrZXJWaWV3ZXIoKTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxuICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcbiAgICBzd2l0Y2hNYW5hZ2VtZW50KCkge1xuICAgICAgdGhpcy5tYW5hZ2VtZW50ID0gIXRoaXMubWFuYWdlbWVudDtcbiAgICAgIHRoaXMuY2hhbmdlU3RpY2tlcnNTdGF0dXMoZmFsc2UpO1xuICAgIH0sXG4gICAgc2hvd1JlYXNvbihzKSB7XG4gICAgICBzd2VldEluZm8ocy5yZWFzb24pO1xuICAgIH0sXG4gICAgbW92ZVN0aWNrZXIoKSB7XG4gICAgICBjb25zdCB7c2VsZWN0ZWRTdGlja2Vyc30gPSB0aGlzO1xuICAgICAgaWYoIXNlbGVjdGVkU3RpY2tlcnMubGVuZ3RoKSByZXR1cm47XG4gICAgICBjb25zdCBib2R5ID0ge1xuICAgICAgICB0eXBlOiBcIm1vdmVcIixcbiAgICAgICAgc3RpY2tlcnNJZDogc2VsZWN0ZWRTdGlja2Vycy5tYXAocyA9PiBzLl9pZClcbiAgICAgIH07XG4gICAgICBua2NBUEkoXCIvc3RpY2tlclwiLCBcIlBPU1RcIiwgYm9keSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xuICAgIH0sXG4gICAgcmVtb3ZlU3RpY2tlcigpIHtcbiAgICAgIGNvbnN0IHtzZWxlY3RlZFN0aWNrZXJzfSA9IHRoaXM7XG4gICAgICBpZighc2VsZWN0ZWRTdGlja2Vycy5sZW5ndGgpIHJldHVybjtcbiAgICAgIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeWIoOmZpOW3sumAieS4reeahCR7c2VsZWN0ZWRTdGlja2Vycy5sZW5ndGh95Liq6KGo5oOF77yfYClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgICAgICB0eXBlOiBcImRlbGV0ZVwiLFxuICAgICAgICAgICAgc3RpY2tlcnNJZDogc2VsZWN0ZWRTdGlja2Vycy5tYXAocyA9PiBzLl9pZClcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvc3RpY2tlclwiLCBcIlBPU1RcIiwgYm9keSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcbiAgICB9LFxuICAgIHNlbGVjdChzKSB7XG4gICAgICBzLnNlbGVjdGVkID0gIXMuc2VsZWN0ZWQ7XG4gICAgfSxcbiAgICBjaGFuZ2VTdGlja2Vyc1N0YXR1cyhzZWxlY3QpIHtcbiAgICAgIHRoaXMub3duU3RpY2tlcnMubWFwKHMgPT4gcy5zZWxlY3RlZCA9ICEhc2VsZWN0KTtcbiAgICB9LFxuICAgIHNlbGVjdEFsbCgpIHtcbiAgICAgIGxldCBjb3VudCA9IDAsIHNlbGVjdCA9IHRydWU7XG4gICAgICBmb3IoY29uc3QgcyBvZiB0aGlzLm93blN0aWNrZXJzKSB7XG4gICAgICAgIGlmKHMuc2VsZWN0ZWQpIGNvdW50ICsrO1xuICAgICAgfVxuICAgICAgaWYoY291bnQgPT09IHRoaXMub3duU3RpY2tlcnMubGVuZ3RoKSB7XG4gICAgICAgIHNlbGVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhpcy5jaGFuZ2VTdGlja2Vyc1N0YXR1cyhzZWxlY3QpO1xuICAgIH0sXG4gICAgc2hhcmVTdGlja2VyKCkge1xuICAgICAgY29uc3Qge3NlbGVjdGVkU3RpY2tlcnN9ID0gdGhpcztcbiAgICAgIGlmKCFzZWxlY3RlZFN0aWNrZXJzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgY29uc3QgYm9keSA9IHtcbiAgICAgICAgdHlwZTogXCJzaGFyZVwiLFxuICAgICAgICBzdGlja2Vyc0lkOiBzZWxlY3RlZFN0aWNrZXJzLm1hcChzID0+IHMuX2lkKVxuICAgICAgfTtcbiAgICAgIG5rY0FQSShcIi9zdGlja2VyXCIsIFwiUE9TVFwiLCBib2R5KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XG4gICAgfVxuICB9XG59KTsiXX0=
