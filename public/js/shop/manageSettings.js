"use strict";

var data = NKC.methods.getDataById("data");

var _ref = data.dealInfo || {},
    _ref$address = _ref.address,
    address = _ref$address === void 0 ? "" : _ref$address,
    _ref$dealDescription = _ref.dealDescription,
    dealDescription = _ref$dealDescription === void 0 ? "" : _ref$dealDescription,
    _ref$dealAnnouncement = _ref.dealAnnouncement,
    dealAnnouncement = _ref$dealAnnouncement === void 0 ? "" : _ref$dealAnnouncement,
    _ref$templates = _ref.templates,
    templates = _ref$templates === void 0 ? [] : _ref$templates;

var locationStr = "";
var index = address.indexOf("&");

if (index === -1) {
  locationStr = address;
  address = "";
} else {
  locationStr = address.slice(0, index);
  address = address.slice(index + 1);
}

var app = new Vue({
  el: "#address",
  data: {
    dealDescription: dealDescription,
    dealAnnouncement: dealAnnouncement,
    address: address,
    templates: templates,
    location: locationStr
  },
  mounted: function mounted() {
    window.SelectAddress = new NKC.modules.SelectAddress();
  },
  methods: {
    selectAddress: function selectAddress(address) {
      SelectAddress.open(function (d) {
        app.location = d.join("/");
      }, {
        onlyChina: true
      });
    },
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    save: function save() {
      var dealDescription = this.dealDescription,
          dealAnnouncement = this.dealAnnouncement,
          address = this.address,
          templates = this.templates,
          location = this.location;
      Promise.resolve().then(function () {
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
        if (!location) throw "请选择区域";
        app.checkString(location, {
          name: "区域",
          minLength: 1,
          maxLength: 500
        });
        if (!address) throw "请输入详细地址";
        app.checkString(address, {
          name: "详细地址",
          minLength: 1,
          maxLength: 500
        });
        templates.map(function (t) {
          t.firstPrice = parseFloat(t.firstPrice);
          t.addPrice = parseFloat(t.addPrice);
          var name = t.name,
              firstPrice = t.firstPrice,
              addPrice = t.addPrice;
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
          dealDescription: dealDescription,
          dealAnnouncement: dealAnnouncement,
          address: address,
          templates: templates,
          location: location
        });
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    addTemplate: function addTemplate() {
      this.templates.push({
        name: "新建模板",
        firstPrice: 0,
        addPrice: 0
      });
    },
    removeTemplate: function removeTemplate(index) {
      this.templates.splice(index, 1);
    }
  }
});