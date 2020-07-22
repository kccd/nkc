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
      }).then(function () {
        sweetSuccess('保存成功');
        normalWatermarkInput.value = null;
        smallWatermarkInput.value = null;
      })["catch"](sweetError);
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvdXBsb2FkL3VwbG9hZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFYO0lBQ08sYyxHQUFrQixJQUFJLENBQUMsYyxDQUF2QixjO0FBQ1AsY0FBYyxDQUFDLGlCQUFmLEdBQW1DLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFxQyxJQUFyQyxDQUFuQztBQUNBLGNBQWMsQ0FBQyxpQkFBZixHQUFtQyxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBaEMsQ0FBcUMsSUFBckMsQ0FBbkM7QUFDQSxjQUFjLENBQUMsTUFBZixDQUFzQixHQUF0QixDQUEwQixVQUFBLENBQUMsRUFBSTtBQUM3QixFQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQWY7QUFDQSxFQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQWY7QUFDRCxDQUhEO0FBSUEsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsU0FBcEIsQ0FBOEIsY0FBOUIsSUFBZ0QsR0FBaEQ7QUFDQSxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNoQixFQUFBLEVBQUUsRUFBRSxNQURZO0FBRWhCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBREw7QUFFSixJQUFBLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFGWDtBQUdKLElBQUEsbUJBQW1CLEVBQUUsRUFIakI7QUFJSixJQUFBLG1CQUFtQixFQUFFLEVBSmpCO0FBS0osSUFBQSxrQkFBa0IsRUFBRSxFQUxoQjtBQU1KLElBQUEsa0JBQWtC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QSxvQkFBb0IsQ0FBQyxLQUFyQixHQUE2QixJQUE3QjtBQUNBLFFBQUEsbUJBQW1CLENBQUMsS0FBcEIsR0FBNEIsSUFBNUI7QUFDRCxPQWZJLFdBZ0JFLFVBaEJGLENBQVA7QUFpQkQ7QUExRU07QUFWTyxDQUFSLENBQVYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuY29uc3Qge2V4dGVuc2lvbkxpbWl0fSA9IGRhdGEudXBsb2FkU2V0dGluZ3M7XHJcbmV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0V2hpdGVsaXN0ID0gZXh0ZW5zaW9uTGltaXQuZGVmYXVsdFdoaXRlbGlzdC5qb2luKCcsICcpO1xyXG5leHRlbnNpb25MaW1pdC5fZGVmYXVsdEJsYWNrbGlzdCA9IGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRCbGFja2xpc3Quam9pbignLCAnKTtcclxuZXh0ZW5zaW9uTGltaXQub3RoZXJzLm1hcChvID0+IHtcclxuICBvLl9ibGFja2xpc3QgPSBvLmJsYWNrbGlzdC5qb2luKCcsICcpO1xyXG4gIG8uX3doaXRlbGlzdCA9IG8ud2hpdGVsaXN0LmpvaW4oJywgJyk7XHJcbn0pO1xyXG5kYXRhLnVwbG9hZFNldHRpbmdzLndhdGVybWFyay5idXlOb1dhdGVybWFyayAvPSAxMDA7XHJcbnZhciBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgdXM6IGRhdGEudXBsb2FkU2V0dGluZ3MsXHJcbiAgICBjZXJ0TGlzdDogZGF0YS5jZXJ0TGlzdCxcclxuICAgIG5vcm1hbFdhdGVybWFya0RhdGE6ICcnLFxyXG4gICAgbm9ybWFsV2F0ZXJtYXJrRmlsZTogJycsXHJcbiAgICBzbWFsbFdhdGVybWFya0RhdGE6ICcnLFxyXG4gICAgc21hbGxXYXRlcm1hcmtGaWxlOiAnJyxcclxuICB9LFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgYWRkU2l6ZUxpbWl0KCkge1xyXG4gICAgICB0aGlzLnVzLnNpemVMaW1pdC5vdGhlcnMucHVzaCh7XHJcbiAgICAgICAgZXh0OiAnJyxcclxuICAgICAgICBzaXplOiAwXHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGFkZENvdW50TGltaXQoKSB7XHJcbiAgICAgIHRoaXMudXMuY291bnRMaW1pdC5vdGhlcnMucHVzaCh7XHJcbiAgICAgICAgdHlwZTogJycsXHJcbiAgICAgICAgY291bnQ6IDBcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBhZGRFeHRlbnNpb25MaW1pdCgpIHtcclxuICAgICAgdGhpcy51cy5leHRlbnNpb25MaW1pdC5vdGhlcnMucHVzaCh7XHJcbiAgICAgICAgdHlwZTogJycsXHJcbiAgICAgICAgdXNpbmc6ICdibGFja2xpc3QnLFxyXG4gICAgICAgIGJsYWNrbGlzdDogW10sXHJcbiAgICAgICAgd2hpdGVsaXN0OiBbXSxcclxuICAgICAgICBfYmxhY2tsaXN0OiAnJyxcclxuICAgICAgICBfd2hpdGVsaXN0OiAnJ1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIHJlbW92ZUZyb21BcnIoYXJyLCBpbmRleCkge1xyXG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgfSxcclxuICAgIHNlbGVjdGVkV2F0ZXJtYXJrKGMgPSAnbm9ybWFsJykge1xyXG4gICAgICBjb25zdCBpbnB1dCA9IHRoaXMuJHJlZnNbYCR7Y31XYXRlcm1hcmtJbnB1dGBdO1xyXG4gICAgICBjb25zdCBmaWxlcyA9IGlucHV0LmZpbGVzO1xyXG4gICAgICBpZighZmlsZXMgfHwgIWZpbGVzLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICBjb25zdCBmaWxlID0gZmlsZXNbMF07XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBOS0MubWV0aG9kcy5maWxlVG9VcmwoZmlsZSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHNlbGZbYCR7Y31XYXRlcm1hcmtEYXRhYF0gPSBkYXRhO1xyXG4gICAgICAgICAgc2VsZltgJHtjfVdhdGVybWFya0ZpbGVgXSA9IGZpbGU7XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBjb25zdCB1cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy51cykpO1xyXG4gICAgICBjb25zdCB7ZXh0ZW5zaW9uTGltaXR9ID0gdXM7XHJcbiAgICAgIGNvbnN0IHtub3JtYWxXYXRlcm1hcmtGaWxlLCBzbWFsbFdhdGVybWFya0ZpbGV9ID0gdGhpcztcclxuICAgICAgY29uc3Qgbm9ybWFsV2F0ZXJtYXJrSW5wdXQgPSB0aGlzLiRyZWZzLm5vcm1hbFdhdGVybWFya0lucHV0O1xyXG4gICAgICBjb25zdCBzbWFsbFdhdGVybWFya0lucHV0ID0gdGhpcy4kcmVmcy5zbWFsbFdhdGVybWFya0lucHV0O1xyXG4gICAgICBleHRlbnNpb25MaW1pdC5kZWZhdWx0QmxhY2tsaXN0ID0gZXh0ZW5zaW9uTGltaXQuX2RlZmF1bHRCbGFja2xpc3Quc3BsaXQoJywnKS5tYXAoZSA9PiBlLnRyaW0oKSk7XHJcbiAgICAgIGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRXaGl0ZWxpc3QgPSBleHRlbnNpb25MaW1pdC5fZGVmYXVsdFdoaXRlbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgZXh0ZW5zaW9uTGltaXQub3RoZXJzLm1hcChvID0+IHtcclxuICAgICAgICBvLmJsYWNrbGlzdCA9IG8uX2JsYWNrbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgICBvLndoaXRlbGlzdCA9IG8uX3doaXRlbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgICBkZWxldGUgby5fYmxhY2tsaXN0O1xyXG4gICAgICAgIGRlbGV0ZSBvLl93aGl0ZWxpc3Q7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyDnp6/liIbkuZjku6UxMDDnlKjkuo7lrZjlgqhcclxuICAgICAgdXMud2F0ZXJtYXJrLmJ1eU5vV2F0ZXJtYXJrICo9IDEwMDtcclxuXHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgndXBsb2FkU2V0dGluZ3MnLCBKU09OLnN0cmluZ2lmeSh1cykpO1xyXG4gICAgICAgICAgaWYobm9ybWFsV2F0ZXJtYXJrRmlsZSkge1xyXG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ25vcm1hbFdhdGVybWFyaycsIG5vcm1hbFdhdGVybWFya0ZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYoc21hbGxXYXRlcm1hcmtGaWxlKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc21hbGxXYXRlcm1hcmsnLCBzbWFsbFdhdGVybWFya0ZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoJy9lL3NldHRpbmdzL3VwbG9hZCcsICdQVVQnLCBmb3JtRGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoJ+S/neWtmOaIkOWKnycpO1xyXG4gICAgICAgICAgbm9ybWFsV2F0ZXJtYXJrSW5wdXQudmFsdWUgPSBudWxsO1xyXG4gICAgICAgICAgc21hbGxXYXRlcm1hcmtJbnB1dC52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbiJdfQ==
