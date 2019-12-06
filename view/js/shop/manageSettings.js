const data = NKC.methods.getDataById("data");
let {address = "", dealDescription = "", dealAnnouncement = "", templates = []} = data.dealInfo || {};
let locationStr = "";

const index = address.indexOf("&");
if(index === -1) {
  locationStr = address;
  address = "";
} else {
  locationStr = address.slice(0, index);
  address = address.slice(index + 1);
}
const app = new Vue({
  el: "#address",
  data: {
    dealDescription,
    dealAnnouncement,
    address,
    templates,
    location: locationStr
  },
  mounted() {
    window.SelectAddress = new NKC.modules.SelectAddress();
  },
  methods: {
    selectAddress(address) {
      SelectAddress.open(function(d) {
        app.location = d.join("/");
      }, {
        onlyChina: true
      });
    },
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    save() {
      const {
        dealDescription, dealAnnouncement, address, templates, location
      } = this;
      Promise.resolve()
        .then(() => {
          app.checkString(dealDescription, {
            name: "供货说明",
            minLength: 0,
            maxLength: 500
          });
          app.checkString(dealAnnouncement, {
            name: "全局公告",
            minLength: 0,
            maxLength: 500
          });
          if(!location) throw "请选择区域";
          app.checkString(location, {
            name: "区域",
            minLength: 1,
            maxLength: 500
          });
          if(!address) throw "请输入详细地址";
          app.checkString(address, {
            name: "详细地址",
            minLength: 1,
            maxLength: 500
          });
          templates.map(t => {
            t.firstPrice = parseFloat(t.firstPrice);
            t.addPrice = parseFloat(t.addPrice);
            let {name, firstPrice, addPrice} = t;
            app.checkString(name, {
              name: "模板名称",
              minLength: 1,
              maxLength: 100
            });
            app.checkNumber(firstPrice, {
              name: "首件价格",
              min: 0,
              fractionDigits: 2
            });
            app.checkNumber(addPrice, {
              name: "首件后每件价格",
              min: 0,
              fractionDigits: 2
            });
          });
          return nkcAPI("/shop/manage/settings", "PATCH", {
            dealDescription, dealAnnouncement, address, templates, location
          });
        })
        .then(() => {
          sweetSuccess("保存成功");
        })
        .catch(sweetError);
    },
    addTemplate() {
      this.templates.push({
        name: "新建模板",
        firstPrice: 0,
        addPrice: 0
      });
    },
    removeTemplate(index) {
      this.templates.splice(index, 1);
    }
  }
});