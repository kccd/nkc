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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3AvYmlsbC9iaWxsLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWIsQyxDQUVBOztBQUNBLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFpQixVQUFBLENBQUMsRUFBSTtBQUNwQixFQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsRUFBZjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFYLENBQWUsVUFBQSxDQUFDLEVBQUk7QUFDbEIsUUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQWxCOztBQUNBLFFBQUcsQ0FBQyxPQUFPLENBQUMsVUFBWixFQUF3QjtBQUN0QixNQUFBLENBQUMsQ0FBQyxXQUFGLEdBQWdCLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixDQUF6QixFQUE0QixJQUE1QztBQUNBLE1BQUEsQ0FBQyxDQUFDLE1BQUYsR0FBVyxFQUFYO0FBQ0Q7QUFDRixHQU5EO0FBT0QsQ0FURDtBQVdBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2xCLEVBQUEsRUFBRSxFQUFFLE1BRGM7QUFFbEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FEWjtBQUN1QjtBQUMzQixJQUFBLGVBQWUsRUFBRSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsS0FBcUIsRUFGbEM7QUFFc0M7QUFDMUMsSUFBQSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BSFY7QUFHbUI7QUFDdkIsSUFBQSxZQUFZLEVBQUUsQ0FKVjtBQUlhO0FBQ2pCLElBQUEsVUFBVSxFQUFFLENBTFI7QUFLVztBQUVmLElBQUEsZUFBZSxFQUFFLEtBUGI7QUFRSixJQUFBLFdBQVcsRUFB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Q0FBakI7QUFDRCxTQS9CRDtBQWdDQSxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtBQUNBLGVBQU8sTUFBTSxDQUFDLGFBQUQsRUFBZ0IsTUFBaEIsRUFBd0IsSUFBeEIsQ0FBYjtBQUNELE9BckNILEVBc0NHLElBdENILENBc0NRLFVBQUEsSUFBSSxFQUFJO0FBQ1osUUFBQSxpQkFBaUIsQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFkLENBQW1CLEdBQW5CLENBQXpCLENBQWpCO0FBQ0EsUUFBQSxZQUFZLENBQUMsZUFBRCxDQUFaO0FBQ0QsT0F6Q0gsV0EwQ1MsVUExQ1Q7QUEyQ0Q7QUFqTU07QUFyQlMsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuXHJcbi8vIOm7mOiupOmAieaLqeesrOS4gOS4qui/kOi0ueaooeadv1xyXG5kYXRhLnJlc3VsdHMubWFwKHIgPT4ge1xyXG4gIHIuYnV5TWVzc2FnZSA9IFwiXCI7XHJcbiAgci5wcm9kdWN0cy5tYXAocCA9PiB7XHJcbiAgICBjb25zdCBwcm9kdWN0ID0gcC5wcm9kdWN0O1xyXG4gICAgaWYoIXByb2R1Y3QuaXNGcmVlUG9zdCkge1xyXG4gICAgICBwLmZyZWlnaHROYW1lID0gcHJvZHVjdC5mcmVpZ2h0VGVtcGxhdGVzWzBdLm5hbWVcclxuICAgICAgcC5jZXJ0SWQgPSBcIlwiO1xyXG4gICAgfVxyXG4gIH0pXHJcbn0pXHJcblxyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgYWRkcmVzc2VzOiBkYXRhLmFkZHJlc3NlcywgLy8g5Zyw5Z2AXHJcbiAgICBzZWxlY3RlZEFkZHJlc3M6IGRhdGEuYWRkcmVzc2VzWzBdIHx8IFwiXCIsIC8vIOW3sumAieaLqeeahOWcsOWdgFxyXG4gICAgcmVzdWx0czogZGF0YS5yZXN1bHRzLCAvLyDllYblk4Hop4TmoLzmlbDmja5cclxuICAgIGZyZWlnaHRUb3RhbDogMCwgLy8g6L+Q6LS55oC76K6hXHJcbiAgICBwcmljZVRvdGFsOiAwLCAvLyDllYblk4HmgLvorqFcclxuXHJcbiAgICBzaG93QWRkcmVzc0Zvcm06IGZhbHNlLFxyXG4gICAgYWRkcmVzc0Zvcm06IHtcclxuICAgICAgdXNlcm5hbWU6IFwiXCIsXHJcbiAgICAgIGFkZHJlc3M6IFwiXCIsXHJcbiAgICAgIGxvY2F0aW9uOiBcIlwiLFxyXG4gICAgICBtb2JpbGU6IFwiXCJcclxuICAgIH1cclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICB0aGlzLmV4dGVuZFByb2R1Y3QoKTtcclxuICAgIHdpbmRvdy5TZWxlY3RBZGRyZXNzID0gbmV3IE5LQy5tb2R1bGVzLlNlbGVjdEFkZHJlc3MoKTtcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgdmlzaXRVcmw6IE5LQy5tZXRob2RzLnZpc2l0VXJsLFxyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIC8vIOmakOiXj+a3u+WKoOWcsOWdgOeahOi+k+WFpeahhlxyXG4gICAgc3dpdGNoQWRkcmVzc0Zvcm0oKSB7XHJcbiAgICAgIHRoaXMuc2hvd0FkZHJlc3NGb3JtID0gIXRoaXMuc2hvd0FkZHJlc3NGb3JtO1xyXG4gICAgfSxcclxuICAgIC8vIOa3u+WKoOaWsOWcsOWdgFxyXG4gICAgc2F2ZUFkZHJlc3NGb3JtKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgY29uc3Qge3VzZXJuYW1lLCBhZGRyZXNzLCBsb2NhdGlvbiwgbW9iaWxlfSA9IHRoaXMuYWRkcmVzc0Zvcm07XHJcbiAgICAgIHRoaXMuY2hlY2tTdHJpbmcodXNlcm5hbWUsIHtcclxuICAgICAgICBuYW1lOiBcIuaUtuS7tuS6uuWnk+WQjVwiLFxyXG4gICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICBtYXhMZW5ndGg6IDUwXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNoZWNrU3RyaW5nKGxvY2F0aW9uLCB7XHJcbiAgICAgICAgbmFtZTogXCLmiYDlnKjlnLDljLpcIixcclxuICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgbWF4TGVuZ3RoOiAxMDBcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuY2hlY2tTdHJpbmcoYWRkcmVzcywge1xyXG4gICAgICAgIG5hbWU6IFwi6K+m57uG5Zyw5Z2AXCIsXHJcbiAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgIG1heExlbmd0aDogNTAwXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmNoZWNrU3RyaW5nKG1vYmlsZSwge1xyXG4gICAgICAgIG5hbWU6IFwi5omL5py65Y+3XCIsXHJcbiAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgIH0pO1xyXG4gICAgICBua2NBUEkoYC91LyR7TktDLmNvbmZpZ3MudWlkfS9zZXR0aW5ncy90cmFuc2FjdGlvbmAsIFwiUEFUQ0hcIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJhZGRcIixcclxuICAgICAgICBhZGRyZXNzZXM6IFt0aGlzLmFkZHJlc3NGb3JtXVxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZi5hZGRyZXNzZXMgPSBkYXRhLmFkZHJlc3NlcztcclxuICAgICAgICAgIGlmKHNlbGYuYWRkcmVzc2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdGVkQWRkcmVzcyA9IHNlbGYuYWRkcmVzc2VzW3NlbGYuYWRkcmVzc2VzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RlZEFkZHJlc3MgPSBcIlwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2VsZi5zd2l0Y2hBZGRyZXNzRm9ybSgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdExvY2F0aW9uKCkge1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgU2VsZWN0QWRkcmVzcy5vcGVuKGRhdGEgPT4ge1xyXG4gICAgICAgIHNlbGYuYWRkcmVzc0Zvcm0ubG9jYXRpb24gPSBkYXRhLmpvaW4oXCIgXCIpO1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIC8vIOaUueWPmOinhOagvOeahOaVsOmHj1xyXG4gICAgY2hhbmdlQ291bnQodHlwZSwgcGFyYW0pIHtcclxuICAgICAgaWYodHlwZSA9PSBcInVwXCIpIHtcclxuICAgICAgICBpZihwYXJhbS5jb3VudCA+PSBwYXJhbS5wcm9kdWN0UGFyYW0uc3RvY2tzU3VycGx1cykgeyAvLyDmlbDph4/kuI3og73lpKfkuo7op4TmoLzlupPlrZhcclxuICAgICAgICAgIHNjcmVlblRvcFdhcm5pbmcoXCLlupPlrZjkuI3otrNcIik7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9O1xyXG4gICAgICAgIHBhcmFtLmNvdW50ICsrO1xyXG4gICAgICB9IGVsc2UgaWYocGFyYW0uY291bnQgPiAxKXtcclxuICAgICAgICBwYXJhbS5jb3VudCAtLTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmV4dGVuZFByb2R1Y3QoKTtcclxuICAgIH0sXHJcbiAgICAvLyDorqHnrpfop4TmoLzov5DotLnjgIHku7fmoLxcclxuICAgIGV4dGVuZFByb2R1Y3QoKSB7XHJcbiAgICAgIGxldCBmcmVpZ2h0VG90YWwgPSAwLCBwcmljZVRvdGFsXyA9IDA7XHJcbiAgICAgIHRoaXMucmVzdWx0cy5tYXAociA9PiB7XHJcbiAgICAgICAgci5wcm9kdWN0cy5tYXAocCA9PiB7XHJcbiAgICAgICAgICAvLyDmoLnmja7nlKjmiLfpgInmi6nnmoTlv6vpgJLlkI3ojrflj5blv6vpgJLmqKHmnb9cclxuICAgICAgICAgIGNvbnN0IHtmcmVpZ2h0TmFtZX0gPSBwO1xyXG4gICAgICAgICAgY29uc3Qge2ZyZWlnaHRUZW1wbGF0ZXMsIGlzRnJlZVBvc3R9ID0gcC5wcm9kdWN0O1xyXG4gICAgICAgICAgaWYoIWlzRnJlZVBvc3QpIHtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHQgb2YgZnJlaWdodFRlbXBsYXRlcykge1xyXG4gICAgICAgICAgICAgIGlmKHQubmFtZSA9PT0gZnJlaWdodE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHAuZnJlaWdodCA9IHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ICAgICAgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyDnu5/orqHlkIzkuIDllYblk4HkuIvop4TmoLznmoTmgLvkuKrmlbDku6Xlj4rmgLvku7fmoLxcclxuICAgICAgICAgIGxldCBjb3VudFRvdGFsID0gMCwgcHJpY2VUb3RhbCA9IDA7XHJcbiAgICAgICAgICBwLnBhcmFtcy5tYXAocGFyYW0gPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7Y291bnQsIHByaWNlfSA9IHBhcmFtOyBcclxuICAgICAgICAgICAgY291bnRUb3RhbCArPSBjb3VudDtcclxuICAgICAgICAgICAgcHJpY2VUb3RhbCArPSAoY291bnQgKiBwcmljZSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHAuY291bnRUb3RhbCA9IGNvdW50VG90YWw7XHJcbiAgICAgICAgICBwLnByaWNlVG90YWwgPSBwcmljZVRvdGFsO1xyXG4gICAgICAgICAgcC5mcmVpZ2h0VG90YWwgPSAwO1xyXG4gICAgICAgICAgaWYoIWlzRnJlZVBvc3QpIHtcclxuICAgICAgICAgICAgaWYocC5jb3VudFRvdGFsID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgcC5mcmVpZ2h0VG90YWwgPSBwLmZyZWlnaHQuZmlyc3RQcmljZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwLmZyZWlnaHRUb3RhbCA9IHAuZnJlaWdodC5maXJzdFByaWNlICsgKHAuZnJlaWdodC5hZGRQcmljZSAqIChwLmNvdW50VG90YWwgLSAxKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIOagueaNruavj+S4quWVhuWTgeeahOaAu+i/kOi0ueOAgeWVhuWTgeaAu+S7t+agvOiuoeeul+aVtOS4quiuouWNleeahOi/kOi0ueS7peWPiuWVhuWTgeS7t+agvFxyXG4gICAgICAgICAgZnJlaWdodFRvdGFsICs9IHAuZnJlaWdodFRvdGFsO1xyXG4gICAgICAgICAgcHJpY2VUb3RhbF8gKz0gcC5wcmljZVRvdGFsO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5mcmVpZ2h0VG90YWwgPSBmcmVpZ2h0VG90YWw7XHJcbiAgICAgIHRoaXMucHJpY2VUb3RhbCA9IHByaWNlVG90YWxfO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdEFkZHJlc3MoYWRkcmVzcykge1xyXG4gICAgICB0aGlzLnNlbGVjdGVkQWRkcmVzcyA9IGFkZHJlc3M7XHJcbiAgICB9LFxyXG4gICAgc2V0RnJlaWdodEJ5TmFtZSgpIHtcclxuICAgICAgdGhpcy5leHRlbmRQcm9kdWN0KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35paw55So5oi355qE5b+r6YCS5L+h5oGvXHJcbiAgICBnZXRBZGRyZXNzZXMoKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBua2NBUEkod2luZG93LmxvY2F0aW9uLmhyZWYgKyBgJnQ9JHtEYXRlLm5vdygpfWAsIFwiR0VUXCIpXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBzZWxmLmFkZHJlc3NlcyA9IGRhdGEuYWRkcmVzc2VzO1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5Yi35paw5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICB9LFxyXG4gICAgLy8g55So5oi36YCJ5oup5LqG5Yet6K+B5paH5Lu2XHJcbiAgICBzZWxlY3RlZEZpbGUociwgcCkge1xyXG4gICAgICBjb25zdCB7cHJvZHVjdH0gPSBwO1xyXG4gICAgICBsZXQgZG9tID0gJChgaW5wdXQuaGlkZGVuLmlucHV0LSR7cHJvZHVjdC5wcm9kdWN0SWR9YCk7XHJcbiAgICAgIGRvbSA9IGRvbVswXTtcclxuICAgICAgY29uc3QgZmlsZSA9IGRvbS5maWxlc1swXTtcclxuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgZm9ybURhdGEuYXBwZW5kKFwidHlwZVwiLCBcInNob3BwaW5nXCIpO1xyXG4gICAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlXCIsIGZpbGUpO1xyXG4gICAgICBua2NVcGxvYWRGaWxlKFwiL3Nob3AvY2VydFwiLCBcIlBPU1RcIiwgZm9ybURhdGEpXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBwLmNlcnRJZCA9IGRhdGEuY2VydC5faWQ7XHJcbiAgICAgICAgICBWdWUuc2V0KHIucHJvZHVjdHMsIHIucHJvZHVjdHMuaW5kZXhPZihwKSwgcCk7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkuIrkvKDmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgLy8g5p+l55yL5Yet6K+BXHJcbiAgICBnZXRDZXJ0KGNlcnRJZCkge1xyXG4gICAgICBOS0MubWV0aG9kcy52aXNpdFVybChgL3Nob3AvY2VydC8ke2NlcnRJZH1gLCB0cnVlKTtcclxuICAgIH0sXHJcbiAgICBzdWJtaXQoKSB7XHJcbiAgICAgIGNvbnN0IHtyZXN1bHRzLCBzZWxlY3RlZEFkZHJlc3N9ID0gdGhpcztcclxuICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICBwYXJhbXM6IFtdLFxyXG4gICAgICAgIGFkZHJlc3M6IHNlbGVjdGVkQWRkcmVzc1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBpZighYm9keS5hZGRyZXNzKSB0aHJvdyBcIuivt+mAieaLqeaUtui0p+WcsOWdgFwiO1xyXG4gICAgICAgICAgcmVzdWx0cy5tYXAodXNlck9iaiA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtwcm9kdWN0cywgdXNlciwgYnV5TWVzc2FnZX0gPSB1c2VyT2JqO1xyXG4gICAgICAgICAgICBjb25zdCByID0ge1xyXG4gICAgICAgICAgICAgIHVpZDogdXNlci51aWQsXHJcbiAgICAgICAgICAgICAgYnV5TWVzc2FnZSxcclxuICAgICAgICAgICAgICBwcm9kdWN0czogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcm9kdWN0cy5tYXAocHJvZHVjdE9iaiA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3Qge3Byb2R1Y3QsIHBhcmFtcywgcHJpY2VUb3RhbCwgZnJlaWdodFRvdGFsLCBjZXJ0SWQsIGZyZWlnaHROYW1lfSA9IHByb2R1Y3RPYmo7XHJcbiAgICAgICAgICAgICAgaWYocHJvZHVjdC51cGxvYWRDZXJ0ICYmICFjZXJ0SWQpIHRocm93IFwi6K+35LiK5Lyg5Yet6K+BXCI7XHJcbiAgICAgICAgICAgICAgaWYoIXByb2R1Y3QuaXNGcmVlUG9zdCAmJiAhZnJlaWdodE5hbWUpIHRocm93IFwi6K+36YCJ5oup54mp5rWBXCI7XHJcbiAgICAgICAgICAgICAgY29uc3QgcCA9IHtcclxuICAgICAgICAgICAgICAgIHByb2R1Y3RJZDogcHJvZHVjdC5wcm9kdWN0SWQsXHJcbiAgICAgICAgICAgICAgICBwcmljZVRvdGFsLFxyXG4gICAgICAgICAgICAgICAgZnJlaWdodFRvdGFsLFxyXG4gICAgICAgICAgICAgICAgY2VydElkLFxyXG4gICAgICAgICAgICAgICAgZnJlaWdodE5hbWUsXHJcbiAgICAgICAgICAgICAgICBwcm9kdWN0UGFyYW1zOiBbXVxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgcGFyYW1zLm1hcChwYXJhbU9iaiA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7cHJvZHVjdFBhcmFtLCBjb3VudCwgcHJpY2UsIGNhcnRJZH0gPSBwYXJhbU9iajtcclxuICAgICAgICAgICAgICAgIHAucHJvZHVjdFBhcmFtcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgX2lkOiBwcm9kdWN0UGFyYW0uX2lkLFxyXG4gICAgICAgICAgICAgICAgICBjYXJ0SWQsXHJcbiAgICAgICAgICAgICAgICAgIGNvdW50LFxyXG4gICAgICAgICAgICAgICAgICBwcmljZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgci5wcm9kdWN0cy5wdXNoKHApO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBib2R5LnBhcmFtcy5wdXNoKHIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhib2R5KTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvc2hvcC9vcmRlclwiLCBcIlBPU1RcIiwgYm9keSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIG9wZW5Ub05ld0xvY2F0aW9uKCcvc2hvcC9wYXk/b3JkZXJzSWQ9JyArIGRhdGEub3JkZXJzSWQuam9pbihcIi1cIikpO1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5o+Q5Lqk5oiQ5Yqf77yM5q2j5Zyo5YmN5b6A5LuY5qy+6aG16Z2iXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxufSkiXX0=
