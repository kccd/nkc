NKC.modules.ShopModifyPrice = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleModifyPrice");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    
    self.app = new Vue({
      el: "#moduleModifyPriceApp",
      data: {
        price: 0,
        type: "discount", // discount: 折扣，reduce: 减价, input: 直接输入
        number: "",
        warning: ""
      },
      mounted() {
        this.checkData();
      },
      watch: {
        number() {
          this.checkData();
        },
        type() {
          this.checkData();
        }
      },
      computed: {
        resultPrice() {
          let {price, number, type} = this;
          number = number || 0;
          if(type === "input") {
            return number.toFixed(2);
          } else if(type === "discount") {
            return (number * price / 100).toFixed(2);
          } else {
            return (price - number).toFixed(2);
          } 
        }
      },
      methods: {
        checkData() {
          this.warning = "";
          let {price, number, type} = this;
          if(type === "discount") {
            if(number >= 1 && number <= 100){}
            else{
              this.warning = "折扣数值不在规定的范围内";
            }
          } else if(type === "reduce") {
            if(number >= 0.01 && number < price) {}
            else {
              this.warning = "减去的数值不在规定的范围内";
            }
          } else {
            if(number >= 0.01) {}
            else {
              this.warning = "改价后的数值不能小于0.01";
            }
          }
        },
        open(callback, price) {
          self.callback = callback;
          self.app.price = price;
          self.dom.modal("show");
        },
        close() {
          self.dom.modal("hide");
        },
        submit() {
          self.callback(parseFloat(this.resultPrice));
          this.close();
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }

}