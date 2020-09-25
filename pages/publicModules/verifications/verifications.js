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
          return nkcAPI("/verifications", 'GET').then(function (data) {
            if (data.verificationData.type === 'unEnabled') {
              return self.callback({
                secret: data.verificationData.type
              });
            } else if (showModal) {
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
        open: function open() {
          this.getData(true);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3ZlcmlmaWNhdGlvbnMvdmVyaWZpY2F0aW9ucy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FNLGE7QUFDSiwyQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLHNCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx5QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixRQUFBLGNBQWMsRUFBRTtBQUNkLFVBQUEsSUFBSSxFQUFFLEtBRFE7QUFFZCxVQUFBLE1BQU0sRUFBRSxDQUZNO0FBR2QsVUFBQSxJQUFJLEVBQUU7QUFDSixZQUFBLFFBQVEsRUFBRSxFQUROO0FBRUosWUFBQSxlQUFlLEVBQUUsRUFGYjtBQUdKLFlBQUEsZUFBZSxFQUFFLEVBSGI7QUFJSixZQUFBLG9CQUFvQixFQUFFO0FBSmxCO0FBSFE7QUFGWixPQUZXO0FBZWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxPQURPLHFCQUNvQjtBQUFBLGNBQW5CLFNBQW1CLHVFQUFQLEtBQU87QUFDekIsaUJBQU8sTUFBTSxtQkFBbUIsS0FBbkIsQ0FBTixDQUNKLElBREksQ0FDQyxVQUFBLElBQUksRUFBSTtBQUNaLGdCQUFHLElBQUksQ0FBQyxnQkFBTCxDQUFzQixJQUF0QixLQUErQixXQUFsQyxFQUErQztBQUM3QyxxQkFBTyxJQUFJLENBQUMsUUFBTCxDQUFjO0FBQUMsZ0JBQUEsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBTCxDQUFzQjtBQUEvQixlQUFkLENBQVA7QUFDRCxhQUZELE1BRU8sSUFBRyxTQUFILEVBQWM7QUFDbkIsY0FBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0Q7O0FBQ0QsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsR0FBZ0IsSUFBSSxDQUFDLGdCQUFMLENBQXNCLElBQXRDO0FBQ0EsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBbEIsRUFBd0IsSUFBeEIsR0FBK0IsSUFBSSxDQUFDLGdCQUFwQztBQUNBLGdCQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBTCxXQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBckIsVUFBakI7QUFDQSxnQkFBRyxRQUFILEVBQWEsUUFBUTtBQUN0QixXQVhJLFdBWUUsVUFBQSxHQUFHLEVBQUk7QUFDWixZQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWjtBQUNBLFlBQUEsVUFBVSxDQUFDLEdBQUQsQ0FBVjtBQUNELFdBZkksQ0FBUDtBQWdCRCxTQWxCTTtBQW1CUCxRQUFBLElBbkJPLGtCQW1CQTtBQUNMLGVBQUssT0FBTCxDQUFhLElBQWI7QUFDRCxTQXJCTTtBQXNCUCxRQUFBLEtBdEJPLG1CQXNCQztBQUNOLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNELFNBeEJNO0FBeUJQLFFBQUEsa0JBekJPLGdDQXlCYztBQUNuQixjQUFJLFFBQVEsR0FBRyxDQUFmO0FBQ0EsY0FBSSxTQUFTLEdBQUcsQ0FBaEI7QUFDQSxjQUFJLFFBQVEsR0FBRyxLQUFmO0FBQ0EsZUFBSyxjQUFMLENBQW9CLE1BQXBCLEdBQTZCLENBQTdCO0FBQ0EsY0FBRyxLQUFLLGNBQUwsQ0FBb0IsSUFBdkIsRUFBNkI7O0FBQzdCLGNBQU0sS0FBSyxHQUFHLElBQWQ7O0FBQ0EsVUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLGdCQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBTixDQUFZLE1BQTNCOztBQUNBLGdCQUFNLElBQUksR0FBRyxTQUFQLElBQU8sQ0FBQyxDQUFELEVBQU87QUFDbEIsa0JBQUcsQ0FBQyxDQUFDLE9BQUYsS0FBYyxTQUFqQixFQUE0QjtBQUMxQix1QkFBTyxDQUFDLENBQUMsT0FBRixDQUFVLENBQVYsRUFBYSxPQUFwQjtBQUNELGVBRkQsTUFFTztBQUNMLHVCQUFPLENBQUMsQ0FBQyxPQUFUO0FBQ0Q7QUFDRixhQU5EOztBQU9BLGdCQUFNLFdBQVcsR0FBRyxTQUFkLFdBQWMsQ0FBQyxDQUFELEVBQU87QUFDekI7QUFDQSxjQUFBLENBQUMsQ0FBQyxjQUFGO0FBQ0EsY0FBQSxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUQsQ0FBaEI7QUFDQSxjQUFBLFFBQVEsR0FBRyxJQUFYO0FBQ0QsYUFMRDs7QUFNQSxnQkFBTSxTQUFTLEdBQUcsU0FBWixTQUFZLENBQUMsQ0FBRCxFQUFPO0FBQ3ZCO0FBQ0EsY0FBQSxRQUFRLEdBQUcsS0FBWDtBQUNBLGNBQUEsUUFBUSxHQUFHLEtBQUssQ0FBQyxjQUFOLENBQXFCLE1BQWhDO0FBQ0QsYUFKRDs7QUFLQSxnQkFBTSxXQUFXLEdBQUcsU0FBZCxXQUFjLENBQUMsQ0FBRCxFQUFPO0FBQ3pCO0FBRUEsa0JBQUcsQ0FBQyxRQUFKLEVBQWM7QUFDZCxjQUFBLEtBQUssQ0FBQyxjQUFOLENBQXFCLE1BQXJCLEdBQThCLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBRCxDQUFmLEdBQXFCLFNBQW5EO0FBQ0QsYUFMRDs7QUFNQSxZQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxXQUFyQztBQUNBLFlBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLFdBQTFCLEVBQXVDLFdBQXZDO0FBQ0EsWUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsU0FBMUIsRUFBcUMsU0FBckM7QUFFQSxZQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixZQUF4QixFQUFzQyxXQUF0QztBQUNBLFlBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLFdBQTFCLEVBQXVDLFdBQXZDO0FBQ0EsWUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsVUFBMUIsRUFBc0MsU0FBdEM7QUFFRCxXQWxDUyxFQWtDUCxHQWxDTyxDQUFWO0FBbUNELFNBbkVNO0FBb0VQLFFBQUEsTUFwRU8sb0JBb0VFO0FBQUEsZ0NBQ2tDLEtBQUssS0FBSyxJQUFWLENBRGxDO0FBQUEsY0FDTSxnQkFETixtQkFDQSxJQURBO0FBQUEsY0FDd0IsTUFEeEIsbUJBQ3dCLE1BRHhCO0FBRVAsVUFBQSxnQkFBZ0IsQ0FBQyxNQUFqQixHQUEwQixNQUExQjtBQUNBLFVBQUEsTUFBTSxtQkFBbUIsTUFBbkIsRUFBMkI7QUFDL0IsWUFBQSxnQkFBZ0IsRUFBaEI7QUFEK0IsV0FBM0IsQ0FBTixDQUdHLElBSEgsQ0FHUSxVQUFDLElBQUQsRUFBVTtBQUNkLFlBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYztBQUNaLGNBQUEsTUFBTSxFQUFFLElBQUksQ0FBQztBQURELGFBQWQ7QUFHQSxZQUFBLElBQUksQ0FBQyxLQUFMO0FBQ0QsV0FSSCxXQVNTLFVBQUEsR0FBRyxFQUFJO0FBQ1osWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVo7QUFDQSxZQUFBLGdCQUFnQixDQUFDLEdBQUQsQ0FBaEI7QUFDQSxZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVDtBQUNELFdBYkg7QUFjRDtBQXJGTTtBQWZRLEtBQVIsQ0FBWDtBQXVHRDs7Ozt5QkFDSSxRLEVBQVU7QUFDYixXQUFLLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxXQUFLLEdBQUwsQ0FBUyxJQUFUO0FBQ0Q7Ozs0QkFDTztBQUNOLFdBQUssR0FBTCxDQUFTLEtBQVQ7QUFDRDs7Ozs7O0FBSUgsR0FBRyxDQUFDLE9BQUosQ0FBWSxhQUFaLEdBQTRCLGFBQTVCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgVmVyaWZpY2F0aW9ucyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuZG9tID0gJChcIiNtb2R1bGVWZXJpZmljYXRpb25zXCIpO1xyXG4gICAgc2VsZi5kb20ubW9kYWwoe1xyXG4gICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcclxuICAgIH0pO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6ICcjbW9kdWxlVmVyaWZpY2F0aW9uc0FwcCcsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICB2ZXJuaWVyQ2FsaXBlcjoge1xyXG4gICAgICAgICAgaW5pdDogZmFsc2UsXHJcbiAgICAgICAgICBhbnN3ZXI6IDAsXHJcbiAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIHF1ZXN0aW9uOiAnJyxcclxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnJyxcclxuICAgICAgICAgICAgbWFpbkltYWdlQmFzZTY0OiAnJyxcclxuICAgICAgICAgICAgc2Vjb25kYXJ5SW1hZ2VCYXNlNjQ6ICcnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgZ2V0RGF0YShzaG93TW9kYWwgPSBmYWxzZSkge1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3ZlcmlmaWNhdGlvbnNgLCAnR0VUJylcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YS52ZXJpZmljYXRpb25EYXRhLnR5cGUgPT09ICd1bkVuYWJsZWQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayh7c2VjcmV0OiBkYXRhLnZlcmlmaWNhdGlvbkRhdGEudHlwZX0pO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZihzaG93TW9kYWwpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnR5cGUgPSBkYXRhLnZlcmlmaWNhdGlvbkRhdGEudHlwZTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcFtzZWxmLmFwcC50eXBlXS5kYXRhID0gZGF0YS52ZXJpZmljYXRpb25EYXRhO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGluaXRGdW5jID0gc2VsZi5hcHBbYCR7c2VsZi5hcHAudHlwZX1Jbml0YF07XHJcbiAgICAgICAgICAgICAgaWYoaW5pdEZ1bmMpIGluaXRGdW5jKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgc3dlZXRFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW4oKSB7XHJcbiAgICAgICAgICB0aGlzLmdldERhdGEodHJ1ZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbG9zZSgpIHtcclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZXJuaWVyQ2FsaXBlckluaXQoKSB7XHJcbiAgICAgICAgICBsZXQgdGVtcExlZnQgPSAwO1xyXG4gICAgICAgICAgbGV0IG1vdXNlTGVmdCA9IDA7XHJcbiAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMudmVybmllckNhbGlwZXIuYW5zd2VyID0gMDtcclxuICAgICAgICAgIGlmKHRoaXMudmVybmllckNhbGlwZXIuaW5pdCkgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IF90aGlzLiRyZWZzLmJ1dHRvbjtcclxuICAgICAgICAgICAgY29uc3QgZ2V0WCA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZS5zY3JlZW5YID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlLnRvdWNoZXNbMF0uc2NyZWVuWDtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGUuc2NyZWVuWDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTW91c2VEb3duID0gKGUpID0+IHtcclxuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg5oyJ5LiLYCwgZSk7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIG1vdXNlTGVmdCA9IGdldFgoZSk7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlVXAgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDmiqzotbdgLCBlKTtcclxuICAgICAgICAgICAgICBzZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHRlbXBMZWZ0ID0gX3RoaXMudmVybmllckNhbGlwZXIuYW5zd2VyO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk1vdXNlTW92ZSA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYOenu+WKqGAsIGUpO1xyXG5cclxuICAgICAgICAgICAgICBpZighc2VsZWN0ZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICBfdGhpcy52ZXJuaWVyQ2FsaXBlci5hbnN3ZXIgPSB0ZW1wTGVmdCArIGdldFgoZSkgLSBtb3VzZUxlZnQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uTW91c2VEb3duKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uTW91c2VVcCk7XHJcblxyXG4gICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtkYXRhOiB2ZXJpZmljYXRpb25EYXRhLCBhbnN3ZXJ9ID0gdGhpc1t0aGlzLnR5cGVdO1xyXG4gICAgICAgICAgdmVyaWZpY2F0aW9uRGF0YS5hbnN3ZXIgPSBhbnN3ZXI7XHJcbiAgICAgICAgICBua2NBUEkoYC92ZXJpZmljYXRpb25zYCwgJ1BPU1QnLCB7XHJcbiAgICAgICAgICAgIHZlcmlmaWNhdGlvbkRhdGFcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5jYWxsYmFjayh7XHJcbiAgICAgICAgICAgICAgICBzZWNyZXQ6IGRhdGEuc2VjcmV0XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoZXJyKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5nZXREYXRhKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuICBvcGVuKGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICB0aGlzLmFwcC5vcGVuKCk7XHJcbiAgfVxyXG4gIGNsb3NlKCkge1xyXG4gICAgdGhpcy5hcHAuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG5OS0MubW9kdWxlcy5WZXJpZmljYXRpb25zID0gVmVyaWZpY2F0aW9ucztcclxuIl19
