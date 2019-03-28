var app = new Vue({
  el: '#app',
  data: {
    user: '',
    order: '',
    refund: '',
    refunds: [],
    reason: '',
    type: '',
    money: '',
    applyRMInput: false,
    infoInput: false,
    uploadStatus: '',
    trackNumber: '',
    displayGiveUpInput: false,
    giveUpReason: ''
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
    var data = document.getElementById('data');
    data = JSON.parse(data.innerHTML);
    this.order = data.order;
    this.user = data.user;
    this.refunds = data.refunds;
    if(data.refund) {
      this.refund = data.refund;
      if(["S_AGREE_RP", "P_AGREE_RP"].indexOf(this.refund.status) !== -1)  {
        this.infoInput = true;
      }
    } else {
      if(this.order.orderStatus !== "finish" && !this.order.closeStatus) {
        this.applyRMInput = true;
      }
    }
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
    submitTrackNumber: function() {
      nkcAPI("/shop/refund/" + this.refund._id, "POST", {
        type: "submitTrackNumber",
        trackNumber: this.trackNumber
      })
        .then(function() {
          window.location.reload();
        })    
        .catch(function(data) {
          screenTopWarning(data);
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
    newRefund: function(data) {
      var url = '/shop/refund';
      var method = 'POST';
      if(this.refund) {
        url = '/shop/refund/' + this.refund._id;
        method = 'PATCH';
      }
      var obj = {
        refund: data.refund,
        orderId: data.orderId
      };
      console.log(obj);
      nkcAPI(url, method, obj)
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    submitBuyerReasonToP: function() {
      var data = {
        refund: {
          reason: this.reason,
          money: this.money,
          type: this.type,
          root: true
        },
        orderId: this.order.orderId
      }
      this.newRefund(data);
    },  
    submitBuyerReason: function() {
      var data = {
        refund: {
          reason: this.reason,
          money: this.money,
          type: this.type
        },
        orderId: this.order.orderId
      }
      this.newRefund(data);
    },
    refundType: function(t) {
      return {
        'money': '退款',
        'product': '退款+退货'
      }[t];
    }
  }
});   