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
    agreeR: function() {
      nkcAPI("/shop/manage/" + this.myStore.storeId + "/order/refund", "POST", {
        orderId: this.order.orderId,
        type: "agreeR",
        reason: this.reason
      })
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          screenTopWarning(data);
        });
    },
    disagreeR: function() {
      nkcAPI("/shop/manage/" + this.myStore.storeId + "/order/refund", "POST", {
        orderId: this.order.orderId,
        type: "disagreeR",
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
        'product': '退货',
        'all': '退款+退货'
      }[t];
    }
  }
})