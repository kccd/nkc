"use strict";

var data = NKC.methods.getDataById("data");
console.log(data); // 默认选择第一个运费模板

data.results.map(function (r) {
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
    priceTotal: 0 // 商品总计

  },
  mounted: function mounted() {
    this.extendProduct();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    visitUrl: NKC.methods.visitUrl,
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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = freightTemplates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var t = _step.value;

                if (t.name === freightName) {
                  p.freight = t;
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
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
    selectedFile: function selectedFile(p) {
      var product = p.product;
      var dom = $("input.hidden.input-".concat(product.productId));
      dom = dom[0];
      var file = dom.files[0];
      var formData = new FormData();
      formData.append("type", "shopping");
      formData.append("file", file);
      nkcUploadFile("/shop/cert", "POST", formData).then(function (data) {
        p.certId = data.cert._id;
        sweetSuccess("上传成功");
      })["catch"](sweetError);
    },
    // 查看凭证
    getCert: function getCert(certId) {
      NKC.methods.visitUrl("/shop/cert/".concat(certId), true);
    },
    submit: function submit() {
      var results = this.results;
      var body = {
        params: []
      };
      Promise.resolve().then(function () {
        results.map(function (userObj) {
          var products = userObj.products,
              user = userObj.user;
          var r = {
            uid: user.uid,
            products: []
          };
          products.map(function (productObj) {
            var product = productObj.product,
                params = productObj.params,
                priceTotal = productObj.priceTotal,
                freightTotal = productObj.freightTotal,
                certId = productObj.certId;
            if (product.uploadCert && !certId) throw "请上传凭证";
            var p = {
              productId: product.productId,
              priceTotal: priceTotal,
              freightTotal: freightTotal,
              certId: certId,
              productParams: []
            };
            params.map(function (paramObj) {
              var productParam = paramObj.productParam,
                  count = paramObj.count,
                  price = paramObj.price;
              p.productParams.push({
                _id: productParam._id,
                count: count,
                price: price
              });
            });
            r.products.push(p);
          });
          body.params.push(r);
        });
        console.log(body);
      })["catch"](sweetError);
    }
  }
});