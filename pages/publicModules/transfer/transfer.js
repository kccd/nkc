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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3RyYW5zZmVyL3RyYW5zZmVyLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVo7QUFDRSxvQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLGlCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSxvQkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsT0FBTyxFQUFFLElBREw7QUFFSixRQUFBLEtBQUssRUFBRSxFQUZIO0FBR0osUUFBQSxRQUFRLEVBQUUsRUFITjtBQUlKLFFBQUEsTUFBTSxFQUFFLEVBSko7QUFLSixRQUFBLElBQUksRUFBRSxFQUxGO0FBTUosUUFBQSxPQUFPLEVBQUU7QUFOTCxPQUZXO0FBVWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxJQURPLGdCQUNGLFFBREUsRUFDUSxJQURSLEVBQ2M7QUFDbkIsZUFBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFVBQUEsTUFBTSxjQUFPLElBQVAseUJBQTBCLElBQUksQ0FBQyxHQUFMLEVBQTFCLEdBQXdDLEtBQXhDLENBQU4sQ0FDRyxJQURILENBQ1EsVUFBQSxJQUFJLEVBQUk7QUFDWixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxHQUFtQixJQUFJLENBQUMsT0FBeEI7QUFDRCxXQUhILFdBSVMsVUFBQSxJQUFJLEVBQUk7QUFDYixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxHQUFtQixJQUFJLENBQUMsT0FBeEI7QUFDQSxZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxHQUFpQixJQUFJLENBQUMsS0FBTCxJQUFjLElBQS9CO0FBQ0QsV0FQSDtBQVFBLFVBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRCxTQWJNO0FBY1AsUUFBQSxLQWRPLG1CQWNDO0FBQ04sVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0EsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFFBQVQsR0FBb0IsRUFBcEI7QUFDRCxTQWpCTTtBQWtCUCxRQUFBLE1BbEJPLG9CQWtCRTtBQUNQLGVBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxVQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQ0csSUFESCxDQUNRLFlBQU07QUFBQSxnQkFDSCxXQURHLEdBQ1ksR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUR4QixDQUNILFdBREc7QUFBQSw0QkFFd0IsSUFBSSxDQUFDLEdBRjdCO0FBQUEsZ0JBRUwsUUFGSyxhQUVMLFFBRks7QUFBQSxnQkFFSyxNQUZMLGFBRUssTUFGTDtBQUFBLGdCQUVhLE9BRmIsYUFFYSxPQUZiO0FBR1YsWUFBQSxXQUFXLENBQUMsTUFBRCxFQUFTO0FBQ2xCLGNBQUEsSUFBSSxFQUFFLE1BRFk7QUFFbEIsY0FBQSxHQUFHLEVBQUUsSUFGYTtBQUdsQixjQUFBLGNBQWMsRUFBRTtBQUhFLGFBQVQsQ0FBWDtBQUtBLFlBQUEsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBVixDQUFqQjtBQUNBLGdCQUFHLE1BQU0sR0FBRyxPQUFaLEVBQXFCLGdFQUFpQixPQUFPLEdBQUMsR0FBekI7QUFDckIsZ0JBQUcsQ0FBQyxRQUFKLEVBQWMsTUFBTSxPQUFOO0FBQ2QsbUJBQU8sTUFBTSxjQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBaEIsZ0JBQWlDLE1BQWpDLEVBQXlDO0FBQ3BELGNBQUEsUUFBUSxFQUFSLFFBRG9EO0FBRXBELGNBQUEsTUFBTSxFQUFOO0FBRm9ELGFBQXpDLENBQWI7QUFJRCxXQWhCSCxFQWlCRyxJQWpCSCxDQWlCUSxZQUFNO0FBQ1YsWUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0EsWUFBQSxJQUFJLENBQUMsS0FBTDtBQUNELFdBcEJILFdBcUJTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsR0FBaUIsSUFBSSxDQUFDLEtBQUwsSUFBYyxJQUEvQjtBQUNELFdBdkJIO0FBd0JEO0FBNUNNO0FBVlEsS0FBUixDQUFYO0FBeURBLElBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQXJCO0FBQ0EsSUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBdEI7QUFDRDs7QUFuRUg7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLlRyYW5zZmVyID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlVHJhbnNmZXJcIik7IFxyXG4gICAgc2VsZi5kb20ubW9kYWwoe1xyXG4gICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcclxuICAgIH0pO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZVRyYW5zZmVyQXBwXCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIGVycm9yOiBcIlwiLFxyXG4gICAgICAgIHBhc3N3b3JkOiBcIlwiLFxyXG4gICAgICAgIG51bWJlcjogXCJcIixcclxuICAgICAgICB0VWlkOiBcIlwiLFxyXG4gICAgICAgIGtjYk9uY2U6IFwiXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBvcGVuKGNhbGxiYWNrLCB0VWlkKSB7XHJcbiAgICAgICAgICB0aGlzLnRVaWQgPSB0VWlkO1xyXG4gICAgICAgICAgbmtjQVBJKGAvdS8ke3RVaWR9L3RyYW5zZmVyP3Q9JHtEYXRlLm5vdygpfWAsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmtjYk9uY2UgPSBkYXRhLmtjYk9uY2U7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5rY2JPbmNlID0gZGF0YS5rY2JPbmNlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIHNlbGYuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKFwic2hvd1wiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlKCkge1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJoaWRlXCIpO1xyXG4gICAgICAgICAgc2VsZi5hcHAucGFzc3dvcmQgPSBcIlwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgdGhpcy5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3Qge2NoZWNrTnVtYmVyfSA9IE5LQy5tZXRob2RzLmNoZWNrRGF0YTtcclxuICAgICAgICAgICAgICBsZXQge3Bhc3N3b3JkLCBudW1iZXIsIGtjYk9uY2V9ID0gc2VsZi5hcHA7XHJcbiAgICAgICAgICAgICAgY2hlY2tOdW1iZXIobnVtYmVyLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIui9rOi0pumHkeminVwiLFxyXG4gICAgICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBudW1iZXIgPSBwYXJzZUludChudW1iZXIgKiAxMDApO1xyXG4gICAgICAgICAgICAgIGlmKG51bWJlciA+IGtjYk9uY2UpIHRocm93IGDovazotKbph5Hpop3kuI3og73otoXov4cke2tjYk9uY2UvMTAwfWtjYmA7XHJcbiAgICAgICAgICAgICAgaWYoIXBhc3N3b3JkKSB0aHJvdyBcIuivt+i+k+WFpeWvhueggVwiO1xyXG4gICAgICAgICAgICAgIHJldHVybiBua2NBUEkoYC91LyR7c2VsZi5hcHAudFVpZH0vdHJhbnNmZXJgLCBcIlBPU1RcIiwge1xyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgICBudW1iZXJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIui9rOi0puaIkOWKn1wiKTtcclxuICAgICAgICAgICAgICBzZWxmLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5lcnJvciA9IGRhdGEuZXJyb3IgfHwgZGF0YTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlbGYub3BlbiA9IHNlbGYuYXBwLm9wZW47XHJcbiAgICBzZWxmLmNsb3NlID0gc2VsZi5hcHAuY2xvc2U7XHJcbiAgfVxyXG59Il19
