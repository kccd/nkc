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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvdXBsb2FkL3VwbG9hZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFYO0lBQ08sYyxHQUFrQixJQUFJLENBQUMsYyxDQUF2QixjO0FBQ1AsY0FBYyxDQUFDLGlCQUFmLEdBQW1DLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFxQyxJQUFyQyxDQUFuQztBQUNBLGNBQWMsQ0FBQyxpQkFBZixHQUFtQyxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBaEMsQ0FBcUMsSUFBckMsQ0FBbkM7QUFDQSxjQUFjLENBQUMsTUFBZixDQUFzQixHQUF0QixDQUEwQixVQUFBLENBQUMsRUFBSTtBQUM3QixFQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQWY7QUFDQSxFQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQWY7QUFDRCxDQUhEO0FBSUEsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsU0FBcEIsQ0FBOEIsY0FBOUIsSUFBZ0QsR0FBaEQ7QUFDQSxNQUFNLENBQUMsR0FBUCxHQUFhLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FETDtBQUVKLElBQUEsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUZYO0FBR0osSUFBQSxtQkFBbUIsRUFBRSxFQUhqQjtBQUlKLElBQUEsbUJBQW1CLEVBQUUsRUFKakI7QUFLSixJQUFBLGtCQUFrQixFQUFFLEVBTGhCO0FBTUosSUFBQSxr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LFVBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsZ0JBQWhCLEVBQWtDLGtCQUFsQztBQUNEOztBQUNELGVBQU8sYUFBYSxDQUFDLG9CQUFELEVBQXVCLEtBQXZCLEVBQThCLFFBQTlCLENBQXBCO0FBQ0QsT0FWSSxFQVdKLElBWEksQ0FXQyxVQUFBLElBQUksRUFBSTtBQUNaLFFBQUEsWUFBWSxDQUFDLE1BQUQsQ0FBWjtBQUNBLFFBQUEsb0JBQW9CLENBQUMsS0FBckIsR0FBNkIsSUFBN0I7QUFDQSxRQUFBLG1CQUFtQixDQUFDLEtBQXBCLEdBQTRCLElBQTVCO0FBSFksb0NBSTRCLElBQUksQ0FBQyxjQUFMLENBQW9CLFNBSmhEO0FBQUEsWUFJTCxjQUpLLHlCQUlMLGNBSks7QUFBQSxZQUlXLGFBSlgseUJBSVcsYUFKWDtBQUtaLFFBQUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxTQUFSLENBQWtCLGNBQWxCLEdBQW1DLGNBQW5DO0FBQ0EsUUFBQSxJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsQ0FBa0IsYUFBbEIsR0FBa0MsYUFBbEM7QUFDQSxRQUFBLElBQUksQ0FBQyxTQUFMO0FBQ0QsT0FuQkksV0FvQkUsVUFwQkYsQ0FBUDtBQXFCRDtBQXJGTTtBQVZVLENBQVIsQ0FBYiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5jb25zdCB7ZXh0ZW5zaW9uTGltaXR9ID0gZGF0YS51cGxvYWRTZXR0aW5ncztcclxuZXh0ZW5zaW9uTGltaXQuX2RlZmF1bHRXaGl0ZWxpc3QgPSBleHRlbnNpb25MaW1pdC5kZWZhdWx0V2hpdGVsaXN0LmpvaW4oJywgJyk7XHJcbmV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0QmxhY2tsaXN0ID0gZXh0ZW5zaW9uTGltaXQuZGVmYXVsdEJsYWNrbGlzdC5qb2luKCcsICcpO1xyXG5leHRlbnNpb25MaW1pdC5vdGhlcnMubWFwKG8gPT4ge1xyXG4gIG8uX2JsYWNrbGlzdCA9IG8uYmxhY2tsaXN0LmpvaW4oJywgJyk7XHJcbiAgby5fd2hpdGVsaXN0ID0gby53aGl0ZWxpc3Quam9pbignLCAnKTtcclxufSk7XHJcbmRhdGEudXBsb2FkU2V0dGluZ3Mud2F0ZXJtYXJrLmJ1eU5vV2F0ZXJtYXJrIC89IDEwMDtcclxud2luZG93LmFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICB1czogZGF0YS51cGxvYWRTZXR0aW5ncyxcclxuICAgIGNlcnRMaXN0OiBkYXRhLmNlcnRMaXN0LFxyXG4gICAgbm9ybWFsV2F0ZXJtYXJrRGF0YTogJycsXHJcbiAgICBub3JtYWxXYXRlcm1hcmtGaWxlOiAnJyxcclxuICAgIHNtYWxsV2F0ZXJtYXJrRGF0YTogJycsXHJcbiAgICBzbWFsbFdhdGVybWFya0ZpbGU6ICcnLFxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICByZXNldEZpbGUoKSB7XHJcbiAgICAgIHRoaXMubm9ybWFsV2F0ZXJtYXJrRGF0YSA9ICcnO1xyXG4gICAgICB0aGlzLm5vcm1hbFdhdGVybWFya0ZpbGUgPSAnJztcclxuICAgICAgdGhpcy5zbWFsbFdhdGVybWFya0RhdGEgPSAnJztcclxuICAgICAgdGhpcy5zbWFsbFdhdGVybWFya0ZpbGUgPSAnJztcclxuICAgIH0sXHJcbiAgICBhZGRTaXplTGltaXQoKSB7XHJcbiAgICAgIHRoaXMudXMuc2l6ZUxpbWl0Lm90aGVycy5wdXNoKHtcclxuICAgICAgICBleHQ6ICcnLFxyXG4gICAgICAgIHNpemU6IDBcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWRkQ291bnRMaW1pdCgpIHtcclxuICAgICAgdGhpcy51cy5jb3VudExpbWl0Lm90aGVycy5wdXNoKHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICBjb3VudDogMFxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGFkZEV4dGVuc2lvbkxpbWl0KCkge1xyXG4gICAgICB0aGlzLnVzLmV4dGVuc2lvbkxpbWl0Lm90aGVycy5wdXNoKHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICB1c2luZzogJ2JsYWNrbGlzdCcsXHJcbiAgICAgICAgYmxhY2tsaXN0OiBbXSxcclxuICAgICAgICB3aGl0ZWxpc3Q6IFtdLFxyXG4gICAgICAgIF9ibGFja2xpc3Q6ICcnLFxyXG4gICAgICAgIF93aGl0ZWxpc3Q6ICcnXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlRnJvbUFycihhcnIsIGluZGV4KSB7XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICB9LFxyXG4gICAgc2VsZWN0ZWRXYXRlcm1hcmsoYyA9ICdub3JtYWwnKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy4kcmVmc1tgJHtjfVdhdGVybWFya0lucHV0YF07XHJcbiAgICAgIGNvbnN0IGZpbGVzID0gaW5wdXQuZmlsZXM7XHJcbiAgICAgIGlmKCFmaWxlcyB8fCAhZmlsZXMubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBmaWxlc1swXTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZltgJHtjfVdhdGVybWFya0RhdGFgXSA9IGRhdGE7XHJcbiAgICAgICAgICBzZWxmW2Ake2N9V2F0ZXJtYXJrRmlsZWBdID0gZmlsZTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNvbnN0IHVzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnVzKSk7XHJcbiAgICAgIGNvbnN0IHtleHRlbnNpb25MaW1pdH0gPSB1cztcclxuICAgICAgY29uc3Qge25vcm1hbFdhdGVybWFya0ZpbGUsIHNtYWxsV2F0ZXJtYXJrRmlsZX0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgICAgY29uc3Qgbm9ybWFsV2F0ZXJtYXJrSW5wdXQgPSB0aGlzLiRyZWZzLm5vcm1hbFdhdGVybWFya0lucHV0O1xyXG4gICAgICBjb25zdCBzbWFsbFdhdGVybWFya0lucHV0ID0gdGhpcy4kcmVmcy5zbWFsbFdhdGVybWFya0lucHV0O1xyXG4gICAgICBleHRlbnNpb25MaW1pdC5kZWZhdWx0QmxhY2tsaXN0ID0gZXh0ZW5zaW9uTGltaXQuX2RlZmF1bHRCbGFja2xpc3Quc3BsaXQoJywnKS5tYXAoZSA9PiBlLnRyaW0oKSk7XHJcbiAgICAgIGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRXaGl0ZWxpc3QgPSBleHRlbnNpb25MaW1pdC5fZGVmYXVsdFdoaXRlbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgZXh0ZW5zaW9uTGltaXQub3RoZXJzLm1hcChvID0+IHtcclxuICAgICAgICBvLmJsYWNrbGlzdCA9IG8uX2JsYWNrbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgICBvLndoaXRlbGlzdCA9IG8uX3doaXRlbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgICBkZWxldGUgby5fYmxhY2tsaXN0O1xyXG4gICAgICAgIGRlbGV0ZSBvLl93aGl0ZWxpc3Q7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyDnp6/liIbkuZjku6UxMDDnlKjkuo7lrZjlgqhcclxuICAgICAgdXMud2F0ZXJtYXJrLmJ1eU5vV2F0ZXJtYXJrICo9IDEwMDtcclxuXHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgndXBsb2FkU2V0dGluZ3MnLCBKU09OLnN0cmluZ2lmeSh1cykpO1xyXG4gICAgICAgICAgaWYobm9ybWFsV2F0ZXJtYXJrRmlsZSkge1xyXG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ25vcm1hbFdhdGVybWFyaycsIG5vcm1hbFdhdGVybWFya0ZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYoc21hbGxXYXRlcm1hcmtGaWxlKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc21hbGxXYXRlcm1hcmsnLCBzbWFsbFdhdGVybWFya0ZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoJy9lL3NldHRpbmdzL3VwbG9hZCcsICdQVVQnLCBmb3JtRGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgICBub3JtYWxXYXRlcm1hcmtJbnB1dC52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICBzbWFsbFdhdGVybWFya0lucHV0LnZhbHVlID0gbnVsbDtcclxuICAgICAgICAgIGNvbnN0IHtub3JtYWxBdHRhY2hJZCwgc21hbGxBdHRhY2hJZH0gPSBkYXRhLnVwbG9hZFNldHRpbmdzLndhdGVybWFyaztcclxuICAgICAgICAgIHNlbGYudXMud2F0ZXJtYXJrLm5vcm1hbEF0dGFjaElkID0gbm9ybWFsQXR0YWNoSWQ7XHJcbiAgICAgICAgICBzZWxmLnVzLndhdGVybWFyay5zbWFsbEF0dGFjaElkID0gc21hbGxBdHRhY2hJZDtcclxuICAgICAgICAgIHNlbGYucmVzZXRGaWxlKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbiJdfQ==
