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
          }).then(function () {
            self.callback({
              verificationData: verificationData
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLGNBQWMsRUFBRTtBQUNkLFVBQUEsSUFBSSxFQUFFLEtBRFE7QUFFZCxVQUFBLE1BQU0sRUFBRSxDQUZNO0FBR2QsVUFBQSxJQUFJLEVBQUU7QUFDSixZQUFBLFFBQVEsRUFBRSxFQUROO0FBRUosWUFBQSxlQUFlLEVBQUUsRUFGYjtBQUdKLFlBQUEsZUFBZSxFQUFFLEVBSGI7QUFJSixZQUFBLG9CQUFvQixFQUFFO0FBSmxCO0FBSFE7QUFGWixPQUZXO0FBZWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxPQURPLHFCQUNHO0FBQ1IsaUJBQU8sTUFBTSxtQkFBbUIsS0FBbkIsQ0FBTixDQUNKLElBREksQ0FDQyxVQUFBLElBQUksRUFBSTtBQUNaLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULEdBQWdCLElBQUksQ0FBQyxnQkFBTCxDQUFzQixJQUF0QztBQUNBLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsR0FBTCxDQUFT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QUFBLGNBQ00sZ0JBRE4sbUJBQ0EsSUFEQTtBQUFBLGNBQ3dCLE1BRHhCLG1CQUN3QixNQUR4QjtBQUVQLFVBQUEsZ0JBQWdCLENBQUMsTUFBakIsR0FBMEIsTUFBMUI7QUFDQSxVQUFBLE1BQU0sbUJBQW1CLE1BQW5CLEVBQTJCO0FBQy9CLFlBQUEsZ0JBQWdCLEVBQWhCO0FBRCtCLFdBQTNCLENBQU4sQ0FHRyxJQUhILENBR1EsWUFBTTtBQUNWLFlBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYztBQUNaLGNBQUEsZ0JBQWdCLEVBQWhCO0FBRFksYUFBZDtBQUdBLFlBQUEsSUFBSSxDQUFDLEtBQUw7QUFDRCxXQVJILFdBU1MsVUFBQSxHQUFHLEVBQUk7QUFDWixZQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWjtBQUNBLFlBQUEsZ0JBQWdCLENBQUMsR0FBRCxDQUFoQjtBQUNBLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFUO0FBQ0QsV0FiSDtBQWNEO0FBbkZNO0FBZlEsS0FBUixDQUFYO0FBcUdEOzs7O3lCQUNJLFEsRUFBVTtBQUNiLFdBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLFdBQUssR0FBTCxDQUFTLElBQVQ7QUFDRDs7OzRCQUNPO0FBQ04sV0FBSyxHQUFMLENBQVMsS0FBVDtBQUNEOzs7Ozs7QUFJSCxHQUFHLENBQUMsT0FBSixDQUFZLGFBQVosR0FBNEIsYUFBNUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBWZXJpZmljYXRpb25zIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZVZlcmlmaWNhdGlvbnNcIik7XHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogJyNtb2R1bGVWZXJpZmljYXRpb25zQXBwJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIHZlcm5pZXJDYWxpcGVyOiB7XHJcbiAgICAgICAgICBpbml0OiBmYWxzZSxcclxuICAgICAgICAgIGFuc3dlcjogMCxcclxuICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgcXVlc3Rpb246ICcnLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcnLFxyXG4gICAgICAgICAgICBtYWluSW1hZ2VCYXNlNjQ6ICcnLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnlJbWFnZUJhc2U2NDogJydcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBnZXREYXRhKCkge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3ZlcmlmaWNhdGlvbnNgLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAudHlwZSA9IGRhdGEudmVyaWZpY2F0aW9uRGF0YS50eXBlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwW3NlbGYuYXBwLnR5cGVdLmRhdGEgPSBkYXRhLnZlcmlmaWNhdGlvbkRhdGE7XHJcbiAgICAgICAgICAgICAgY29uc3QgaW5pdEZ1bmMgPSBzZWxmLmFwcFtgJHtzZWxmLmFwcC50eXBlfUluaXRgXTtcclxuICAgICAgICAgICAgICBpZihpbml0RnVuYykgaW5pdEZ1bmMoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3BlbigpIHtcclxuICAgICAgICAgIHRoaXMuZ2V0RGF0YSgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmVybmllckNhbGlwZXJJbml0KCkge1xyXG4gICAgICAgICAgbGV0IHRlbXBMZWZ0ID0gMDtcclxuICAgICAgICAgIGxldCBtb3VzZUxlZnQgPSAwO1xyXG4gICAgICAgICAgbGV0IHNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlciA9IDA7XHJcbiAgICAgICAgICBpZih0aGlzLnZlcm5pZXJDYWxpcGVyLmluaXQpIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBidXR0b24gPSBfdGhpcy4kcmVmcy5idXR0b247XHJcbiAgICAgICAgICAgIGNvbnN0IGdldFggPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmKGUuc2NyZWVuWCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZS50b3VjaGVzWzBdLnNjcmVlblg7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlLnNjcmVlblg7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlRG93biA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOaMieS4i2AsIGUpO1xyXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICBtb3VzZUxlZnQgPSBnZXRYKGUpO1xyXG4gICAgICAgICAgICAgIHNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Nb3VzZVVwID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg5oqs6LW3YCwgZSk7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB0ZW1wTGVmdCA9IF90aGlzLnZlcm5pZXJDYWxpcGVyLmFuc3dlcjtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDnp7vliqhgLCBlKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYoIXNlbGVjdGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyID0gdGVtcExlZnQgKyBnZXRYKGUpIC0gbW91c2VMZWZ0O1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvbk1vdXNlRG93bik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvbk1vdXNlVXApO1xyXG5cclxuICAgICAgICAgIH0sIDMwMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7ZGF0YTogdmVyaWZpY2F0aW9uRGF0YSwgYW5zd2VyfSA9IHRoaXNbdGhpcy50eXBlXTtcclxuICAgICAgICAgIHZlcmlmaWNhdGlvbkRhdGEuYW5zd2VyID0gYW5zd2VyO1xyXG4gICAgICAgICAgbmtjQVBJKGAvdmVyaWZpY2F0aW9uc2AsICdQT1NUJywge1xyXG4gICAgICAgICAgICB2ZXJpZmljYXRpb25EYXRhXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayh7XHJcbiAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25EYXRhXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZXJyKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5nZXREYXRhKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBvcGVuKGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLmFwcC5vcGVuKCk7XHJcbiAgfVxyXG4gIGNsb3NlKCkge1xyXG4gICAgdGhpcy5hcHAuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5OS0MubW9kdWxlcy5WZXJpZmljYXRpb25zID0gVmVyaWZpY2F0aW9ucztcclxuIl19
