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
var app = new Vue({
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
      });
      var formData = new FormData();
      return Promise.resolve().then(function () {
        formData.append('uploadSettings', JSON.stringify(us));

        if (normalWatermarkFile) {
          formData.append('normalWatermark', normalWatermarkFile);
        }

        if (smallWatermarkFile) {
          formData.append('smallWatermark', smallWatermarkFile);
        }

        return nkcUploadFile('/e/settings/upload', 'PATCH', formData);
      }).then(function () {
        sweetSuccess('保存成功');
        normalWatermarkInput.value = null;
        smallWatermarkInput.value = null;
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy91cGxvYWQvdXBsb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQVg7SUFDTyxjLEdBQWtCLElBQUksQ0FBQyxjLENBQXZCLGM7QUFDUCxjQUFjLENBQUMsaUJBQWYsR0FBbUMsY0FBYyxDQUFDLGdCQUFmLENBQWdDLElBQWhDLENBQXFDLElBQXJDLENBQW5DO0FBQ0EsY0FBYyxDQUFDLGlCQUFmLEdBQW1DLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFxQyxJQUFyQyxDQUFuQztBQUNBLGNBQWMsQ0FBQyxNQUFmLENBQXNCLEdBQXRCLENBQTBCLFVBQUEsQ0FBQyxFQUFJO0FBQzdCLEVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxDQUFDLENBQUMsU0FBRixDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBZjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxDQUFDLENBQUMsU0FBRixDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBZjtBQUNELENBSEQ7QUFJQSxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNoQixFQUFBLEVBQUUsRUFBRSxNQURZO0FBRWhCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBREw7QUFFSixJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFGWDtBQUdKLElBQUEsbUJBQW1CLEVBQUUsRUFIakI7QUFJSixJQUFBLG1CQUFtQixFQUFFLEVBSmpCO0FBS0osSUFBQSxrQkFBa0IsRUFBRSxFQUxoQjtBQU1KLElBQUEsa0JBQWtCLEVBQUU7QUFOaEIsR0FGVTtBQVVoQixFQUFBLE9BQU8sRUFB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QVA7QUFpQkQ7QUF4RU07QUFWTyxDQUFSLENBQVYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuY29uc3Qge2V4dGVuc2lvbkxpbWl0fSA9IGRhdGEudXBsb2FkU2V0dGluZ3M7XHJcbmV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0V2hpdGVsaXN0ID0gZXh0ZW5zaW9uTGltaXQuZGVmYXVsdFdoaXRlbGlzdC5qb2luKCcsICcpO1xyXG5leHRlbnNpb25MaW1pdC5fZGVmYXVsdEJsYWNrbGlzdCA9IGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRCbGFja2xpc3Quam9pbignLCAnKTtcclxuZXh0ZW5zaW9uTGltaXQub3RoZXJzLm1hcChvID0+IHtcclxuICBvLl9ibGFja2xpc3QgPSBvLmJsYWNrbGlzdC5qb2luKCcsICcpO1xyXG4gIG8uX3doaXRlbGlzdCA9IG8ud2hpdGVsaXN0LmpvaW4oJywgJyk7XHJcbn0pO1xyXG52YXIgYXBwID0gbmV3IFZ1ZSh7XHJcbiAgZWw6IFwiI2FwcFwiLFxyXG4gIGRhdGE6IHtcclxuICAgIHVzOiBkYXRhLnVwbG9hZFNldHRpbmdzLFxyXG4gICAgY2VydExpc3Q6IGRhdGEuY2VydExpc3QsXHJcbiAgICBub3JtYWxXYXRlcm1hcmtEYXRhOiAnJyxcclxuICAgIG5vcm1hbFdhdGVybWFya0ZpbGU6ICcnLFxyXG4gICAgc21hbGxXYXRlcm1hcmtEYXRhOiAnJyxcclxuICAgIHNtYWxsV2F0ZXJtYXJrRmlsZTogJycsXHJcbiAgfSxcclxuICBtZXRob2RzOiB7XHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGFkZFNpemVMaW1pdCgpIHtcclxuICAgICAgdGhpcy51cy5zaXplTGltaXQub3RoZXJzLnB1c2goe1xyXG4gICAgICAgIGV4dDogJycsXHJcbiAgICAgICAgc2l6ZTogMFxyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBhZGRDb3VudExpbWl0KCkge1xyXG4gICAgICB0aGlzLnVzLmNvdW50TGltaXQub3RoZXJzLnB1c2goe1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIGNvdW50OiAwXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgYWRkRXh0ZW5zaW9uTGltaXQoKSB7XHJcbiAgICAgIHRoaXMudXMuZXh0ZW5zaW9uTGltaXQub3RoZXJzLnB1c2goe1xyXG4gICAgICAgIHR5cGU6ICcnLFxyXG4gICAgICAgIHVzaW5nOiAnYmxhY2tsaXN0JyxcclxuICAgICAgICBibGFja2xpc3Q6IFtdLFxyXG4gICAgICAgIHdoaXRlbGlzdDogW10sXHJcbiAgICAgICAgX2JsYWNrbGlzdDogJycsXHJcbiAgICAgICAgX3doaXRlbGlzdDogJydcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICByZW1vdmVGcm9tQXJyKGFyciwgaW5kZXgpIHtcclxuICAgICAgYXJyLnNwbGljZShpbmRleCwgMSlcclxuICAgIH0sXHJcbiAgICBzZWxlY3RlZFdhdGVybWFyayhjID0gJ25vcm1hbCcpIHtcclxuICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLiRyZWZzW2Ake2N9V2F0ZXJtYXJrSW5wdXRgXTtcclxuICAgICAgY29uc3QgZmlsZXMgPSBpbnB1dC5maWxlcztcclxuICAgICAgaWYoIWZpbGVzIHx8ICFmaWxlcy5sZW5ndGgpIHJldHVybjtcclxuICAgICAgY29uc3QgZmlsZSA9IGZpbGVzWzBdO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgTktDLm1ldGhvZHMuZmlsZVRvVXJsKGZpbGUpXHJcbiAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICBzZWxmW2Ake2N9V2F0ZXJtYXJrRGF0YWBdID0gZGF0YTtcclxuICAgICAgICAgIHNlbGZbYCR7Y31XYXRlcm1hcmtGaWxlYF0gPSBmaWxlO1xyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgY29uc3QgdXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMudXMpKTtcclxuICAgICAgY29uc3Qge2V4dGVuc2lvbkxpbWl0fSA9IHVzO1xyXG4gICAgICBjb25zdCB7bm9ybWFsV2F0ZXJtYXJrRmlsZSwgc21hbGxXYXRlcm1hcmtGaWxlfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IG5vcm1hbFdhdGVybWFya0lucHV0ID0gdGhpcy4kcmVmcy5ub3JtYWxXYXRlcm1hcmtJbnB1dDtcclxuICAgICAgY29uc3Qgc21hbGxXYXRlcm1hcmtJbnB1dCA9IHRoaXMuJHJlZnMuc21hbGxXYXRlcm1hcmtJbnB1dDtcclxuICAgICAgZXh0ZW5zaW9uTGltaXQuZGVmYXVsdEJsYWNrbGlzdCA9IGV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0QmxhY2tsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xyXG4gICAgICBleHRlbnNpb25MaW1pdC5kZWZhdWx0V2hpdGVsaXN0ID0gZXh0ZW5zaW9uTGltaXQuX2RlZmF1bHRXaGl0ZWxpc3Quc3BsaXQoJywnKS5tYXAoZSA9PiBlLnRyaW0oKSk7XHJcbiAgICAgIGV4dGVuc2lvbkxpbWl0Lm90aGVycy5tYXAobyA9PiB7XHJcbiAgICAgICAgby5ibGFja2xpc3QgPSBvLl9ibGFja2xpc3Quc3BsaXQoJywnKS5tYXAoZSA9PiBlLnRyaW0oKSk7XHJcbiAgICAgICAgby53aGl0ZWxpc3QgPSBvLl93aGl0ZWxpc3Quc3BsaXQoJywnKS5tYXAoZSA9PiBlLnRyaW0oKSk7XHJcbiAgICAgICAgZGVsZXRlIG8uX2JsYWNrbGlzdDtcclxuICAgICAgICBkZWxldGUgby5fd2hpdGVsaXN0O1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgndXBsb2FkU2V0dGluZ3MnLCBKU09OLnN0cmluZ2lmeSh1cykpO1xyXG4gICAgICAgICAgaWYobm9ybWFsV2F0ZXJtYXJrRmlsZSkge1xyXG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ25vcm1hbFdhdGVybWFyaycsIG5vcm1hbFdhdGVybWFya0ZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYoc21hbGxXYXRlcm1hcmtGaWxlKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc21hbGxXYXRlcm1hcmsnLCBzbWFsbFdhdGVybWFya0ZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoJy9lL3NldHRpbmdzL3VwbG9hZCcsICdQQVRDSCcsIGZvcm1EYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgICBub3JtYWxXYXRlcm1hcmtJbnB1dC52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICBzbWFsbFdhdGVybWFya0lucHV0LnZhbHVlID0gbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuIl19
