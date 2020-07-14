(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var data = NKC.methods.getDataById("data"); // 默认选择第一个运费模板

data.results.map(function (r) {
  r.buyMessage = "";
  r.products.map(function (p) {
    var product = p.product;

    if (!product.isFreePost) {
      p.freightName = product.freightTemplates[0].name;
      p.certId = "";
    }
  });
});
var app = new Vue({
  el: "#app",
  data: {
    addresses: data.addresses,
    // 地址
    selectedAddress: data.addresses[0] || "",
    // 已选择的地址
    results: data.results,
    // 商品规格数据
    freightTotal: 0,
    // 运费总计
    priceTotal: 0,
    // 商品总计
    showAddressForm: false,
    addressForm: {
      username: "",
      address: "",
      location: "",
      mobile: ""
    }
  },
  mounted: function mounted() {
    this.extendProduct();
    window.SelectAddress = new NKC.modules.SelectAddress();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    visitUrl: NKC.methods.visitUrl,
    checkString: NKC.methods.checkData.checkString,
    // 隐藏添加地址的输入框
    switchAddressForm: function switchAddressForm() {
      this.showAddressForm = !this.showAddressForm;
    },
    // 添加新地址
    saveAddressForm: function saveAddressForm() {
      var self = this;
      var _this$addressForm = this.addressForm,
          username = _this$addressForm.username,
          address = _this$addressForm.address,
          location = _this$addressForm.location,
          mobile = _this$addressForm.mobile;
      this.checkString(username, {
        name: "收件人姓名",
        minLength: 1,
        maxLength: 50
      });
      this.checkString(location, {
        name: "所在地区",
        minLength: 1,
        maxLength: 100
      });
      this.checkString(address, {
        name: "详细地址",
        minLength: 1,
        maxLength: 500
      });
      this.checkString(mobile, {
        name: "手机号",
        minLength: 1,
        maxLength: 100
      });
      nkcAPI("/u/".concat(NKC.configs.uid, "/settings/transaction"), "PATCH", {
        operation: "add",
        addresses: [this.addressForm]
      }).then(function (data) {
        self.addresses = data.addresses;

        if (self.addresses.length) {
          self.selectedAddress = self.addresses[self.addresses.length - 1];
        } else {
          self.selectedAddress = "";
        }

        self.switchAddressForm();
      })["catch"](sweetError);
    },
    selectLocation: function selectLocation() {
      var self = this;
      SelectAddress.open(function (data) {
        self.addressForm.location = data.join(" ");
      });
    },
    // 改变规格的数量
    changeCount: function changeCount(type, param) {
      if (type == "up") {
        if (param.count >= param.productParam.stocksSurplus) {
          // 数量不能大于规格库存
          screenTopWarning("库存不足");
          return;
        }

        ;
        param.count++;
      } else if (param.count > 1) {
        param.count--;
      }

      this.extendProduct();
    },
    // 计算规格运费、价格
    extendProduct: function extendProduct() {
      var freightTotal = 0,
          priceTotal_ = 0;
      this.results.map(function (r) {
        r.products.map(function (p) {
          // 根据用户选择的快递名获取快递模板
          var freightName = p.freightName;
          var _p$product = p.product,
              freightTemplates = _p$product.freightTemplates,
              isFreePost = _p$product.isFreePost;

          if (!isFreePost) {
            var _iterator = _createForOfIteratorHelper(freightTemplates),
                _step;

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var t = _step.value;

                if (t.name === freightName) {
                  p.freight = t;
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          } // 统计同一商品下规格的总个数以及总价格


          var countTotal = 0,
              priceTotal = 0;
          p.params.map(function (param) {
            var count = param.count,
                price = param.price;
            countTotal += count;
            priceTotal += count * price;
          });
          p.countTotal = countTotal;
          p.priceTotal = priceTotal;
          p.freightTotal = 0;

          if (!isFreePost) {
            if (p.countTotal === 1) {
              p.freightTotal = p.freight.firstPrice;
            } else {
              p.freightTotal = p.freight.firstPrice + p.freight.addPrice * (p.countTotal - 1);
            }
          } // 根据每个商品的总运费、商品总价格计算整个订单的运费以及商品价格


          freightTotal += p.freightTotal;
          priceTotal_ += p.priceTotal;
        });
      });
      this.freightTotal = freightTotal;
      this.priceTotal = priceTotal_;
    },
    selectAddress: function selectAddress(address) {
      this.selectedAddress = address;
    },
    setFreightByName: function setFreightByName() {
      this.extendProduct();
    },
    // 刷新用户的快递信息
    getAddresses: function getAddresses() {
      var self = this;
      nkcAPI(window.location.href + "&t=".concat(Date.now()), "GET").then(function (data) {
        self.addresses = data.addresses;
        sweetSuccess("刷新成功");
      })["catch"](sweetError);
    },
    // 用户选择了凭证文件
    selectedFile: function selectedFile(r, p) {
      var product = p.product;
      var dom = $("input.hidden.input-".concat(product.productId));
      dom = dom[0];
      var file = dom.files[0];
      var formData = new FormData();
      formData.append("type", "shopping");
      formData.append("file", file);
      nkcUploadFile("/shop/cert", "POST", formData).then(function (data) {
        p.certId = data.cert._id;
        Vue.set(r.products, r.products.indexOf(p), p);
        sweetSuccess("上传成功");
      })["catch"](sweetError);
    },
    // 查看凭证
    getCert: function getCert(certId) {
      NKC.methods.visitUrl("/shop/cert/".concat(certId), true);
    },
    submit: function submit() {
      var results = this.results,
          selectedAddress = this.selectedAddress;
      var body = {
        params: [],
        address: selectedAddress
      };
      Promise.resolve().then(function () {
        if (!body.address) throw "请选择收货地址";
        results.map(function (userObj) {
          var products = userObj.products,
              user = userObj.user,
              buyMessage = userObj.buyMessage;
          var r = {
            uid: user.uid,
            buyMessage: buyMessage,
            products: []
          };
          products.map(function (productObj) {
            var product = productObj.product,
                params = productObj.params,
                priceTotal = productObj.priceTotal,
                freightTotal = productObj.freightTotal,
                certId = productObj.certId,
                freightName = productObj.freightName;
            if (product.uploadCert && !certId) throw "请上传凭证";
            if (!product.isFreePost && !freightName) throw "请选择物流";
            var p = {
              productId: product.productId,
              priceTotal: priceTotal,
              freightTotal: freightTotal,
              certId: certId,
              freightName: freightName,
              productParams: []
            };
            params.map(function (paramObj) {
              var productParam = paramObj.productParam,
                  count = paramObj.count,
                  price = paramObj.price,
                  cartId = paramObj.cartId;
              p.productParams.push({
                _id: productParam._id,
                cartId: cartId,
                count: count,
                price: price
              });
            });
            r.products.push(p);
          });
          body.params.push(r);
        });
        console.log(body);
        return nkcAPI("/shop/order", "POST", body);
      }).then(function (data) {
        openToNewLocation('/shop/pay?ordersId=' + data.ordersId.join("-"));
        sweetSuccess("提交成功，正在前往付款页面");
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zaG9wL2JpbGwvYmlsbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiLEMsQ0FFQTs7QUFDQSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBaUIsVUFBQSxDQUFDLEVBQUk7QUFDcEIsRUFBQSxDQUFDLENBQUMsVUFBRixHQUFlLEVBQWY7QUFDQSxFQUFBLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBWCxDQUFlLFVBQUEsQ0FBQyxFQUFJO0FBQ2xCLFFBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFsQjs7QUFDQSxRQUFHLENBQUMsT0FBTyxDQUFDLFVBQVosRUFBd0I7QUFDdEIsTUFBQSxDQUFDLENBQUMsV0FBRixHQUFnQixPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsQ0FBekIsRUFBNEIsSUFBNUM7QUFDQSxNQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBWDtBQUNEO0FBQ0YsR0FORDtBQU9ELENBVEQ7QUFXQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBRFo7QUFDdUI7QUFDM0IsSUFBQSxlQUFlLEVBQUUsSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEtBQXFCLEVBRmxDO0FBRXNDO0FBQzFDLElBQUEsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUhWO0FBR21CO0FBQ3ZCLElBQUEsWUFBWSxFQUFFLENBSlY7QUFJYTtBQUNqQixJQUFBLFVBQVUsRUFBRSxDQUxSO0FBS1c7QUFFZixJQUFBLGVBQWUsRUFBRSxLQVBiO0FBUUosSUFBQSxXQUFXLEVBQUU7QUFDWCxNQUFBLFFBQVEsRUFB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Q0EsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVo7QUFDQSxlQUFPLE1BQU0sQ0FBQyxhQUFELEVBQWdCLE1BQWhCLEVBQXdCLElBQXhCLENBQWI7QUFDRCxPQXJDSCxFQXNDRyxJQXRDSCxDQXNDUSxVQUFBLElBQUksRUFBSTtBQUNaLFFBQUEsaUJBQWlCLENBQUMsd0JBQXdCLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFtQixHQUFuQixDQUF6QixDQUFqQjtBQUNBLFFBQUEsWUFBWSxDQUFDLGVBQUQsQ0FBWjtBQUNELE9BekNILFdBMENTLFVBMUNUO0FBMkNEO0FBak1NO0FBckJTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcblxyXG4vLyDpu5jorqTpgInmi6nnrKzkuIDkuKrov5DotLnmqKHmnb9cclxuZGF0YS5yZXN1bHRzLm1hcChyID0+IHtcclxuICByLmJ1eU1lc3NhZ2UgPSBcIlwiO1xyXG4gIHIucHJvZHVjdHMubWFwKHAgPT4ge1xyXG4gICAgY29uc3QgcHJvZHVjdCA9IHAucHJvZHVjdDtcclxuICAgIGlmKCFwcm9kdWN0LmlzRnJlZVBvc3QpIHtcclxuICAgICAgcC5mcmVpZ2h0TmFtZSA9IHByb2R1Y3QuZnJlaWdodFRlbXBsYXRlc1swXS5uYW1lXHJcbiAgICAgIHAuY2VydElkID0gXCJcIjtcclxuICAgIH1cclxuICB9KVxyXG59KVxyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIGFkZHJlc3NlczogZGF0YS5hZGRyZXNzZXMsIC8vIOWcsOWdgFxyXG4gICAgc2VsZWN0ZWRBZGRyZXNzOiBkYXRhLmFkZHJlc3Nlc1swXSB8fCBcIlwiLCAvLyDlt7LpgInmi6nnmoTlnLDlnYBcclxuICAgIHJlc3VsdHM6IGRhdGEucmVzdWx0cywgLy8g5ZWG5ZOB6KeE5qC85pWw5o2uXHJcbiAgICBmcmVpZ2h0VG90YWw6IDAsIC8vIOi/kOi0ueaAu+iuoVxyXG4gICAgcHJpY2VUb3RhbDogMCwgLy8g5ZWG5ZOB5oC76K6hXHJcblxyXG4gICAgc2hvd0FkZHJlc3NGb3JtOiBmYWxzZSxcclxuICAgIGFkZHJlc3NGb3JtOiB7XHJcbiAgICAgIHVzZXJuYW1lOiBcIlwiLFxyXG4gICAgICBhZGRyZXNzOiBcIlwiLFxyXG4gICAgICBsb2NhdGlvbjogXCJcIixcclxuICAgICAgbW9iaWxlOiBcIlwiXHJcbiAgICB9XHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgdGhpcy5leHRlbmRQcm9kdWN0KCk7XHJcbiAgICB3aW5kb3cuU2VsZWN0QWRkcmVzcyA9IG5ldyBOS0MubW9kdWxlcy5TZWxlY3RBZGRyZXNzKCk7XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcclxuICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICAvLyDpmpDol4/mt7vliqDlnLDlnYDnmoTovpPlhaXmoYZcclxuICAgIHN3aXRjaEFkZHJlc3NGb3JtKCkge1xyXG4gICAgICB0aGlzLnNob3dBZGRyZXNzRm9ybSA9ICF0aGlzLnNob3dBZGRyZXNzRm9ybTtcclxuICAgIH0sXHJcbiAgICAvLyDmt7vliqDmlrDlnLDlnYBcclxuICAgIHNhdmVBZGRyZXNzRm9ybSgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHt1c2VybmFtZSwgYWRkcmVzcywgbG9jYXRpb24sIG1vYmlsZX0gPSB0aGlzLmFkZHJlc3NGb3JtO1xyXG4gICAgICB0aGlzLmNoZWNrU3RyaW5nKHVzZXJuYW1lLCB7XHJcbiAgICAgICAgbmFtZTogXCLmlLbku7bkurrlp5PlkI1cIixcclxuICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgbWF4TGVuZ3RoOiA1MFxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5jaGVja1N0cmluZyhsb2NhdGlvbiwge1xyXG4gICAgICAgIG5hbWU6IFwi5omA5Zyo5Zyw5Yy6XCIsXHJcbiAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNoZWNrU3RyaW5nKGFkZHJlc3MsIHtcclxuICAgICAgICBuYW1lOiBcIuivpue7huWcsOWdgFwiLFxyXG4gICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICBtYXhMZW5ndGg6IDUwMFxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5jaGVja1N0cmluZyhtb2JpbGUsIHtcclxuICAgICAgICBuYW1lOiBcIuaJi+acuuWPt1wiLFxyXG4gICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICBtYXhMZW5ndGg6IDEwMFxyXG4gICAgICB9KTtcclxuICAgICAgbmtjQVBJKGAvdS8ke05LQy5jb25maWdzLnVpZH0vc2V0dGluZ3MvdHJhbnNhY3Rpb25gLCBcIlBBVENIXCIsIHtcclxuICAgICAgICBvcGVyYXRpb246IFwiYWRkXCIsXHJcbiAgICAgICAgYWRkcmVzc2VzOiBbdGhpcy5hZGRyZXNzRm9ybV1cclxuICAgICAgfSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYuYWRkcmVzc2VzID0gZGF0YS5hZGRyZXNzZXM7XHJcbiAgICAgICAgICBpZihzZWxmLmFkZHJlc3Nlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RlZEFkZHJlc3MgPSBzZWxmLmFkZHJlc3Nlc1tzZWxmLmFkZHJlc3Nlcy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0ZWRBZGRyZXNzID0gXCJcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNlbGYuc3dpdGNoQWRkcmVzc0Zvcm0oKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICBzZWxlY3RMb2NhdGlvbigpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFNlbGVjdEFkZHJlc3Mub3BlbihkYXRhID0+IHtcclxuICAgICAgICBzZWxmLmFkZHJlc3NGb3JtLmxvY2F0aW9uID0gZGF0YS5qb2luKFwiIFwiKTtcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICAvLyDmlLnlj5jop4TmoLznmoTmlbDph49cclxuICAgIGNoYW5nZUNvdW50KHR5cGUsIHBhcmFtKSB7XHJcbiAgICAgIGlmKHR5cGUgPT0gXCJ1cFwiKSB7XHJcbiAgICAgICAgaWYocGFyYW0uY291bnQgPj0gcGFyYW0ucHJvZHVjdFBhcmFtLnN0b2Nrc1N1cnBsdXMpIHsgLy8g5pWw6YeP5LiN6IO95aSn5LqO6KeE5qC85bqT5a2YXHJcbiAgICAgICAgICBzY3JlZW5Ub3BXYXJuaW5nKFwi5bqT5a2Y5LiN6LazXCIpO1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwYXJhbS5jb3VudCArKztcclxuICAgICAgfSBlbHNlIGlmKHBhcmFtLmNvdW50ID4gMSl7XHJcbiAgICAgICAgcGFyYW0uY291bnQgLS07XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5leHRlbmRQcm9kdWN0KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6h566X6KeE5qC86L+Q6LS544CB5Lu35qC8XHJcbiAgICBleHRlbmRQcm9kdWN0KCkge1xyXG4gICAgICBsZXQgZnJlaWdodFRvdGFsID0gMCwgcHJpY2VUb3RhbF8gPSAwO1xyXG4gICAgICB0aGlzLnJlc3VsdHMubWFwKHIgPT4ge1xyXG4gICAgICAgIHIucHJvZHVjdHMubWFwKHAgPT4ge1xyXG4gICAgICAgICAgLy8g5qC55o2u55So5oi36YCJ5oup55qE5b+r6YCS5ZCN6I635Y+W5b+r6YCS5qih5p2/XHJcbiAgICAgICAgICBjb25zdCB7ZnJlaWdodE5hbWV9ID0gcDtcclxuICAgICAgICAgIGNvbnN0IHtmcmVpZ2h0VGVtcGxhdGVzLCBpc0ZyZWVQb3N0fSA9IHAucHJvZHVjdDtcclxuICAgICAgICAgIGlmKCFpc0ZyZWVQb3N0KSB7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCB0IG9mIGZyZWlnaHRUZW1wbGF0ZXMpIHtcclxuICAgICAgICAgICAgICBpZih0Lm5hbWUgPT09IGZyZWlnaHROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBwLmZyZWlnaHQgPSB0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSAgICAgIFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8g57uf6K6h5ZCM5LiA5ZWG5ZOB5LiL6KeE5qC855qE5oC75Liq5pWw5Lul5Y+K5oC75Lu35qC8XHJcbiAgICAgICAgICBsZXQgY291bnRUb3RhbCA9IDAsIHByaWNlVG90YWwgPSAwO1xyXG4gICAgICAgICAgcC5wYXJhbXMubWFwKHBhcmFtID0+IHtcclxuICAgICAgICAgICAgY29uc3Qge2NvdW50LCBwcmljZX0gPSBwYXJhbTsgXHJcbiAgICAgICAgICAgIGNvdW50VG90YWwgKz0gY291bnQ7XHJcbiAgICAgICAgICAgIHByaWNlVG90YWwgKz0gKGNvdW50ICogcHJpY2UpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBwLmNvdW50VG90YWwgPSBjb3VudFRvdGFsO1xyXG4gICAgICAgICAgcC5wcmljZVRvdGFsID0gcHJpY2VUb3RhbDtcclxuICAgICAgICAgIHAuZnJlaWdodFRvdGFsID0gMDtcclxuICAgICAgICAgIGlmKCFpc0ZyZWVQb3N0KSB7XHJcbiAgICAgICAgICAgIGlmKHAuY291bnRUb3RhbCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgIHAuZnJlaWdodFRvdGFsID0gcC5mcmVpZ2h0LmZpcnN0UHJpY2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcC5mcmVpZ2h0VG90YWwgPSBwLmZyZWlnaHQuZmlyc3RQcmljZSArIChwLmZyZWlnaHQuYWRkUHJpY2UgKiAocC5jb3VudFRvdGFsIC0gMSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyDmoLnmja7mr4/kuKrllYblk4HnmoTmgLvov5DotLnjgIHllYblk4HmgLvku7fmoLzorqHnrpfmlbTkuKrorqLljZXnmoTov5DotLnku6Xlj4rllYblk4Hku7fmoLxcclxuICAgICAgICAgIGZyZWlnaHRUb3RhbCArPSBwLmZyZWlnaHRUb3RhbDtcclxuICAgICAgICAgIHByaWNlVG90YWxfICs9IHAucHJpY2VUb3RhbDtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuZnJlaWdodFRvdGFsID0gZnJlaWdodFRvdGFsO1xyXG4gICAgICB0aGlzLnByaWNlVG90YWwgPSBwcmljZVRvdGFsXztcclxuICAgIH0sXHJcbiAgICBzZWxlY3RBZGRyZXNzKGFkZHJlc3MpIHtcclxuICAgICAgdGhpcy5zZWxlY3RlZEFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgfSxcclxuICAgIHNldEZyZWlnaHRCeU5hbWUoKSB7XHJcbiAgICAgIHRoaXMuZXh0ZW5kUHJvZHVjdCgpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsOeUqOaIt+eahOW/q+mAkuS/oeaBr1xyXG4gICAgZ2V0QWRkcmVzc2VzKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgbmtjQVBJKHdpbmRvdy5sb2NhdGlvbi5ocmVmICsgYCZ0PSR7RGF0ZS5ub3coKX1gLCBcIkdFVFwiKVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZi5hZGRyZXNzZXMgPSBkYXRhLmFkZHJlc3NlcztcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuWIt+aWsOaIkOWKn1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgfSxcclxuICAgIC8vIOeUqOaIt+mAieaLqeS6huWHreivgeaWh+S7tlxyXG4gICAgc2VsZWN0ZWRGaWxlKHIsIHApIHtcclxuICAgICAgY29uc3Qge3Byb2R1Y3R9ID0gcDtcclxuICAgICAgbGV0IGRvbSA9ICQoYGlucHV0LmhpZGRlbi5pbnB1dC0ke3Byb2R1Y3QucHJvZHVjdElkfWApO1xyXG4gICAgICBkb20gPSBkb21bMF07XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBkb20uZmlsZXNbMF07XHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcInR5cGVcIiwgXCJzaG9wcGluZ1wiKTtcclxuICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZVwiLCBmaWxlKTtcclxuICAgICAgbmtjVXBsb2FkRmlsZShcIi9zaG9wL2NlcnRcIiwgXCJQT1NUXCIsIGZvcm1EYXRhKVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgcC5jZXJ0SWQgPSBkYXRhLmNlcnQuX2lkO1xyXG4gICAgICAgICAgVnVlLnNldChyLnByb2R1Y3RzLCByLnByb2R1Y3RzLmluZGV4T2YocCksIHApO1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5LiK5Lyg5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIC8vIOafpeeci+WHreivgVxyXG4gICAgZ2V0Q2VydChjZXJ0SWQpIHtcclxuICAgICAgTktDLm1ldGhvZHMudmlzaXRVcmwoYC9zaG9wL2NlcnQvJHtjZXJ0SWR9YCwgdHJ1ZSk7XHJcbiAgICB9LFxyXG4gICAgc3VibWl0KCkge1xyXG4gICAgICBjb25zdCB7cmVzdWx0cywgc2VsZWN0ZWRBZGRyZXNzfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSB7XHJcbiAgICAgICAgcGFyYW1zOiBbXSxcclxuICAgICAgICBhZGRyZXNzOiBzZWxlY3RlZEFkZHJlc3NcclxuICAgICAgfTtcclxuXHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgaWYoIWJvZHkuYWRkcmVzcykgdGhyb3cgXCLor7fpgInmi6nmlLbotKflnLDlnYBcIjtcclxuICAgICAgICAgIHJlc3VsdHMubWFwKHVzZXJPYmogPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7cHJvZHVjdHMsIHVzZXIsIGJ1eU1lc3NhZ2V9ID0gdXNlck9iajtcclxuICAgICAgICAgICAgY29uc3QgciA9IHtcclxuICAgICAgICAgICAgICB1aWQ6IHVzZXIudWlkLFxyXG4gICAgICAgICAgICAgIGJ1eU1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgcHJvZHVjdHM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJvZHVjdHMubWFwKHByb2R1Y3RPYmogPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHtwcm9kdWN0LCBwYXJhbXMsIHByaWNlVG90YWwsIGZyZWlnaHRUb3RhbCwgY2VydElkLCBmcmVpZ2h0TmFtZX0gPSBwcm9kdWN0T2JqO1xyXG4gICAgICAgICAgICAgIGlmKHByb2R1Y3QudXBsb2FkQ2VydCAmJiAhY2VydElkKSB0aHJvdyBcIuivt+S4iuS8oOWHreivgVwiO1xyXG4gICAgICAgICAgICAgIGlmKCFwcm9kdWN0LmlzRnJlZVBvc3QgJiYgIWZyZWlnaHROYW1lKSB0aHJvdyBcIuivt+mAieaLqeeJqea1gVwiO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHAgPSB7XHJcbiAgICAgICAgICAgICAgICBwcm9kdWN0SWQ6IHByb2R1Y3QucHJvZHVjdElkLFxyXG4gICAgICAgICAgICAgICAgcHJpY2VUb3RhbCxcclxuICAgICAgICAgICAgICAgIGZyZWlnaHRUb3RhbCxcclxuICAgICAgICAgICAgICAgIGNlcnRJZCxcclxuICAgICAgICAgICAgICAgIGZyZWlnaHROYW1lLFxyXG4gICAgICAgICAgICAgICAgcHJvZHVjdFBhcmFtczogW11cclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHBhcmFtcy5tYXAocGFyYW1PYmogPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qge3Byb2R1Y3RQYXJhbSwgY291bnQsIHByaWNlLCBjYXJ0SWR9ID0gcGFyYW1PYmo7XHJcbiAgICAgICAgICAgICAgICBwLnByb2R1Y3RQYXJhbXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgIF9pZDogcHJvZHVjdFBhcmFtLl9pZCxcclxuICAgICAgICAgICAgICAgICAgY2FydElkLFxyXG4gICAgICAgICAgICAgICAgICBjb3VudCxcclxuICAgICAgICAgICAgICAgICAgcHJpY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHIucHJvZHVjdHMucHVzaChwKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgYm9keS5wYXJhbXMucHVzaChyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYm9keSk7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKFwiL3Nob3Avb3JkZXJcIiwgXCJQT1NUXCIsIGJvZHkpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBvcGVuVG9OZXdMb2NhdGlvbignL3Nob3AvcGF5P29yZGVyc0lkPScgKyBkYXRhLm9yZGVyc0lkLmpvaW4oXCItXCIpKTtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaPkOS6pOaIkOWKn++8jOato+WcqOWJjeW+gOS7mOasvumhtemdolwiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn0pIl19
