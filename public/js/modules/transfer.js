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