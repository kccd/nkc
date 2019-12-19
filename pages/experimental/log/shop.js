function showOrderInfo(orderId) {
  $(".product-info[data-order-id="+orderId+"]").toggle();
}

var data = NKC.methods.getDataById("data");console.log(data);
var app = new Vue({
  el: "#app",
  data: {
    orderId: "",
    userType: "username", // username, uid
    userContent: "",
    tUserType: "username", // username, uid
    tUserContent: ""
  },
  mounted: function() {
    if(!data.c) return;
    var obj = JSON.parse(NKC.methods.base64ToStr(data.c));
    this.orderId = obj.orderId;
    this.userType = obj.userType;
    this.userContent = obj.userContent;
    this.tUserType = obj.tUserType;
    this.tUserContent = obj.tUserContent;
  },
  methods: {
    submit: function() {
      var c = NKC.methods.strToBase64(JSON.stringify({
        orderId: this.orderId,
        userType: this.userType,
        userContent: this.userContent,
        tUserType: this.tUserType,
        tUserContent: this.tUserContent
      }));
      NKC.methods.visitUrl("/e/log/shop?c=" + c);
    },
    reset: function() {
      NKC.methods.visitUrl("/e/log/shop");
    }
  }
});