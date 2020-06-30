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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3RyYW5zZmVyL3RyYW5zZmVyLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLFFBQVo7QUFDRSxvQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLGlCQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSxvQkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsT0FBTyxFQUFFLElBREw7QUFFSixRQUFBLEtBQUssRUFBRSxFQUZIO0FBR0osUUFBQSxLQUFLLEVBQUUsRUFISDtBQUlKLFFBQUEsUUFBUSxFQUFFLEVBSk47QUFLSixRQUFBLE1BQU0sRUFBRSxFQUxKO0FBTUosUUFBQSxJQUFJLEVBQUUsRUFORjtBQU9KLFFBQUEsT0FBTyxFQUFFO0FBUEwsT0FGVztBQVdqQixNQUFBLE9BQU8sRUFBRTtBQUNQLFFBQUEsSUFETyxnQkFDRixRQURFLEVBQ1EsSUFEUixFQUNjO0FBQ25CLGVBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxVQUFBLE1BQU0sY0FBTyxJQUFQLHlCQUEwQixJQUFJLENBQUMsR0FBTCxFQUExQixHQUF3QyxLQUF4QyxDQUFOLENBQ0csSUFESCxDQUNRLFVBQUEsSUFBSSxFQUFJO0FBQ1osWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQVQsR0FBbUIsSUFBSSxDQUFDLE9BQXhCO0FBQ0EsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsR0FBaUIsSUFBSSxDQUFDLFNBQXRCO0FBQ0QsV0FKSCxXQUtTLFVBQUEsSUFBSSxFQUFJO0FBQ2IsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQVQsR0FBbUIsSUFBSSxDQUFDLE9BQXhCO0FBQ0EsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsR0FBaUIsSUFBSSxDQUFDLEtBQUwsSUFBYyxJQUEvQjtBQUNELFdBUkg7QUFTQSxVQUFBLElBQUksQ0FBQyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0QsU0FkTTtBQWVQLFFBQUEsS0FmTyxtQkFlQztBQUNOLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNBLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxRQUFULEdBQW9CLEVBQXBCO0FBQ0QsU0FsQk07QUFtQlAsUUFBQSxNQW5CTyxvQkFtQkU7QUFDUCxlQUFLLEtBQUwsR0FBYSxFQUFiO0FBQ0EsVUFBQSxPQUFPLENBQUMsT0FBUixHQUNHLElBREgsQ0FDUSxZQUFNO0FBQUEsZ0JBQ0gsV0FERyxHQUNZLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FEeEIsQ0FDSCxXQURHO0FBQUEsNEJBRXdCLElBQUksQ0FBQyxHQUY3QjtBQUFBLGdCQUVMLFFBRkssYUFFTCxRQUZLO0FBQUEsZ0JBRUssTUFGTCxhQUVLLE1BRkw7QUFBQSxnQkFFYSxPQUZiLGFBRWEsT0FGYjtBQUdWLFlBQUEsV0FBVyxDQUFDLE1BQUQsRUFBUztBQUNsQixjQUFBLElBQUksRUFBRSxNQURZO0FBRWxCLGNBQUEsR0FBRyxFQUFFLElBRmE7QUFHbEIsY0FBQSxjQUFjLEVBQUU7QUFIRSxhQUFULENBQVg7QUFLQSxZQUFBLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQVYsQ0FBakI7QUFDQSxnQkFBRyxNQUFNLEdBQUcsT0FBWixFQUFxQixnRUFBaUIsT0FBTyxHQUFDLEdBQXpCO0FBQ3JCLGdCQUFHLENBQUMsUUFBSixFQUFjLE1BQU0sT0FBTjtBQUNkLG1CQUFPLE1BQU0sY0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLElBQWhCLGdCQUFpQyxNQUFqQyxFQUF5QztBQUNwRCxjQUFBLFFBQVEsRUFBUixRQURvRDtBQUVwRCxjQUFBLE1BQU0sRUFBTjtBQUZvRCxhQUF6QyxDQUFiO0FBSUQsV0FoQkgsRUFpQkcsSUFqQkgsQ0FpQlEsWUFBTTtBQUNWLFlBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNBLFlBQUEsSUFBSSxDQUFDLEtBQUw7QUFDRCxXQXBCSCxXQXFCUyxVQUFBLElBQUksRUFBSTtBQUNiLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULEdBQWlCLElBQUksQ0FBQyxLQUFMLElBQWMsSUFBL0I7QUFDRCxXQXZCSDtBQXdCRDtBQTdDTTtBQVhRLEtBQVIsQ0FBWDtBQTJEQSxJQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFyQjtBQUNBLElBQUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQXRCO0FBQ0Q7O0FBckVIO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5UcmFuc2ZlciA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZVRyYW5zZmVyXCIpO1xyXG4gICAgc2VsZi5kb20ubW9kYWwoe1xyXG4gICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcclxuICAgIH0pO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZVRyYW5zZmVyQXBwXCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIHNjb3JlOiAnJyxcclxuICAgICAgICBlcnJvcjogXCJcIixcclxuICAgICAgICBwYXNzd29yZDogXCJcIixcclxuICAgICAgICBudW1iZXI6IFwiXCIsXHJcbiAgICAgICAgdFVpZDogXCJcIixcclxuICAgICAgICBrY2JPbmNlOiBcIlwiLFxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgb3BlbihjYWxsYmFjaywgdFVpZCkge1xyXG4gICAgICAgICAgdGhpcy50VWlkID0gdFVpZDtcclxuICAgICAgICAgIG5rY0FQSShgL3UvJHt0VWlkfS90cmFuc2Zlcj90PSR7RGF0ZS5ub3coKX1gLCBcIkdFVFwiKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5rY2JPbmNlID0gZGF0YS5rY2JPbmNlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnNjb3JlID0gZGF0YS5zaG9wU2NvcmU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5rY2JPbmNlID0gZGF0YS5rY2JPbmNlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIHNlbGYuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKFwic2hvd1wiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlKCkge1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJoaWRlXCIpO1xyXG4gICAgICAgICAgc2VsZi5hcHAucGFzc3dvcmQgPSBcIlwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgdGhpcy5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3Qge2NoZWNrTnVtYmVyfSA9IE5LQy5tZXRob2RzLmNoZWNrRGF0YTtcclxuICAgICAgICAgICAgICBsZXQge3Bhc3N3b3JkLCBudW1iZXIsIGtjYk9uY2V9ID0gc2VsZi5hcHA7XHJcbiAgICAgICAgICAgICAgY2hlY2tOdW1iZXIobnVtYmVyLCB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIui9rOi0pumHkeminVwiLFxyXG4gICAgICAgICAgICAgICAgbWluOiAwLjAxLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBudW1iZXIgPSBwYXJzZUludChudW1iZXIgKiAxMDApO1xyXG4gICAgICAgICAgICAgIGlmKG51bWJlciA+IGtjYk9uY2UpIHRocm93IGDovazotKbph5Hpop3kuI3og73otoXov4cke2tjYk9uY2UvMTAwfWtjYmA7XHJcbiAgICAgICAgICAgICAgaWYoIXBhc3N3b3JkKSB0aHJvdyBcIuivt+i+k+WFpeWvhueggVwiO1xyXG4gICAgICAgICAgICAgIHJldHVybiBua2NBUEkoYC91LyR7c2VsZi5hcHAudFVpZH0vdHJhbnNmZXJgLCBcIlBPU1RcIiwge1xyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgICBudW1iZXJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIui9rOi0puaIkOWKn1wiKTtcclxuICAgICAgICAgICAgICBzZWxmLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5lcnJvciA9IGRhdGEuZXJyb3IgfHwgZGF0YTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNlbGYub3BlbiA9IHNlbGYuYXBwLm9wZW47XHJcbiAgICBzZWxmLmNsb3NlID0gc2VsZi5hcHAuY2xvc2U7XHJcbiAgfVxyXG59XHJcbiJdfQ==
