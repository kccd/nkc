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
    displayInput: false
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
    editReason: function() {
      if(this.displayInput) {
        this.displayInput = false;  
      } else {
        if(!this.reason) {
          this.reason = this.refund.reason;
          this.money = this.refund.money;
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