var app = new Vue({
  el: '#app',
  data: {

    // 向谁申请
    applyType: "seller", // platform: 平台, seller: 买家
    display: {
      apply: false
    },

    // 新的退款/退货申请
    newRefund: {
      type: "",
      reason: "",
      money: ""
    },

    // 错误信息
    error: "",
    // 其他信息
    info: "",


    user: '',
    order: '',
    refund: '',
    refunds: [],
    reason: '',
    type: '',
    money: '',
    applyRMInput: false,
    uploadStatus: '',
    trackNumber: '',
    displayGiveUpInput: false,
    giveUpReason: '',
    param: ""
  },
  computed: {
    status: function() {
      var refund = this.refunds[this.refunds.length - 1];
      return refund.logs[refund.logs.length -1];
    },
    product: function() {
      if(this.order) return this.order.product;
    },
    productParam: function() {
      if(this.order) return this.order.productParam;
    },
    params: function() {
      return this.order.params;
    },
    seller: function() {
      if(this.order) return this.order.product.user;
    },
    refundMoneyMax: function() {
      var maxMoney = 0;
      if(this.param) {
        return this.param.productPrice;
      } else {
        return this.order.orderPrice + this.order.orderFreightPrice
      }
    }
  },
  mounted: function() {
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    this.order = data.order;
    this.param = data.param;
    this.user = data.user;
    this.refunds = data.refunds;
    if(data.refund) {
      this.refund = data.refund;
    } else {
      if(this.order.orderStatus !== "finish" && !this.order.closeStatus) {
        this.display.apply = true;
      }
    }
  },
  methods: {
    format: NKC.methods.format,
    cancelOrder: function() {
      this.clearInfo();
      nkcAPI("/shop/refund", "POST", {
        refund: {
          reason: app.reason
        },
        orderId: this.order.orderId
      })
        .then(function() {
          app.info = "订单取消成功，正在前往我的订单";
          setTimeout(function() {
            window.location.href="/shop/order"
          }, 2000); 
        })
        .catch(function(data) {
          app.error = data.error || data;
        })
    },
    saveCerts: function() {
      this.clearInfo();
      var certs = this.order.certs;
      var certsId = [];
      for(var i = 0; i < certs.length; i++ ) {
        certsId.push(certs[i]._id);
      }
      nkcAPI("/shop/cert", "PATCH", {
        certsId: certsId
      })
        .then(function() {
          app.info = "保存成功";
          setTimeout(function() {
            app.info = "";
          }, 3000); 
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
    },
    deleteCert: function(cert) {
      this.clearInfo();
      nkcAPI("/shop/cert/" + cert._id, "DELETE")
        .then(function() {
          var index = app.order.certs.indexOf(cert);
          if(index !== -1) {
            app.order.certs.splice(index, 1);
          }
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
    },
    viewCert: function(cert) {
      window.open("/shop/cert/" + cert._id);
    },
    // 切换申请类型 向买家、平台
    selectApplyType: function(type) {
      this.applyType = type;
    },
    // 清除info、error
    clearInfo: function() {
      this.info = "";
      this.error = "";
    },
    // 提交申请
    submitApply: function() {
      this.clearInfo();
      var applyType = this.applyType;
      var newRefund = this.newRefund;
      var param  = this.param;
      if(newRefund.reason === "") return this.error = "请输入理由";
      if(newRefund.type === "") return this.error = "请选择退款方式";
      if(newRefund.type !== "money" && applyType === "platform") return this.error = "请求平台介入时退款方式只能选择【只退款】";
      if(newRefund.money >= 0) {
        if(param) {
          if(newRefund.money*100 > param.productPrice) return this.error = "退款金额不能超过退款中的商品的金额";
        } else {
          if(newRefund.money*100 > this.order.orderPrice + this.order.orderFreightPrice) return this.error = "退款金额不能超过订单金额";
        }
      }
      else return this.error = "请输入正确的退款金额";
      var url = "/shop/refund";
      var method = "POST";

      if(applyType === "platform") {
        newRefund.root = true;
      }

      var obj = {
        refund: newRefund,
        orderId: this.order.orderId,
        paramId: param?param._id: ""
      };

      nkcAPI(url, method, obj)
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          app.error = data.error || data;
        });

    },

    upload: function(arr, index, dom) {
      if(arr.length < index + 1) {
        dom.value =  "";
        return;
      }
      var file = arr[index];
      var formData = new FormData();
      formData.append("type", "refund");
      formData.append("orderId", this.order.orderId);
      formData.append("file", file);
      uploadFilePromise("/shop/cert", formData, function(e) {
        var p = (e.loaded/e.total)*100;
        if(p >= 100) {
          p = 100;
          if(arr.length === index+1) {
            setTimeout(function() {
              app.uploadStatus = "";
            }, 2000)
          }
        }
        app.uploadStatus = "上传中... " + (index+1) + "/" + arr.length + " " + p.toFixed(1) + "%";
        
      })
        .then(function(data) {
          var cert = data.cert;
          app.order.certs.push(cert);
        })
        .catch(function(data) {
          app.error = data.error || data;
        })
        .finally(function() {
          app.upload(arr, index+1, dom);
        });
    },
    selectedFile: function(e) {
      var inputDom = e.target;
      var files = inputDom.files;
      this.upload(files, 0, inputDom);
    },
    submitTrackNumber: function() {
      this.clearInfo();
      nkcAPI("/shop/refund/" + this.refund._id, "POST", {
        type: "submitTrackNumber",
        trackNumber: this.trackNumber
      })
        .then(function() {
          window.location.reload();
        })    
        .catch(function(data) {
          this.error = data.error || data;
        });
    },
    giveUpRefund: function() {
      var refund = this.refund;
      nkcAPI("/shop/refund/" + refund._id, 'POST', {
        type: "giveUp",
        reason: app.giveUpReason
      })
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    
    refundType: function(t) {
      return {
        'money': '只退款',
        'product': '退货退款'
      }[t];
    }
  }
});   