var app = new Vue({
  el: "#app",
  data: {

    user: "",

    error: "",
    info: "",

    // 是否同意
    agree: "",
    password: "",

    uploadStatus: "",

    // 退货地址信息
    storeName: "",
    address: "",
    mobile: "",

    order: '',
    refund: '',
    refunds: [],
    displayInput: false,
    myStore: '',
    reason: '',

  },
  computed: {
    orderOriginPrice: function() {
      var num = 0;
      for(var i = 0; i < this.order.params.length; i++) {
        num += this.order.params[i].productPrice;
      }
      return num
    },
    param: function() {
      var paramId;
      if(this.refund.paramId) {
        paramId = this.refund.paramId;
      }
      if(!paramId) return "";
      for(var i = 0 ; i < this.order.params.length; i++) {
        if(this.order.params[i].costId === paramId) return this.order.params[i];
      }
      return ""
    },
    params: function() {
      return this.order.params;
    },
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
    seller: function() {
      if(this.order) return this.order.product.user;
    }
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.refund = data.refund;
    this.refunds = data.refunds;
    this.user = data.user;
    // this.myStore = data.myStore;
    this.storeName = data.user.username;
    this.address = data.dealInfo.address;
    this.mobile = data.dealInfo.mobile[0];
    this.order = data.order;
  },
  methods: {
    format: NKC.methods.format,
    clearInfo: function() {
      this.error = "";
      this.info = "";
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
      if(this.param) formData.append("paramId", this.param.costId);
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
          screenTopWarning(data);
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
    saveCerts: function() {

    },
    sellerPost: function() {
      var type;
      var agree = this.agree;
      var method = "POST", url = "/shop/manage/" + this.refund.sellerId + "/order/refund";
      if(agree === '' && this.refund.status !== "P_APPLY_RM") return this.error = "请选择同意或者不同意";
      if(["B_APPLY_RM", "B_INPUT_INFO"].indexOf(this.refund.status) !== -1) {
        type = agree? "agreeRM": "disagreeRM";
      } else if(["B_APPLY_RP"].indexOf(this.refund.status) !== -1) {
        type = agree? "agreeRP": "disagreeRP";
      } else if(this.refund.status === "B_INPUT_CERT_RM") {
        type = agree? "uploadCerts": "agreeRM";
      } else if(this.refund.status === "P_APPLY_RM") {
        method = "PATCH";
        url = "/shop/cert";
        type = "uploadCerts";
      } else {
        return this.error = "申请记录状态异常，请刷新";
      }  
        
      
      var certsId = [];

      if(type === "uploadCerts") {
        for(var i = 0; i < this.order.certs.length; i++) {
          certsId.push(this.order.certs[i]._id);
        }
      }

      var password = this.password;
      if(type === "agreeRM") {
        if(password === "") return this.error = "请输入登录密码";
      }



      if(type === "agreeRP") {
        if(!this.storeName) return this.error = "请输入收件人姓名";
        if(!this.mobile) return this.error = "请输入收件人手机号";
        if(!this.address) return this.error = "请输入收件人地址";
      }

      nkcAPI(url, method, {
        orderId: this.order.orderId,
        type: type,
        reason: this.reason,
        certsId: certsId,
        password: password,

        sellerInfo: {
          name: this.storeName,
          address: this.address,
          mobile: this.mobile
        }
      })
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          app.error = data.error || data;
        });
    },
    refundType: function(t) {
      return {
        'money': '只退款',
        'product': '退货退款',
      }[t];
    }
  }
});