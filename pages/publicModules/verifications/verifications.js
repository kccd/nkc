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
          var showModal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          if (showModal) {
            self.dom.modal('show');
          }

          return nkcAPI("/verifications", 'GET').then(function (data) {
            if (data.verificationData.type === 'unEnabled') {
              return self.done({
                secret: data.verificationData.type
              });
            }

            self.app.type = data.verificationData.type;
            self.app[self.app.type].data = data.verificationData;
            var initFunc = self.app["".concat(self.app.type, "Init")];
            if (initFunc) initFunc();
          })["catch"](function (err) {
            console.log(err);
            sweetError(err);
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
            self.app.getData();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLGNBQWMsRUFBRTtBQUNkLFVBQUEsSUFBSSxFQUFFLEtBRFE7QUFFZCxVQUFBLE1BQU0sRUFBRSxDQUZNO0FBR2QsVUFBQSxJQUFJLEVBQUU7QUFDSixZQUFBLFFBQVEsRUFBRSxFQUROO0FBRUosWUFBQSxlQUFlLEVBQUUsRUFGYjtBQUdKLFlBQUEsZUFBZSxFQUFFLEVBSGI7QUFJSixZQUFBLG9CQUFvQixFQUFFO0FBSmxCO0FBSFE7QUFGWixPQUZXO0FBZWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxPQURPLHFCQUNvQjtBQUFBLGNBQW5CLFNBQW1CLHVFQUFQLEtBQU87O0FBQ3pCLGNBQUcsU0FBSCxFQUFjO0FBQ1osWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0Q7O0FBQ0QsaUJBQU8sTUFBTSxtQkFBbUIsS0FBbkIsQ0FBTixDQUNKLElBREksQ0FDQyxVQUFBLElBQUksRUFBSTtBQUNaLGdCQUFHLElBQUks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IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIFZlcmlmaWNhdGlvbnMge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlVmVyaWZpY2F0aW9uc1wiKTtcclxuICAgIHNlbGYuZG9tLm1vZGFsKHtcclxuICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgIGJhY2tkcm9wOiBcInN0YXRpY1wiXHJcbiAgICB9KTtcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiAnI21vZHVsZVZlcmlmaWNhdGlvbnNBcHAnLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgdHlwZTogJycsXHJcbiAgICAgICAgdmVybmllckNhbGlwZXI6IHtcclxuICAgICAgICAgIGluaXQ6IGZhbHNlLFxyXG4gICAgICAgICAgYW5zd2VyOiAwLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBxdWVzdGlvbjogJycsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJycsXHJcbiAgICAgICAgICAgIG1haW5JbWFnZUJhc2U2NDogJycsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUltYWdlQmFzZTY0OiAnJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIGdldERhdGEoc2hvd01vZGFsID0gZmFsc2UpIHtcclxuICAgICAgICAgIGlmKHNob3dNb2RhbCkge1xyXG4gICAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3ZlcmlmaWNhdGlvbnNgLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGUgPT09ICd1bkVuYWJsZWQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5kb25lKHtzZWNyZXQ6IGRhdGEudmVyaWZpY2F0aW9uRGF0YS50eXBlfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnR5cGUgPSBkYXRhLnZlcmlmaWNhdGlvbkRhdGEudHlwZTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcFtzZWxmLmFwcC50eXBlXS5kYXRhID0gZGF0YS52ZXJpZmljYXRpb25EYXRhO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGluaXRGdW5jID0gc2VsZi5hcHBbYCR7c2VsZi5hcHAudHlwZX1Jbml0YF07XHJcbiAgICAgICAgICAgICAgaWYoaW5pdEZ1bmMpIGluaXRGdW5jKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgc3dlZXRFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlKCkge1xyXG4gICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmVybmllckNhbGlwZXJJbml0KCkge1xyXG4gICAgICAgICAgbGV0IHRlbXBMZWZ0ID0gMDtcclxuICAgICAgICAgIGxldCBtb3VzZUxlZnQgPSAwO1xyXG4gICAgICAgICAgbGV0IHNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlciA9IDA7XHJcbiAgICAgICAgICBpZih0aGlzLnZlcm5pZXJDYWxpcGVyLmluaXQpIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBfdGhpcy4kcmVmcy5idXR0b247XHJcbiAgICAgICAgICAgIGNvbnN0IGdldFggPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmKGUuc2NyZWVuWCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZS50b3VjaGVzWzBdLnNjcmVlblg7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlLnNjcmVlblg7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgb25Nb3VzZURvd24gPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDmjInkuItgLCBlKTtcclxuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgbW91c2VMZWZ0ID0gZ2V0WChlKTtcclxuICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTW91c2VVcCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOaKrOi1t2AsIGUpO1xyXG4gICAgICAgICAgICAgIHNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgdGVtcExlZnQgPSBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXI7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTW91c2VNb3ZlID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg56e75YqoYCwgZSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmKCFzZWxlY3RlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlciA9IHRlbXBMZWZ0ICsgZ2V0WChlKSAtIG1vdXNlTGVmdDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Nb3VzZURvd24pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Nb3VzZVVwKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHttb3ZlTGVmdCwgbW92ZVJpZ2h0fSA9IHRoaXMuJHJlZnM7XHJcbiAgICAgICAgICAgIG1vdmVMZWZ0Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyIC0tO1xyXG4gICAgICAgICAgICAgIF90aGlzLnZlcm5pZXJDYWxpcGVyLnRlbXBMZWZ0ID0gX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBtb3ZlUmlnaHQub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgKys7XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIudGVtcExlZnQgPSBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXI7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtkYXRhOiB2ZXJpZmljYXRpb25EYXRhLCBhbnN3ZXJ9ID0gdGhpc1t0aGlzLnR5cGVdO1xyXG4gICAgICAgICAgdmVyaWZpY2F0aW9uRGF0YS5hbnN3ZXIgPSBhbnN3ZXI7XHJcbiAgICAgICAgICBua2NBUEkoYC92ZXJpZmljYXRpb25zYCwgJ1BPU1QnLCB7XHJcbiAgICAgICAgICAgIHZlcmlmaWNhdGlvbkRhdGFcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5kb25lKHtcclxuICAgICAgICAgICAgICAgIHNlY3JldDogZGF0YS5zZWNyZXRcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzZWxmLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgc2NyZWVuVG9wV2FybmluZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmdldERhdGEoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIG9wZW4oY2FsbGJhY2spIHtcclxuICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhpcy5yZWplY3QgPSB1bmRlZmluZWQ7XHJcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgdGhpcy5hcHAuZ2V0RGF0YSh0cnVlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcclxuICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuYXBwLmdldERhdGEodHJ1ZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbG9zZSgpIHtcclxuICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcign6aqM6K+B5aSx6LSlJyk7XHJcbiAgICBpZih0aGlzLmNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMuY2FsbGJhY2soZXJyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVqZWN0KGVycik7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRvbS5tb2RhbCgnaGlkZScpO1xyXG4gIH1cclxuICBkb25lKHJlcykge1xyXG4gICAgaWYodGhpcy5jYWxsYmFjaykge1xyXG4gICAgICB0aGlzLmNhbGxiYWNrKHVuZGVmaW5lZCwgcmVzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzb2x2ZShyZXMpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcbk5LQy5tb2R1bGVzLlZlcmlmaWNhdGlvbnMgPSBWZXJpZmljYXRpb25zO1xyXG4iXX0=
