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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLGNBQWMsRUFBRTtBQUNkLFVBQUEsSUFBSSxFQUFFLEtBRFE7QUFFZCxVQUFBLE1BQU0sRUFBRSxDQUZNO0FBR2QsVUFBQSxJQUFJLEVBQUU7QUFDSixZQUFBLFFBQVEsRUFBRSxFQUROO0FBRUosWUFBQSxlQUFlLEVBQUUsRUFGYjtBQUdKLFlBQUEsZUFBZSxFQUFFLEVBSGI7QUFJSixZQUFBLG9CQUFvQixFQUFFO0FBSmxCO0FBSFE7QUFGWixPQUZXO0FBZWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxPQURPLHFCQUNvQjtBQUFBLGNBQW5CLFNBQW1CLHVFQUFQLEtBQU87O0FBQ3pCOzs7QUFHQSxpQkFBTyxNQUFNLG1CQUFtQixLQUFuQixDQUFOLENBQ0osSUFESSxDQUNDLFVBQUEsSUFBSSxFQUFJO0FBQ1osZ0JBQUcsSUFBSSxDQUFDLGdCQUFMLENBQXNCLElBQXRCLEtBQStCLFdBQWxDLEVBQStDO0FBQzdDLHFCQUFPLElBQUksQ0FBQyxJ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c291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBWZXJpZmljYXRpb25zIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZVZlcmlmaWNhdGlvbnNcIik7XHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogJyNtb2R1bGVWZXJpZmljYXRpb25zQXBwJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIHZlcm5pZXJDYWxpcGVyOiB7XHJcbiAgICAgICAgICBpbml0OiBmYWxzZSxcclxuICAgICAgICAgIGFuc3dlcjogMCxcclxuICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgcXVlc3Rpb246ICcnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcnLFxyXG4gICAgICAgICAgICBtYWluSW1hZ2VCYXNlNjQ6ICcnLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJbWFnZUJhc2U2NDogJydcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBnZXREYXRhKHNob3dNb2RhbCA9IGZhbHNlKSB7XHJcbiAgICAgICAgICAvKmlmKHNob3dNb2RhbCkge1xyXG4gICAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgfSovXHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvdmVyaWZpY2F0aW9uc2AsICdHRVQnKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBpZihkYXRhLnZlcmlmaWNhdGlvbkRhdGEudHlwZSA9PT0gJ3VuRW5hYmxlZCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmRvbmUoe3NlY3JldDogZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGV9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYoc2hvd01vZGFsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBzZWxmLmFwcC50eXBlID0gZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGU7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHBbc2VsZi5hcHAudHlwZV0uZGF0YSA9IGRhdGEudmVyaWZpY2F0aW9uRGF0YTtcclxuICAgICAgICAgICAgICBjb25zdCBpbml0RnVuYyA9IHNlbGYuYXBwW2Ake3NlbGYuYXBwLnR5cGV9SW5pdGBdO1xyXG4gICAgICAgICAgICAgIGlmKGluaXRGdW5jKSBpbml0RnVuYygpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9zZSgpIHtcclxuICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZlcm5pZXJDYWxpcGVySW5pdCgpIHtcclxuICAgICAgICAgIGxldCB0ZW1wTGVmdCA9IDA7XHJcbiAgICAgICAgICBsZXQgbW91c2VMZWZ0ID0gMDtcclxuICAgICAgICAgIGxldCBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgPSAwO1xyXG4gICAgICAgICAgaWYodGhpcy52ZXJuaWVyQ2FsaXBlci5pbml0KSByZXR1cm47XHJcbiAgICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYnV0dG9uID0gX3RoaXMuJHJlZnMuYnV0dG9uO1xyXG4gICAgICAgICAgICBjb25zdCBnZXRYID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICBpZihlLnNjcmVlblggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGUudG91Y2hlc1swXS5zY3JlZW5YO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZS5zY3JlZW5YO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG9uTW91c2VEb3duID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg5oyJ5LiLYCwgZSk7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIG1vdXNlTGVmdCA9IGdldFgoZSk7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlVXAgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDmiqzotbdgLCBlKTtcclxuICAgICAgICAgICAgICBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHRlbXBMZWZ0ID0gX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlTW92ZSA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOenu+WKqGAsIGUpO1xyXG5cclxuICAgICAgICAgICAgICBpZighc2VsZWN0ZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgPSB0ZW1wTGVmdCArIGdldFgoZSkgLSBtb3VzZUxlZnQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uTW91c2VEb3duKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB7bW92ZUxlZnQsIG1vdmVSaWdodH0gPSB0aGlzLiRyZWZzO1xyXG4gICAgICAgICAgICBtb3ZlTGVmdC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgIF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlciAtLTtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci50ZW1wTGVmdCA9IF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlcjtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbW92ZVJpZ2h0Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyICsrO1xyXG4gICAgICAgICAgICAgIF90aGlzLnZlcm5pZXJDYWxpcGVyLnRlbXBMZWZ0ID0gX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7ZGF0YTogdmVyaWZpY2F0aW9uRGF0YSwgYW5zd2VyfSA9IHRoaXNbdGhpcy50eXBlXTtcclxuICAgICAgICAgIHZlcmlmaWNhdGlvbkRhdGEuYW5zd2VyID0gYW5zd2VyO1xyXG4gICAgICAgICAgbmtjQVBJKGAvdmVyaWZpY2F0aW9uc2AsICdQT1NUJywge1xyXG4gICAgICAgICAgICB2ZXJpZmljYXRpb25EYXRhXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuZG9uZSh7XHJcbiAgICAgICAgICAgICAgICBzZWNyZXQ6IGRhdGEuc2VjcmV0XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZXJyKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5nZXREYXRhKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBvcGVuKGNhbGxiYWNrKSB7XHJcbiAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICB0aGlzLnJlc29sdmUgPSB1bmRlZmluZWQ7XHJcbiAgICAgIHRoaXMucmVqZWN0ID0gdW5kZWZpbmVkO1xyXG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgIHRoaXMuYXBwLmdldERhdGEodHJ1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XHJcbiAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLmFwcC5nZXREYXRhKHRydWUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xvc2UoKSB7XHJcbiAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoJ+mqjOivgeWksei0pScpO1xyXG4gICAgaWYodGhpcy5jYWxsYmFjaykge1xyXG4gICAgICB0aGlzLmNhbGxiYWNrKGVycik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlamVjdChlcnIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5kb20ubW9kYWwoJ2hpZGUnKTtcclxuICB9XHJcbiAgZG9uZShyZXMpIHtcclxuICAgIGlmKHRoaXMuY2FsbGJhY2spIHtcclxuICAgICAgdGhpcy5jYWxsYmFjayh1bmRlZmluZWQsIHJlcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlc29sdmUocmVzKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5OS0MubW9kdWxlcy5WZXJpZmljYXRpb25zID0gVmVyaWZpY2F0aW9ucztcclxuIl19
