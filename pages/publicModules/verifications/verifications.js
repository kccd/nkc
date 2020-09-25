(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Verifications = /*#__PURE__*/function () {
  function Verifications() {
    _classCallCheck(this, Verifications);

    var self = this;
    self.dom = $("#moduleVerifications");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: '#moduleVerificationsApp',
      data: {
        type: '',
        vernierCaliper: {
          init: false,
          answer: 0,
          data: {
            question: '',
            backgroundColor: '',
            mainImageBase64: '',
            secondaryImageBase64: ''
          }
        }
      },
      methods: {
        getData: function getData() {
          return nkcAPI("/verifications", 'GET').then(function (data) {
            self.app.type = data.verificationData.type;
            self.app[self.app.type].data = data.verificationData;
            var initFunc = self.app["".concat(self.app.type, "Init")];
            if (initFunc) initFunc();
          })["catch"](function (err) {
            console.log(err);
            sweetError(err);
          });
        },
        open: function open() {
          this.getData().then(function () {
            self.dom.modal('show');
          });
        },
        close: function close() {
          self.dom.modal('hide');
        },
        vernierCaliperInit: function vernierCaliperInit() {
          var tempLeft = 0;
          var mouseLeft = 0;
          var selected = false;
          this.vernierCaliper.answer = 0;
          if (this.vernierCaliper.init) return;

          var _this = this;

          setTimeout(function () {
            var button = _this.$refs.button;

            var getX = function getX(e) {
              if (e.screenX === undefined) {
                return e.touches[0].screenX;
              } else {
                return e.screenX;
              }
            };

            var onMouseDown = function onMouseDown(e) {
              // console.log(`按下`, e);
              e.preventDefault();
              mouseLeft = getX(e);
              selected = true;
            };

            var onMouseUp = function onMouseUp(e) {
              // console.log(`抬起`, e);
              selected = false;
              tempLeft = _this.vernierCaliper.answer;
            };

            var onMouseMove = function onMouseMove(e) {
              // console.log(`移动`, e);
              if (!selected) return;
              _this.vernierCaliper.answer = tempLeft + getX(e) - mouseLeft;
            };

            button.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            button.addEventListener('touchstart', onMouseDown);
            document.addEventListener('touchmove', onMouseMove);
            document.addEventListener('touchend', onMouseUp);
          }, 300);
        },
        submit: function submit() {
          var _this$this$type = this[this.type],
              verificationData = _this$this$type.data,
              answer = _this$this$type.answer;
          verificationData.answer = answer;
          nkcAPI("/verifications", 'POST', {
            verificationData: verificationData
          }).then(function (data) {
            self.callback({
              secret: data.secret
            });
            self.close();
          })["catch"](function (err) {
            console.log(err);
            screenTopWarning(err);
            self.app.getData();
          });
        }
      }
    });
  }

  _createClass(Verifications, [{
    key: "open",
    value: function open(callback) {
      this.callback = callback;
      this.app.open();
    }
  }, {
    key: "close",
    value: function close() {
      this.app.close();
    }
  }]);

  return Verifications;
}();

NKC.modules.Verifications = Verifications;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLGNBQWMsRUFBRTtBQUNkLFVBQUEsSUFBSSxFQUFFLEtBRFE7QUFFZCxVQUFBLE1BQU0sRUFBRSxDQUZNO0FBR2QsVUFBQSxJQUFJLEVBQUU7QUFDSixZQUFBLFFBQVEsRUFBRSxFQUROO0FBRUosWUFBQSxlQUFlLEVBQUUsRUFGYjtBQUdKLFlBQUEsZUFBZSxFQUFFLEVBSGI7QUFJSixZQUFBLG9CQUFvQixFQUFFO0FBSmxCO0FBSFE7QUFGWixPQUZXO0FBZWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxPQURPLHFCQUNHO0FBQ1IsaUJBQU8sTUFBTSxtQkFBbUIsS0FBbkIsQ0FBTixDQUNKLElBREksQ0FDQyxVQUFBLElBQUksRUFBSTtBQUNaLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULEdBQWdCLElBQUksQ0FBQyxnQkFBTCxDQUFzQixJQUF0QztBQUNBLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsR0FBTCxDQUFT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QUFBLGNBQ00sZ0JBRE4sbUJBQ0EsSUFEQTtBQUFBLGNBQ3dCLE1BRHhCLG1CQUN3QixNQUR4QjtBQUVQLFVBQUEsZ0JBQWdCLENBQUMsTUFBakIsR0FBMEIsTUFBMUI7QUFDQSxVQUFBLE1BQU0sbUJBQW1CLE1BQW5CLEVBQTJCO0FBQy9CLFlBQUEsZ0JBQWdCLEVBQWhCO0FBRCtCLFdBQTNCLENBQU4sQ0FHRyxJQUhILENBR1EsVUFBQyxJQUFELEVBQVU7QUFDZCxZQUFBLElBQUksQ0FBQyxRQUFMLENBQWM7QUFDWixjQUFBLE1BQU0sRUFBRSxJQUFJLENBQUM7QUFERCxhQUFkO0FBR0EsWUFBQSxJQUFJLENBQUMsS0FBTDtBQUNELFdBUkgsV0FTUyxVQUFBLEdBQUcsRUFBSTtBQUNaLFlBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0FBQ0EsWUFBQSxnQkFBZ0IsQ0FBQyxHQUFELENBQWhCO0FBQ0EsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQVQ7QUFDRCxXQWJIO0FBY0Q7QUFuRk07QUFmUSxLQUFSLENBQVg7QUFxR0Q7Ozs7eUJBQ0ksUSxFQUFVO0FBQ2IsV0FBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsV0FBSyxHQUFMLENBQVMsSUFBVDtBQUNEOzs7NEJBQ087QUFDTixXQUFLLEdBQUwsQ0FBUyxLQUFUO0FBQ0Q7Ozs7OztBQUlILEdBQUcsQ0FBQyxPQUFKLENBQVksYUFBWixHQUE0QixhQUE1QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIFZlcmlmaWNhdGlvbnMge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlVmVyaWZpY2F0aW9uc1wiKTtcclxuICAgIHNlbGYuZG9tLm1vZGFsKHtcclxuICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgIGJhY2tkcm9wOiBcInN0YXRpY1wiXHJcbiAgICB9KTtcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiAnI21vZHVsZVZlcmlmaWNhdGlvbnNBcHAnLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgdHlwZTogJycsXHJcbiAgICAgICAgdmVybmllckNhbGlwZXI6IHtcclxuICAgICAgICAgIGluaXQ6IGZhbHNlLFxyXG4gICAgICAgICAgYW5zd2VyOiAwLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBxdWVzdGlvbjogJycsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJycsXHJcbiAgICAgICAgICAgIG1haW5JbWFnZUJhc2U2NDogJycsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUltYWdlQmFzZTY0OiAnJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIGdldERhdGEoKSB7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvdmVyaWZpY2F0aW9uc2AsICdHRVQnKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC50eXBlID0gZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGU7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHBbc2VsZi5hcHAudHlwZV0uZGF0YSA9IGRhdGEudmVyaWZpY2F0aW9uRGF0YTtcclxuICAgICAgICAgICAgICBjb25zdCBpbml0RnVuYyA9IHNlbGYuYXBwW2Ake3NlbGYuYXBwLnR5cGV9SW5pdGBdO1xyXG4gICAgICAgICAgICAgIGlmKGluaXRGdW5jKSBpbml0RnVuYygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcGVuKCkge1xyXG4gICAgICAgICAgdGhpcy5nZXREYXRhKClcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9zZSgpIHtcclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZXJuaWVyQ2FsaXBlckluaXQoKSB7XHJcbiAgICAgICAgICBsZXQgdGVtcExlZnQgPSAwO1xyXG4gICAgICAgICAgbGV0IG1vdXNlTGVmdCA9IDA7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMudmVybmllckNhbGlwZXIuYW5zd2VyID0gMDtcclxuICAgICAgICAgIGlmKHRoaXMudmVybmllckNhbGlwZXIuaW5pdCkgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IF90aGlzLiRyZWZzLmJ1dHRvbjtcclxuICAgICAgICAgICAgY29uc3QgZ2V0WCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZS5zY3JlZW5YID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlLnRvdWNoZXNbMF0uc2NyZWVuWDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGUuc2NyZWVuWDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTW91c2VEb3duID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg5oyJ5LiLYCwgZSk7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIG1vdXNlTGVmdCA9IGdldFgoZSk7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlVXAgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDmiqzotbdgLCBlKTtcclxuICAgICAgICAgICAgICBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHRlbXBMZWZ0ID0gX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlTW92ZSA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOenu+WKqGAsIGUpO1xyXG5cclxuICAgICAgICAgICAgICBpZighc2VsZWN0ZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgPSB0ZW1wTGVmdCArIGdldFgoZSkgLSBtb3VzZUxlZnQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uTW91c2VEb3duKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtkYXRhOiB2ZXJpZmljYXRpb25EYXRhLCBhbnN3ZXJ9ID0gdGhpc1t0aGlzLnR5cGVdO1xyXG4gICAgICAgICAgdmVyaWZpY2F0aW9uRGF0YS5hbnN3ZXIgPSBhbnN3ZXI7XHJcbiAgICAgICAgICBua2NBUEkoYC92ZXJpZmljYXRpb25zYCwgJ1BPU1QnLCB7XHJcbiAgICAgICAgICAgIHZlcmlmaWNhdGlvbkRhdGFcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayh7XHJcbiAgICAgICAgICAgICAgICBzZWNyZXQ6IGRhdGEuc2VjcmV0XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZXJyKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5nZXREYXRhKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBvcGVuKGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLmFwcC5vcGVuKCk7XHJcbiAgfVxyXG4gIGNsb3NlKCkge1xyXG4gICAgdGhpcy5hcHAuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5OS0MubW9kdWxlcy5WZXJpZmljYXRpb25zID0gVmVyaWZpY2F0aW9ucztcclxuIl19
