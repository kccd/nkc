(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.ownStickers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var s = _step.value;
          if (s.selected) count++;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3N0aWNrZXJzL3N0aWNrZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLFVBQUEsQ0FBQyxFQUFJO0FBQ3hCLEVBQUEsQ0FBQyxDQUFDLFFBQUYsR0FBYSxLQUFiO0FBQ0QsQ0FGRDtBQUdBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FEZDtBQUVKLElBQUEsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUZkO0FBR0osSUFBQSxVQUFVLEVBQUU7QUFIUixHQUZZO0FBT2xCLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxnQkFEUSw4QkFDVztBQUNqQixhQUFPLEtBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUjtBQUFBLE9BQXpCLENBQVA7QUFDRDtBQUhPLEdBUFE7QUFZbEIsRUFBQSxPQVprQixxQkFZUjtBQUNSLElBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxpQkFBWjtBQUNELEdBZGlCO0FBZWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxnQkFGTyw4QkFFWTtBQUNqQixXQUFLLFVBQUwsR0FBa0IsQ0FBQyxLQUFLLFVBQXhCO0FBQ0EsV0FBSyxvQkFBTCxDQUEwQixLQUExQjtBQUNELEtBTE07QUFNUCxJQUFB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TSxDQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLElBQXJCLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7QUFDRCxPQUhILFdBSVMsVUFKVDtBQUtEO0FBbEVNO0FBZlMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuZGF0YS5vd25TdGlja2Vycy5tYXAocyA9PiB7XHJcbiAgcy5zZWxlY3RlZCA9IGZhbHNlXHJcbn0pO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgb3duU3RpY2tlcnM6IGRhdGEub3duU3RpY2tlcnMsXHJcbiAgICBob3RTdGlja2VyczogZGF0YS5ob3RTdGlja2VycyxcclxuICAgIG1hbmFnZW1lbnQ6IGZhbHNlXHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgc2VsZWN0ZWRTdGlja2VycygpIHtcclxuICAgICAgcmV0dXJuIHRoaXMub3duU3RpY2tlcnMuZmlsdGVyKHMgPT4gISFzLnNlbGVjdGVkKTtcclxuICAgIH1cclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBOS0MubWV0aG9kcy5pbml0U3RpY2tlclZpZXdlcigpO1xyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBzd2l0Y2hNYW5hZ2VtZW50KCkge1xyXG4gICAgICB0aGlzLm1hbmFnZW1lbnQgPSAhdGhpcy5tYW5hZ2VtZW50O1xyXG4gICAgICB0aGlzLmNoYW5nZVN0aWNrZXJzU3RhdHVzKGZhbHNlKTtcclxuICAgIH0sXHJcbiAgICBzaG93UmVhc29uKHMpIHtcclxuICAgICAgc3dlZXRJbmZvKHMucmVhc29uKTtcclxuICAgIH0sXHJcbiAgICBtb3ZlU3RpY2tlcigpIHtcclxuICAgICAgY29uc3Qge3NlbGVjdGVkU3RpY2tlcnN9ID0gdGhpcztcclxuICAgICAgaWYoIXNlbGVjdGVkU3RpY2tlcnMubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGJvZHkgPSB7XHJcbiAgICAgICAgdHlwZTogXCJtb3ZlXCIsXHJcbiAgICAgICAgc3RpY2tlcnNJZDogc2VsZWN0ZWRTdGlja2Vycy5tYXAocyA9PiBzLl9pZClcclxuICAgICAgfTtcclxuICAgICAgbmtjQVBJKFwiL3N0aWNrZXJcIiwgXCJQT1NUXCIsIGJvZHkpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZVN0aWNrZXIoKSB7XHJcbiAgICAgIGNvbnN0IHtzZWxlY3RlZFN0aWNrZXJzfSA9IHRoaXM7XHJcbiAgICAgIGlmKCFzZWxlY3RlZFN0aWNrZXJzLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICBzd2VldFF1ZXN0aW9uKGDnoa7lrpropoHliKDpmaTlt7LpgInkuK3nmoQke3NlbGVjdGVkU3RpY2tlcnMubGVuZ3RofeS4quihqOaDhe+8n2ApXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJkZWxldGVcIixcclxuICAgICAgICAgICAgc3RpY2tlcnNJZDogc2VsZWN0ZWRTdGlja2Vycy5tYXAocyA9PiBzLl9pZClcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKFwiL3N0aWNrZXJcIiwgXCJQT1NUXCIsIGJvZHkpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdChzKSB7XHJcbiAgICAgIHMuc2VsZWN0ZWQgPSAhcy5zZWxlY3RlZDtcclxuICAgIH0sXHJcbiAgICBjaGFuZ2VTdGlja2Vyc1N0YXR1cyhzZWxlY3QpIHtcclxuICAgICAgdGhpcy5vd25TdGlja2Vycy5tYXAocyA9PiBzLnNlbGVjdGVkID0gISFzZWxlY3QpO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdEFsbCgpIHtcclxuICAgICAgbGV0IGNvdW50ID0gMCwgc2VsZWN0ID0gdHJ1ZTtcclxuICAgICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5vd25TdGlja2Vycykge1xyXG4gICAgICAgIGlmKHMuc2VsZWN0ZWQpIGNvdW50ICsrO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGNvdW50ID09PSB0aGlzLm93blN0aWNrZXJzLmxlbmd0aCkge1xyXG4gICAgICAgIHNlbGVjdCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuY2hhbmdlU3RpY2tlcnNTdGF0dXMoc2VsZWN0KTtcclxuICAgIH0sXHJcbiAgICBzaGFyZVN0aWNrZXIoKSB7XHJcbiAgICAgIGNvbnN0IHtzZWxlY3RlZFN0aWNrZXJzfSA9IHRoaXM7XHJcbiAgICAgIGlmKCFzZWxlY3RlZFN0aWNrZXJzLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgIHR5cGU6IFwic2hhcmVcIixcclxuICAgICAgICBzdGlja2Vyc0lkOiBzZWxlY3RlZFN0aWNrZXJzLm1hcChzID0+IHMuX2lkKVxyXG4gICAgICB9O1xyXG4gICAgICBua2NBUEkoXCIvc3RpY2tlclwiLCBcIlBPU1RcIiwgYm9keSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXX0=
