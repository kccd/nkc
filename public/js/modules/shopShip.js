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
            return nkcAPI("/shop/manage/".concat(NKC.configs.uid, "/order/detail?orderId=").concat(orderId), "GET");
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