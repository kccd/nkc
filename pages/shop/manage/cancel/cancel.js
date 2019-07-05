var app = new Vue({
  el: "#app",
  data: {
    order: "",
    product: "",

    user: "",

    error: "",
    info: "",

    reason: "",
    password: "",
    money: ""
  },
  computed: {
    needPassword: function() {
      return this.order.orderStatus === "unShip";
    },
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
    }
  },
  mounted: function() {
    var data = document.getElementById("data");
    data = JSON.parse(data.innerHTML);
    this.order = data.order;
    this.product = data.product;
    this.user = data.user;
  },
  methods: {
    submit: function() {
      this.error = "";
      this.info = "";
      if(this.reason === "") return this.error = "请输入理由";
      if(this.needPassword) {
        if(this.money >= 1 && this.money <= 50) {console.log(1)}
        else return this.error = "请输入正确的补偿金额";
      }
      nkcAPI("/shop/manage/" + this.order.sellUid + "/order/cancel", "POST", {
        orderId: this.order.orderId,
        money: this.money,
        reason: this.reason,
        password: this.password
      })
        .then(function() {
          app.info = "订单取消成功，正在前往订单列表...";
          setTimeout(function() {
            // window.location.href = "/shop/manage/" + app.order.sellUid + "/order";
            openToNewLocation("/shop/manage/" + app.order.sellUid + "/order");
          }, 2000);
        })
        .catch(function(data) {
          app.error = data.error || data;
        })
    }
  }
});