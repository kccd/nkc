const data = NKC.methods.getDataById("data");
console.log(data);

// 默认选择第一个运费模板
data.results.map(r => {
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
    priceTotal: 0 // 商品总计
  },
  mounted() {
    this.extendProduct();
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    visitUrl: NKC.methods.visitUrl,
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
    selectedFile(p) {
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
          sweetSuccess("上传成功");
        })
        .catch(sweetError);
    },
    // 查看凭证
    getCert(certId) {
      NKC.methods.visitUrl(`/shop/cert/${certId}`, true);
    },
    submit() {
      const {results} = this;
      const body = {
        params: []
      };
      Promise.resolve()
        .then(() => {
          results.map(userObj => {
            const {products, user} = userObj;
            const r = {
              uid: user.uid,
              products: []
            }
            products.map(productObj => {
              const {product, params, priceTotal, freightTotal, certId} = productObj;
              if(product.uploadCert && !certId) throw "请上传凭证";
              const p = {
                productId: product.productId,
                priceTotal,
                freightTotal,
                certId,
                productParams: []
              };
              params.map(paramObj => {
                const {productParam, count, price} = paramObj;
                p.productParams.push({
                  _id: productParam._id,
                  count,
                  price
                });
              });
              r.products.push(p);
            })
            body.params.push(r);
          });
          console.log(body);
        })
        .catch(sweetError);
    }
  }
})