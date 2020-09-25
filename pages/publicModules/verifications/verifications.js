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
            x: offsetX - 10,
            y: offsetY - 10,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLGNBQWMsRUFBRTtBQUNkLFVBQUEsSUFBSSxFQUFFLEtBRFE7QUFFZCxVQUFBLE1BQU0sRUFBRSxDQUZNO0FBR2QsVUFBQSxJQUFJLEVBQUU7QUFDSixZQUFBLFFBQVEsRUFBRSxFQUROO0FBRUosWUFBQSxlQUFlLEVBQUUsRUFGYjtBQUdKLFlBQUEsZUFBZSxFQUFFLEVBSGI7QUFJSixZQUFBLG9CQUFvQixFQUFFO0FBSmxCO0FBSFEsU0FGWjtBQVlKLFFBQUEsWUFBWSxFQUFFO0FBQ1osVUFBQSxNQUFNLEVBQUUsRUFESTtBQUVaLFVBQUEsSUFBSSxFQUFFO0FBQ0osWUFBQSxRQUFRLEVBQUUsRUFETjtBQUVKLFlBQUEsS0FBSyxFQUFFO0FBQ0wsY0FBQSxNQUFNLEVBQUUsRUFESDtBQUVMLGNBQUEsS0FBSyxFQUFFLENBRkY7QUFHTCxjQUFBLE1BQU0sRUFBRTtBQUhIO0FBRkg7QUFGTTtBQVpWLE9BRlc7QUEwQmpCLE1BQUEsT0FBTyxFQUFFO0FB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QUdHLElBSEgsQ0FHUSxVQUFDLElBQUQsRUFBVTtBQUNkLFlBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYztBQUNaLGNBQUEsTUFBTSxFQUFFLElBQUksQ0FBQztBQURELGFBQWQ7QUFHQSxZQUFBLElBQUksQ0FBQyxLQUFMO0FBQ0QsV0FSSCxXQVNTLFVBQUEsR0FBRyxFQUFJO0FBQ1osWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7QUFDQSxZQUFBLGdCQUFnQixDQUFDLEdBQUQsQ0FBaEI7QUFDQSxZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVDtBQUNELFdBYkg7QUFjRDtBQWpHTTtBQTFCUSxLQUFSLENBQVg7QUE4SEQ7Ozs7eUJBQ0ksUSxFQUFVO0FBQ2IsV0FBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsV0FBSyxHQUFMLENBQVMsSUFBVDtBQUNEOzs7NEJBQ087QUFDTixXQUFLLEdBQUwsQ0FBUyxLQUFUO0FBQ0Q7Ozs7OztBQUlILEdBQUcsQ0FBQyxPQUFKLENBQVksYUFBWixHQUE0QixhQUE1QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIFZlcmlmaWNhdGlvbnMge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlVmVyaWZpY2F0aW9uc1wiKTtcclxuICAgIHNlbGYuZG9tLm1vZGFsKHtcclxuICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgIGJhY2tkcm9wOiBcInN0YXRpY1wiXHJcbiAgICB9KTtcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiAnI21vZHVsZVZlcmlmaWNhdGlvbnNBcHAnLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgdHlwZTogJycsXHJcbiAgICAgICAgdmVybmllckNhbGlwZXI6IHtcclxuICAgICAgICAgIGluaXQ6IGZhbHNlLFxyXG4gICAgICAgICAgYW5zd2VyOiAwLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBxdWVzdGlvbjogJycsXHJcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJycsXHJcbiAgICAgICAgICAgIG1haW5JbWFnZUJhc2U2NDogJycsXHJcbiAgICAgICAgICAgIHNlY29uZGFyeUltYWdlQmFzZTY0OiAnJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG91Y2hDYXB0Y2hhOiB7XHJcbiAgICAgICAgICBhbnN3ZXI6IFtdLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBxdWVzdGlvbjogXCJcIixcclxuICAgICAgICAgICAgaW1hZ2U6IHtcclxuICAgICAgICAgICAgICBiYXNlNjQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgd2lkdGg6IDAsXHJcbiAgICAgICAgICAgICAgaGVpZ2h0OiAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBnZXREYXRhKCkge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3ZlcmlmaWNhdGlvbnNgLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAudHlwZSA9IGRhdGEudmVyaWZpY2F0aW9uRGF0YS50eXBlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwW3NlbGYuYXBwLnR5cGVdLmRhdGEgPSBkYXRhLnZlcmlmaWNhdGlvbkRhdGE7XHJcbiAgICAgICAgICAgICAgY29uc3QgaW5pdEZ1bmMgPSBzZWxmLmFwcFtgJHtzZWxmLmFwcC50eXBlfUluaXRgXTtcclxuICAgICAgICAgICAgICBpZihpbml0RnVuYykgaW5pdEZ1bmMoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3BlbigpIHtcclxuICAgICAgICAgIHRoaXMuZ2V0RGF0YSgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmVybmllckNhbGlwZXJJbml0KCkge1xyXG4gICAgICAgICAgbGV0IHRlbXBMZWZ0ID0gMDtcclxuICAgICAgICAgIGxldCBtb3VzZUxlZnQgPSAwO1xyXG4gICAgICAgICAgbGV0IHNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlciA9IDA7XHJcbiAgICAgICAgICBpZih0aGlzLnZlcm5pZXJDYWxpcGVyLmluaXQpIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBfdGhpcy4kcmVmcy5idXR0b247XHJcbiAgICAgICAgICAgIGNvbnN0IGdldFggPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmKGUuc2NyZWVuWCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZS50b3VjaGVzWzBdLnNjcmVlblg7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlLnNjcmVlblg7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlRG93biA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOaMieS4i2AsIGUpO1xyXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICBtb3VzZUxlZnQgPSBnZXRYKGUpO1xyXG4gICAgICAgICAgICAgIHNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Nb3VzZVVwID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg5oqs6LW3YCwgZSk7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB0ZW1wTGVmdCA9IF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlcjtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDnp7vliqhgLCBlKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYoIXNlbGVjdGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyID0gdGVtcExlZnQgKyBnZXRYKGUpIC0gbW91c2VMZWZ0O1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvbk1vdXNlRG93bik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b3VjaENhcHRjaGFJbml0KCkge1xyXG4gICAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgdGhpcy50b3VjaENhcHRjaGEuYW5zd2VyLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b3VjaENhcHRjaGFDbGljayhlKSB7XHJcbiAgICAgICAgICBsZXQge29mZnNldFgsIG9mZnNldFksIHRhcmdldH0gPSBlO1xyXG4gICAgICAgICAgaWYodGhpcy50b3VjaENhcHRjaGEuYW5zd2VyLmxlbmd0aCA9PT0gMykgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy50b3VjaENhcHRjaGEuYW5zd2VyLnB1c2goe1xyXG4gICAgICAgICAgICB4OiBvZmZzZXRYIC0gMTAsXHJcbiAgICAgICAgICAgIHk6IG9mZnNldFkgLSAxMCxcclxuICAgICAgICAgICAgdzogdGFyZ2V0LndpZHRoLFxyXG4gICAgICAgICAgICBoOiB0YXJnZXQuaGVpZ2h0XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtkYXRhOiB2ZXJpZmljYXRpb25EYXRhLCBhbnN3ZXJ9ID0gdGhpc1t0aGlzLnR5cGVdO1xyXG4gICAgICAgICAgdmVyaWZpY2F0aW9uRGF0YS5hbnN3ZXIgPSBhbnN3ZXI7XHJcbiAgICAgICAgICBua2NBUEkoYC92ZXJpZmljYXRpb25zYCwgJ1BPU1QnLCB7XHJcbiAgICAgICAgICAgIHZlcmlmaWNhdGlvbkRhdGFcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayh7XHJcbiAgICAgICAgICAgICAgICBzZWNyZXQ6IGRhdGEuc2VjcmV0XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZXJyKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5nZXREYXRhKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBvcGVuKGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLmFwcC5vcGVuKCk7XHJcbiAgfVxyXG4gIGNsb3NlKCkge1xyXG4gICAgdGhpcy5hcHAuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5OS0MubW9kdWxlcy5WZXJpZmljYXRpb25zID0gVmVyaWZpY2F0aW9ucztcclxuIl19
