var app = new Vue({
  el: '#app',
  data: {

    agree: '',

    error: '',
    info: '',

    password: "",

    user: '',
    order: '',
    refund: '',
    refunds: [],
    reason: '',
    type: '',
    displayInput: false
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
    },
    params: function() {
      return this.order.params;
    },
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
    format: function(m, t) {
      if(typeof moment === "undefined") throw 'moment is not loaded';
      return moment(t).format(m);
    },
    clearInfo: function() {
      this.error = "";
      this.info = "";
    },
    viewCert: function(cert) {
      window.open("/shop/cert/" + cert._id);
    },
    submit: function() {
      this.clearInfo();
      var agree = this.agree;
      var reason = this.reason;
      var password = this.password;

      if(agree === "") return this.error = "请选择同意或拒绝";
      if(agree === false) {
        if(reason === "") return this.error = "请输入拒绝理由";
      }
      
      agree = agree? "agree": "disagree";
      
      nkcAPI("/e/settings/shop/refunds/" + agree, "POST", {
        orderId: this.order.orderId,
        reason: this.reason,
        password: password
      })
        .then(function() {
          window.location.reload();
        })
        .catch(function(data) {
          app.error = data.error || data;
        });

    },
    agreeR: function() {
      nkcAPI("/e/settings/shop/refunds/agree", "POST", {
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
      console.log("不同意")
      nkcAPI("/e/settings/shop/refunds/disagree", "POST", {
        orderId: this.order.orderId,
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
});   