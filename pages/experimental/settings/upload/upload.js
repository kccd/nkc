(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var extensionLimit = data.uploadSettings.extensionLimit;
extensionLimit._defaultWhitelist = extensionLimit.defaultWhitelist.join(', ');
extensionLimit._defaultBlacklist = extensionLimit.defaultBlacklist.join(', ');
extensionLimit.others.map(function (o) {
  o._blacklist = o.blacklist.join(', ');
  o._whitelist = o.whitelist.join(', ');
});
data.uploadSettings.watermark.buyNoWatermark /= 100;
window.app = new Vue({
  el: "#app",
  data: {
    us: data.uploadSettings,
    certList: data.certList,
    normalWatermarkData: '',
    normalWatermarkFile: '',
    smallWatermarkData: '',
    smallWatermarkFile: ''
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    resetFile: function resetFile() {
      this.normalWatermarkData = '';
      this.normalWatermarkFile = '';
      this.smallWatermarkData = '';
      this.smallWatermarkFile = '';
    },
    addSizeLimit: function addSizeLimit() {
      this.us.sizeLimit.others.push({
        ext: '',
        size: 0
      });
    },
    addCountLimit: function addCountLimit() {
      this.us.countLimit.others.push({
        type: '',
        count: 0
      });
    },
    addExtensionLimit: function addExtensionLimit() {
      this.us.extensionLimit.others.push({
        type: '',
        using: 'blacklist',
        blacklist: [],
        whitelist: [],
        _blacklist: '',
        _whitelist: ''
      });
    },
    removeFromArr: function removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    selectedWatermark: function selectedWatermark() {
      var c = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'normal';
      var input = this.$refs["".concat(c, "WatermarkInput")];
      var files = input.files;
      if (!files || !files.length) return;
      var file = files[0];
      var self = this;
      NKC.methods.fileToUrl(file).then(function (data) {
        self["".concat(c, "WatermarkData")] = data;
        self["".concat(c, "WatermarkFile")] = file;
      });
    },
    submit: function submit() {
      var us = JSON.parse(JSON.stringify(this.us));
      var extensionLimit = us.extensionLimit;
      var normalWatermarkFile = this.normalWatermarkFile,
          smallWatermarkFile = this.smallWatermarkFile;
      var self = this;
      var normalWatermarkInput = this.$refs.normalWatermarkInput;
      var smallWatermarkInput = this.$refs.smallWatermarkInput;
      extensionLimit.defaultBlacklist = extensionLimit._defaultBlacklist.split(',').map(function (e) {
        return e.trim();
      });
      extensionLimit.defaultWhitelist = extensionLimit._defaultWhitelist.split(',').map(function (e) {
        return e.trim();
      });
      extensionLimit.others.map(function (o) {
        o.blacklist = o._blacklist.split(',').map(function (e) {
          return e.trim();
        });
        o.whitelist = o._whitelist.split(',').map(function (e) {
          return e.trim();
        });
        delete o._blacklist;
        delete o._whitelist;
      }); // 积分乘以100用于存储

      us.watermark.buyNoWatermark *= 100;
      var formData = new FormData();
      return Promise.resolve().then(function () {
        formData.append('uploadSettings', JSON.stringify(us));

        if (normalWatermarkFile) {
          formData.append('normalWatermark', normalWatermarkFile);
        }

        if (smallWatermarkFile) {
          formData.append('smallWatermark', smallWatermarkFile);
        }

        return nkcUploadFile('/e/settings/upload', 'PUT', formData);
      }).then(function (data) {
        sweetSuccess('保存成功');
        normalWatermarkInput.value = null;
        smallWatermarkInput.value = null;
        var _data$uploadSettings$ = data.uploadSettings.watermark,
            normalAttachId = _data$uploadSettings$.normalAttachId,
            smallAttachId = _data$uploadSettings$.smallAttachId;
        self.us.watermark.normalAttachId = normalAttachId;
        self.us.watermark.smallAttachId = smallAttachId;
        self.resetFile();
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy91cGxvYWQvdXBsb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQVg7SUFDTyxjLEdBQWtCLElBQUksQ0FBQyxjLENBQXZCLGM7QUFDUCxjQUFjLENBQUMsaUJBQWYsR0FBbUMsY0FBYyxDQUFDLGdCQUFmLENBQWdDLElBQWhDLENBQXFDLElBQXJDLENBQW5DO0FBQ0EsY0FBYyxDQUFDLGlCQUFmLEdBQW1DLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFxQyxJQUFyQyxDQUFuQztBQUNBLGNBQWMsQ0FBQyxNQUFmLENBQXNCLEdBQXRCLENBQTBCLFVBQUEsQ0FBQyxFQUFJO0FBQzdCLEVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxDQUFDLENBQUMsU0FBRixDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBZjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxDQUFDLENBQUMsU0FBRixDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBZjtBQUNELENBSEQ7QUFJQSxJQUFJLENBQUMsY0FBTCxDQUFvQixTQUFwQixDQUE4QixjQUE5QixJQUFnRCxHQUFoRDtBQUNBLE1BQU0sQ0FBQyxHQUFQLEdBQWEsSUFBSSxHQUFKLENBQVE7QUFDbkIsRUFBQSxFQUFFLEVBQUUsTUFEZTtBQUVuQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxjQURMO0FBRUosSUFBQSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBRlg7QUFHSixJQUFBLG1CQUFtQixFQUFFLEVBSGpCO0FBSUosSUFBQSxtQkFBbUIsRUFBRSxFQUpqQjtBQUtKLElBQUEsa0JBQWtCLEVB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QUcsa0JBQUgsRUFBdUI7QUFDckIsVUFBQSxRQUFRLENBQUMsTUFBVCxDQUFnQixnQkFBaEIsRUFBa0Msa0JBQWxDO0FBQ0Q7O0FBQ0QsZUFBTyxhQUFhLENBQUMsb0JBQUQsRUFBdUIsS0FBdkIsRUFBOEIsUUFBOUIsQ0FBcEI7QUFDRCxPQVZJLEVBV0osSUFYSSxDQVdDLFVBQUEsSUFBSSxFQUFJO0FBQ1osUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0EsUUFBQSxvQkFBb0IsQ0FBQyxLQUFyQixHQUE2QixJQUE3QjtBQUNBLFFBQUEsbUJBQW1CLENBQUMsS0FBcEIsR0FBNEIsSUFBNUI7QUFIWSxvQ0FJNEIsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsU0FKaEQ7QUFBQSxZQUlMLGNBSksseUJBSUwsY0FKSztBQUFBLFlBSVcsYUFKWCx5QkFJVyxhQUpYO0FBS1osUUFBQSxJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsQ0FBa0IsY0FBbEIsR0FBbUMsY0FBbkM7QUFDQSxRQUFBLElBQUksQ0FBQyxFQUFMLENBQVEsU0FBUixDQUFrQixhQUFsQixHQUFrQyxhQUFsQztBQUNBLFFBQUEsSUFBSSxDQUFDLFNBQUw7QUFDRCxPQW5CSSxXQW9CRSxVQXBCRixDQUFQO0FBcUJEO0FBckZNO0FBVlUsQ0FBUixDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbmNvbnN0IHtleHRlbnNpb25MaW1pdH0gPSBkYXRhLnVwbG9hZFNldHRpbmdzO1xyXG5leHRlbnNpb25MaW1pdC5fZGVmYXVsdFdoaXRlbGlzdCA9IGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRXaGl0ZWxpc3Quam9pbignLCAnKTtcclxuZXh0ZW5zaW9uTGltaXQuX2RlZmF1bHRCbGFja2xpc3QgPSBleHRlbnNpb25MaW1pdC5kZWZhdWx0QmxhY2tsaXN0LmpvaW4oJywgJyk7XHJcbmV4dGVuc2lvbkxpbWl0Lm90aGVycy5tYXAobyA9PiB7XHJcbiAgby5fYmxhY2tsaXN0ID0gby5ibGFja2xpc3Quam9pbignLCAnKTtcclxuICBvLl93aGl0ZWxpc3QgPSBvLndoaXRlbGlzdC5qb2luKCcsICcpO1xyXG59KTtcclxuZGF0YS51cGxvYWRTZXR0aW5ncy53YXRlcm1hcmsuYnV5Tm9XYXRlcm1hcmsgLz0gMTAwO1xyXG53aW5kb3cuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIHVzOiBkYXRhLnVwbG9hZFNldHRpbmdzLFxyXG4gICAgY2VydExpc3Q6IGRhdGEuY2VydExpc3QsXHJcbiAgICBub3JtYWxXYXRlcm1hcmtEYXRhOiAnJyxcclxuICAgIG5vcm1hbFdhdGVybWFya0ZpbGU6ICcnLFxyXG4gICAgc21hbGxXYXRlcm1hcmtEYXRhOiAnJyxcclxuICAgIHNtYWxsV2F0ZXJtYXJrRmlsZTogJycsXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIHJlc2V0RmlsZSgpIHtcclxuICAgICAgdGhpcy5ub3JtYWxXYXRlcm1hcmtEYXRhID0gJyc7XHJcbiAgICAgIHRoaXMubm9ybWFsV2F0ZXJtYXJrRmlsZSA9ICcnO1xyXG4gICAgICB0aGlzLnNtYWxsV2F0ZXJtYXJrRGF0YSA9ICcnO1xyXG4gICAgICB0aGlzLnNtYWxsV2F0ZXJtYXJrRmlsZSA9ICcnO1xyXG4gICAgfSxcclxuICAgIGFkZFNpemVMaW1pdCgpIHtcclxuICAgICAgdGhpcy51cy5zaXplTGltaXQub3RoZXJzLnB1c2goe1xyXG4gICAgICAgIGV4dDogJycsXHJcbiAgICAgICAgc2l6ZTogMFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBhZGRDb3VudExpbWl0KCkge1xyXG4gICAgICB0aGlzLnVzLmNvdW50TGltaXQub3RoZXJzLnB1c2goe1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIGNvdW50OiAwXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgYWRkRXh0ZW5zaW9uTGltaXQoKSB7XHJcbiAgICAgIHRoaXMudXMuZXh0ZW5zaW9uTGltaXQub3RoZXJzLnB1c2goe1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIHVzaW5nOiAnYmxhY2tsaXN0JyxcclxuICAgICAgICBibGFja2xpc3Q6IFtdLFxyXG4gICAgICAgIHdoaXRlbGlzdDogW10sXHJcbiAgICAgICAgX2JsYWNrbGlzdDogJycsXHJcbiAgICAgICAgX3doaXRlbGlzdDogJydcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICByZW1vdmVGcm9tQXJyKGFyciwgaW5kZXgpIHtcclxuICAgICAgYXJyLnNwbGljZShpbmRleCwgMSlcclxuICAgIH0sXHJcbiAgICBzZWxlY3RlZFdhdGVybWFyayhjID0gJ25vcm1hbCcpIHtcclxuICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLiRyZWZzW2Ake2N9V2F0ZXJtYXJrSW5wdXRgXTtcclxuICAgICAgY29uc3QgZmlsZXMgPSBpbnB1dC5maWxlcztcclxuICAgICAgaWYoIWZpbGVzIHx8ICFmaWxlcy5sZW5ndGgpIHJldHVybjtcclxuICAgICAgY29uc3QgZmlsZSA9IGZpbGVzWzBdO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgTktDLm1ldGhvZHMuZmlsZVRvVXJsKGZpbGUpXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBzZWxmW2Ake2N9V2F0ZXJtYXJrRGF0YWBdID0gZGF0YTtcclxuICAgICAgICAgIHNlbGZbYCR7Y31XYXRlcm1hcmtGaWxlYF0gPSBmaWxlO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgY29uc3QgdXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMudXMpKTtcclxuICAgICAgY29uc3Qge2V4dGVuc2lvbkxpbWl0fSA9IHVzO1xyXG4gICAgICBjb25zdCB7bm9ybWFsV2F0ZXJtYXJrRmlsZSwgc21hbGxXYXRlcm1hcmtGaWxlfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBjb25zdCBub3JtYWxXYXRlcm1hcmtJbnB1dCA9IHRoaXMuJHJlZnMubm9ybWFsV2F0ZXJtYXJrSW5wdXQ7XHJcbiAgICAgIGNvbnN0IHNtYWxsV2F0ZXJtYXJrSW5wdXQgPSB0aGlzLiRyZWZzLnNtYWxsV2F0ZXJtYXJrSW5wdXQ7XHJcbiAgICAgIGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRCbGFja2xpc3QgPSBleHRlbnNpb25MaW1pdC5fZGVmYXVsdEJsYWNrbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgZXh0ZW5zaW9uTGltaXQuZGVmYXVsdFdoaXRlbGlzdCA9IGV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0V2hpdGVsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xyXG4gICAgICBleHRlbnNpb25MaW1pdC5vdGhlcnMubWFwKG8gPT4ge1xyXG4gICAgICAgIG8uYmxhY2tsaXN0ID0gby5fYmxhY2tsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xyXG4gICAgICAgIG8ud2hpdGVsaXN0ID0gby5fd2hpdGVsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xyXG4gICAgICAgIGRlbGV0ZSBvLl9ibGFja2xpc3Q7XHJcbiAgICAgICAgZGVsZXRlIG8uX3doaXRlbGlzdDtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIOenr+WIhuS5mOS7pTEwMOeUqOS6juWtmOWCqFxyXG4gICAgICB1cy53YXRlcm1hcmsuYnV5Tm9XYXRlcm1hcmsgKj0gMTAwO1xyXG5cclxuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCd1cGxvYWRTZXR0aW5ncycsIEpTT04uc3RyaW5naWZ5KHVzKSk7XHJcbiAgICAgICAgICBpZihub3JtYWxXYXRlcm1hcmtGaWxlKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnbm9ybWFsV2F0ZXJtYXJrJywgbm9ybWFsV2F0ZXJtYXJrRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZihzbWFsbFdhdGVybWFya0ZpbGUpIHtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdzbWFsbFdhdGVybWFyaycsIHNtYWxsV2F0ZXJtYXJrRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZSgnL2Uvc2V0dGluZ3MvdXBsb2FkJywgJ1BVVCcsIGZvcm1EYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcclxuICAgICAgICAgIG5vcm1hbFdhdGVybWFya0lucHV0LnZhbHVlID0gbnVsbDtcclxuICAgICAgICAgIHNtYWxsV2F0ZXJtYXJrSW5wdXQudmFsdWUgPSBudWxsO1xyXG4gICAgICAgICAgY29uc3Qge25vcm1hbEF0dGFjaElkLCBzbWFsbEF0dGFjaElkfSA9IGRhdGEudXBsb2FkU2V0dGluZ3Mud2F0ZXJtYXJrO1xyXG4gICAgICAgICAgc2VsZi51cy53YXRlcm1hcmsubm9ybWFsQXR0YWNoSWQgPSBub3JtYWxBdHRhY2hJZDtcclxuICAgICAgICAgIHNlbGYudXMud2F0ZXJtYXJrLnNtYWxsQXR0YWNoSWQgPSBzbWFsbEF0dGFjaElkO1xyXG4gICAgICAgICAgc2VsZi5yZXNldEZpbGUoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuIl19
