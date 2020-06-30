(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.Transfer = /*#__PURE__*/function () {
  function _class() {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $("#moduleTransfer");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: "#moduleTransferApp",
      data: {
        loading: true,
        error: "",
        password: "",
        number: "",
        tUid: "",
        kcbOnce: ""
      },
      methods: {
        open: function open(callback, tUid) {
          this.tUid = tUid;
          nkcAPI("/u/".concat(tUid, "/transfer?t=").concat(Date.now()), "GET").then(function (data) {
            self.app.kcbOnce = data.kcbOnce;
          })["catch"](function (data) {
            self.app.kcbOnce = data.kcbOnce;
            self.app.error = data.error || data;
          });
          self.callback = callback;
          self.dom.modal("show");
        },
        close: function close() {
          self.dom.modal("hide");
          self.app.password = "";
        },
        submit: function submit() {
          this.error = "";
          Promise.resolve().then(function () {
            var checkNumber = NKC.methods.checkData.checkNumber;
            var _self$app = self.app,
                password = _self$app.password,
                number = _self$app.number,
                kcbOnce = _self$app.kcbOnce;
            checkNumber(number, {
              name: "转账金额",
              min: 0.01,
              fractionDigits: 2
            });
            number = parseInt(number * 100);
            if (number > kcbOnce) throw "\u8F6C\u8D26\u91D1\u989D\u4E0D\u80FD\u8D85\u8FC7".concat(kcbOnce / 100, "kcb");
            if (!password) throw "请输入密码";
            return nkcAPI("/u/".concat(self.app.tUid, "/transfer"), "POST", {
              password: password,
              number: number
            });
          }).then(function () {
            sweetSuccess("转账成功");
            self.close();
          })["catch"](function (data) {
            self.app.error = data.error || data;
          });
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvdHJhbnNmZXIvdHJhbnNmZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsaUJBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBSUEsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLG9CQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxPQUFPLEVBQUUsSUFETDtBQUVKLFFBQUEsS0FBSyxFQUFFLEVBRkg7QUFHSixRQUFBLFFBQVEsRUFBRSxFQUhOO0FBSUosUUFBQSxNQUFNLEVBQUUsRUFKSjtBQUtKLFFBQUEsSUFBSSxFQUFFLEVBTEY7QUFNSixRQUFBLE9BQU8sRUFBRTtBQU5MLE9BRlc7QUFVakIsTUFBQSxPQUFPLEVBQUU7QUFDUCxRQUFBLElBRE8sZ0JBQ0YsUUFERSxFQUNRLElBRFIsRUFDYztBQUNuQixlQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsVUFBQSxNQUFNLGNBQU8sSUFBUCx5QkFBMEIsSUFBSSxDQUFDLEdBQUwsRUFBMUIsR0FBd0MsS0FBeEMsQ0FBTixDQUNHLElBREgsQ0FDUSxVQUFBLElBQUksRUFBSTtBQUNaLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEdBQW1CLElBQUksQ0FBQyxPQUF4QjtBQUNELFdBSEgsV0FJUyxVQUFBLElBQUksRUFBSTtBQUNiLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEdBQW1CLElBQUksQ0FBQyxPQUF4QjtBQUNBLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULEdBQWlCLElBQUksQ0FBQyxLQUFMLElBQWMsSUFBL0I7QUFDRCxXQVBIO0FBUUEsVUFBQSxJQUFJLENBQUMsUUFBTCxHQUFnQixRQUFoQjtBQUNBLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNELFNBYk07QUFjUCxRQUFBLEtBZE8sbUJBY0M7QUFDTixVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsUUFBVCxHQUFvQixFQUFwQjtBQUNELFNBakJNO0FBa0JQLFFBQUEsTUFsQk8sb0JBa0JFO0FBQ1AsZUFBSyxLQUFMLEdBQWEsRUFBYjtBQUNBLFVBQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUFBLGdCQUNILFdBREcsR0FDWSxHQUFHLENBQUMsT0FBSixDQUFZLFNBRHhCLENBQ0gsV0FERztBQUFBLDRCQUV3QixJQUFJLENBQUMsR0FGN0I7QUFBQSxnQkFFTCxRQUZLLGFBRUwsUUFGSztBQUFBLGdCQUVLLE1BRkwsYUFFSyxNQUZMO0FBQUEsZ0JBRWEsT0FGYixhQUVhLE9BRmI7QUFHVixZQUFBLFdBQVcsQ0FBQyxNQUFELEVBQVM7QUFDbEIsY0FBQSxJQUFJLEVBQUUsTUFEWTtBQUVsQixjQUFBLEdBQUcsRUFBRSxJQUZhO0FBR2xCLGNBQUEsY0FBYyxFQUFFO0FBSEUsYUFBVCxDQUFYO0FBS0EsWUFBQSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFWLENBQWpCO0FBQ0EsZ0JBQUcsTUFBTSxHQUFHLE9BQVosRUFBcUIsZ0VBQWlCLE9BQU8sR0FBQyxHQUF6QjtBQUNyQixnQkFBRyxDQUFDLFFBQUosRUFBYyxNQUFNLE9BQU47QUFDZCxtQkFBTyxNQUFNLGNBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFoQixnQkFBaUMsTUFBakMsRUFBeUM7QUFDcEQsY0FBQSxRQUFRLEVBQVIsUUFEb0Q7QUFFcEQsY0FBQSxNQUFNLEVBQU47QUFGb0QsYUFBekMsQ0FBYjtBQUlELFdBaEJILEVBaUJHLElBakJILENBaUJRLFlBQU07QUFDVixZQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDQSxZQUFBLElBQUksQ0FBQyxLQUFMO0FBQ0QsV0FwQkgsV0FxQlMsVUFBQSxJQUFJLEVBQUk7QUFDYixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxHQUFpQixJQUFJLENBQUMsS0FBTCxJQUFjLElBQS9CO0FBQ0QsV0F2Qkg7QUF3QkQ7QUE1Q007QUFWUSxLQUFSLENBQVg7QUF5REEsSUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBckI7QUFDQSxJQUFBLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUF0QjtBQUNEOztBQW5FSDtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuVHJhbnNmZXIgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuZG9tID0gJChcIiNtb2R1bGVUcmFuc2ZlclwiKTsgXHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogXCIjbW9kdWxlVHJhbnNmZXJBcHBcIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIGxvYWRpbmc6IHRydWUsXHJcbiAgICAgICAgZXJyb3I6IFwiXCIsXHJcbiAgICAgICAgcGFzc3dvcmQ6IFwiXCIsXHJcbiAgICAgICAgbnVtYmVyOiBcIlwiLFxyXG4gICAgICAgIHRVaWQ6IFwiXCIsXHJcbiAgICAgICAga2NiT25jZTogXCJcIixcclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIG9wZW4oY2FsbGJhY2ssIHRVaWQpIHtcclxuICAgICAgICAgIHRoaXMudFVpZCA9IHRVaWQ7XHJcbiAgICAgICAgICBua2NBUEkoYC91LyR7dFVpZH0vdHJhbnNmZXI/dD0ke0RhdGUubm93KCl9YCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAua2NiT25jZSA9IGRhdGEua2NiT25jZTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmtjYk9uY2UgPSBkYXRhLmtjYk9uY2U7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuZXJyb3IgPSBkYXRhLmVycm9yIHx8IGRhdGE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgICBzZWxmLmFwcC5wYXNzd29yZCA9IFwiXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICB0aGlzLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCB7Y2hlY2tOdW1iZXJ9ID0gTktDLm1ldGhvZHMuY2hlY2tEYXRhO1xyXG4gICAgICAgICAgICAgIGxldCB7cGFzc3dvcmQsIG51bWJlciwga2NiT25jZX0gPSBzZWxmLmFwcDtcclxuICAgICAgICAgICAgICBjaGVja051bWJlcihudW1iZXIsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi6L2s6LSm6YeR6aKdXCIsXHJcbiAgICAgICAgICAgICAgICBtaW46IDAuMDEsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG51bWJlciA9IHBhcnNlSW50KG51bWJlciAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgaWYobnVtYmVyID4ga2NiT25jZSkgdGhyb3cgYOi9rOi0pumHkemineS4jeiDvei2hei/hyR7a2NiT25jZS8xMDB9a2NiYDtcclxuICAgICAgICAgICAgICBpZighcGFzc3dvcmQpIHRocm93IFwi6K+36L6T5YWl5a+G56CBXCI7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3UvJHtzZWxmLmFwcC50VWlkfS90cmFuc2ZlcmAsIFwiUE9TVFwiLCB7XHJcbiAgICAgICAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgICAgICAgIG51bWJlclxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi6L2s6LSm5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5vcGVuID0gc2VsZi5hcHAub3BlbjtcclxuICAgIHNlbGYuY2xvc2UgPSBzZWxmLmFwcC5jbG9zZTtcclxuICB9XHJcbn0iXX0=
