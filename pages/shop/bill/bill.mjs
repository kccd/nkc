const data = NKC.methods.getDataById("data");

// 默认选择第一个运费模板
data.results.map(r => {
  r.buyMessage = "";
  r.products.map(p => {
    const product = p.product;
    if(!product.isFreePost) {
      p.freightName = product.freightTemplates[0].name
      p.certId = "";
    }
  })
})

const app = new Vue({
  el: "#app",
  data: {
    addresses: data.addresses, // 地址
    selectedAddress: data.addresses[0] || "", // 已选择的地址
    results: data.results, // 商品规格数据
    freightTotal: 0, // 运费总计
    priceTotal: 0, // 商品总计

    showAddressForm: false,
    addressForm: {
      username: "",
      address: "",
      location: "",
      mobile: ""
    }
  },
  mounted() {
    this.extendProduct();
    window.SelectAddress = new NKC.modules.SelectAddress();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    visitUrl: NKC.methods.visitUrl,
    checkString: NKC.methods.checkData.checkString,
    // 隐藏添加地址的输入框
    switchAddressForm() {
      this.showAddressForm = !this.showAddressForm;
    },
    // 添加新地址
    saveAddressForm() {
      const self = this;
      const {username, address, location, mobile} = this.addressForm;
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
      nkcAPI(`/u/${NKC.configs.uid}/settings/transaction`, "PUT", {
        operation: "add",
        addresses: [this.addressForm]
      })
        .then(data => {
          self.addresses = data.addresses;
          if(self.addresses.length) {
            self.selectedAddress = self.addresses[self.addresses.length - 1];
          } else {
            self.selectedAddress = "";
          }
          self.switchAddressForm();
        })
        .catch(sweetError);
    },
    selectLocation() {
      const self = this;
      SelectAddress.open(data => {
        self.addressForm.location = data.join(" ");
      })
    },
    // 改变规格的数量
    changeCount(type, param) {
      if(type == "up") {
        if(param.count >= param.productParam.stocksSurplus) { // 数量不能大于规格库存
          screenTopWarning("库存不足");
          return
        };
        param.count ++;
      } else if(param.count > 1){
        param.count --;
      }
      this.extendProduct();
    },
    // 计算规格运费、价格
    extendProduct() {
      let freightTotal = 0, priceTotal_ = 0;
      this.results.map(r => {
        r.products.map(p => {
          // 根据用户选择的快递名获取快递模板
          const {freightName} = p;
          const {freightTemplates, isFreePost} = p.product;
          if(!isFreePost) {
            for(const t of freightTemplates) {
              if(t.name === freightName) {
                p.freight = t;
              }
            }      
          }
          // 统计同一商品下规格的总个数以及总价格
          let countTotal = 0, priceTotal = 0;
          p.params.map(param => {
            const {count, price} = param; 
            countTotal += count;
            priceTotal += (count * price);
          });
          p.countTotal = countTotal;
          p.priceTotal = priceTotal;
          p.freightTotal = 0;
          if(!isFreePost) {
            if(p.countTotal === 1) {
              p.freightTotal = p.freight.firstPrice;
            } else {
              p.freightTotal = p.freight.firstPrice + (p.freight.addPrice * (p.countTotal - 1));
            }
          }
          // 根据每个商品的总运费、商品总价格计算整个订单的运费以及商品价格
          freightTotal += p.freightTotal;
          priceTotal_ += p.priceTotal;
        });
      });
      this.freightTotal = freightTotal;
      this.priceTotal = priceTotal_;
    },
    selectAddress(address) {
      this.selectedAddress = address;
    },
    setFreightByName() {
      this.extendProduct();
    },
    // 刷新用户的快递信息
    getAddresses() {
      const self = this;
      nkcAPI(window.location.href + `&t=${Date.now()}`, "GET")
        .then(data => {
          self.addresses = data.addresses;
          sweetSuccess("刷新成功");
        })
        .catch(sweetError)
    },
    // 用户选择了凭证文件
    selectedFile(r, p) {
      const {product} = p;
      let dom = $(`input.hidden.input-${product.productId}`);
      dom = dom[0];
      const file = dom.files[0];
      const formData = new FormData();
      formData.append("type", "shopping");
      formData.append("file", file);
      nkcUploadFile("/shop/cert", "POST", formData)
        .then(data => {
          p.certId = data.cert._id;
          Vue.set(r.products, r.products.indexOf(p), p);
          sweetSuccess("上传成功");
        })
        .catch(sweetError);
    },
    // 查看凭证
    getCert(certId) {
      NKC.methods.visitUrl(`/shop/cert/${certId}`, true);
    },
    submit() {
      const {results, selectedAddress} = this;
      const body = {
        params: [],
        address: selectedAddress
      };

      Promise.resolve()
        .then(() => {
          if(!body.address) throw "请选择收货地址";
          results.map(userObj => {
            const {products, user, buyMessage} = userObj;
            const r = {
              uid: user.uid,
              buyMessage,
              products: []
            }
            products.map(productObj => {
              const {product, params, priceTotal, freightTotal, certId, freightName} = productObj;
              if(product.uploadCert && !certId) throw "请上传凭证";
              if(!product.isFreePost && !freightName) throw "请选择物流";
              const p = {
                productId: product.productId,
                priceTotal,
                freightTotal,
                certId,
                freightName,
                productParams: []
              };
              params.map(paramObj => {
                const {productParam, count, price, cartId} = paramObj;
                p.productParams.push({
                  _id: productParam._id,
                  cartId,
                  count,
                  price
                });
              });
              r.products.push(p);
            })
            body.params.push(r);
          });
          console.log(body);
          return nkcAPI("/shop/order", "POST", body);
        })
        .then(data => {
          openToNewLocation('/shop/pay?ordersId=' + data.ordersId.join("-"));
          sweetSuccess("提交成功，正在前往付款页面");
        })
        .catch(sweetError);
    }
  }
})