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
        error: '',
        vernierCaliper: {
          init: false,
          answer: 0,
          data: {
            question: '',
            backgroundColor: '',
            mainImageBase64: '',
            secondaryImageBase64: ''
          }
        },
        touchCaptcha: {
          answer: [],
          data: {
            question: "",
            image: {
              base64: "",
              width: 0,
              height: 0
            }
          }
        }
      },
      methods: {
        getData: function getData() {
          var showModal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
          this.error = '';
          return nkcAPI("/verifications", 'GET').then(function (data) {
            if (data.verificationData.type === 'unEnabled') {
              return self.done({
                secret: data.verificationData.type
              });
            }

            if (showModal) {
              self.dom.modal('show');
            }

            self.app.type = data.verificationData.type;
            self.app[self.app.type].data = data.verificationData;
            var initFunc = self.app["".concat(self.app.type, "Init")];
            if (initFunc) initFunc();
          })["catch"](function (err) {
            console.log(err); // sweetError(err);

            self.app.error = err.error || err.message || err;
            self.app.type = 'error';

            if (showModal) {
              self.dom.modal('show');
            }
          });
        },
        close: function close() {
          self.close();
        },
        vernierCaliperInit: function vernierCaliperInit() {
          var _this2 = this;

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
            var _this2$$refs = _this2.$refs,
                moveLeft = _this2$$refs.moveLeft,
                moveRight = _this2$$refs.moveRight;

            moveLeft.onclick = function () {
              _this.vernierCaliper.answer--;
              _this.vernierCaliper.tempLeft = _this.vernierCaliper.answer;
            };

            moveRight.onclick = function () {
              _this.vernierCaliper.answer++;
              _this.vernierCaliper.tempLeft = _this.vernierCaliper.answer;
            };
          }, 300);
        },
        touchCaptchaInit: function touchCaptchaInit() {
          var self = this;
          this.touchCaptcha.answer.length = 0;
        },
        touchCaptchaClick: function touchCaptchaClick(e) {
          var offsetX = e.offsetX,
              offsetY = e.offsetY,
              target = e.target;
          if (this.touchCaptcha.answer.length === 3) return;
          this.touchCaptcha.answer.push({
            x: offsetX,
            y: offsetY,
            w: target.width,
            h: target.height
          });
        },
        submit: function submit() {
          var _this$this$type = this[this.type],
              verificationData = _this$this$type.data,
              answer = _this$this$type.answer;
          verificationData.answer = answer;
          nkcAPI("/verifications", 'POST', {
            verificationData: verificationData
          }).then(function (data) {
            self.done({
              secret: data.secret
            });
            self.close();
          })["catch"](function (err) {
            console.log(err);
            screenTopWarning(err);
          });
        }
      }
    });
  }

  _createClass(Verifications, [{
    key: "open",
    value: function open(callback) {
      var _this3 = this;

      if (callback) {
        this.resolve = undefined;
        this.reject = undefined;
        this.callback = callback;
        this.app.getData(true);
      } else {
        return new Promise(function (resolve, reject) {
          _this3.resolve = resolve;
          _this3.reject = reject;
          _this3.callback = undefined;

          _this3.app.getData(true);
        });
      }
    }
  }, {
    key: "close",
    value: function close() {
      var err = new Error('验证失败');

      if (this.callback) {
        this.callback(err);
      } else {
        this.reject(err);
      }

      this.dom.modal('hide');
    }
  }, {
    key: "done",
    value: function done(res) {
      if (this.callback) {
        this.callback(undefined, res);
      } else {
        this.resolve(res);
      }
    }
  }]);

  return Verifications;
}();

NKC.modules.Verifications = Verifications;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLEtBQUssRUFBRSxFQUZIO0FBR0osUUFBQSxjQUFjLEVBQUU7QUFDZCxVQUFBLElBQUksRUFBRSxLQURRO0FBRWQsVUFBQSxNQUFNLEVBQUUsQ0FGTTtBQUdkLFVBQUEsSUFBSSxFQUFFO0FBQ0osWUFBQSxRQUFRLEVBQUUsRUFETjtBQUVKLFlBQUEsZUFBZSxFQUFFLEVBRmI7QUFHSixZQUFBLGVBQWUsRUFBRSxFQUhiO0FBSUosWUFBQSxvQkFBb0IsRUFBRTtBQUpsQjtBQUhRLFNBSFo7QUFhSixRQUFBLFlBQVksRUFBRTtBQUNaLFVBQUEsTUFBTSxFQUFFLEVBREk7QUFFWixVQUFBLElBQUksRUFBRTtBQUNKLFlBQUEsUUFBUSxFQUFFLEVBRE47QUFFSixZQUFBLEtBQUssRUFBRTtBQUNMLGNBQUEsTUFBTSxFQUFFLEVBREg7QUFFTCxjQUFBLEtBQUssRUFBRSxDQUZGO0FBR0wsY0FBQSxNQUFNLEVBQUU7QUFISDtBQUZIO0FBRk07QUFiVixPQUZX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ZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgVmVyaWZpY2F0aW9ucyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuZG9tID0gJChcIiNtb2R1bGVWZXJpZmljYXRpb25zXCIpO1xyXG4gICAgc2VsZi5kb20ubW9kYWwoe1xyXG4gICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcclxuICAgIH0pO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6ICcjbW9kdWxlVmVyaWZpY2F0aW9uc0FwcCcsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICBlcnJvcjogJycsXHJcbiAgICAgICAgdmVybmllckNhbGlwZXI6IHtcclxuICAgICAgICAgIGluaXQ6IGZhbHNlLFxyXG4gICAgICAgICAgYW5zd2VyOiAwLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBxdWVzdGlvbjogJycsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJycsXHJcbiAgICAgICAgICAgIG1haW5JbWFnZUJhc2U2NDogJycsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUltYWdlQmFzZTY0OiAnJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG91Y2hDYXB0Y2hhOiB7XHJcbiAgICAgICAgICBhbnN3ZXI6IFtdLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBxdWVzdGlvbjogXCJcIixcclxuICAgICAgICAgICAgaW1hZ2U6IHtcclxuICAgICAgICAgICAgICBiYXNlNjQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgd2lkdGg6IDAsXHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBnZXREYXRhKHNob3dNb2RhbCA9IGZhbHNlKSB7XHJcbiAgICAgICAgICB0aGlzLmVycm9yID0gJyc7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvdmVyaWZpY2F0aW9uc2AsICdHRVQnKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBpZihkYXRhLnZlcmlmaWNhdGlvbkRhdGEudHlwZSA9PT0gJ3VuRW5hYmxlZCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmRvbmUoe3NlY3JldDogZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGV9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYoc2hvd01vZGFsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBzZWxmLmFwcC50eXBlID0gZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGU7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHBbc2VsZi5hcHAudHlwZV0uZGF0YSA9IGRhdGEudmVyaWZpY2F0aW9uRGF0YTtcclxuICAgICAgICAgICAgICBjb25zdCBpbml0RnVuYyA9IHNlbGYuYXBwW2Ake3NlbGYuYXBwLnR5cGV9SW5pdGBdO1xyXG4gICAgICAgICAgICAgIGlmKGluaXRGdW5jKSBpbml0RnVuYygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIC8vIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5lcnJvciA9IGVyci5lcnJvciB8fCBlcnIubWVzc2FnZSB8fCBlcnI7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAudHlwZSA9ICdlcnJvcic7XHJcbiAgICAgICAgICAgICAgaWYoc2hvd01vZGFsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9zZSgpIHtcclxuICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZlcm5pZXJDYWxpcGVySW5pdCgpIHtcclxuICAgICAgICAgIGxldCB0ZW1wTGVmdCA9IDA7XHJcbiAgICAgICAgICBsZXQgbW91c2VMZWZ0ID0gMDtcclxuICAgICAgICAgIGxldCBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgPSAwO1xyXG4gICAgICAgICAgaWYodGhpcy52ZXJuaWVyQ2FsaXBlci5pbml0KSByZXR1cm47XHJcbiAgICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gX3RoaXMuJHJlZnMuYnV0dG9uO1xyXG4gICAgICAgICAgICBjb25zdCBnZXRYID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICBpZihlLnNjcmVlblggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGUudG91Y2hlc1swXS5zY3JlZW5YO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZS5zY3JlZW5YO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG9uTW91c2VEb3duID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg5oyJ5LiLYCwgZSk7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIG1vdXNlTGVmdCA9IGdldFgoZSk7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlVXAgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDmiqzotbdgLCBlKTtcclxuICAgICAgICAgICAgICBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHRlbXBMZWZ0ID0gX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlTW92ZSA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOenu+WKqGAsIGUpO1xyXG5cclxuICAgICAgICAgICAgICBpZighc2VsZWN0ZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgPSB0ZW1wTGVmdCArIGdldFgoZSkgLSBtb3VzZUxlZnQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uTW91c2VEb3duKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB7bW92ZUxlZnQsIG1vdmVSaWdodH0gPSB0aGlzLiRyZWZzO1xyXG4gICAgICAgICAgICBtb3ZlTGVmdC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgIF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlciAtLTtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci50ZW1wTGVmdCA9IF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlcjtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbW92ZVJpZ2h0Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyICsrO1xyXG4gICAgICAgICAgICAgIF90aGlzLnZlcm5pZXJDYWxpcGVyLnRlbXBMZWZ0ID0gX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b3VjaENhcHRjaGFJbml0KCkge1xyXG4gICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgdGhpcy50b3VjaENhcHRjaGEuYW5zd2VyLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b3VjaENhcHRjaGFDbGljayhlKSB7XHJcbiAgICAgICAgICBsZXQge29mZnNldFgsIG9mZnNldFksIHRhcmdldH0gPSBlO1xyXG4gICAgICAgICAgaWYodGhpcy50b3VjaENhcHRjaGEuYW5zd2VyLmxlbmd0aCA9PT0gMykgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy50b3VjaENhcHRjaGEuYW5zd2VyLnB1c2goe1xyXG4gICAgICAgICAgICB4OiBvZmZzZXRYLFxyXG4gICAgICAgICAgICB5OiBvZmZzZXRZLFxyXG4gICAgICAgICAgICB3OiB0YXJnZXQud2lkdGgsXHJcbiAgICAgICAgICAgIGg6IHRhcmdldC5oZWlnaHRcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgY29uc3Qge2RhdGE6IHZlcmlmaWNhdGlvbkRhdGEsIGFuc3dlcn0gPSB0aGlzW3RoaXMudHlwZV07XHJcbiAgICAgICAgICB2ZXJpZmljYXRpb25EYXRhLmFuc3dlciA9IGFuc3dlcjtcclxuICAgICAgICAgIG5rY0FQSShgL3ZlcmlmaWNhdGlvbnNgLCAnUE9TVCcsIHtcclxuICAgICAgICAgICAgdmVyaWZpY2F0aW9uRGF0YVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmRvbmUoe1xyXG4gICAgICAgICAgICAgICAgc2VjcmV0OiBkYXRhLnNlY3JldFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICBzY3JlZW5Ub3BXYXJuaW5nKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBvcGVuKGNhbGxiYWNrKSB7XHJcbiAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICB0aGlzLnJlc29sdmUgPSB1bmRlZmluZWQ7XHJcbiAgICAgIHRoaXMucmVqZWN0ID0gdW5kZWZpbmVkO1xyXG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgIHRoaXMuYXBwLmdldERhdGEodHJ1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XHJcbiAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLmFwcC5nZXREYXRhKHRydWUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xvc2UoKSB7XHJcbiAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoJ+mqjOivgeWksei0pScpO1xyXG4gICAgaWYodGhpcy5jYWxsYmFjaykge1xyXG4gICAgICB0aGlzLmNhbGxiYWNrKGVycik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlamVjdChlcnIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kb20ubW9kYWwoJ2hpZGUnKTtcclxuICB9XHJcbiAgZG9uZShyZXMpIHtcclxuICAgIGlmKHRoaXMuY2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5jYWxsYmFjayh1bmRlZmluZWQsIHJlcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc29sdmUocmVzKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5OS0MubW9kdWxlcy5WZXJpZmljYXRpb25zID0gVmVyaWZpY2F0aW9ucztcclxuIl19
