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

          nkcAPI(url, "PUT", {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvc2hvcC9zaGlwLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaO0FBQ0Usb0JBQWM7QUFBQTs7QUFDWixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLENBQUMsQ0FBQyxpQkFBRCxDQUFaO0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZTtBQUNiLE1BQUEsSUFBSSxFQUFFLEtBRE87QUFFYixNQUFBLFFBQVEsRUFBRTtBQUZHLEtBQWY7QUFJQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsb0JBRGE7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLE9BQU8sRUFBRSxJQURMO0FBRUosUUFBQSxLQUFLLEVBQUUsRUFGSDtBQUdKLFFBQUEsV0FBVyxFQUFFLEVBSFQ7QUFJSixRQUFBLFNBQVMsRUFBRSxNQUpQO0FBS0osUUFBQSxLQUFLLEVBQUUsSUFMSDtBQU1KLFFBQUEsVUFBVSxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksVUFOcEI7QUFPSixRQUFBLFNBQVMsRUFBRTtBQVBQLE9BRlc7QUFXakIsTUFBQSxPQUFPLEVBQUU7QUFDUCxRQUFBLElBRE8sZ0JBQ0YsSUFERSxFQUNJLENBRVYsQ0FITTtBQUlQLFFBQUEsSUFKTyxnQkFJRixJQUpFLEVBSWtCO0FBQUEsY0FBZCxPQUFjLHVFQUFKLEVBQUk7QUFBQSxjQUNoQixPQURnQixHQUNMLE9BREssQ0FDaEIsT0FEZ0I7QUFFdkIsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0EsVUFBQSxPQUFPLENBQUMsT0FBUixH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Q0FBUyxLQUFUO0FBQ0Q7QUFqRkg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLlNob3BTaGlwID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlU2hvcFNoaXBcIik7XHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogXCIjbW9kdWxlU2hvcFNoaXBBcHBcIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIGxvYWRpbmc6IHRydWUsXHJcbiAgICAgICAgb3JkZXI6IFwiXCIsXHJcbiAgICAgICAgdHJhY2tOdW1iZXI6IFwiXCIsXHJcbiAgICAgICAgdHJhY2tOYW1lOiBcIkFVVE9cIixcclxuICAgICAgICB0cmFjazogdHJ1ZSxcclxuICAgICAgICB0cmFja05hbWVzOiBOS0MuY29uZmlncy50cmFja05hbWVzLFxyXG4gICAgICAgIHRyYWNrTGlzdDogW10sXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBjb3B5KHRleHQpIHtcclxuICAgICAgICBcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW4oZnVuYywgb3B0aW9ucyA9IHt9KSB7XHJcbiAgICAgICAgICBjb25zdCB7b3JkZXJJZH0gPSBvcHRpb25zO1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xyXG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBua2NBUEkoYC9zaG9wL21hbmFnZS8ke05LQy5jb25maWdzLnVpZH0vb3JkZXIvZGV0YWlsP29yZGVySWQ9JHtvcmRlcklkfSZ0PSR7RGF0ZS5ub3coKX1gLCBcIkdFVFwiKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLm9yZGVyID0gZGF0YS5vcmRlcjtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC50cmFja05hbWUgPSBkYXRhLm9yZGVyLnRyYWNrTmFtZSB8fCBcIkFVVE9cIjtcclxuICAgICAgICAgICAgICBpZihkYXRhLm9yZGVyLnRyYWNrTnVtYmVyID09PSBcIm5vXCIpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnRyYWNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC50cmFja051bWJlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnRyYWNrTnVtYmVyID0gZGF0YS5vcmRlci50cmFja051bWJlciB8fCBcIlwiO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAudHJhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7dHJhY2ssIG9yZGVyLCB0cmFja05hbWUsIHRyYWNrTnVtYmVyfSA9IHRoaXM7XHJcbiAgICAgICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgICAgICBvcmRlcklkOiBvcmRlci5vcmRlcklkXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBsZXQgdXJsID0gYC9zaG9wL21hbmFnZS8ke05LQy5jb25maWdzLnVpZH0vb3JkZXIvc2VuZEdvb2RzYDtcclxuICAgICAgICAgIGlmKG9yZGVyLm9yZGVyU3RhdHVzID09PSBcInVuU2lnblwiKSB7XHJcbiAgICAgICAgICAgIHVybCA9IGAvc2hvcC9tYW5hZ2UvJHtOS0MuY29uZmlncy51aWR9L29yZGVyL2VkaXRHb29kc2A7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZighdHJhY2spIHtcclxuICAgICAgICAgICAgYm9keS50cmFja05hbWUgPSBcIlwiO1xyXG4gICAgICAgICAgICBib2R5LnRyYWNrTnVtYmVyID0gXCJub1wiO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYm9keS50cmFja05hbWUgPSB0cmFja05hbWU7XHJcbiAgICAgICAgICAgIGJvZHkudHJhY2tOdW1iZXIgPSB0cmFja051bWJlcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5rY0FQSSh1cmwsIFwiUFVUXCIsIHtwb3N0OiBib2R5fSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2VsZi5vcGVuID0gc2VsZi5hcHAub3BlbjtcclxuICAgIHNlbGYuY2xvc2UgPSBzZWxmLmFwcC5jbG9zZTtcclxuICB9XHJcbiAgb3BlbiAoZnVuYywgb3B0aW9ucykge1xyXG4gICAgdGhpcy5hcHAub3BlbihmdW5jLCBvcHRpb25zKTtcclxuICB9XHJcbiAgY2xvc2UoKSB7XHJcbiAgICB0aGlzLmFwcC5jbG9zZSgpO1xyXG4gIH1cclxufTtcclxuIl19
