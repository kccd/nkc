(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

window.app = new Vue({
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9zaG9wL21hbmFnZS9zZXR0aW5ncy9zZXR0aW5ncy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiOztXQUNrRixJQUFJLENBQUMsUUFBTCxJQUFpQixFO3dCQUE5RixPO0lBQUEsTyw2QkFBVSxFO2dDQUFJLGU7SUFBQSxlLHFDQUFrQixFO2lDQUFJLGdCO0lBQUEsZ0Isc0NBQW1CLEU7MEJBQUksUztJQUFBLFMsK0JBQVksRTs7QUFDNUUsSUFBSSxXQUFXLEdBQUcsRUFBbEI7QUFFQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBUixDQUFnQixHQUFoQixDQUFkOztBQUNBLElBQUcsS0FBSyxLQUFLLENBQUMsQ0FBZCxFQUFpQjtBQUNmLEVBQUEsV0FBVyxHQUFHLE9BQWQ7QUFDQSxFQUFBLE9BQU8sR0FBRyxFQUFWO0FBQ0QsQ0FIRCxNQUdPO0FBQ0wsRUFBQSxXQUFXLEdBQUcsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkLEVBQWlCLEtBQWpCLENBQWQ7QUFDQSxFQUFBLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBUixDQUFjLEtBQUssR0FBRyxDQUF0QixDQUFWO0FBQ0Q7O0FBQ0QsTUFBTSxDQUFDLEdBQVAsR0FBYSxJQUFJLEdBQUosQ0FBUTtBQUNuQixFQUFBLEVBQUUsRUFBRSxVQURlO0FBRW5CLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxlQUFlLEVBQWYsZUFESTtBQUVKLElBQUEsZ0JBQWdCLEVBQWhCLGdCQUZJO0FBR0osSUFBQSxPQUFPLEVBQVAsT0FISTtBQUlKLElBQUEsU0FBUyxFQUFULFNBSkk7QUFLSixJQUFBLFFBQVEsRUFBRTtBQUxOLEdBRmE7QUFTbkIsRUFBQSxPQVRtQixxQkFTVDtBQUNSLElBQUEsTUFBTSxDQUFD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UUFBaEIsRUFBMEI7QUFDeEIsWUFBQSxJQUFJLEVBQUUsU0FEa0I7QUFFeEIsWUFBQSxHQUFHLEVBQUUsQ0FGbUI7QUFHeEIsWUFBQSxjQUFjLEVBQUU7QUFIUSxXQUExQjtBQUtELFNBbkJEO0FBb0JBLGVBQU8sTUFBTSxDQUFDLHVCQUFELEVBQTBCLE9BQTFCLEVBQW1DO0FBQzlDLFVBQUEsZUFBZSxFQUFmLGVBRDhDO0FBQzdCLFVBQUEsZ0JBQWdCLEVBQWhCLGdCQUQ2QjtBQUNYLFVBQUEsT0FBTyxFQUFQLE9BRFc7QUFDRixVQUFBLFNBQVMsRUFBVCxTQURFO0FBQ1MsVUFBQSxRQUFRLEVBQVI7QUFEVCxTQUFuQyxDQUFiO0FBR0QsT0EvQ0gsRUFnREcsSUFoREgsQ0FnRFEsWUFBTTtBQUNWLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BbERILFdBbURTLFVBbkRUO0FBb0RELEtBbEVNO0FBbUVQLElBQUEsV0FuRU8seUJBbUVPO0FBQ1osV0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQjtBQUNsQixRQUFBLElBQUksRUFBRSxNQURZO0FBRWxCLFFBQUEsVUFBVSxFQUFFLENBRk07QUFHbEIsUUFBQSxRQUFRLEVBQUU7QUFIUSxPQUFwQjtBQUtELEtBekVNO0FBMEVQLElBQUEsY0ExRU8sMEJBMEVRLEtBMUVSLEVBMEVlO0FBQ3BCLFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsS0FBdEIsRUFBNkIsQ0FBN0I7QUFDRDtBQTVFTTtBQVpVLENBQVIsQ0FBYiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbmxldCB7YWRkcmVzcyA9IFwiXCIsIGRlYWxEZXNjcmlwdGlvbiA9IFwiXCIsIGRlYWxBbm5vdW5jZW1lbnQgPSBcIlwiLCB0ZW1wbGF0ZXMgPSBbXX0gPSBkYXRhLmRlYWxJbmZvIHx8IHt9O1xyXG5sZXQgbG9jYXRpb25TdHIgPSBcIlwiO1xyXG5cclxuY29uc3QgaW5kZXggPSBhZGRyZXNzLmluZGV4T2YoXCImXCIpO1xyXG5pZihpbmRleCA9PT0gLTEpIHtcclxuICBsb2NhdGlvblN0ciA9IGFkZHJlc3M7XHJcbiAgYWRkcmVzcyA9IFwiXCI7XHJcbn0gZWxzZSB7XHJcbiAgbG9jYXRpb25TdHIgPSBhZGRyZXNzLnNsaWNlKDAsIGluZGV4KTtcclxuICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZShpbmRleCArIDEpO1xyXG59XHJcbndpbmRvdy5hcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYWRkcmVzc1wiLFxyXG4gIGRhdGE6IHtcclxuICAgIGRlYWxEZXNjcmlwdGlvbixcclxuICAgIGRlYWxBbm5vdW5jZW1lbnQsXHJcbiAgICBhZGRyZXNzLFxyXG4gICAgdGVtcGxhdGVzLFxyXG4gICAgbG9jYXRpb246IGxvY2F0aW9uU3RyXHJcbiAgfSxcclxuICBtb3VudGVkKCkge1xyXG4gICAgd2luZG93LlNlbGVjdEFkZHJlc3MgPSBuZXcgTktDLm1vZHVsZXMuU2VsZWN0QWRkcmVzcygpO1xyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgc2VsZWN0QWRkcmVzcyhhZGRyZXNzKSB7XHJcbiAgICAgIFNlbGVjdEFkZHJlc3Mub3BlbihmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgYXBwLmxvY2F0aW9uID0gZC5qb2luKFwiL1wiKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIG9ubHlDaGluYTogdHJ1ZVxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBjaGVja1N0cmluZzogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrU3RyaW5nLFxyXG4gICAgY2hlY2tOdW1iZXI6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja051bWJlcixcclxuICAgIHNhdmUoKSB7XHJcbiAgICAgIGNvbnN0IHtcclxuICAgICAgICBkZWFsRGVzY3JpcHRpb24sIGRlYWxBbm5vdW5jZW1lbnQsIGFkZHJlc3MsIHRlbXBsYXRlcywgbG9jYXRpb25cclxuICAgICAgfSA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgYXBwLmNoZWNrU3RyaW5nKGRlYWxEZXNjcmlwdGlvbiwge1xyXG4gICAgICAgICAgICBuYW1lOiBcIuS+m+i0p+ivtOaYjlwiLFxyXG4gICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgIG1heExlbmd0aDogNTAwXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGFwcC5jaGVja1N0cmluZyhkZWFsQW5ub3VuY2VtZW50LCB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwi5YWo5bGA5YWs5ZGKXCIsXHJcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcclxuICAgICAgICAgICAgbWF4TGVuZ3RoOiA1MDBcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYoIWxvY2F0aW9uKSB0aHJvdyBcIuivt+mAieaLqeWMuuWfn1wiO1xyXG4gICAgICAgICAgYXBwLmNoZWNrU3RyaW5nKGxvY2F0aW9uLCB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwi5Yy65Z+fXCIsXHJcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgbWF4TGVuZ3RoOiA1MDBcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYoIWFkZHJlc3MpIHRocm93IFwi6K+36L6T5YWl6K+m57uG5Zyw5Z2AXCI7XHJcbiAgICAgICAgICBhcHAuY2hlY2tTdHJpbmcoYWRkcmVzcywge1xyXG4gICAgICAgICAgICBuYW1lOiBcIuivpue7huWcsOWdgFwiLFxyXG4gICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgIG1heExlbmd0aDogNTAwXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRlbXBsYXRlcy5tYXAodCA9PiB7XHJcbiAgICAgICAgICAgIHQuZmlyc3RQcmljZSA9IHBhcnNlRmxvYXQodC5maXJzdFByaWNlKTtcclxuICAgICAgICAgICAgdC5hZGRQcmljZSA9IHBhcnNlRmxvYXQodC5hZGRQcmljZSk7XHJcbiAgICAgICAgICAgIGxldCB7bmFtZSwgZmlyc3RQcmljZSwgYWRkUHJpY2V9ID0gdDtcclxuICAgICAgICAgICAgYXBwLmNoZWNrU3RyaW5nKG5hbWUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIuaooeadv+WQjeensFwiLFxyXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYXBwLmNoZWNrTnVtYmVyKGZpcnN0UHJpY2UsIHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIummluS7tuS7t+agvFwiLFxyXG4gICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgYXBwLmNoZWNrTnVtYmVyKGFkZFByaWNlLCB7XHJcbiAgICAgICAgICAgICAgbmFtZTogXCLpppbku7blkI7mr4/ku7bku7fmoLxcIixcclxuICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvc2hvcC9tYW5hZ2Uvc2V0dGluZ3NcIiwgXCJQQVRDSFwiLCB7XHJcbiAgICAgICAgICAgIGRlYWxEZXNjcmlwdGlvbiwgZGVhbEFubm91bmNlbWVudCwgYWRkcmVzcywgdGVtcGxhdGVzLCBsb2NhdGlvblxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkVGVtcGxhdGUoKSB7XHJcbiAgICAgIHRoaXMudGVtcGxhdGVzLnB1c2goe1xyXG4gICAgICAgIG5hbWU6IFwi5paw5bu65qih5p2/XCIsXHJcbiAgICAgICAgZmlyc3RQcmljZTogMCxcclxuICAgICAgICBhZGRQcmljZTogMFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVUZW1wbGF0ZShpbmRleCkge1xyXG4gICAgICB0aGlzLnRlbXBsYXRlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il19
