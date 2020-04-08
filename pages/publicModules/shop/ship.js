(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.ShopShip =
/*#__PURE__*/
function () {
  function _class() {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $("#moduleShopShip");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: "#moduleShopShipApp",
      data: {
        loading: true,
        order: "",
        trackNumber: "",
        trackName: "AUTO",
        track: true,
        trackNames: NKC.configs.trackNames,
        trackList: []
      },
      methods: {
        copy: function copy(text) {},
        open: function open(func) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var orderId = options.orderId;
          self.dom.modal("show");
          Promise.resolve().then(function () {
            return nkcAPI("/shop/manage/".concat(NKC.configs.uid, "/order/detail?orderId=").concat(orderId, "&t=").concat(Date.now()), "GET");
          }).then(function (data) {
            self.app.loading = false;
            self.app.order = data.order;
            self.app.trackName = data.order.trackName || "AUTO";

            if (data.order.trackNumber === "no") {
              self.app.track = false;
              self.app.trackNumber = "";
            } else {
              self.app.trackNumber = data.order.trackNumber || "";
              self.app.track = true;
            }
          })["catch"](sweetError);
        },
        close: function close() {
          self.dom.modal("hide");
        },
        submit: function submit() {
          var track = this.track,
              order = this.order,
              trackName = this.trackName,
              trackNumber = this.trackNumber;
          var body = {
            orderId: order.orderId
          };
          var url = "/shop/manage/".concat(NKC.configs.uid, "/order/sendGoods");

          if (order.orderStatus === "unSign") {
            url = "/shop/manage/".concat(NKC.configs.uid, "/order/editGoods");
          }

          if (!track) {
            body.trackName = "";
            body.trackNumber = "no";
          } else {
            body.trackName = trackName;
            body.trackNumber = trackNumber;
          }

          nkcAPI(url, "PATCH", {
            post: body
          }).then(function () {
            self.close();
            sweetSuccess("保存成功");
          })["catch"](sweetError);
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }

  _createClass(_class, [{
    key: "open",
    value: function open(func, options) {
      this.app.open(func, options);
    }
  }, {
    key: "close",
    value: function close() {
      this.app.close();
    }
  }]);

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvc2hvcC9zaGlwLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaO0FBQUE7QUFBQTtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsaUJBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBSUEsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLG9CQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxPQUFPLEVBQUUsSUFETDtBQUVKLFFBQUEsS0FBSyxFQUFFLEVBRkg7QUFHSixRQUFBLFdBQVcsRUFBRSxFQUhUO0FBSUosUUFBQSxTQUFTLEVBQUUsTUFKUDtBQUtKLFFBQUEsS0FBSyxFQUFFLElBTEg7QUFNSixRQUFBLFVBQVUsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFVBTnBCO0FBT0osUUFBQSxTQUFTLEVBQUU7QUFQUCxPQUZXO0FBV2pCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxJQURPLGdCQUNGLElBREUsRUFDSSxDQUVWLENBSE07QUFJUCxRQUFBLElBSk8sZ0JBSUYsSUFKRSxFQUlrQjtBQUFBLGNBQWQsT0FBYyx1RUFBSixFQUFJO0FBQUEsY0FDaEIsT0FEZ0IsR0FDTCxPQURLLENBQ2hCLE9BRGdCO0FBRXZCLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNBLFVBQUEsT0FBTyxD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V0FBSyxHQUFMLENBQVMsS0FBVDtBQUNEO0FBakZIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5TaG9wU2hpcCA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZVNob3BTaGlwXCIpO1xuICAgIHNlbGYuZG9tLm1vZGFsKHtcbiAgICAgIHNob3c6IGZhbHNlLFxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcbiAgICB9KTtcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xuICAgICAgZWw6IFwiI21vZHVsZVNob3BTaGlwQXBwXCIsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgIG9yZGVyOiBcIlwiLFxuICAgICAgICB0cmFja051bWJlcjogXCJcIixcbiAgICAgICAgdHJhY2tOYW1lOiBcIkFVVE9cIixcbiAgICAgICAgdHJhY2s6IHRydWUsXG4gICAgICAgIHRyYWNrTmFtZXM6IE5LQy5jb25maWdzLnRyYWNrTmFtZXMsXG4gICAgICAgIHRyYWNrTGlzdDogW10sXG4gICAgICB9LFxuICAgICAgbWV0aG9kczoge1xuICAgICAgICBjb3B5KHRleHQpIHtcbiAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIG9wZW4oZnVuYywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgICAgY29uc3Qge29yZGVySWR9ID0gb3B0aW9ucztcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcInNob3dcIik7XG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3Nob3AvbWFuYWdlLyR7TktDLmNvbmZpZ3MudWlkfS9vcmRlci9kZXRhaWw/b3JkZXJJZD0ke29yZGVySWR9JnQ9JHtEYXRlLm5vdygpfWAsIFwiR0VUXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICBzZWxmLmFwcC5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgIHNlbGYuYXBwLm9yZGVyID0gZGF0YS5vcmRlcjtcbiAgICAgICAgICAgICAgc2VsZi5hcHAudHJhY2tOYW1lID0gZGF0YS5vcmRlci50cmFja05hbWUgfHwgXCJBVVRPXCI7XG4gICAgICAgICAgICAgIGlmKGRhdGEub3JkZXIudHJhY2tOdW1iZXIgPT09IFwibm9cIikge1xuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnRyYWNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VsZi5hcHAudHJhY2tOdW1iZXIgPSBcIlwiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnRyYWNrTnVtYmVyID0gZGF0YS5vcmRlci50cmFja051bWJlciB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnRyYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJoaWRlXCIpO1xuICAgICAgICB9LFxuICAgICAgICBzdWJtaXQoKSB7XG4gICAgICAgICAgY29uc3Qge3RyYWNrLCBvcmRlciwgdHJhY2tOYW1lLCB0cmFja051bWJlcn0gPSB0aGlzO1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSB7XG4gICAgICAgICAgICBvcmRlcklkOiBvcmRlci5vcmRlcklkXG4gICAgICAgICAgfTtcbiAgICAgICAgICBcbiAgICAgICAgICBsZXQgdXJsID0gYC9zaG9wL21hbmFnZS8ke05LQy5jb25maWdzLnVpZH0vb3JkZXIvc2VuZEdvb2RzYDtcbiAgICAgICAgICBpZihvcmRlci5vcmRlclN0YXR1cyA9PT0gXCJ1blNpZ25cIikge1xuICAgICAgICAgICAgdXJsID0gYC9zaG9wL21hbmFnZS8ke05LQy5jb25maWdzLnVpZH0vb3JkZXIvZWRpdEdvb2RzYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoIXRyYWNrKSB7XG4gICAgICAgICAgICBib2R5LnRyYWNrTmFtZSA9IFwiXCI7XG4gICAgICAgICAgICBib2R5LnRyYWNrTnVtYmVyID0gXCJub1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib2R5LnRyYWNrTmFtZSA9IHRyYWNrTmFtZTtcbiAgICAgICAgICAgIGJvZHkudHJhY2tOdW1iZXIgPSB0cmFja051bWJlcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmtjQVBJKHVybCwgXCJQQVRDSFwiLCB7cG9zdDogYm9keX0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xuICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIilcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYub3BlbiA9IHNlbGYuYXBwLm9wZW47XG4gICAgc2VsZi5jbG9zZSA9IHNlbGYuYXBwLmNsb3NlO1xuICB9XG4gIG9wZW4gKGZ1bmMsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmFwcC5vcGVuKGZ1bmMsIG9wdGlvbnMpO1xuICB9XG4gIGNsb3NlKCkge1xuICAgIHRoaXMuYXBwLmNsb3NlKCk7XG4gIH1cbn07Il19
