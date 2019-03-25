var app = new Vue({
  el: '#app',
  data: {
    user: '',
    order: '',
    refund: '',
    refunds: [],
    reason: '',
    type: '',
    displayInput: false
  },
  computed: {
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
    for(var i = 0; i < data.refunds.length; i++) {
      var refund = data.refunds[i];
      for(var j = 0; j < refund.logs.length; j++) {
        var log = refund.logs[j];
        if(!log.info) continue;
        log.info = log.info.replace('')
      }
    }
    this.refunds = data.refunds;
    if(this.order.refundStatus) {
      this.refund = data.refund;
    } else {
      this.displayInput = true;
    }
  },
  methods: {
    format: NKC.methods.format,
    giveUpRefund: function() {
      var refund = this.refund;
      nkcAPI("/shop/refund/" + refund._id + "/give_up", 'POST', {})
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    submitBuyerReason: function() {
      var obj = {
        refund: {
          reason: this.reason,
          type: this.type
        },
        orderId: this.order.orderId
      }
      var url = '/shop/refund';
      var method = 'POST';
      if(this.refund) {
        url = '/shop/refund/' + this.refund._id;
        method = 'PATCH';
      }
      nkcAPI(url, method, obj)
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    editReason: function() {
      if(this.displayInput) {
        this.displayInput = false;  
      } else {
        if(!this.reason) {
          this.reason = this.refund.reason;
          this.type = this.refund.type;
        }
        this.displayInput = true;
      }
    },
    refundType: function(t) {
      return {
        'money': '退款',
        'product': '退货',
        'all': '退款+退货'
      }[t];
    }
  }
});   