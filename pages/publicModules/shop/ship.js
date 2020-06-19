(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.ShopShip = /*#__PURE__*/function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL3Nob3Avc2hpcC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsaUJBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBSUEsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLG9CQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxPQUFPLEVBQUUsSUFETDtBQUVKLFFBQUEsS0FBSyxFQUFFLEVBRkg7QUFHSixRQUFBLFdBQVcsRUFBRSxFQUhUO0FBSUosUUFBQSxTQUFTLEVBQUUsTUFKUDtBQUtKLFFBQUEsS0FBSyxFQUFFLElBTEg7QUFNSixRQUFBLFVBQVUsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLFVBTnBCO0FBT0osUUFBQSxTQUFTLEVBQUU7QUFQUCxPQUZXO0FBV2pCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxJQURPLGdCQUNGLElBREUsRUFDSSxDQUVWLENBSE07QUFJUCxRQUFBLElBSk8sZ0JBSUYsSUFKRSxFQUlrQjtBQUFBLGNBQWQsT0FBYyx1RUFBSixFQUFJO0FBQUEsY0FDaEIsT0FEZ0IsR0FDTCxPQURLLENBQ2hCLE9BRGdCO0FBRXZCLFVBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWUsTUFBZjtBQUNBLFVBQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtB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OztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5TaG9wU2hpcCA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZVNob3BTaGlwXCIpO1xyXG4gICAgc2VsZi5kb20ubW9kYWwoe1xyXG4gICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcclxuICAgIH0pO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZVNob3BTaGlwQXBwXCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIG9yZGVyOiBcIlwiLFxyXG4gICAgICAgIHRyYWNrTnVtYmVyOiBcIlwiLFxyXG4gICAgICAgIHRyYWNrTmFtZTogXCJBVVRPXCIsXHJcbiAgICAgICAgdHJhY2s6IHRydWUsXHJcbiAgICAgICAgdHJhY2tOYW1lczogTktDLmNvbmZpZ3MudHJhY2tOYW1lcyxcclxuICAgICAgICB0cmFja0xpc3Q6IFtdLFxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgY29weSh0ZXh0KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcGVuKGZ1bmMsIG9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgICAgY29uc3Qge29yZGVySWR9ID0gb3B0aW9ucztcclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKFwic2hvd1wiKTtcclxuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvc2hvcC9tYW5hZ2UvJHtOS0MuY29uZmlncy51aWR9L29yZGVyL2RldGFpbD9vcmRlcklkPSR7b3JkZXJJZH0mdD0ke0RhdGUubm93KCl9YCwgXCJHRVRcIik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5vcmRlciA9IGRhdGEub3JkZXI7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAudHJhY2tOYW1lID0gZGF0YS5vcmRlci50cmFja05hbWUgfHwgXCJBVVRPXCI7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YS5vcmRlci50cmFja051bWJlciA9PT0gXCJub1wiKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC50cmFjayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAudHJhY2tOdW1iZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC50cmFja051bWJlciA9IGRhdGEub3JkZXIudHJhY2tOdW1iZXIgfHwgXCJcIjtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnRyYWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlKCkge1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJoaWRlXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgY29uc3Qge3RyYWNrLCBvcmRlciwgdHJhY2tOYW1lLCB0cmFja051bWJlcn0gPSB0aGlzO1xyXG4gICAgICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICAgICAgb3JkZXJJZDogb3JkZXIub3JkZXJJZFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgbGV0IHVybCA9IGAvc2hvcC9tYW5hZ2UvJHtOS0MuY29uZmlncy51aWR9L29yZGVyL3NlbmRHb29kc2A7XHJcbiAgICAgICAgICBpZihvcmRlci5vcmRlclN0YXR1cyA9PT0gXCJ1blNpZ25cIikge1xyXG4gICAgICAgICAgICB1cmwgPSBgL3Nob3AvbWFuYWdlLyR7TktDLmNvbmZpZ3MudWlkfS9vcmRlci9lZGl0R29vZHNgO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYoIXRyYWNrKSB7XHJcbiAgICAgICAgICAgIGJvZHkudHJhY2tOYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgYm9keS50cmFja051bWJlciA9IFwibm9cIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJvZHkudHJhY2tOYW1lID0gdHJhY2tOYW1lO1xyXG4gICAgICAgICAgICBib2R5LnRyYWNrTnVtYmVyID0gdHJhY2tOdW1iZXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBua2NBUEkodXJsLCBcIlBBVENIXCIsIHtwb3N0OiBib2R5fSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5vcGVuID0gc2VsZi5hcHAub3BlbjtcclxuICAgIHNlbGYuY2xvc2UgPSBzZWxmLmFwcC5jbG9zZTtcclxuICB9XHJcbiAgb3BlbiAoZnVuYywgb3B0aW9ucykge1xyXG4gICAgdGhpcy5hcHAub3BlbihmdW5jLCBvcHRpb25zKTtcclxuICB9XHJcbiAgY2xvc2UoKSB7XHJcbiAgICB0aGlzLmFwcC5jbG9zZSgpO1xyXG4gIH1cclxufTsiXX0=
