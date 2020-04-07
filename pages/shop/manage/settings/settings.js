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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3AvbWFuYWdlL3NldHRpbmdzL3NldHRpbmdzLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7O1dBQ2tGLElBQUksQ0FBQyxRQUFMLElBQWlCLEU7d0JBQTlGLE87SUFBQSxPLDZCQUFVLEU7Z0NBQUksZTtJQUFBLGUscUNBQWtCLEU7aUNBQUksZ0I7SUFBQSxnQixzQ0FBbUIsRTswQkFBSSxTO0lBQUEsUywrQkFBWSxFOztBQUM1RSxJQUFJLFdBQVcsR0FBRyxFQUFsQjtBQUVBLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEdBQWhCLENBQWQ7O0FBQ0EsSUFBRyxLQUFLLEtBQUssQ0FBQyxDQUFkLEVBQWlCO0FBQ2YsRUFBQSxXQUFXLEdBQUcsT0FBZDtBQUNBLEVBQUEsT0FBTyxHQUFHLEVBQVY7QUFDRCxDQUhELE1BR087QUFDTCxFQUFBLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBUixDQUFjLENBQWQsRUFBaUIsS0FBakIsQ0FBZDtBQUNBLEVBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBSyxHQUFHLENBQXRCLENBQVY7QUFDRDs7QUFDRCxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLFVBRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLGVBQWUsRUFBZixlQURJO0FBRUosSUFBQSxnQkFBZ0IsRUFBaEIsZ0JBRkk7QUFHSixJQUFBLE9BQU8sRUFBUCxPQUhJO0FBSUosSUFBQSxTQUFTLEVBQVQsU0FKSTtBQUtKLElBQUEsUUFBUSxFQUFFO0FBTE4sR0FGYTtBQVNuQixFQUFBLE9BVG1CLHFCQVNU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QUFHLENBQUMsV0FBSixDQUFnQixRQUFoQixFQUEwQjtBQUN4QixZQUFBLElBQUksRUFBRSxTQURrQjtBQUV4QixZQUFBLEdBQUcsRUFBRSxDQUZtQjtBQUd4QixZQUFBLGNBQWMsRUFBRTtBQUhRLFdBQTFCO0FBS0QsU0FuQkQ7QUFvQkEsZUFBTyxNQUFNLENBQUMsdUJBQUQsRUFBMEIsT0FBMUIsRUFBbUM7QUFDOUMsVUFBQSxlQUFlLEVBQWYsZUFEOEM7QUFDN0IsVUFBQSxnQkFBZ0IsRUFBaEIsZ0JBRDZCO0FBQ1gsVUFBQSxPQUFPLEVBQVAsT0FEVztBQUNGLFVBQUEsU0FBUyxFQUFULFNBREU7QUFDUyxVQUFBLFFBQVEsRUFBUjtBQURULFNBQW5DLENBQWI7QUFHRCxPQS9DSCxFQWdERyxJQWhESCxDQWdEUSxZQUFNO0FBQ1YsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0QsT0FsREgsV0FtRFMsVUFuRFQ7QUFvREQsS0FsRU07QUFtRVAsSUFBQSxXQW5FTyx5QkFtRU87QUFDWixXQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CO0FBQ2xCLFFBQUEsSUFBSSxFQUFFLE1BRFk7QUFFbEIsUUFBQSxVQUFVLEVBQUUsQ0FGTTtBQUdsQixRQUFBLFFBQVEsRUFBRTtBQUhRLE9BQXBCO0FBS0QsS0F6RU07QUEwRVAsSUFBQSxjQTFFTywwQkEwRVEsS0ExRVIsRUEwRWU7QUFDcEIsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixLQUF0QixFQUE2QixDQUE3QjtBQUNEO0FBNUVNO0FBWlUsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcbmxldCB7YWRkcmVzcyA9IFwiXCIsIGRlYWxEZXNjcmlwdGlvbiA9IFwiXCIsIGRlYWxBbm5vdW5jZW1lbnQgPSBcIlwiLCB0ZW1wbGF0ZXMgPSBbXX0gPSBkYXRhLmRlYWxJbmZvIHx8IHt9O1xubGV0IGxvY2F0aW9uU3RyID0gXCJcIjtcblxuY29uc3QgaW5kZXggPSBhZGRyZXNzLmluZGV4T2YoXCImXCIpO1xuaWYoaW5kZXggPT09IC0xKSB7XG4gIGxvY2F0aW9uU3RyID0gYWRkcmVzcztcbiAgYWRkcmVzcyA9IFwiXCI7XG59IGVsc2Uge1xuICBsb2NhdGlvblN0ciA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xuICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZShpbmRleCArIDEpO1xufVxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xuICBlbDogXCIjYWRkcmVzc1wiLFxuICBkYXRhOiB7XG4gICAgZGVhbERlc2NyaXB0aW9uLFxuICAgIGRlYWxBbm5vdW5jZW1lbnQsXG4gICAgYWRkcmVzcyxcbiAgICB0ZW1wbGF0ZXMsXG4gICAgbG9jYXRpb246IGxvY2F0aW9uU3RyXG4gIH0sXG4gIG1vdW50ZWQoKSB7XG4gICAgd2luZG93LlNlbGVjdEFkZHJlc3MgPSBuZXcgTktDLm1vZHVsZXMuU2VsZWN0QWRkcmVzcygpO1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgc2VsZWN0QWRkcmVzcyhhZGRyZXNzKSB7XG4gICAgICBTZWxlY3RBZGRyZXNzLm9wZW4oZnVuY3Rpb24oZCkge1xuICAgICAgICBhcHAubG9jYXRpb24gPSBkLmpvaW4oXCIvXCIpO1xuICAgICAgfSwge1xuICAgICAgICBvbmx5Q2hpbmE6IHRydWVcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcbiAgICBjaGVja051bWJlcjogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrTnVtYmVyLFxuICAgIHNhdmUoKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGRlYWxEZXNjcmlwdGlvbiwgZGVhbEFubm91bmNlbWVudCwgYWRkcmVzcywgdGVtcGxhdGVzLCBsb2NhdGlvblxuICAgICAgfSA9IHRoaXM7XG4gICAgICBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgYXBwLmNoZWNrU3RyaW5nKGRlYWxEZXNjcmlwdGlvbiwge1xuICAgICAgICAgICAgbmFtZTogXCLkvpvotKfor7TmmI5cIixcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcbiAgICAgICAgICAgIG1heExlbmd0aDogNTAwXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXBwLmNoZWNrU3RyaW5nKGRlYWxBbm5vdW5jZW1lbnQsIHtcbiAgICAgICAgICAgIG5hbWU6IFwi5YWo5bGA5YWs5ZGKXCIsXG4gICAgICAgICAgICBtaW5MZW5ndGg6IDAsXG4gICAgICAgICAgICBtYXhMZW5ndGg6IDUwMFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmKCFsb2NhdGlvbikgdGhyb3cgXCLor7fpgInmi6nljLrln59cIjtcbiAgICAgICAgICBhcHAuY2hlY2tTdHJpbmcobG9jYXRpb24sIHtcbiAgICAgICAgICAgIG5hbWU6IFwi5Yy65Z+fXCIsXG4gICAgICAgICAgICBtaW5MZW5ndGg6IDEsXG4gICAgICAgICAgICBtYXhMZW5ndGg6IDUwMFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmKCFhZGRyZXNzKSB0aHJvdyBcIuivt+i+k+WFpeivpue7huWcsOWdgFwiO1xuICAgICAgICAgIGFwcC5jaGVja1N0cmluZyhhZGRyZXNzLCB7XG4gICAgICAgICAgICBuYW1lOiBcIuivpue7huWcsOWdgFwiLFxuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxuICAgICAgICAgICAgbWF4TGVuZ3RoOiA1MDBcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0ZW1wbGF0ZXMubWFwKHQgPT4ge1xuICAgICAgICAgICAgdC5maXJzdFByaWNlID0gcGFyc2VGbG9hdCh0LmZpcnN0UHJpY2UpO1xuICAgICAgICAgICAgdC5hZGRQcmljZSA9IHBhcnNlRmxvYXQodC5hZGRQcmljZSk7XG4gICAgICAgICAgICBsZXQge25hbWUsIGZpcnN0UHJpY2UsIGFkZFByaWNlfSA9IHQ7XG4gICAgICAgICAgICBhcHAuY2hlY2tTdHJpbmcobmFtZSwge1xuICAgICAgICAgICAgICBuYW1lOiBcIuaooeadv+WQjeensFwiLFxuICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMTAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFwcC5jaGVja051bWJlcihmaXJzdFByaWNlLCB7XG4gICAgICAgICAgICAgIG5hbWU6IFwi6aaW5Lu25Lu35qC8XCIsXG4gICAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXBwLmNoZWNrTnVtYmVyKGFkZFByaWNlLCB7XG4gICAgICAgICAgICAgIG5hbWU6IFwi6aaW5Lu25ZCO5q+P5Lu25Lu35qC8XCIsXG4gICAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgICAgZnJhY3Rpb25EaWdpdHM6IDJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvc2hvcC9tYW5hZ2Uvc2V0dGluZ3NcIiwgXCJQQVRDSFwiLCB7XG4gICAgICAgICAgICBkZWFsRGVzY3JpcHRpb24sIGRlYWxBbm5vdW5jZW1lbnQsIGFkZHJlc3MsIHRlbXBsYXRlcywgbG9jYXRpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xuICAgIH0sXG4gICAgYWRkVGVtcGxhdGUoKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlcy5wdXNoKHtcbiAgICAgICAgbmFtZTogXCLmlrDlu7rmqKHmnb9cIixcbiAgICAgICAgZmlyc3RQcmljZTogMCxcbiAgICAgICAgYWRkUHJpY2U6IDBcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVtb3ZlVGVtcGxhdGUoaW5kZXgpIHtcbiAgICAgIHRoaXMudGVtcGxhdGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG59KTsiXX0=
