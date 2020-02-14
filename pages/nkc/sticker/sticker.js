(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
data.stickers.map(function (s) {
  if (s.reviewed === null) {
    s.status = true;
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
                reason = s.reason;

            if (!status) {
              self.checkString(reason, {
                name: "原因",
                minLength: 0,
                maxLength: 500
              });
            }

            arr.push({
              _id: s._id,
              status: status,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL25rYy9zdGlja2VyL3N0aWNrZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQUksQ0FBQyxRQUFMLENBQWMsR0FBZCxDQUFrQixVQUFBLENBQUMsRUFBSTtBQUNyQixNQUFHLENBQUMsQ0FBQyxRQUFGLEtBQWUsSUFBbEIsRUFBd0I7QUFDdEIsSUFBQSxDQUFDLENBQUMsTUFBRixHQUFXLElBQVg7QUFDRDtBQUNGLENBSkQ7QUFLQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxRQUFRLEVBQUUsSUFBSSxDQUFDO0FBRFgsR0FGWTtBQUtsQixFQUFBLE9BTGtCLHFCQUtSO0FBQ1IsSUFBQSxjQUFjLENBQUMsU0FBZjtBQUNBLElBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxlQUFaLENBQTRCLGdCQUE1QjtBQUNELEdBUmlCO0FBU2xCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxNQUZiO0FBR1AsSUFBQSxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUhmO0FBSVAsSUFBQSxXQUFXLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFaLENBQXNCLFdBSjVCO0FBS1AsSUFBQSxNQUxPLGtCQUtBLENBTEEsRUFLRztBQUNSLFdBQUssUUFBTCxDQUFjLEdBQWQsQ0FBa0IsVUFBQSxDQUFDLEVBQUk7QUFDckIsWUFBRyxDQUFDLENBQUMsUUFBRixLQUFlLElBQWxCLEVBQXdCO0FBQ3RCLFVBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFDLENBQUMsQ0FBYjtBQUNEO0FBQ0YsT0FKRDtBQUtELEtBWE07QUFZUCxJQUFBLE1BWk8sa0JBWUEsUUFaQSxFQVlVO0FBQ2YsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLE1BQUEsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFULENBQWdCLFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLFFBQUYsS0FBZSxJQUFuQjtBQUFBLE9BQWpCLENBQVg7QUFDQSxNQUFBLGFBQWEsQ0FBQyxXQUFELENBQWIsQ0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFlBQU0sR0FBRyxHQUFHLEVBQVo7QUFEVTtBQUFBO0FBQUE7O0FBQUE7QUFFViwrQkFBZSxRQUFmLDhIQUF5QjtBQUFBLGdCQUFmLENBQWU7QUFBQSxnQkFDaEIsR0FEZ0IsR0FDTyxDQURQLENBQ2hCLEdBRGdCO0FBQUEsZ0JBQ1gsTUFEVyxHQUNPLENBRFAsQ0FDWCxNQURXO0FBQUEsZ0JBQ0gsTUFERyxHQUNPLENBRFAsQ0FDSCxNQURHOztBQUV2QixnQkFBRyxDQUFDLE1BQUosRUFBWTtBQUNWLGNBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsTUFBakIsRUFBeUI7QUFDdkIsZ0JBQUEsSUFBSSxFQUFFLElBRGlCO0FBRXZCLGdCQUFBLFNBQVMsRUFBRSxDQUZZO0FBR3ZCLGdCQUFBLFNBQVMsRUFBRTtBQUhZLGVBQXpCO0FBS0Q7O0FBQ0QsWUFBQSxHQUFHLENBQUMsSUFBSixDQUFTO0FBQ1AsY0FBQSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBREE7QUFFUCxjQUFBLE1BQU0sRUFBTixNQUZPO0FBR1AsY0FBQSxNQUFNLEVBQU47QUFITyxhQUFUO0FBS0Q7QUFoQlM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFpQlYsZUFBTyxNQUFNLENBQUMsY0FBRCxFQUFpQixNQUFqQixFQUF5QjtBQUNwQyxVQUFBLFFBQVEsRUFBRSxHQUQwQjtBQUVwQyxVQUFBLElBQUksRUFBRTtBQUY4QixTQUF6QixDQUFiO0FBSUQsT0F0QkgsRUF1QkcsSUF2QkgsQ0F1QlEsWUFBTTtBQUNWO0FBQ0EsUUFBQSxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQjtBQUNELE9BMUJILFdBMkJTLFVBM0JUO0FBNEJELEtBM0NNO0FBNENQLElBQUEsU0E1Q08sdUJBNENLO0FBQ1YsV0FBSyxNQUFMLENBQVksS0FBSyxRQUFqQjtBQUNELEtBOUNNO0FBK0NQLElBQUEsY0EvQ08sMEJBK0NRLENBL0NSLEVBK0NXLENBL0NYLEVBK0NjO0FBQ25CLE1BQUEsTUFBTSxDQUFDLGNBQUQsRUFBaUIsTUFBakIsRUFBeUI7QUFDN0IsUUFBQSxRQUFRLEVBQUUsQ0FBQyxDQUFELENBRG1CO0FBRTdCLFFBQUEsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUZpQjtBQUc3QixRQUFBLElBQUksRUFBRTtBQUh1QixPQUF6QixDQUFOLENBS0csSUFMSCxDQUtRLFlBQU07QUFDVixRQUFBLENBQUMsQ0FBQyxRQUFGLEdBQWEsQ0FBQyxDQUFDLENBQWY7QUFDRCxPQVBILFdBUVMsVUFSVDtBQVNEO0FBekRNO0FBVFMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuZGF0YS5zdGlja2Vycy5tYXAocyA9PiB7XHJcbiAgaWYocy5yZXZpZXdlZCA9PT0gbnVsbCkge1xyXG4gICAgcy5zdGF0dXMgPSB0cnVlO1xyXG4gIH1cclxufSk7XHJcbmNvbnN0IGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICBzdGlja2VyczogZGF0YS5zdGlja2Vyc1xyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIGZsb2F0VXNlclBhbmVsLmluaXRQYW5lbCgpO1xyXG4gICAgTktDLm1ldGhvZHMuaW5pdEltYWdlVmlld2VyKFwiLnN0aWNrZXItaW1hZ2VcIilcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgZm9ybWF0OiBOS0MubWV0aG9kcy5mb3JtYXQsXHJcbiAgICB2aXNpdFVybDogTktDLm1ldGhvZHMudmlzaXRVcmwsXHJcbiAgICBjaGVja1N0cmluZzogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrU3RyaW5nLFxyXG4gICAgc2V0QWxsKHQpIHtcclxuICAgICAgdGhpcy5zdGlja2Vycy5tYXAocyA9PiB7XHJcbiAgICAgICAgaWYocy5yZXZpZXdlZCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgcy5zdGF0dXMgPSAhIXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdChzdGlja2Vycykge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgc3RpY2tlcnMgPSBzdGlja2Vycy5maWx0ZXIocyA9PiBzLnJldmlld2VkID09PSBudWxsKTtcclxuICAgICAgc3dlZXRRdWVzdGlvbihcIuehruWumuimgeaJp+ihjOatpOaTjeS9nO+8n1wiKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IHMgb2Ygc3RpY2tlcnMpIHtcclxuICAgICAgICAgICAgY29uc3Qge19pZCwgc3RhdHVzLCByZWFzb259ID0gcztcclxuICAgICAgICAgICAgaWYoIXN0YXR1cykge1xyXG4gICAgICAgICAgICAgIHNlbGYuY2hlY2tTdHJpbmcocmVhc29uLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuWOn+WboFwiLFxyXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4TGVuZ3RoOiA1MDBcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhcnIucHVzaCh7XHJcbiAgICAgICAgICAgICAgX2lkOiBzLl9pZCxcclxuICAgICAgICAgICAgICBzdGF0dXMsXHJcbiAgICAgICAgICAgICAgcmVhc29uXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9ua2Mvc3RpY2tlclwiLCBcIlBPU1RcIiwge1xyXG4gICAgICAgICAgICBzdGlja2VyczogYXJyLFxyXG4gICAgICAgICAgICB0eXBlOiBcInJldmlld1wiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIC8vIHN0aWNrZXJzLm1hcChzID0+IHMucmV2aWV3ZWQgPSBzLnN0YXR1cyk7XHJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH0sXHJcbiAgICBzdWJtaXRBbGwoKSB7XHJcbiAgICAgIHRoaXMuc3VibWl0KHRoaXMuc3RpY2tlcnMpO1xyXG4gICAgfSxcclxuICAgIGRpc2FibGVTdGlja2VyKHMsIGQpIHtcclxuICAgICAgbmtjQVBJKFwiL25rYy9zdGlja2VyXCIsIFwiUE9TVFwiLCB7XHJcbiAgICAgICAgc3RpY2tlcnM6IFtzXSxcclxuICAgICAgICBkaXNhYmxlZDogISFkLFxyXG4gICAgICAgIHR5cGU6IFwiZGlzYWJsZVwiXHJcbiAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgcy5kaXNhYmxlZCA9ICEhZDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
