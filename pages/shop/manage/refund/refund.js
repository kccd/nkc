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