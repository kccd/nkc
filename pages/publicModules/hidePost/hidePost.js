(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.HidePost = /*#__PURE__*/function () {
  function _class() {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $("#moduleHidePost");
    self.dom.modal({
      show: false
    });
    self.app = new Vue({
      el: "#moduleHidePostApp",
      data: {
        pid: "",
        hide: ""
      },
      methods: {
        open: function open(callback, options) {
          self.callback = callback;
          var pid = options.pid,
              hide = options.hide;
          this.pid = pid;
          this.hide = hide;
          self.dom.modal("show");
        },
        close: function close() {
          self.dom.modal("hide");
        },
        submit: function submit() {
          nkcAPI("/p/".concat(this.pid, "/hide"), "PATCH", {
            hide: this.hide
          }).then(function () {
            self.callback();
            self.app.close();
          })["catch"](sweetError);
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2hpZGVQb3N0L2hpZGVQb3N0Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVo7QUFDRSxvQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLGlCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUU7QUFETyxLQUFmO0FBR0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLG9CQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxHQUFHLEVBQUUsRUFERDtBQUVKLFFBQUEsSUFBSSxFQUFFO0FBRkYsT0FGVztBQU1qQixNQUFBLE9BQU8sRUFBRTtBQUNQLFFBQUEsSUFETyxnQkFDRixRQURFLEVBQ1EsT0FEUixFQUNpQjtBQUN0QixVQUFBLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQWhCO0FBRHNCLGNBRWYsR0FGZSxHQUVGLE9BRkUsQ0FFZixHQUZlO0FBQUEsY0FFVixJQUZVLEdBRUYsT0FGRSxDQUVWLElBRlU7QUFHdEIsZUFBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLGVBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRCxTQVBNO0FBUVAsUUFBQSxLQVJPLG1CQVFDO0FBQ04sVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0QsU0FWTTtBQVdQLFFBQUEsTUFYTyxvQkFXRTtBQUNQLFVBQUEsTUFBTSxjQUFPLEtBQUssR0FBWixZQUF3QixPQUF4QixFQUFpQztBQUNyQyxZQUFBLElBQUksRUFBRSxLQUFLO0FBRDBCLFdBQWpDLENBQU4sQ0FHRyxJQUhILENBR1EsWUFBTTtBQUNWLFlBQUEsSUFBSSxDQUFDLFFBQUw7QUFDQSxZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVDtBQUNELFdBTkgsV0FPUyxVQVBUO0FBUUQ7QUFwQk07QUFOUSxLQUFSLENBQVg7QUE2QkEsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBckI7QUFDQSxJQUFBLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUF0QjtBQUNEOztBQXRDSDtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuSGlkZVBvc3QgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuZG9tID0gJChcIiNtb2R1bGVIaWRlUG9zdFwiKTsgXHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlXHJcbiAgICB9KTtcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiBcIiNtb2R1bGVIaWRlUG9zdEFwcFwiLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgcGlkOiBcIlwiLFxyXG4gICAgICAgIGhpZGU6IFwiXCIgICAgICAgIFxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgb3BlbihjYWxsYmFjaywgb3B0aW9ucykge1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgY29uc3Qge3BpZCwgaGlkZX0gPSBvcHRpb25zO1xyXG4gICAgICAgICAgdGhpcy5waWQgPSBwaWQ7XHJcbiAgICAgICAgICB0aGlzLmhpZGUgPSBoaWRlO1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBua2NBUEkoYC9wLyR7dGhpcy5waWR9L2hpZGVgLCBcIlBBVENIXCIsIHtcclxuICAgICAgICAgICAgaGlkZTogdGhpcy5oaWRlXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5vcGVuID0gc2VsZi5hcHAub3BlbjtcclxuICAgIHNlbGYuY2xvc2UgPSBzZWxmLmFwcC5jbG9zZTtcclxuICB9XHJcbn0iXX0=
