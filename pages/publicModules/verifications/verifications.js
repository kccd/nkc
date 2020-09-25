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
          var showModal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          /*if(showModal) {
            self.dom.modal('show');
          }*/
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLGNBQWMsRUFBRTtBQUNkLFVBQUEsSUFBSSxFQUFFLEtBRFE7QUFFZCxVQUFBLE1BQU0sRUFBRSxDQUZNO0FBR2QsVUFBQSxJQUFJLEVBQUU7QUFDSixZQUFBLFFBQVEsRUFBRSxFQUROO0FBRUosWUFBQSxlQUFlLEVBQUUsRUFGYjtBQUdKLFlBQUEsZUFBZSxFQUFFLEVBSGI7QUFJSixZQUFBLG9CQUFvQixFQUFFO0FBSmxCO0FBSFEsU0FGWjtBQVlKLFFBQUEsWUFBWSxFQUFFO0FBQ1osVUFBQSxNQUFNLEVBQUUsRUFESTtBQUVaLFVBQUEsSUFBSSxFQUFFO0FBQ0osWUFBQSxRQUFRLEVBQUUsRUFETjtBQUVKLFlBQUEsS0FBSyxFQUFFO0FBQ0wsY0FBQSxNQUFNLEVBQUUsRUFESDtBQUVMLGNBQUEsS0FBSyxFQUFFLENBRkY7QUFHTCxjQUFBLE1BQU0sRUFBRTtBQUhIO0FBRkg7QUFGTTtBQVpWLE9BRlc7QUEwQmpCLE1BQUEsT0FBTyxFQUFFO0FB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QWMsU0FBZDtBQUNBLGFBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLGFBQUssR0FBTCxDQUFTLE9BQVQsQ0FBaUIsSUFBakI7QUFDRCxPQUxELE1BS087QUFDTCxlQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdEMsVUFBQSxNQUFJLENBQUMsT0FBTCxHQUFlLE9BQWY7QUFDQSxVQUFBLE1BQUksQ0FBQyxNQUFMLEdBQWMsTUFBZDtBQUNBLFVBQUEsTUFBSSxDQUFDLFFBQUwsR0FBZ0IsU0FBaEI7O0FBQ0EsVUFBQSxNQUFJLENBQUMsR0FBTCxDQUFTLE9BQVQsQ0FBaUIsSUFBakI7QUFDRCxTQUxNLENBQVA7QUFNRDtBQUNGOzs7NEJBQ087QUFDTixVQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUosQ0FBVSxNQUFWLENBQVo7O0FBQ0EsVUFBRyxLQUFLLFFBQVIsRUFBa0I7QUFDaEIsYUFBSyxRQUFMLENBQWMsR0FBZDtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUssTUFBTCxDQUFZLEdBQVo7QUFDRDs7QUFDRCxXQUFLLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNEOzs7eUJBQ0ksRyxFQUFLO0FBQ1IsVUFBRyxLQUFLLFFBQVIsRUFBa0I7QUFDaEIsYUFBSyxRQUFMLENBQWMsU0FBZCxFQUF5QixHQUF6QjtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUssT0FBTCxDQUFhLEdBQWI7QUFDRDtBQUNGOzs7Ozs7QUFJSCxHQUFHLENBQUMsT0FBSixDQUFZLGFBQVosR0FBNEIsYUFBNUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBWZXJpZmljYXRpb25zIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZVZlcmlmaWNhdGlvbnNcIik7XHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogJyNtb2R1bGVWZXJpZmljYXRpb25zQXBwJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIHZlcm5pZXJDYWxpcGVyOiB7XHJcbiAgICAgICAgICBpbml0OiBmYWxzZSxcclxuICAgICAgICAgIGFuc3dlcjogMCxcclxuICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgcXVlc3Rpb246ICcnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcnLFxyXG4gICAgICAgICAgICBtYWluSW1hZ2VCYXNlNjQ6ICcnLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJbWFnZUJhc2U2NDogJydcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvdWNoQ2FwdGNoYToge1xyXG4gICAgICAgICAgYW5zd2VyOiBbXSxcclxuICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgcXVlc3Rpb246IFwiXCIsXHJcbiAgICAgICAgICAgIGltYWdlOiB7XHJcbiAgICAgICAgICAgICAgYmFzZTY0OiBcIlwiLFxyXG4gICAgICAgICAgICAgIHdpZHRoOiAwLFxyXG4gICAgICAgICAgICAgIGhlaWdodDogMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgZ2V0RGF0YShzaG93TW9kYWwgPSBmYWxzZSkge1xyXG4gICAgICAgICAgLyppZihzaG93TW9kYWwpIHtcclxuICAgICAgICAgICAgc2VsZi5kb20ubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3ZlcmlmaWNhdGlvbnNgLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGUgPT09ICd1bkVuYWJsZWQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5kb25lKHtzZWNyZXQ6IGRhdGEudmVyaWZpY2F0aW9uRGF0YS50eXBlfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmKHNob3dNb2RhbCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kb20ubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAudHlwZSA9IGRhdGEudmVyaWZpY2F0aW9uRGF0YS50eXBlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwW3NlbGYuYXBwLnR5cGVdLmRhdGEgPSBkYXRhLnZlcmlmaWNhdGlvbkRhdGE7XHJcbiAgICAgICAgICAgICAgY29uc3QgaW5pdEZ1bmMgPSBzZWxmLmFwcFtgJHtzZWxmLmFwcC50eXBlfUluaXRgXTtcclxuICAgICAgICAgICAgICBpZihpbml0RnVuYykgaW5pdEZ1bmMoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmNsb3NlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZXJuaWVyQ2FsaXBlckluaXQoKSB7XHJcbiAgICAgICAgICBsZXQgdGVtcExlZnQgPSAwO1xyXG4gICAgICAgICAgbGV0IG1vdXNlTGVmdCA9IDA7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMudmVybmllckNhbGlwZXIuYW5zd2VyID0gMDtcclxuICAgICAgICAgIGlmKHRoaXMudmVybmllckNhbGlwZXIuaW5pdCkgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IF90aGlzLiRyZWZzLmJ1dHRvbjtcclxuICAgICAgICAgICAgY29uc3QgZ2V0WCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZS5zY3JlZW5YID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlLnRvdWNoZXNbMF0uc2NyZWVuWDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGUuc2NyZWVuWDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlRG93biA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOaMieS4i2AsIGUpO1xyXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICBtb3VzZUxlZnQgPSBnZXRYKGUpO1xyXG4gICAgICAgICAgICAgIHNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Nb3VzZVVwID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg5oqs6LW3YCwgZSk7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB0ZW1wTGVmdCA9IF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlcjtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDnp7vliqhgLCBlKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYoIXNlbGVjdGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyID0gdGVtcExlZnQgKyBnZXRYKGUpIC0gbW91c2VMZWZ0O1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvbk1vdXNlRG93bik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qge21vdmVMZWZ0LCBtb3ZlUmlnaHR9ID0gdGhpcy4kcmVmcztcclxuICAgICAgICAgICAgbW92ZUxlZnQub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgLS07XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIudGVtcExlZnQgPSBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXI7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIG1vdmVSaWdodC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgIF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlciArKztcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci50ZW1wTGVmdCA9IF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlcjtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG91Y2hDYXB0Y2hhSW5pdCgpIHtcclxuICAgICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICAgIHRoaXMudG91Y2hDYXB0Y2hhLmFuc3dlci5sZW5ndGggPSAwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG91Y2hDYXB0Y2hhQ2xpY2soZSkge1xyXG4gICAgICAgICAgbGV0IHtvZmZzZXRYLCBvZmZzZXRZLCB0YXJnZXR9ID0gZTtcclxuICAgICAgICAgIGlmKHRoaXMudG91Y2hDYXB0Y2hhLmFuc3dlci5sZW5ndGggPT09IDMpIHJldHVybjtcclxuICAgICAgICAgIHRoaXMudG91Y2hDYXB0Y2hhLmFuc3dlci5wdXNoKHtcclxuICAgICAgICAgICAgeDogb2Zmc2V0WCxcclxuICAgICAgICAgICAgeTogb2Zmc2V0WSxcclxuICAgICAgICAgICAgdzogdGFyZ2V0LndpZHRoLFxyXG4gICAgICAgICAgICBoOiB0YXJnZXQuaGVpZ2h0XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtkYXRhOiB2ZXJpZmljYXRpb25EYXRhLCBhbnN3ZXJ9ID0gdGhpc1t0aGlzLnR5cGVdO1xyXG4gICAgICAgICAgdmVyaWZpY2F0aW9uRGF0YS5hbnN3ZXIgPSBhbnN3ZXI7XHJcbiAgICAgICAgICBua2NBUEkoYC92ZXJpZmljYXRpb25zYCwgJ1BPU1QnLCB7XHJcbiAgICAgICAgICAgIHZlcmlmaWNhdGlvbkRhdGFcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5kb25lKHtcclxuICAgICAgICAgICAgICAgIHNlY3JldDogZGF0YS5zZWNyZXRcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzZWxmLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgc2NyZWVuVG9wV2FybmluZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmdldERhdGEoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIG9wZW4oY2FsbGJhY2spIHtcclxuICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgdGhpcy5yZWplY3QgPSB1bmRlZmluZWQ7XHJcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgdGhpcy5hcHAuZ2V0RGF0YSh0cnVlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcclxuICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuYXBwLmdldERhdGEodHJ1ZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbG9zZSgpIHtcclxuICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcign6aqM6K+B5aSx6LSlJyk7XHJcbiAgICBpZih0aGlzLmNhbGxiYWNrKSB7XHJcbiAgICAgIHRoaXMuY2FsbGJhY2soZXJyKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVqZWN0KGVycik7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRvbS5tb2RhbCgnaGlkZScpO1xyXG4gIH1cclxuICBkb25lKHJlcykge1xyXG4gICAgaWYodGhpcy5jYWxsYmFjaykge1xyXG4gICAgICB0aGlzLmNhbGxiYWNrKHVuZGVmaW5lZCwgcmVzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVzb2x2ZShyZXMpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcbk5LQy5tb2R1bGVzLlZlcmlmaWNhdGlvbnMgPSBWZXJpZmljYXRpb25zO1xyXG4iXX0=
