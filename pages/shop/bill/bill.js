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
      Promise.resolve().then(function () {
        self.checkString(username, {
          name: "收件人姓名",
          minLength: 1,
          maxLength: 50
        });
        self.checkString(location, {
          name: "所在地区",
          minLength: 1,
          maxLength: 100
        });
        self.checkString(address, {
          name: "详细地址",
          minLength: 1,
          maxLength: 500
        });
        self.checkString(mobile, {
          name: "手机号",
          minLength: 1,
          maxLength: 100
        });
        return nkcAPI("/u/".concat(NKC.configs.uid, "/settings/transaction"), "PUT", {
          operation: "add",
          addresses: [self.addressForm]
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zaG9wL2JpbGwvYmlsbC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiLEMsQ0FFQTs7QUFDQSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBaUIsVUFBQSxDQUFDLEVBQUk7QUFDcEIsRUFBQSxDQUFDLENBQUMsVUFBRixHQUFlLEVBQWY7QUFDQSxFQUFBLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBWCxDQUFlLFVBQUEsQ0FBQyxFQUFJO0FBQ2xCLFFBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFsQjs7QUFDQSxRQUFHLENBQUMsT0FBTyxDQUFDLFVBQVosRUFBd0I7QUFDdEIsTUFBQSxDQUFDLENBQUMsV0FBRixHQUFnQixPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsQ0FBekIsRUFBNEIsSUFBNUM7QUFDQSxNQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBWDtBQUNEO0FBQ0YsR0FORDtBQU9ELENBVEQ7QUFXQSxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBRFo7QUFDdUI7QUFDM0IsSUFBQSxlQUFlLEVBQUUsSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEtBQXFCLEVBRmxDO0FBRXNDO0FBQzFDLElBQUEsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUhWO0FBR21CO0FBQ3ZCLElBQUEsWUFBWSxFQUFFLENBSlY7QUFJYTtBQUNqQixJQUFBLFVBQVUsRUFBRSxDQUxSO0FBS1c7QUFFZixJQUFBLGVBQWUsRUFBRSxLQVBiO0FBUUosSUFBQSxXQUFXLEVBQUU7QUFDWCxNQUFBLFFBQVEsRUFBRSxFQURDO0FBRVgsTUFBQSxPQUFPLEVBQUUsRUFGRTtBQUdYLE1BQUEsUUFBUSxFQUFFLEVBSEM7QUFJWCxNQUFBLE1BQU0sRUFBRTtBQUpHO0FBUlQsR0FGWTtBQWlCbEIsRUFBQSxPQWpCa0IscUJBaUJSO0FBQ1IsU0FBSyxhQUFMO0FBQ0EsSUFBQSxNQUFNLENBQUMsYUFBUCxHQUF1QixJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksYUFBaEIsRUFBdkI7QUFDRCxHQXBCaUI7QUFxQmxCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxRQUFRLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUZmO0FBR1AsSUFBQSxXQUFXLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFaLENBQXNCLFdBSDVCO0FBSVA7QUFDQSxJQUFBLGlCQUxPLCtCQUthO0FBQ2xCLFdBQUssZUFBTCxHQUF1QixDQUFDLEtBQUssZUFBN0I7QUFDRCxLQVBNO0FBUVA7QUFDQSxJQUFBLGVBVE8sNkJBU1c7QUFDaEIsVUFBTSxJQUFJLEdBQUcsSUFBYjtBQURnQiw4QkFFOEIsS0FBSyxXQUZuQztBQUFBLFVBRVQsUUFGUyxxQkFFVCxRQUZTO0FBQUEsVUFFQyxPQUZELHFCQUVDLE9BRkQ7QUFBQSxVQUVVLFFBRlYscUJBRVUsUUFGVjtBQUFBLFVBRW9CLE1BRnBCLHFCQUVvQixNQUZwQjtBQUdoQixNQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQ0csSUFESCxDQUNRLFlBQU07QUFDVixRQUFBLElBQUksQ0FBQyxXQUFMLENBQWlCLFFBQWpCLEVBQTJCO0FBQ3pCLFVBQUEsSUFBSSxFQUFFLE9BRG1CO0FBRXpCLFVBQUEsU0FBUyxFQUFFLENBRmM7QUFHekIsVUFBQSxTQUFTLEVBQUU7QUFIYyxTQUEzQjtBQUtBLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsUUFBakIsRUFBMkI7QUFDekIsVUFBQSxJQUFJLEVBQUUsTUFEbUI7QUFFekIsVUFBQSxTQUFTLEVBQUUsQ0FGYztBQUd6QixVQUFBLFNBQVMsRUFBRTtBQUhjLFNBQTNCO0FBS0EsUUFBQSxJQUFJLENBQUMsV0FBTCxDQUFpQixPQUFqQixFQUEwQjtBQUN4QixVQUFBLElBQUksRUFBRSxNQURrQjtBQUV4QixVQUFBLFNBQVMsRUFBRSxDQUZhO0FBR3hCLFVBQUEsU0FBUyxFQUFFO0FBSGEsU0FBMUI7QUFLQSxRQUFBLElBQUksQ0FBQyxXQUFMLENBQWlCLE1BQWpCLEVBQXlCO0FBQ3ZCLFVBQUEsSUFBSSxFQUFFLEtBRGlCO0FBRXZCLFVBQUEsU0FBUyxFQUFFLENBRlk7QUFHdkIsVUFBQSxTQUFTLEVBQUU7QUFIWSxTQUF6QjtBQUtBLGVBQU8sTUFBTSxjQUFPLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FBbkIsNEJBQStDLEtBQS9DLEVBQXNEO0FBQ2pFLFVBQUEsU0FBUyxFQUFFLEtBRHNEO0FBRWpFLFVBQUEsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQU47QUFGc0QsU0FBdEQsQ0FBYjtBQUlELE9BMUJILEVBMkJHLElBM0JILENBMkJRLFVBQUEsSUFBSSxFQUFJO0FBQ1osUUFBQSxJQUFJLENBQUMsU0FBTCxHQUFpQixJQUFJLENBQUMsU0FBdEI7O0FBQ0EsWUFBRyxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWxCLEVBQTBCO0FBQ3hCLFVBQUEsSUFBSSxDQUFDLGVBQUwsR0FBdUIsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsR0FBd0IsQ0FBdkMsQ0FBdkI7QUFDRCxTQUZELE1BRU87QUFDTCxVQUFBLElBQUksQ0FBQyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0Q7O0FBQ0QsUUFBQSxJQUFJLENBQUMsaUJBQUw7QUFDRCxPQW5DSCxXQW9DUyxVQXBDVDtBQXFDRCxLQWpETTtBQWtEUCxJQUFBLGNBbERPLDRCQWtEVTtBQUNmLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxNQUFBLGFBQWEsQ0FBQyxJQUFkLENBQW1CLFVBQUEsSUFBSSxFQUFJO0FBQ3pCLFFBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsUUFBakIsR0FBNEIsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLENBQTVCO0FBQ0QsT0FGRDtBQUdELEtBdkRNO0FBd0RQO0FBQ0EsSUFBQSxXQXpETyx1QkF5REssSUF6REwsRUF5RFcsS0F6RFgsRUF5RGtCO0FBQ3ZCLFVBQUcsSUFBSSxJQUFJLElBQVgsRUFBaUI7QUFDZixZQUFHLEtBQUssQ0FBQyxLQUFOLElBQWUsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsYUFBckMsRUFBb0Q7QUFBRTtBQUNwRCxVQUFBLGdCQUFnQixDQUFDLE1BQUQsQ0FBaEI7QUFDQTtBQUNEOztBQUFBO0FBQ0QsUUFBQSxLQUFLLENBQUMsS0FBTjtBQUNELE9BTkQsTUFNTyxJQUFHLEtBQUssQ0FBQyxLQUFOLEdBQWMsQ0FBakIsRUFBbUI7QUFDeEIsUUFBQSxLQUFLLENBQUMsS0FBTjtBQUNEOztBQUNELFdBQUssYUFBTDtBQUNELEtBcEVNO0FBcUVQO0FBQ0EsSUFBQSxhQXRFTywyQkFzRVM7QUFDZCxVQUFJLFlBQVksR0FBRyxDQUFuQjtBQUFBLFVBQXNCLFdBQVcsR0FBRyxDQUFwQztBQUNBLFdBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsVUFBQSxDQUFDLEVBQUk7QUFDcEIsUUFBQSxDQUFDLENBQUMsUUFBRixDQUFXLEdBQVgsQ0FBZSxVQUFBLENBQUMsRUFBSTtBQUNsQjtBQURrQixjQUVYLFdBRlcsR0FFSSxDQUZKLENBRVgsV0FGVztBQUFBLDJCQUdxQixDQUFDLENBQUMsT0FIdkI7QUFBQSxjQUdYLGdCQUhXLGNBR1gsZ0JBSFc7QUFBQSxjQUdPLFVBSFAsY0FHTyxVQUhQOztBQUlsQixjQUFHLENBQUMsVUFBSixFQUFnQjtBQUFBLHVEQUNDLGdCQUREO0FBQUE7O0FBQUE7QUFDZCxrRUFBaUM7QUFBQSxvQkFBdkIsQ0FBdUI7O0FBQy9CLG9CQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVcsV0FBZCxFQUEyQjtBQUN6QixrQkFBQSxDQUFDLENBQUMsT0FBRixHQUFZLENBQVo7QUFDRDtBQUNGO0FBTGE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU1mLFdBVmlCLENBV2xCOzs7QUFDQSxjQUFJLFVBQVUsR0FBRyxDQUFqQjtBQUFBLGNBQW9CLFVBQVUsR0FBRyxDQUFqQztBQUNBLFVBQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxHQUFULENBQWEsVUFBQSxLQUFLLEVBQUk7QUFBQSxnQkFDYixLQURhLEdBQ0csS0FESCxDQUNiLEtBRGE7QUFBQSxnQkFDTixLQURNLEdBQ0csS0FESCxDQUNOLEtBRE07QUFFcEIsWUFBQSxVQUFVLElBQUksS0FBZDtBQUNBLFlBQUEsVUFBVSxJQUFLLEtBQUssR0FBRyxLQUF2QjtBQUNELFdBSkQ7QUFLQSxVQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsVUFBZjtBQUNBLFVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxVQUFmO0FBQ0EsVUFBQSxDQUFDLENBQUMsWUFBRixHQUFpQixDQUFqQjs7QUFDQSxjQUFHLENBQUMsVUFBSixFQUFnQjtBQUNkLGdCQUFHLENBQUMsQ0FBQyxVQUFGLEtBQWlCLENBQXBCLEVBQXVCO0FBQ3JCLGNBQUEsQ0FBQyxDQUFDLFlBQUYsR0FBaUIsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxVQUEzQjtBQUNELGFBRkQsTUFFTztBQUNMLGNBQUEsQ0FBQyxDQUFDLFlBQUYsR0FBaUIsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxVQUFWLEdBQXdCLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBVixJQUFzQixDQUFDLENBQUMsVUFBRixHQUFlLENBQXJDLENBQXpDO0FBQ0Q7QUFDRixXQTNCaUIsQ0E0QmxCOzs7QUFDQSxVQUFBLFlBQVksSUFBSSxDQUFDLENBQUMsWUFBbEI7QUFDQSxVQUFBLFdBQVcsSUFBSSxDQUFDLENBQUMsVUFBakI7QUFDRCxTQS9CRDtBQWdDRCxPQWpDRDtBQWtDQSxXQUFLLFlBQUwsR0FBb0IsWUFBcEI7QUFDQSxXQUFLLFVBQUwsR0FBa0IsV0FBbEI7QUFDRCxLQTVHTTtBQTZHUCxJQUFBLGFBN0dPLHlCQTZHTyxPQTdHUCxFQTZHZ0I7QUFDckIsV0FBSyxlQUFMLEdBQXVCLE9BQXZCO0FBQ0QsS0EvR007QUFnSFAsSUFBQSxnQkFoSE8sOEJBZ0hZO0FBQ2pCLFdBQUssYUFBTDtBQUNELEtBbEhNO0FBbUhQO0FBQ0EsSUFBQSxZQXBITywwQkFvSFE7QUFDYixVQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsTUFBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsSUFBaEIsZ0JBQTZCLElBQUksQ0FBQyxHQUFMLEVBQTdCLENBQUQsRUFBNEMsS0FBNUMsQ0FBTixDQUNHLElBREgsQ0FDUSxVQUFBLElBQUksRUFBSTtBQUNaLFFBQUEsSUFBSSxDQUFDLFNBQUwsR0FBaUIsSUFBSSxDQUFDLFNBQXRCO0FBQ0EsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0QsT0FKSCxXQUtTLFVBTFQ7QUFNRCxLQTVITTtBQTZIUDtBQUNBLElBQUEsWUE5SE8sd0JBOEhNLENBOUhOLEVBOEhTLENBOUhULEVBOEhZO0FBQUEsVUFDVixPQURVLEdBQ0MsQ0FERCxDQUNWLE9BRFU7QUFFakIsVUFBSSxHQUFHLEdBQUcsQ0FBQyw4QkFBdUIsT0FBTyxDQUFDLFNBQS9CLEVBQVg7QUFDQSxNQUFBLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBRCxDQUFUO0FBQ0EsVUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUosQ0FBVSxDQUFWLENBQWI7QUFDQSxVQUFNLFFBQVEsR0FBRyxJQUFJLFFBQUosRUFBakI7QUFDQSxNQUFBLFFBQVEsQ0FBQyxNQUFULENBQWdCLE1BQWhCLEVBQXdCLFVBQXhCO0FBQ0EsTUFBQSxRQUFRLENBQUMsTUFBVCxDQUFnQixNQUFoQixFQUF3QixJQUF4QjtBQUNBLE1BQUEsYUFBYSxDQUFDLFlBQUQsRUFBZSxNQUFmLEVBQXVCLFFBQXZCLENBQWIsQ0FDRyxJQURILENBQ1EsVUFBQSxJQUFJLEVBQUk7QUFDWixRQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFyQjtBQUNBLFFBQUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLENBQUMsUUFBVixFQUFvQixDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsQ0FBbUIsQ0FBbkIsQ0FBcEIsRUFBMkMsQ0FBM0M7QUFDQSxRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDRCxPQUxILFdBTVMsVUFOVDtBQU9ELEtBN0lNO0FBOElQO0FBQ0EsSUFBQSxPQS9JTyxtQkErSUMsTUEvSUQsRUErSVM7QUFDZCxNQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixzQkFBbUMsTUFBbkMsR0FBNkMsSUFBN0M7QUFDRCxLQWpKTTtBQWtKUCxJQUFBLE1BbEpPLG9CQWtKRTtBQUFBLFVBQ0EsT0FEQSxHQUM0QixJQUQ1QixDQUNBLE9BREE7QUFBQSxVQUNTLGVBRFQsR0FDNEIsSUFENUIsQ0FDUyxlQURUO0FBRVAsVUFBTSxJQUFJLEdBQUc7QUFDWCxRQUFBLE1BQU0sRUFBRSxFQURHO0FBRVgsUUFBQSxPQUFPLEVBQUU7QUFGRSxPQUFiO0FBS0EsTUFBQSxPQUFPLENBQUMsT0FBUixHQUNHLElBREgsQ0FDUSxZQUFNO0FBQ1YsWUFBRyxDQUFDLElBQUksQ0FBQyxPQUFULEVBQWtCLE1BQU0sU0FBTjtBQUNsQixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBQSxPQUFPLEVBQUk7QUFBQSxjQUNkLFFBRGMsR0FDZ0IsT0FEaEIsQ0FDZCxRQURjO0FBQUEsY0FDSixJQURJLEdBQ2dCLE9BRGhCLENBQ0osSUFESTtBQUFBLGNBQ0UsVUFERixHQUNnQixPQURoQixDQUNFLFVBREY7QUFFckIsY0FBTSxDQUFDLEdBQUc7QUFDUixZQUFBLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FERjtBQUVSLFlBQUEsVUFBVSxFQUFWLFVBRlE7QUFHUixZQUFBLFFBQVEsRUFBRTtBQUhGLFdBQVY7QUFLQSxVQUFBLFFBQVEsQ0FBQyxHQUFULENBQWEsVUFBQSxVQUFVLEVBQUk7QUFBQSxnQkFDbEIsT0FEa0IsR0FDZ0QsVUFEaEQsQ0FDbEIsT0FEa0I7QUFBQSxnQkFDVCxNQURTLEdBQ2dELFVBRGhELENBQ1QsTUFEUztBQUFBLGdCQUNELFVBREMsR0FDZ0QsVUFEaEQsQ0FDRCxVQURDO0FBQUEsZ0JBQ1csWUFEWCxHQUNnRCxVQURoRCxDQUNXLFlBRFg7QUFBQSxnQkFDeUIsTUFEekIsR0FDZ0QsVUFEaEQsQ0FDeUIsTUFEekI7QUFBQSxnQkFDaUMsV0FEakMsR0FDZ0QsVUFEaEQsQ0FDaUMsV0FEakM7QUFFekIsZ0JBQUcsT0FBTyxDQUFDLFVBQVIsSUFBc0IsQ0FBQyxNQUExQixFQUFrQyxNQUFNLE9BQU47QUFDbEMsZ0JBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVCxJQUF1QixDQUFDLFdBQTNCLEVBQXdDLE1BQU0sT0FBTjtBQUN4QyxnQkFBTSxDQUFDLEdBQUc7QUFDUixjQUFBLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FEWDtBQUVSLGNBQUEsVUFBVSxFQUFWLFVBRlE7QUFHUixjQUFBLFlBQVksRUFBWixZQUhRO0FBSVIsY0FBQSxNQUFNLEVBQU4sTUFKUTtBQUtSLGNBQUEsV0FBVyxFQUFYLFdBTFE7QUFNUixjQUFBLGFBQWEsRUFBRTtBQU5QLGFBQVY7QUFRQSxZQUFBLE1BQU0sQ0FBQyxHQUFQLENBQVcsVUFBQSxRQUFRLEVBQUk7QUFBQSxrQkFDZCxZQURjLEdBQ3dCLFFBRHhCLENBQ2QsWUFEYztBQUFBLGtCQUNBLEtBREEsR0FDd0IsUUFEeEIsQ0FDQSxLQURBO0FBQUEsa0JBQ08sS0FEUCxHQUN3QixRQUR4QixDQUNPLEtBRFA7QUFBQSxrQkFDYyxNQURkLEdBQ3dCLFFBRHhCLENBQ2MsTUFEZDtBQUVyQixjQUFBLENBQUMsQ0FBQyxhQUFGLENBQWdCLElBQWhCLENBQXFCO0FBQ25CLGdCQUFBLEdBQUcsRUFBRSxZQUFZLENBQUMsR0FEQztBQUVuQixnQkFBQSxNQUFNLEVBQU4sTUFGbUI7QUFHbkIsZ0JBQUEsS0FBSyxFQUFMLEtBSG1CO0FBSW5CLGdCQUFBLEtBQUssRUFBTDtBQUptQixlQUFyQjtBQU1ELGFBUkQ7QUFTQSxZQUFBLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBWCxDQUFnQixDQUFoQjtBQUNELFdBdEJEO0FBdUJBLFVBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaLENBQWlCLENBQWpCO0FBQ0QsU0EvQkQ7QUFnQ0EsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVo7QUFDQSxlQUFPLE1BQU0sQ0FBQyxhQUFELEVBQWdCLE1BQWhCLEVBQXdCLElBQXhCLENBQWI7QUFDRCxPQXJDSCxFQXNDRyxJQXRDSCxDQXNDUSxVQUFBLElBQUksRUFBSTtBQUNaLFFBQUEsaUJBQWlCLENBQUMsd0JBQXdCLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFtQixHQUFuQixDQUF6QixDQUFqQjtBQUNBLFFBQUEsWUFBWSxDQUFDLGVBQUQsQ0FBWjtBQUNELE9BekNILFdBMENTLFVBMUNUO0FBMkNEO0FBcE1NO0FBckJTLENBQVIsQ0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcblxyXG4vLyDpu5jorqTpgInmi6nnrKzkuIDkuKrov5DotLnmqKHmnb9cclxuZGF0YS5yZXN1bHRzLm1hcChyID0+IHtcclxuICByLmJ1eU1lc3NhZ2UgPSBcIlwiO1xyXG4gIHIucHJvZHVjdHMubWFwKHAgPT4ge1xyXG4gICAgY29uc3QgcHJvZHVjdCA9IHAucHJvZHVjdDtcclxuICAgIGlmKCFwcm9kdWN0LmlzRnJlZVBvc3QpIHtcclxuICAgICAgcC5mcmVpZ2h0TmFtZSA9IHByb2R1Y3QuZnJlaWdodFRlbXBsYXRlc1swXS5uYW1lXHJcbiAgICAgIHAuY2VydElkID0gXCJcIjtcclxuICAgIH1cclxuICB9KVxyXG59KVxyXG5cclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIGFkZHJlc3NlczogZGF0YS5hZGRyZXNzZXMsIC8vIOWcsOWdgFxyXG4gICAgc2VsZWN0ZWRBZGRyZXNzOiBkYXRhLmFkZHJlc3Nlc1swXSB8fCBcIlwiLCAvLyDlt7LpgInmi6nnmoTlnLDlnYBcclxuICAgIHJlc3VsdHM6IGRhdGEucmVzdWx0cywgLy8g5ZWG5ZOB6KeE5qC85pWw5o2uXHJcbiAgICBmcmVpZ2h0VG90YWw6IDAsIC8vIOi/kOi0ueaAu+iuoVxyXG4gICAgcHJpY2VUb3RhbDogMCwgLy8g5ZWG5ZOB5oC76K6hXHJcblxyXG4gICAgc2hvd0FkZHJlc3NGb3JtOiBmYWxzZSxcclxuICAgIGFkZHJlc3NGb3JtOiB7XHJcbiAgICAgIHVzZXJuYW1lOiBcIlwiLFxyXG4gICAgICBhZGRyZXNzOiBcIlwiLFxyXG4gICAgICBsb2NhdGlvbjogXCJcIixcclxuICAgICAgbW9iaWxlOiBcIlwiXHJcbiAgICB9XHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgdGhpcy5leHRlbmRQcm9kdWN0KCk7XHJcbiAgICB3aW5kb3cuU2VsZWN0QWRkcmVzcyA9IG5ldyBOS0MubW9kdWxlcy5TZWxlY3RBZGRyZXNzKCk7XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcclxuICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICAvLyDpmpDol4/mt7vliqDlnLDlnYDnmoTovpPlhaXmoYZcclxuICAgIHN3aXRjaEFkZHJlc3NGb3JtKCkge1xyXG4gICAgICB0aGlzLnNob3dBZGRyZXNzRm9ybSA9ICF0aGlzLnNob3dBZGRyZXNzRm9ybTtcclxuICAgIH0sXHJcbiAgICAvLyDmt7vliqDmlrDlnLDlnYBcclxuICAgIHNhdmVBZGRyZXNzRm9ybSgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHt1c2VybmFtZSwgYWRkcmVzcywgbG9jYXRpb24sIG1vYmlsZX0gPSB0aGlzLmFkZHJlc3NGb3JtO1xyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHNlbGYuY2hlY2tTdHJpbmcodXNlcm5hbWUsIHtcclxuICAgICAgICAgICAgbmFtZTogXCLmlLbku7bkurrlp5PlkI1cIixcclxuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICBtYXhMZW5ndGg6IDUwXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHNlbGYuY2hlY2tTdHJpbmcobG9jYXRpb24sIHtcclxuICAgICAgICAgICAgbmFtZTogXCLmiYDlnKjlnLDljLpcIixcclxuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICBtYXhMZW5ndGg6IDEwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBzZWxmLmNoZWNrU3RyaW5nKGFkZHJlc3MsIHtcclxuICAgICAgICAgICAgbmFtZTogXCLor6bnu4blnLDlnYBcIixcclxuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICBtYXhMZW5ndGg6IDUwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBzZWxmLmNoZWNrU3RyaW5nKG1vYmlsZSwge1xyXG4gICAgICAgICAgICBuYW1lOiBcIuaJi+acuuWPt1wiLFxyXG4gICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoYC91LyR7TktDLmNvbmZpZ3MudWlkfS9zZXR0aW5ncy90cmFuc2FjdGlvbmAsIFwiUFVUXCIsIHtcclxuICAgICAgICAgICAgb3BlcmF0aW9uOiBcImFkZFwiLFxyXG4gICAgICAgICAgICBhZGRyZXNzZXM6IFtzZWxmLmFkZHJlc3NGb3JtXVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZi5hZGRyZXNzZXMgPSBkYXRhLmFkZHJlc3NlcztcclxuICAgICAgICAgIGlmKHNlbGYuYWRkcmVzc2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdGVkQWRkcmVzcyA9IHNlbGYuYWRkcmVzc2VzW3NlbGYuYWRkcmVzc2VzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RlZEFkZHJlc3MgPSBcIlwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2VsZi5zd2l0Y2hBZGRyZXNzRm9ybSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdExvY2F0aW9uKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgU2VsZWN0QWRkcmVzcy5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIHNlbGYuYWRkcmVzc0Zvcm0ubG9jYXRpb24gPSBkYXRhLmpvaW4oXCIgXCIpO1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIC8vIOaUueWPmOinhOagvOeahOaVsOmHj1xyXG4gICAgY2hhbmdlQ291bnQodHlwZSwgcGFyYW0pIHtcclxuICAgICAgaWYodHlwZSA9PSBcInVwXCIpIHtcclxuICAgICAgICBpZihwYXJhbS5jb3VudCA+PSBwYXJhbS5wcm9kdWN0UGFyYW0uc3RvY2tzU3VycGx1cykgeyAvLyDmlbDph4/kuI3og73lpKfkuo7op4TmoLzlupPlrZhcclxuICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoXCLlupPlrZjkuI3otrNcIik7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9O1xyXG4gICAgICAgIHBhcmFtLmNvdW50ICsrO1xyXG4gICAgICB9IGVsc2UgaWYocGFyYW0uY291bnQgPiAxKXtcclxuICAgICAgICBwYXJhbS5jb3VudCAtLTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmV4dGVuZFByb2R1Y3QoKTtcclxuICAgIH0sXHJcbiAgICAvLyDorqHnrpfop4TmoLzov5DotLnjgIHku7fmoLxcclxuICAgIGV4dGVuZFByb2R1Y3QoKSB7XHJcbiAgICAgIGxldCBmcmVpZ2h0VG90YWwgPSAwLCBwcmljZVRvdGFsXyA9IDA7XHJcbiAgICAgIHRoaXMucmVzdWx0cy5tYXAociA9PiB7XHJcbiAgICAgICAgci5wcm9kdWN0cy5tYXAocCA9PiB7XHJcbiAgICAgICAgICAvLyDmoLnmja7nlKjmiLfpgInmi6nnmoTlv6vpgJLlkI3ojrflj5blv6vpgJLmqKHmnb9cclxuICAgICAgICAgIGNvbnN0IHtmcmVpZ2h0TmFtZX0gPSBwO1xyXG4gICAgICAgICAgY29uc3Qge2ZyZWlnaHRUZW1wbGF0ZXMsIGlzRnJlZVBvc3R9ID0gcC5wcm9kdWN0O1xyXG4gICAgICAgICAgaWYoIWlzRnJlZVBvc3QpIHtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHQgb2YgZnJlaWdodFRlbXBsYXRlcykge1xyXG4gICAgICAgICAgICAgIGlmKHQubmFtZSA9PT0gZnJlaWdodE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHAuZnJlaWdodCA9IHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyDnu5/orqHlkIzkuIDllYblk4HkuIvop4TmoLznmoTmgLvkuKrmlbDku6Xlj4rmgLvku7fmoLxcclxuICAgICAgICAgIGxldCBjb3VudFRvdGFsID0gMCwgcHJpY2VUb3RhbCA9IDA7XHJcbiAgICAgICAgICBwLnBhcmFtcy5tYXAocGFyYW0gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7Y291bnQsIHByaWNlfSA9IHBhcmFtO1xyXG4gICAgICAgICAgICBjb3VudFRvdGFsICs9IGNvdW50O1xyXG4gICAgICAgICAgICBwcmljZVRvdGFsICs9IChjb3VudCAqIHByaWNlKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcC5jb3VudFRvdGFsID0gY291bnRUb3RhbDtcclxuICAgICAgICAgIHAucHJpY2VUb3RhbCA9IHByaWNlVG90YWw7XHJcbiAgICAgICAgICBwLmZyZWlnaHRUb3RhbCA9IDA7XHJcbiAgICAgICAgICBpZighaXNGcmVlUG9zdCkge1xyXG4gICAgICAgICAgICBpZihwLmNvdW50VG90YWwgPT09IDEpIHtcclxuICAgICAgICAgICAgICBwLmZyZWlnaHRUb3RhbCA9IHAuZnJlaWdodC5maXJzdFByaWNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHAuZnJlaWdodFRvdGFsID0gcC5mcmVpZ2h0LmZpcnN0UHJpY2UgKyAocC5mcmVpZ2h0LmFkZFByaWNlICogKHAuY291bnRUb3RhbCAtIDEpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8g5qC55o2u5q+P5Liq5ZWG5ZOB55qE5oC76L+Q6LS544CB5ZWG5ZOB5oC75Lu35qC86K6h566X5pW05Liq6K6i5Y2V55qE6L+Q6LS55Lul5Y+K5ZWG5ZOB5Lu35qC8XHJcbiAgICAgICAgICBmcmVpZ2h0VG90YWwgKz0gcC5mcmVpZ2h0VG90YWw7XHJcbiAgICAgICAgICBwcmljZVRvdGFsXyArPSBwLnByaWNlVG90YWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmZyZWlnaHRUb3RhbCA9IGZyZWlnaHRUb3RhbDtcclxuICAgICAgdGhpcy5wcmljZVRvdGFsID0gcHJpY2VUb3RhbF87XHJcbiAgICB9LFxyXG4gICAgc2VsZWN0QWRkcmVzcyhhZGRyZXNzKSB7XHJcbiAgICAgIHRoaXMuc2VsZWN0ZWRBZGRyZXNzID0gYWRkcmVzcztcclxuICAgIH0sXHJcbiAgICBzZXRGcmVpZ2h0QnlOYW1lKCkge1xyXG4gICAgICB0aGlzLmV4dGVuZFByb2R1Y3QoKTtcclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrDnlKjmiLfnmoTlv6vpgJLkv6Hmga9cclxuICAgIGdldEFkZHJlc3NlcygpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIG5rY0FQSSh3aW5kb3cubG9jYXRpb24uaHJlZiArIGAmdD0ke0RhdGUubm93KCl9YCwgXCJHRVRcIilcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGYuYWRkcmVzc2VzID0gZGF0YS5hZGRyZXNzZXM7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLliLfmlrDmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH0sXHJcbiAgICAvLyDnlKjmiLfpgInmi6nkuoblh63or4Hmlofku7ZcclxuICAgIHNlbGVjdGVkRmlsZShyLCBwKSB7XHJcbiAgICAgIGNvbnN0IHtwcm9kdWN0fSA9IHA7XHJcbiAgICAgIGxldCBkb20gPSAkKGBpbnB1dC5oaWRkZW4uaW5wdXQtJHtwcm9kdWN0LnByb2R1Y3RJZH1gKTtcclxuICAgICAgZG9tID0gZG9tWzBdO1xyXG4gICAgICBjb25zdCBmaWxlID0gZG9tLmZpbGVzWzBdO1xyXG4gICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJ0eXBlXCIsIFwic2hvcHBpbmdcIik7XHJcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVcIiwgZmlsZSk7XHJcbiAgICAgIG5rY1VwbG9hZEZpbGUoXCIvc2hvcC9jZXJ0XCIsIFwiUE9TVFwiLCBmb3JtRGF0YSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHAuY2VydElkID0gZGF0YS5jZXJ0Ll9pZDtcclxuICAgICAgICAgIFZ1ZS5zZXQoci5wcm9kdWN0cywgci5wcm9kdWN0cy5pbmRleE9mKHApLCBwKTtcclxuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS4iuS8oOaIkOWKn1wiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH0sXHJcbiAgICAvLyDmn6XnnIvlh63or4FcclxuICAgIGdldENlcnQoY2VydElkKSB7XHJcbiAgICAgIE5LQy5tZXRob2RzLnZpc2l0VXJsKGAvc2hvcC9jZXJ0LyR7Y2VydElkfWAsIHRydWUpO1xyXG4gICAgfSxcclxuICAgIHN1Ym1pdCgpIHtcclxuICAgICAgY29uc3Qge3Jlc3VsdHMsIHNlbGVjdGVkQWRkcmVzc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgIHBhcmFtczogW10sXHJcbiAgICAgICAgYWRkcmVzczogc2VsZWN0ZWRBZGRyZXNzXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGlmKCFib2R5LmFkZHJlc3MpIHRocm93IFwi6K+36YCJ5oup5pS26LSn5Zyw5Z2AXCI7XHJcbiAgICAgICAgICByZXN1bHRzLm1hcCh1c2VyT2JqID0+IHtcclxuICAgICAgICAgICAgY29uc3Qge3Byb2R1Y3RzLCB1c2VyLCBidXlNZXNzYWdlfSA9IHVzZXJPYmo7XHJcbiAgICAgICAgICAgIGNvbnN0IHIgPSB7XHJcbiAgICAgICAgICAgICAgdWlkOiB1c2VyLnVpZCxcclxuICAgICAgICAgICAgICBidXlNZXNzYWdlLFxyXG4gICAgICAgICAgICAgIHByb2R1Y3RzOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByb2R1Y3RzLm1hcChwcm9kdWN0T2JqID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCB7cHJvZHVjdCwgcGFyYW1zLCBwcmljZVRvdGFsLCBmcmVpZ2h0VG90YWwsIGNlcnRJZCwgZnJlaWdodE5hbWV9ID0gcHJvZHVjdE9iajtcclxuICAgICAgICAgICAgICBpZihwcm9kdWN0LnVwbG9hZENlcnQgJiYgIWNlcnRJZCkgdGhyb3cgXCLor7fkuIrkvKDlh63or4FcIjtcclxuICAgICAgICAgICAgICBpZighcHJvZHVjdC5pc0ZyZWVQb3N0ICYmICFmcmVpZ2h0TmFtZSkgdGhyb3cgXCLor7fpgInmi6nnianmtYFcIjtcclxuICAgICAgICAgICAgICBjb25zdCBwID0ge1xyXG4gICAgICAgICAgICAgICAgcHJvZHVjdElkOiBwcm9kdWN0LnByb2R1Y3RJZCxcclxuICAgICAgICAgICAgICAgIHByaWNlVG90YWwsXHJcbiAgICAgICAgICAgICAgICBmcmVpZ2h0VG90YWwsXHJcbiAgICAgICAgICAgICAgICBjZXJ0SWQsXHJcbiAgICAgICAgICAgICAgICBmcmVpZ2h0TmFtZSxcclxuICAgICAgICAgICAgICAgIHByb2R1Y3RQYXJhbXM6IFtdXHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBwYXJhbXMubWFwKHBhcmFtT2JqID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHtwcm9kdWN0UGFyYW0sIGNvdW50LCBwcmljZSwgY2FydElkfSA9IHBhcmFtT2JqO1xyXG4gICAgICAgICAgICAgICAgcC5wcm9kdWN0UGFyYW1zLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICBfaWQ6IHByb2R1Y3RQYXJhbS5faWQsXHJcbiAgICAgICAgICAgICAgICAgIGNhcnRJZCxcclxuICAgICAgICAgICAgICAgICAgY291bnQsXHJcbiAgICAgICAgICAgICAgICAgIHByaWNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICByLnByb2R1Y3RzLnB1c2gocCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGJvZHkucGFyYW1zLnB1c2gocik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGJvZHkpO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9zaG9wL29yZGVyXCIsIFwiUE9TVFwiLCBib2R5KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgb3BlblRvTmV3TG9jYXRpb24oJy9zaG9wL3BheT9vcmRlcnNJZD0nICsgZGF0YS5vcmRlcnNJZC5qb2luKFwiLVwiKSk7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmj5DkuqTmiJDlip/vvIzmraPlnKjliY3lvoDku5jmrL7pobXpnaJcIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG4iXX0=
