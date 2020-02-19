(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
data.stickers.map(function (s) {
  if (s.reviewed === null) {
    s.status = true;
    s.size = "md";
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
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = stickers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
      this.submit(this.stickers);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL25rYy9zdGlja2VyL3N0aWNrZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQUksQ0FBQyxRQUFMLENBQWMsR0FBZCxDQUFrQixVQUFBLENBQUMsRUFBSTtBQUNyQixNQUFHLENBQUMsQ0FBQyxRQUFGLEtBQWUsSUFBbEIsRUFBd0I7QUFDdEIsSUFBQSxDQUFDLENBQUMsTUFBRixHQUFXLElBQVg7QUFDQSxJQUFBLENBQUMsQ0FBQyxJQUFGLEdBQVMsSUFBVDtBQUNEO0FBQ0YsQ0FMRDtBQU1BLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUM7QUFEWCxHQUZZO0FBS2xCLEVBQUEsT0FMa0IscUJBS1I7QUFDUixJQUFBLGNBQWMsQ0FBQyxTQUFmO0FBQ0EsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLGVBQVosQ0FBNEIsZ0JBQTVCO0FBQ0QsR0FSaUI7QUFTbEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQVosQ0FBa0IsTUFEbkI7QUFFUCxJQUFBLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLE1BRmI7QUFHUCxJQUFBLFFBQVEsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFFBSGY7QUFJUCxJQUFBLFdBQVcsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQVosQ0FBc0IsV0FKNUI7QUFLUCxJQUFBLE1BTE8sa0JBS0EsQ0FMQSxFQUtHO0FBQ1IsV0FBSyxRQUFMLENBQWMsR0FBZCxDQUFrQixVQUFBLENBQUMsRUFBSTtBQUNyQixZQUFHLENBQUMsQ0FBQyxRQUFGLEtBQWUsSUFBbEIsRUFBd0I7QUFDdEIsVUFBQSxDQUFDLENBQUMsTUFBRixHQUFXLENBQUMsQ0FBQyxDQUFiO0FBQ0Q7QUFDRixPQUpEO0FBS0QsS0FYTTtBQVlQLElBQUEsTUFaTyxrQkFZQSxRQVpBLEVBWVU7QUFDZixVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsTUFBQSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsVUFBQSxDQUFDO0FBQUEsZUFBSSxDQUFDLENBQUMsUUFBRixLQUFlLElBQW5CO0FBQUEsT0FBakIsQ0FBWDtBQUNBLE1BQUEsYUFBYSxDQUFDLFdBQUQsQ0FBYixDQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsWUFBTSxHQUFHLEdBQUcsRUFBWjtBQURVO0FBQUE7QUFBQTs7QUFBQTtBQUVWLCtCQUFlLFFBQWYsOEhBQXlCO0FBQUEsZ0JBQWYsQ0FBZTtBQUFBLGdCQUNoQixHQURnQixHQUNhLENBRGIsQ0FDaEIsR0FEZ0I7QUFBQSxnQkFDWCxNQURXLEdBQ2EsQ0FEYixDQUNYLE1BRFc7QUFBQSxnQkFDSCxNQURHLEdBQ2EsQ0FEYixDQUNILE1BREc7QUFBQSxnQkFDSyxJQURMLEdBQ2EsQ0FEYixDQUNLLElBREw7O0FBRXZCLGdCQUFHLENBQUMsTUFBSixFQUFZO0FBQ1YsY0FBQSxJQUFJLENBQUMsV0FBTCxDQUFpQixNQUFqQixFQUF5QjtBQUN2QixnQkFBQSxJQUFJLEVBQUUsSUFEaUI7QUFFdkIsZ0JBQUEsU0FBUyxFQUFFLENBRlk7QUFHdkIsZ0JBQUEsU0FBUyxFQUFFO0FBSFksZUFBekI7QUFLRDs7QUFDRCxZQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVM7QUFDUCxjQUFBLEdBQUcsRUFBSCxHQURPO0FBRVAsY0FBQSxNQUFNLEVBQU4sTUFGTztBQUdQLGNBQUEsSUFBSSxFQUFKLElBSE87QUFJUCxjQUFBLE1BQU0sRUFBTjtBQUpPLGFBQVQ7QUFNRDtBQWpCUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWtCVixlQUFPLE1BQU0sQ0FBQyxjQUFELEVBQWlCLE1BQWpCLEVBQXlCO0FBQ3BDLFVBQUEsUUFBUSxFQUFFLEdBRDBCO0FBRXBDLFVBQUEsSUFBSSxFQUFFO0FBRjhCLFNBQXpCLENBQWI7QUFJRCxPQXZCSCxFQXdCRyxJQXhCSCxDQXdCUSxZQUFNO0FBQ1Y7QUFDQSxRQUFBLE1BQU0sQ0FBQyxRQUFQLENBQWdCLE1BQWhCO0FBQ0QsT0EzQkgsV0E0QlMsVUE1QlQ7QUE2QkQsS0E1Q007QUE2Q1AsSUFBQSxTQTdDTyx1QkE2Q0s7QUFDVixXQUFLLE1BQUwsQ0FBWSxLQUFLLFFBQWpCO0FBQ0QsS0EvQ007QUFnRFAsSUFBQSxVQWhETyxzQkFnREksSUFoREosRUFnRFU7QUFDZixXQUFLLFFBQUwsQ0FBYyxHQUFkLENBQWtCLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLElBQUYsR0FBUyxJQUFiO0FBQUEsT0FBbkI7QUFDRCxLQWxETTtBQW1EUCxJQUFBLGNBbkRPLDBCQW1EUSxDQW5EUixFQW1EVyxDQW5EWCxFQW1EYztBQUNuQixNQUFBLE1BQU0sQ0FBQyxjQUFELEVBQWlCLE1BQWpCLEVBQXlCO0FBQzdCLFFBQUEsUUFBUSxFQUFFLENBQUMsQ0FBRCxDQURtQjtBQUU3QixRQUFBLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FGaUI7QUFHN0IsUUFBQSxJQUFJLEVBQUU7QUFIdUIsT0FBekIsQ0FBTixDQUtHLElBTEgsQ0FLUSxZQUFNO0FBQ1YsUUFBQSxDQUFDLENBQUMsUUFBRixHQUFhLENBQUMsQ0FBQyxDQUFmO0FBQ0QsT0FQSCxXQVFTLFVBUlQ7QUFTRDtBQTdETTtBQVRTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbmRhdGEuc3RpY2tlcnMubWFwKHMgPT4ge1xyXG4gIGlmKHMucmV2aWV3ZWQgPT09IG51bGwpIHtcclxuICAgIHMuc3RhdHVzID0gdHJ1ZTtcclxuICAgIHMuc2l6ZSA9IFwibWRcIjtcclxuICB9XHJcbn0pO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgc3RpY2tlcnM6IGRhdGEuc3RpY2tlcnNcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICBmbG9hdFVzZXJQYW5lbC5pbml0UGFuZWwoKTtcclxuICAgIE5LQy5tZXRob2RzLmluaXRJbWFnZVZpZXdlcihcIi5zdGlja2VyLWltYWdlXCIpXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGZvcm1hdDogTktDLm1ldGhvZHMuZm9ybWF0LFxyXG4gICAgdmlzaXRVcmw6IE5LQy5tZXRob2RzLnZpc2l0VXJsLFxyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIHNldEFsbCh0KSB7XHJcbiAgICAgIHRoaXMuc3RpY2tlcnMubWFwKHMgPT4ge1xyXG4gICAgICAgIGlmKHMucmV2aWV3ZWQgPT09IG51bGwpIHtcclxuICAgICAgICAgIHMuc3RhdHVzID0gISF0O1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBzdWJtaXQoc3RpY2tlcnMpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHN0aWNrZXJzID0gc3RpY2tlcnMuZmlsdGVyKHMgPT4gcy5yZXZpZXdlZCA9PT0gbnVsbCk7XHJcbiAgICAgIHN3ZWV0UXVlc3Rpb24oXCLnoa7lrpropoHmiafooYzmraTmk43kvZzvvJ9cIilcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcclxuICAgICAgICAgIGZvcihjb25zdCBzIG9mIHN0aWNrZXJzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtfaWQsIHN0YXR1cywgcmVhc29uLCBzaXplfSA9IHM7XHJcbiAgICAgICAgICAgIGlmKCFzdGF0dXMpIHtcclxuICAgICAgICAgICAgICBzZWxmLmNoZWNrU3RyaW5nKHJlYXNvbiwge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCLljp/lm6BcIixcclxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcclxuICAgICAgICAgICAgICAgIG1heExlbmd0aDogNTAwXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXJyLnB1c2goe1xyXG4gICAgICAgICAgICAgIF9pZCxcclxuICAgICAgICAgICAgICBzdGF0dXMsXHJcbiAgICAgICAgICAgICAgc2l6ZSxcclxuICAgICAgICAgICAgICByZWFzb25cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKFwiL25rYy9zdGlja2VyXCIsIFwiUE9TVFwiLCB7XHJcbiAgICAgICAgICAgIHN0aWNrZXJzOiBhcnIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwicmV2aWV3XCJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgLy8gc3RpY2tlcnMubWFwKHMgPT4gcy5yZXZpZXdlZCA9IHMuc3RhdHVzKTtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdEFsbCgpIHtcclxuICAgICAgdGhpcy5zdWJtaXQodGhpcy5zdGlja2Vycyk7XHJcbiAgICB9LFxyXG4gICAgbW9kaWZ5U2l6ZShzaXplKSB7XHJcbiAgICAgIHRoaXMuc3RpY2tlcnMubWFwKHMgPT4gcy5zaXplID0gc2l6ZSk7XHJcbiAgICB9LFxyXG4gICAgZGlzYWJsZVN0aWNrZXIocywgZCkge1xyXG4gICAgICBua2NBUEkoXCIvbmtjL3N0aWNrZXJcIiwgXCJQT1NUXCIsIHtcclxuICAgICAgICBzdGlja2VyczogW3NdLFxyXG4gICAgICAgIGRpc2FibGVkOiAhIWQsXHJcbiAgICAgICAgdHlwZTogXCJkaXNhYmxlXCJcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzLmRpc2FibGVkID0gISFkO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXX0=
