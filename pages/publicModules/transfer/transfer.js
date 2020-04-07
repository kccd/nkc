(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.Transfer =
/*#__PURE__*/
function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvdHJhbnNmZXIvdHJhbnNmZXIubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWjtBQUFBO0FBQUE7QUFDRSxvQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLGlCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSxvQkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsT0FBTyxFQUFFLElBREw7QUFFSixRQUFBLEtBQUssRUFBRSxFQUZIO0FBR0osUUFBQSxRQUFRLEVBQUUsRUFITjtBQUlKLFFBQUEsTUFBTSxFQUFFLEVBSko7QUFLSixRQUFBLElBQUksRUFBRSxFQUxGO0FBTUosUUFBQSxPQUFPLEVBQUU7QUFOTCxPQUZXO0FBVWpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxJQURPLGdCQUNGLFFBREUsRUFDUSxJQURSLEVBQ2M7QUFDbkIsZUFBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFVBQUEsTUFBTSxjQUFPLElBQVAseUJBQTBCLElBQUksQ0FBQyxHQUFMLEVBQTFCLEdBQXdDLEtBQXhDLENBQU4sQ0FDRyxJQURILENBQ1EsVUFBQSxJQUFJLEVBQUk7QUFDWixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxHQUFtQixJQUFJLENBQUMsT0FBeEI7QUFDRCxXQUhILFdBSVMsVUFBQSxJQUFJLEVBQUk7QUFDYixZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxHQUFtQixJQUFJLENBQUMsT0FBeEI7QUFDQSxZQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxHQUFpQixJQUFJLENBQUMsS0FBTCxJQUFjLElBQS9CO0FBQ0QsV0FQSDtBQVFBLFVBQUEsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRCxTQWJNO0FBY1AsUUFBQSxLQWRPLG1CQWNDO0FBQ04sVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0EsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFFBQVQsR0FBb0IsRUFBcEI7QUFDRCxTQWpCTTtBQWtCUCxRQUFBLE1BbEJPLG9CQWtCRTtBQUNQLGVBQUssS0FBTCxHQUFhLEVBQWI7QUFDQSxVQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQ0csSUFESCxDQUNRLFlBQU07QUFBQSxnQkFDSCxXQURHLEdBQ1ksR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUR4QixDQUNILFdBREc7QUFBQSw0QkFFd0IsSUFBSSxDQUFDLEdBRjdCO0FBQUEsZ0JBRUwsUUFGSyxhQUVMLFFBRks7QUFBQSxnQkFFSyxNQUZMLGFBRUssTUFGTDtBQUFBLGdCQUVhLE9BRmIsYUFFYSxPQUZiO0FBR1YsWUFBQSxXQUFXLENBQUMsTUFBRCxFQUFTO0FBQ2xCLGNBQUEsSUFBSSxFQUFFLE1BRFk7QUFFbEIsY0FBQSxHQUFHLEVBQUUsSUFGYTtBQUdsQixjQUFBLGNBQWMsRUFBRTtBQUhFLGFBQVQsQ0FBWDtBQUtBLFlBQUEsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBVixDQUFqQjtBQUNBLGdCQUFHLE1BQU0sR0FBRyxPQUFaLEVBQXFCLGdFQUFpQixPQUFPLEdBQUMsR0FBekI7QUFDckIsZ0JBQUcsQ0FBQyxRQUFKLEVBQWMsTUFBTSxPQUFOO0FBQ2QsbUJBQU8sTUFBTSxjQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBaEIsZ0JBQWlDLE1BQWpDLEVBQXlDO0FBQ3BELGNBQUEsUUFBUSxFQUFSLFFBRG9EO0FBRXBELGNBQUEsTUFBTSxFQUFOO0FBRm9ELGFBQXpDLENBQWI7QUFJRCxXQWhCSCxFQWlCRyxJQWpCSCxDQWlCUSxZQUFNO0FBQ1YsWUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0EsWUFBQSxJQUFJLENBQUMsS0FBTDtBQUNELFdBcEJILFdBcUJTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsR0FBaUIsSUFBSSxDQUFDLEtBQUwsSUFBYyxJQUEvQjtBQUNELFdBdkJIO0FBd0JEO0FBNUNNO0FBVlEsS0FBUixDQUFYO0FBeURBLElBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQXJCO0FBQ0EsSUFBQSxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBdEI7QUFDRDs7QUFuRUg7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLlRyYW5zZmVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlVHJhbnNmZXJcIik7IFxuICAgIHNlbGYuZG9tLm1vZGFsKHtcbiAgICAgIHNob3c6IGZhbHNlLFxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcbiAgICB9KTtcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xuICAgICAgZWw6IFwiI21vZHVsZVRyYW5zZmVyQXBwXCIsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgIGVycm9yOiBcIlwiLFxuICAgICAgICBwYXNzd29yZDogXCJcIixcbiAgICAgICAgbnVtYmVyOiBcIlwiLFxuICAgICAgICB0VWlkOiBcIlwiLFxuICAgICAgICBrY2JPbmNlOiBcIlwiLFxuICAgICAgfSxcbiAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgb3BlbihjYWxsYmFjaywgdFVpZCkge1xuICAgICAgICAgIHRoaXMudFVpZCA9IHRVaWQ7XG4gICAgICAgICAgbmtjQVBJKGAvdS8ke3RVaWR9L3RyYW5zZmVyP3Q9JHtEYXRlLm5vdygpfWAsIFwiR0VUXCIpXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgc2VsZi5hcHAua2NiT25jZSA9IGRhdGEua2NiT25jZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XG4gICAgICAgICAgICAgIHNlbGYuYXBwLmtjYk9uY2UgPSBkYXRhLmtjYk9uY2U7XG4gICAgICAgICAgICAgIHNlbGYuYXBwLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgc2VsZi5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKFwic2hvd1wiKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJoaWRlXCIpO1xuICAgICAgICAgIHNlbGYuYXBwLnBhc3N3b3JkID0gXCJcIjtcbiAgICAgICAgfSxcbiAgICAgICAgc3VibWl0KCkge1xuICAgICAgICAgIHRoaXMuZXJyb3IgPSBcIlwiO1xuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHtjaGVja051bWJlcn0gPSBOS0MubWV0aG9kcy5jaGVja0RhdGE7XG4gICAgICAgICAgICAgIGxldCB7cGFzc3dvcmQsIG51bWJlciwga2NiT25jZX0gPSBzZWxmLmFwcDtcbiAgICAgICAgICAgICAgY2hlY2tOdW1iZXIobnVtYmVyLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCLovazotKbph5Hpop1cIixcbiAgICAgICAgICAgICAgICBtaW46IDAuMDEsXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIG51bWJlciA9IHBhcnNlSW50KG51bWJlciAqIDEwMCk7XG4gICAgICAgICAgICAgIGlmKG51bWJlciA+IGtjYk9uY2UpIHRocm93IGDovazotKbph5Hpop3kuI3og73otoXov4cke2tjYk9uY2UvMTAwfWtjYmA7XG4gICAgICAgICAgICAgIGlmKCFwYXNzd29yZCkgdGhyb3cgXCLor7fovpPlhaXlr4bnoIFcIjtcbiAgICAgICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3UvJHtzZWxmLmFwcC50VWlkfS90cmFuc2ZlcmAsIFwiUE9TVFwiLCB7XG4gICAgICAgICAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgbnVtYmVyXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi6L2s6LSm5oiQ5YqfXCIpO1xuICAgICAgICAgICAgICBzZWxmLmNsb3NlKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xuICAgICAgICAgICAgICBzZWxmLmFwcC5lcnJvciA9IGRhdGEuZXJyb3IgfHwgZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgc2VsZi5vcGVuID0gc2VsZi5hcHAub3BlbjtcbiAgICBzZWxmLmNsb3NlID0gc2VsZi5hcHAuY2xvc2U7XG4gIH1cbn0iXX0=
