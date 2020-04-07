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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3N0aWNrZXJzL3N0aWNrZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLEdBQWpCLENBQXFCLFVBQUEsQ0FBQyxFQUFJO0FBQ3hCLEVBQUEsQ0FBQyxDQUFDLFFBQUYsR0FBYSxLQUFiO0FBQ0QsQ0FGRDtBQUdBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FEZDtBQUVKLElBQUEsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUZkO0FBR0osSUFBQSxVQUFVLEVBQUU7QUFIUixHQUZZO0FBT2xCLEVBQUEsUUFBUSxFQUFFO0FBQ1IsSUFBQSxnQkFEUSw4QkFDVztBQUNqQixhQUFPLEtBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUjtBQUFBLE9BQXpCLENBQVA7QUFDRDtBQUhPLEdBUFE7QUFZbEIsRUFBQSxPQVprQixxQkFZUjtBQUNSLElBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxpQkFBWjtBQUNELEdBZGlCO0FBZWxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUZmO0FBR1AsSUFBQSxnQkFITyw4QkFHWTtBQUNqQixXQUFLLFVBQUwsR0FBa0IsQ0FBQyxLQUFLLFVBQXhCO0FBQ0EsV0FBSyxvQkFBTCxDQUEwQixLQUExQjtBQUNELEtBTk07QUFPUCxJQUFBLFVBUE8sc0JBT0ksQ0FQSixFQU9PO0FBQ1osTUFBQSxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQUgsQ0FBVDtBQUNELEtBVE07QUFVUCxJQUFBLFdBVk8seUJBVU87QUFBQSxVQUNMLGdCQURLLEdBQ2UsSUFEZixDQUNMLGdCQURLO0FBRVosVUFBRyxDQUFDLGdCQUFnQixDQUFDLE1BQXJCLEVBQTZCO0FBQzdCLFVBQU0sSUFBSSxHQUFHO0FBQ1gsUUFBQSxJQUFJLEVBQUUsTUFESztBQUVYLFFBQUEsVUFBVSxFQUFFLGdCQUFnQixDQUFDLEdBQWpCLENBQXFCLFVBQUEsQ0FBQztBQUFBLGlCQUFJLENBQUMsQ0FBQyxHQUFOO0FBQUEsU0FBdEI7QUFGRCxPQUFiO0FBSUEsTUFBQSxNQUFNLENBQUMsVUFBRCxFQUFhLE1BQWIsRUFBcUIsSUFBckIsQ0FBTixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsUUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNELE9BSEgsV0FJUyxVQUpUO0FBS0QsS0F0Qk07QUF1QlAsSUFBQSxhQXZCTywyQkF1QlM7QUFBQSxVQUNQLGdCQURPLEdBQ2EsSUFEYixDQUNQLGdCQURPO0FBRWQsVUFBRyxDQUFDLGdCQUFnQixDQUFDLE1BQXJCLEVBQTZCO0FBQzdCLE1BQUEsYUFBYSxpRUFBYSxnQkFBZ0IsQ0FBQyxNQUE5Qiw4QkFBYixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsWUFBTSxJQUFJLEdBQUc7QUFDWCxVQUFBLElBQUksRUFBRSxRQURLO0FBRVgsVUFBQSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsR0FBakIsQ0FBcUIsVUFBQSxDQUFDO0FBQUEsbUJBQUksQ0FBQyxDQUFDLEdBQU47QUFBQSxXQUF0QjtBQUZELFNBQWI7QUFJQSxlQUFPLE1BQU0sQ0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixJQUFyQixDQUFiO0FBQ0QsT0FQSCxFQVFHLElBUkgsQ0FRUSxZQUFNO0FBQ1YsUUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNELE9BVkgsV0FXUyxVQVhUO0FBWUQsS0F0Q007QUF1Q1AsSUFBQSxNQXZDTyxrQkF1Q0EsQ0F2Q0EsRUF1Q0c7QUFDUixNQUFBLENBQUMsQ0FBQyxRQUFGLEdBQWEsQ0FBQyxDQUFDLENBQUMsUUFBaEI7QUFDRCxLQXpDTTtBQTBDUCxJQUFBLG9CQTFDTyxnQ0EwQ2MsTUExQ2QsRUEwQ3NCO0FBQzNCLFdBQUssV0FBTCxDQUFpQixHQUFqQixDQUFxQixVQUFBLENBQUM7QUFBQSxlQUFJLENBQUMsQ0FBQyxRQUFGLEdBQWEsQ0FBQyxDQUFDLE1BQW5CO0FBQUEsT0FBdEI7QUFDRCxLQTVDTTtBQTZDUCxJQUFBLFNBN0NPLHVCQTZDSztBQUNWLFVBQUksS0FBSyxHQUFHLENBQVo7QUFBQSxVQUFlLE1BQU0sR0FBRyxJQUF4QjtBQURVO0FBQUE7QUFBQTs7QUFBQTtBQUVWLDZCQUFlLEtBQUssV0FBcEIsOEhBQWlDO0FBQUEsY0FBdkIsQ0FBdUI7QUFDL0IsY0FBRyxDQUFDLENBQUMsUUFBTCxFQUFlLEtBQUs7QUFDckI7QUFKUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUtWLFVBQUcsS0FBSyxLQUFLLEtBQUssV0FBTCxDQUFpQixNQUE5QixFQUFzQztBQUNwQyxRQUFBLE1BQU0sR0FBRyxLQUFUO0FBQ0Q7O0FBQ0QsV0FBSyxvQkFBTCxDQUEwQixNQUExQjtBQUNELEtBdERNO0FBdURQLElBQUEsWUF2RE8sMEJBdURRO0FBQUEsVUFDTixnQkFETSxHQUNjLElBRGQsQ0FDTixnQkFETTtBQUViLFVBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFyQixFQUE2QjtBQUM3QixVQUFNLElBQUksR0FBRztBQUNYLFFBQUEsSUFBSSxFQUFFLE9BREs7QUFFWCxRQUFBLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUFxQixVQUFBLENBQUM7QUFBQSxpQkFBSSxDQUFDLENBQUMsR0FBTjtBQUFBLFNBQXRCO0FBRkQsT0FBYjtBQUlBLE1BQUEsTUFBTSxDQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLElBQXJCLENBQU4sQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEI7QUFDRCxPQUhILFdBSVMsVUFKVDtBQUtEO0FBbkVNO0FBZlMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcbmRhdGEub3duU3RpY2tlcnMubWFwKHMgPT4ge1xuICBzLnNlbGVjdGVkID0gZmFsc2Vcbn0pO1xuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XG4gIGVsOiBcIiNhcHBcIixcbiAgZGF0YToge1xuICAgIG93blN0aWNrZXJzOiBkYXRhLm93blN0aWNrZXJzLFxuICAgIGhvdFN0aWNrZXJzOiBkYXRhLmhvdFN0aWNrZXJzLFxuICAgIG1hbmFnZW1lbnQ6IGZhbHNlXG4gIH0sXG4gIGNvbXB1dGVkOiB7XG4gICAgc2VsZWN0ZWRTdGlja2VycygpIHtcbiAgICAgIHJldHVybiB0aGlzLm93blN0aWNrZXJzLmZpbHRlcihzID0+ICEhcy5zZWxlY3RlZCk7XG4gICAgfVxuICB9LFxuICBtb3VudGVkKCkge1xuICAgIE5LQy5tZXRob2RzLmluaXRTdGlja2VyVmlld2VyKCk7XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcbiAgICB2aXNpdFVybDogTktDLm1ldGhvZHMudmlzaXRVcmwsXG4gICAgc3dpdGNoTWFuYWdlbWVudCgpIHtcbiAgICAgIHRoaXMubWFuYWdlbWVudCA9ICF0aGlzLm1hbmFnZW1lbnQ7XG4gICAgICB0aGlzLmNoYW5nZVN0aWNrZXJzU3RhdHVzKGZhbHNlKTtcbiAgICB9LFxuICAgIHNob3dSZWFzb24ocykge1xuICAgICAgc3dlZXRJbmZvKHMucmVhc29uKTtcbiAgICB9LFxuICAgIG1vdmVTdGlja2VyKCkge1xuICAgICAgY29uc3Qge3NlbGVjdGVkU3RpY2tlcnN9ID0gdGhpcztcbiAgICAgIGlmKCFzZWxlY3RlZFN0aWNrZXJzLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgY29uc3QgYm9keSA9IHtcbiAgICAgICAgdHlwZTogXCJtb3ZlXCIsXG4gICAgICAgIHN0aWNrZXJzSWQ6IHNlbGVjdGVkU3RpY2tlcnMubWFwKHMgPT4gcy5faWQpXG4gICAgICB9O1xuICAgICAgbmtjQVBJKFwiL3N0aWNrZXJcIiwgXCJQT1NUXCIsIGJvZHkpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcbiAgICB9LFxuICAgIHJlbW92ZVN0aWNrZXIoKSB7XG4gICAgICBjb25zdCB7c2VsZWN0ZWRTdGlja2Vyc30gPSB0aGlzO1xuICAgICAgaWYoIXNlbGVjdGVkU3RpY2tlcnMubGVuZ3RoKSByZXR1cm47XG4gICAgICBzd2VldFF1ZXN0aW9uKGDnoa7lrpropoHliKDpmaTlt7LpgInkuK3nmoQke3NlbGVjdGVkU3RpY2tlcnMubGVuZ3RofeS4quihqOaDhe+8n2ApXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBib2R5ID0ge1xuICAgICAgICAgICAgdHlwZTogXCJkZWxldGVcIixcbiAgICAgICAgICAgIHN0aWNrZXJzSWQ6IHNlbGVjdGVkU3RpY2tlcnMubWFwKHMgPT4gcy5faWQpXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKFwiL3N0aWNrZXJcIiwgXCJQT1NUXCIsIGJvZHkpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XG4gICAgfSxcbiAgICBzZWxlY3Qocykge1xuICAgICAgcy5zZWxlY3RlZCA9ICFzLnNlbGVjdGVkO1xuICAgIH0sXG4gICAgY2hhbmdlU3RpY2tlcnNTdGF0dXMoc2VsZWN0KSB7XG4gICAgICB0aGlzLm93blN0aWNrZXJzLm1hcChzID0+IHMuc2VsZWN0ZWQgPSAhIXNlbGVjdCk7XG4gICAgfSxcbiAgICBzZWxlY3RBbGwoKSB7XG4gICAgICBsZXQgY291bnQgPSAwLCBzZWxlY3QgPSB0cnVlO1xuICAgICAgZm9yKGNvbnN0IHMgb2YgdGhpcy5vd25TdGlja2Vycykge1xuICAgICAgICBpZihzLnNlbGVjdGVkKSBjb3VudCArKztcbiAgICAgIH1cbiAgICAgIGlmKGNvdW50ID09PSB0aGlzLm93blN0aWNrZXJzLmxlbmd0aCkge1xuICAgICAgICBzZWxlY3QgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hhbmdlU3RpY2tlcnNTdGF0dXMoc2VsZWN0KTtcbiAgICB9LFxuICAgIHNoYXJlU3RpY2tlcigpIHtcbiAgICAgIGNvbnN0IHtzZWxlY3RlZFN0aWNrZXJzfSA9IHRoaXM7XG4gICAgICBpZighc2VsZWN0ZWRTdGlja2Vycy5sZW5ndGgpIHJldHVybjtcbiAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgIHR5cGU6IFwic2hhcmVcIixcbiAgICAgICAgc3RpY2tlcnNJZDogc2VsZWN0ZWRTdGlja2Vycy5tYXAocyA9PiBzLl9pZClcbiAgICAgIH07XG4gICAgICBua2NBUEkoXCIvc3RpY2tlclwiLCBcIlBPU1RcIiwgYm9keSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xuICAgIH1cbiAgfVxufSk7Il19
