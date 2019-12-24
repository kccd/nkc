NKC.modules.ShopShip = class {
  constructor() {
    const self = this;
    self.dom = $("#moduleShopShip");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: "#moduleShopShipApp",
      data: {
        loading: true,
        order: "",
        trackNumber: "",
        trackName: "AUTO",
        track: true,
        trackNames: NKC.configs.trackNames,
        trackList: [],
      },
      methods: {
        copy(text) {
        
        },
        open(func, options = {}) {
          const {orderId} = options;
          self.dom.modal("show");
          Promise.resolve()
            .then(() => {
              return nkcAPI(`/shop/manage/${NKC.configs.uid}/order/detail?orderId=${orderId}&t=${Date.now()}`, "GET");
            })
            .then(data => {
              self.app.loading = false;
              self.app.order = data.order;
              self.app.trackName = data.order.trackName || "AUTO";
              if(data.order.trackNumber === "no") {
                self.app.track = false;
                self.app.trackNumber = "";
              } else {
                self.app.trackNumber = data.order.trackNumber || "";
                self.app.track = true;
              }
            })
            .catch(sweetError);
        },
        close() {
          self.dom.modal("hide");
        },
        submit() {
          const {track, order, trackName, trackNumber} = this;
          const body = {
            orderId: order.orderId
          };
          
          let url = `/shop/manage/${NKC.configs.uid}/order/sendGoods`;
          if(order.orderStatus === "unSign") {
            url = `/shop/manage/${NKC.configs.uid}/order/editGoods`;
          }
          if(!track) {
            body.trackName = "";
            body.trackNumber = "no";
          } else {
            body.trackName = trackName;
            body.trackNumber = trackNumber;
          }
          nkcAPI(url, "PATCH", {post: body})
            .then(function() {
              self.close();
              sweetSuccess("保存成功")
            })
            .catch(sweetError)
        }
      }
    });
    self.open = self.app.open;
    self.close = self.app.close;
  }
  open (func, options) {
    this.app.open(func, options);
  }
  close() {
    this.app.close();
  }
};