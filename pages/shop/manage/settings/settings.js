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
        return nkcAPI("/shop/manage/settings", "PUT", {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3Nob3AvbWFuYWdlL3NldHRpbmdzL3NldHRpbmdzLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7O1dBQ2tGLElBQUksQ0FBQyxRQUFMLElBQWlCLEU7d0JBQTlGLE87SUFBQSxPLDZCQUFVLEU7Z0NBQUksZTtJQUFBLGUscUNBQWtCLEU7aUNBQUksZ0I7SUFBQSxnQixzQ0FBbUIsRTswQkFBSSxTO0lBQUEsUywrQkFBWSxFOztBQUM1RSxJQUFJLFdBQVcsR0FBRyxFQUFsQjtBQUVBLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEdBQWhCLENBQWQ7O0FBQ0EsSUFBRyxLQUFLLEtBQUssQ0FBQyxDQUFkLEVBQWlCO0FBQ2YsRUFBQSxXQUFXLEdBQUcsT0FBZDtBQUNBLEVBQUEsT0FBTyxHQUFHLEVBQVY7QUFDRCxDQUhELE1BR087QUFDTCxFQUFBLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBUixDQUFjLENBQWQsRUFBaUIsS0FBakIsQ0FBZDtBQUNBLEVBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBSyxHQUFHLENBQXRCLENBQVY7QUFDRDs7QUFDRCxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLFVBRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLGVBQWUsRUFBZixlQURJO0FBRUosSUFBQSxnQkFBZ0IsRUFBaEIsZ0JBRkk7QUFHSixJQUFBLE9BQU8sRUFBUCxPQUhJO0FBSUosSUFBQSxTQUFTLEVBQVQsU0FKSTtBQUtKLElBQUEsUUFBUSxFQUFFO0FBTE4sR0FGYTtBQVNuQixFQUFBLE9BVG1CLHFCQVNUO0FBQ1IsSUFBQSxNQUFNLENBQUMsYUFBUCxHQUF1QixJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksYUFBaEIsRUFBdkI7QUFDRCxHQVhrQjtBQVluQixFQUFBLE9BQU8sRUFBRTtBQUNQLElBQUEsYUFETyx5QkFDTyxPQURQLEVBQ2dCO0FBQ3JCLE1BQUEsYUFBYSxDQUFDLElBQWQsQ0FBbUIsVUFBUyxDQUFULEVBQVk7QUFDN0IsUUFBQSxHQUFHLENBQUMsUUFBSixHQUFlLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUCxDQUFmO0FBQ0QsT0FGRCxFQUVHO0FBQ0QsUUFBQSxTQUFTLEVBQUU7QUFEVixPQUZIO0FBS0QsS0FQTTtBQVFQLElBQUEsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixXQVI1QjtBQVNQLElBQUEsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixXQVQ1QjtBQVVQLElBQUEsSUFWTyxrQkFVQTtBQUFBLFVBRUgsZUFGRyxHQUdELElBSEMsQ0FFSCxlQUZHO0FBQUEsVUFFYyxnQkFGZCxHQUdELElBSEMsQ0FFYyxnQkFGZDtBQUFBLFVBRWdDLE9BRmhDLEdBR0QsSUFIQyxDQUVnQyxPQUZoQztBQUFBLFVBRXlDLFNBRnpDLEdBR0QsSUFIQyxDQUV5QyxTQUZ6QztBQUFBLFVBRW9ELFFBRnBELEdBR0QsSUFIQyxDQUVvRCxRQUZwRDtBQUlMLE1BQUEsT0FBTyxDQUFDLE9BQVIsR0FDRyxJQURILENBQ1EsWUFBTTtBQUNWLFFBQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsZUFBaEIsRUFBaUM7QUFDL0IsVUFBQSxJQUFJLEVBQUUsTUFEeUI7QUFFL0IsVUFBQSxTQUFTLEVBQUUsQ0FGb0I7QUFHL0IsVUFBQSxTQUFTLEVBQUU7QUFIb0IsU0FBakM7QUFLQSxRQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLGdCQUFoQixFQUFrQztBQUNoQyxVQUFBLElBQUksRUFBRSxNQUQwQjtBQUVoQyxVQUFBLFNBQVMsRUFBRSxDQUZxQjtBQUdoQyxVQUFBLFNBQVMsRUFBRTtBQUhxQixTQUFsQztBQUtBLFlBQUcsQ0FBQyxRQUFKLEVBQWMsTUFBTSxPQUFOO0FBQ2QsUUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixRQUFoQixFQUEwQjtBQUN4QixVQUFBLElBQUksRUFBRSxJQURrQjtBQUV4QixVQUFBLFNBQVMsRUFBRSxDQUZhO0FBR3hCLFVBQUEsU0FBUyxFQUFFO0FBSGEsU0FBMUI7QUFLQSxZQUFHLENBQUMsT0FBSixFQUFhLE1BQU0sU0FBTjtBQUNiLFFBQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsT0FBaEIsRUFBeUI7QUFDdkIsVUFBQSxJQUFJLEVBQUUsTUFEaUI7QUFFdkIsVUFBQSxTQUFTLEVBQUUsQ0FGWTtBQUd2QixVQUFBLFNBQVMsRUFBRTtBQUhZLFNBQXpCO0FBS0EsUUFBQSxTQUFTLENBQUMsR0FBVixDQUFjLFVBQUEsQ0FBQyxFQUFJO0FBQ2pCLFVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQUgsQ0FBekI7QUFDQSxVQUFBLENBQUMsQ0FBQyxRQUFGLEdBQWEsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFILENBQXZCO0FBRmlCLGNBR1osSUFIWSxHQUdrQixDQUhsQixDQUdaLElBSFk7QUFBQSxjQUdOLFVBSE0sR0FHa0IsQ0FIbEIsQ0FHTixVQUhNO0FBQUEsY0FHTSxRQUhOLEdBR2tCLENBSGxCLENBR00sUUFITjtBQUlqQixVQUFBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCLEVBQXNCO0FBQ3BCLFlBQUEsSUFBSSxFQUFFLE1BRGM7QUFFcEIsWUFBQSxTQUFTLEVBQUUsQ0FGUztBQUdwQixZQUFBLFNBQVMsRUFBRTtBQUhTLFdBQXRCO0FBS0EsVUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixVQUFoQixFQUE0QjtBQUMxQixZQUFBLElBQUksRUFBRSxNQURvQjtBQUUxQixZQUFBLEdBQUcsRUFBRSxDQUZxQjtBQUcxQixZQUFBLGNBQWMsRUFBRTtBQUhVLFdBQTVCO0FBS0EsVUFBQSxHQUFHLENBQUMsV0FBSixDQUFnQixRQUFoQixFQUEwQjtBQUN4QixZQUFBLElBQUksRUFBRSxTQURrQjtBQUV4QixZQUFBLEdBQUcsRUFBRSxDQUZtQjtBQUd4QixZQUFBLGNBQWMsRUFBRTtBQUhRLFdBQTFCO0FBS0QsU0FuQkQ7QUFvQkEsZUFBTyxNQUFNLENBQUMsdUJBQUQsRUFBMEIsS0FBMUIsRUFBaUM7QUFDNUMsVUFBQSxlQUFlLEVBQWYsZUFENEM7QUFDM0IsVUFBQSxnQkFBZ0IsRUFBaEIsZ0JBRDJCO0FBQ1QsVUFBQSxPQUFPLEVBQVAsT0FEUztBQUNBLFVBQUEsU0FBUyxFQUFULFNBREE7QUFDVyxVQUFBLFFBQVEsRUFBUjtBQURYLFNBQWpDLENBQWI7QUFHRCxPQS9DSCxFQWdERyxJQWhESCxDQWdEUSxZQUFNO0FBQ1YsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0QsT0FsREgsV0FtRFMsVUFuRFQ7QUFvREQsS0FsRU07QUFtRVAsSUFBQSxXQW5FTyx5QkFtRU87QUFDWixXQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CO0FBQ2xCLFFBQUEsSUFBSSxFQUFFLE1BRFk7QUFFbEIsUUFBQSxVQUFVLEVBQUUsQ0FGTTtBQUdsQixRQUFBLFFBQVEsRUFBRTtBQUhRLE9BQXBCO0FBS0QsS0F6RU07QUEwRVAsSUFBQSxjQTFFTywwQkEwRVEsS0ExRVIsRUEwRWU7QUFDcEIsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixLQUF0QixFQUE2QixDQUE3QjtBQUNEO0FBNUVNO0FBWlUsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxubGV0IHthZGRyZXNzID0gXCJcIiwgZGVhbERlc2NyaXB0aW9uID0gXCJcIiwgZGVhbEFubm91bmNlbWVudCA9IFwiXCIsIHRlbXBsYXRlcyA9IFtdfSA9IGRhdGEuZGVhbEluZm8gfHwge307XHJcbmxldCBsb2NhdGlvblN0ciA9IFwiXCI7XHJcblxyXG5jb25zdCBpbmRleCA9IGFkZHJlc3MuaW5kZXhPZihcIiZcIik7XHJcbmlmKGluZGV4ID09PSAtMSkge1xyXG4gIGxvY2F0aW9uU3RyID0gYWRkcmVzcztcclxuICBhZGRyZXNzID0gXCJcIjtcclxufSBlbHNlIHtcclxuICBsb2NhdGlvblN0ciA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xyXG4gIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKGluZGV4ICsgMSk7XHJcbn1cclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhZGRyZXNzXCIsXHJcbiAgZGF0YToge1xyXG4gICAgZGVhbERlc2NyaXB0aW9uLFxyXG4gICAgZGVhbEFubm91bmNlbWVudCxcclxuICAgIGFkZHJlc3MsXHJcbiAgICB0ZW1wbGF0ZXMsXHJcbiAgICBsb2NhdGlvbjogbG9jYXRpb25TdHJcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICB3aW5kb3cuU2VsZWN0QWRkcmVzcyA9IG5ldyBOS0MubW9kdWxlcy5TZWxlY3RBZGRyZXNzKCk7XHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBzZWxlY3RBZGRyZXNzKGFkZHJlc3MpIHtcclxuICAgICAgU2VsZWN0QWRkcmVzcy5vcGVuKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICBhcHAubG9jYXRpb24gPSBkLmpvaW4oXCIvXCIpO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgb25seUNoaW5hOiB0cnVlXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICBjaGVja051bWJlcjogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrTnVtYmVyLFxyXG4gICAgc2F2ZSgpIHtcclxuICAgICAgY29uc3Qge1xyXG4gICAgICAgIGRlYWxEZXNjcmlwdGlvbiwgZGVhbEFubm91bmNlbWVudCwgYWRkcmVzcywgdGVtcGxhdGVzLCBsb2NhdGlvblxyXG4gICAgICB9ID0gdGhpcztcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBhcHAuY2hlY2tTdHJpbmcoZGVhbERlc2NyaXB0aW9uLCB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwi5L6b6LSn6K+05piOXCIsXHJcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcclxuICAgICAgICAgICAgbWF4TGVuZ3RoOiA1MDBcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYXBwLmNoZWNrU3RyaW5nKGRlYWxBbm5vdW5jZW1lbnQsIHtcclxuICAgICAgICAgICAgbmFtZTogXCLlhajlsYDlhazlkYpcIixcclxuICAgICAgICAgICAgbWluTGVuZ3RoOiAwLFxyXG4gICAgICAgICAgICBtYXhMZW5ndGg6IDUwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZighbG9jYXRpb24pIHRocm93IFwi6K+36YCJ5oup5Yy65Z+fXCI7XHJcbiAgICAgICAgICBhcHAuY2hlY2tTdHJpbmcobG9jYXRpb24sIHtcclxuICAgICAgICAgICAgbmFtZTogXCLljLrln59cIixcclxuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICBtYXhMZW5ndGg6IDUwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZighYWRkcmVzcykgdGhyb3cgXCLor7fovpPlhaXor6bnu4blnLDlnYBcIjtcclxuICAgICAgICAgIGFwcC5jaGVja1N0cmluZyhhZGRyZXNzLCB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwi6K+m57uG5Zyw5Z2AXCIsXHJcbiAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgbWF4TGVuZ3RoOiA1MDBcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGVtcGxhdGVzLm1hcCh0ID0+IHtcclxuICAgICAgICAgICAgdC5maXJzdFByaWNlID0gcGFyc2VGbG9hdCh0LmZpcnN0UHJpY2UpO1xyXG4gICAgICAgICAgICB0LmFkZFByaWNlID0gcGFyc2VGbG9hdCh0LmFkZFByaWNlKTtcclxuICAgICAgICAgICAgbGV0IHtuYW1lLCBmaXJzdFByaWNlLCBhZGRQcmljZX0gPSB0O1xyXG4gICAgICAgICAgICBhcHAuY2hlY2tTdHJpbmcobmFtZSwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi5qih5p2/5ZCN56ewXCIsXHJcbiAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgIG1heExlbmd0aDogMTAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhcHAuY2hlY2tOdW1iZXIoZmlyc3RQcmljZSwge1xyXG4gICAgICAgICAgICAgIG5hbWU6IFwi6aaW5Lu25Lu35qC8XCIsXHJcbiAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgIGZyYWN0aW9uRGlnaXRzOiAyXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhcHAuY2hlY2tOdW1iZXIoYWRkUHJpY2UsIHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIummluS7tuWQjuavj+S7tuS7t+agvFwiLFxyXG4gICAgICAgICAgICAgIG1pbjogMCxcclxuICAgICAgICAgICAgICBmcmFjdGlvbkRpZ2l0czogMlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShcIi9zaG9wL21hbmFnZS9zZXR0aW5nc1wiLCBcIlBVVFwiLCB7XHJcbiAgICAgICAgICAgIGRlYWxEZXNjcmlwdGlvbiwgZGVhbEFubm91bmNlbWVudCwgYWRkcmVzcywgdGVtcGxhdGVzLCBsb2NhdGlvblxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgYWRkVGVtcGxhdGUoKSB7XHJcbiAgICAgIHRoaXMudGVtcGxhdGVzLnB1c2goe1xyXG4gICAgICAgIG5hbWU6IFwi5paw5bu65qih5p2/XCIsXHJcbiAgICAgICAgZmlyc3RQcmljZTogMCxcclxuICAgICAgICBhZGRQcmljZTogMFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVUZW1wbGF0ZShpbmRleCkge1xyXG4gICAgICB0aGlzLnRlbXBsYXRlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdfQ==
