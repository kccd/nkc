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
        score: '',
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
            self.app.score = data.shopScore;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvdHJhbnNmZXIvdHJhbnNmZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsaUJBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBSUEsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLG9CQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxPQUFPLEVBQUUsSUFETDtBQUVKLFFBQUEsS0FBSyxFQUFFLEVBRkg7QUFHSixRQUFBLEtBQUssRUFBRSxFQUhIO0FBSUosUUFBQSxRQUFRLEVBQUUsRUFKTjtBQUtKLFFBQUEsTUFBTSxFQUFFLEVBTEo7QUFNSixRQUFBLElBQUksRUFBRSxFQU5GO0FBT0osUUFBQSxPQUFPLEVBQUU7QUFQTCxPQUZXO0FBV2pCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxJQURPLGdCQUNGLFFBREUsRUFDUSxJQURSLEVBQ2M7QUFDbkIsZUFBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFVBQUEsTUFBTSxjQUFPLElBQVAseUJBQTBCLElBQUksQ0FBQyxHQUFMLEVBQTFCLEdBQXdDLEtBQXhDLENBQU4sQ0FDRyxJQURILENBQ1EsVUFBQSxJQUFJLEVBQUk7QUFDWixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxHQUFtQixJQUFJLENBQUMsT0FBeEI7QUFDQSxZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxHQUFpQixJQUFJLENBQUMsU0FBdEI7QUFDRCxXQUpILFdBS1MsVUFBQSxJQUFJLEVBQUk7QUFDYixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxHQUFtQixJQUFJLENBQUMsT0FBeEI7QUFDQSxZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxHQUFpQixJQUFJLENBQUMsS0FBTCxJQUFjLElBQS9CO0FBQ0QsV0FSSDtBQVNBLFVBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRCxTQWRNO0FBZVAsUUFBQSxLQWZPLG1CQWVDO0FBQ04sVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0EsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFFBQVQsR0FBb0IsRUFBcEI7QUFDRCxTQWxCTTtBQW1CUCxRQUFBLE1BbkJPLG9CQW1CRTtBQUNQLGVBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxVQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQ0csSUFESCxDQUNRLFlBQU07QUFBQSxnQkFDSCxXQURHLEdBQ1ksR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUR4QixDQUNILFdBREc7QUFBQSw0QkFFd0IsSUFBSSxDQUFDLEdBRjdCO0FBQUEsZ0JBRUwsUUFGSyxhQUVMLFFBRks7QUFBQSxnQkFFSyxNQUZMLGFBRUssTUFGTDtBQUFBLGdCQUVhLE9BRmIsYUFFYSxPQUZiO0FBR1YsWUFBQSxXQUFXLENBQUMsTUFBRCxFQUFTO0FBQ2xCLGNBQUEsSUFBSSxFQUFFLE1BRFk7QUFFbEIsY0FBQSxHQUFHLEVBQUUsSUFGYTtBQUdsQixjQUFBLGNBQWMsRUFBRTtBQUhFLGFBQVQsQ0FBWDtBQUtBLFlBQUEsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBVixDQUFqQjtBQUNBLGdCQUFHLE1BQU0sR0FBRyxPQUFaLEVBQXFCLGdFQUFpQixPQUFPLEdBQUMsR0FBekI7QUFDckIsZ0JBQUcsQ0FBQyxRQUFKLEVBQWMsTUFBTSxPQUFOO0FBQ2QsbUJBQU8sTUFBTSxjQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBaEIsZ0JBQWlDLE1BQWpDLEVBQXlDO0FBQ3BELGNBQUEsUUFBUSxFQUFSLFFBRG9EO0FBRXBELGNBQUEsTUFBTSxFQUFOO0FBRm9ELGFBQXpDLENBQWI7QUFJRCxXQWhCSCxFQWlCRyxJQWpCSCxDQWlCUSxZQUFNO0FBQ1YsWUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0EsWUFBQSxJQUFJLENBQUMsS0FBTDtBQUNELFdBcEJILFdBcUJTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsR0FBaUIsSUFBSSxDQUFDLEtBQUwsSUFBYyxJQUEvQjtBQUNELFdBdkJIO0FBd0JEO0FBN0NNO0FBWFEsS0FBUixDQUFYO0FBMkRBLElBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQXJCO0FBQ0EsSUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBdEI7QUFDRDs7QUFyRUg7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLlRyYW5zZmVyID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlVHJhbnNmZXJcIik7XHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogXCIjbW9kdWxlVHJhbnNmZXJBcHBcIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIGxvYWRpbmc6IHRydWUsXHJcbiAgICAgICAgc2NvcmU6ICcnLFxyXG4gICAgICAgIGVycm9yOiBcIlwiLFxyXG4gICAgICAgIHBhc3N3b3JkOiBcIlwiLFxyXG4gICAgICAgIG51bWJlcjogXCJcIixcclxuICAgICAgICB0VWlkOiBcIlwiLFxyXG4gICAgICAgIGtjYk9uY2U6IFwiXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBvcGVuKGNhbGxiYWNrLCB0VWlkKSB7XHJcbiAgICAgICAgICB0aGlzLnRVaWQgPSB0VWlkO1xyXG4gICAgICAgICAgbmtjQVBJKGAvdS8ke3RVaWR9L3RyYW5zZmVyP3Q9JHtEYXRlLm5vdygpfWAsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmtjYk9uY2UgPSBkYXRhLmtjYk9uY2U7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2NvcmUgPSBkYXRhLnNob3BTY29yZTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmtjYk9uY2UgPSBkYXRhLmtjYk9uY2U7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuZXJyb3IgPSBkYXRhLmVycm9yIHx8IGRhdGE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgICBzZWxmLmFwcC5wYXNzd29yZCA9IFwiXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICB0aGlzLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCB7Y2hlY2tOdW1iZXJ9ID0gTktDLm1ldGhvZHMuY2hlY2tEYXRhO1xyXG4gICAgICAgICAgICAgIGxldCB7cGFzc3dvcmQsIG51bWJlciwga2NiT25jZX0gPSBzZWxmLmFwcDtcclxuICAgICAgICAgICAgICBjaGVja051bWJlcihudW1iZXIsIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi6L2s6LSm6YeR6aKdXCIsXHJcbiAgICAgICAgICAgICAgICBtaW46IDAuMDEsXHJcbiAgICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIG51bWJlciA9IHBhcnNlSW50KG51bWJlciAqIDEwMCk7XHJcbiAgICAgICAgICAgICAgaWYobnVtYmVyID4ga2NiT25jZSkgdGhyb3cgYOi9rOi0pumHkemineS4jeiDvei2hei/hyR7a2NiT25jZS8xMDB9a2NiYDtcclxuICAgICAgICAgICAgICBpZighcGFzc3dvcmQpIHRocm93IFwi6K+36L6T5YWl5a+G56CBXCI7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3UvJHtzZWxmLmFwcC50VWlkfS90cmFuc2ZlcmAsIFwiUE9TVFwiLCB7XHJcbiAgICAgICAgICAgICAgICBwYXNzd29yZCxcclxuICAgICAgICAgICAgICAgIG51bWJlclxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi6L2s6LSm5oiQ5YqfXCIpO1xyXG4gICAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5vcGVuID0gc2VsZi5hcHAub3BlbjtcclxuICAgIHNlbGYuY2xvc2UgPSBzZWxmLmFwcC5jbG9zZTtcclxuICB9XHJcbn1cclxuIl19
