var app = new Vue({
  el: "#app",
  data: {
    order: '',
    refund: '',
    refunds: [],
    displayInput: false,
    myStore: '',
    reason: ''
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
    seller: function() {
      if(this.order) return this.order.product.user;
    }
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.refund = data.refund;
    this.refunds = data.refunds;
    this.myStore = data.myStore;
    this.order = data.order;
  },
  methods: {
    format: NKC.methods.format,
    upload: function(arr, index, dom) {
      if(arr.length < index + 1) {
        dom.value =  "";
        return;
      };
      var file = arr[index];
      var formData = new FormData();
      formData.append("type", "refund");
      formData.append("orderId", this.order.orderId);
      formData.append("file", file);
      uploadFilePromise("/shop/cert", formData, function(e) {
        var p = (e.loaded/e.total)*100;
        if(p >= 100) {
          app.uploadStatus = "上传完成！";
          setTimeout(function() {
            app.uploadStatus = "";
          }, 2000)
        } else {
          app.uploadStatus = "上传中... " + p.toFixed(1) + "%";
        }
        
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
    seletedFile: function(e) {
      var inputDom = e.target;
      var files = inputDom.files;
      this.upload(files, 0, inputDom);
    },
    sellerPost: function(agree) {
      var type;
      if(["B_APPLY_RM", "B_INPUT_INFO"].indexOf(this.refund.status) !== -1) {
        type = agree? "agreeRM": "disagreeRM";
      } else if(["B_APPLY_RP", "P_APPLY_RP"].indexOf(this.refund.status) !== -1) {
        type = agree? "agreeRP": "disagreeRP";
      } else {
        return screenTopWarning("申请记录状态异常，请刷新");
      }
      console.log(type)
      nkcAPI("/shop/manage/" + this.myStore.storeId + "/order/refund", "POST", {
        orderId: this.order.orderId,
        type: type,
        reason: this.reason
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
        'money': '退款',
        'product': '退款+退货',
      }[t];
    }
  }
})