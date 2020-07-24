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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy91cGxvYWQvdXBsb2FkLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQVg7SUFDTyxjLEdBQWtCLElBQUksQ0FBQyxjLENBQXZCLGM7QUFDUCxjQUFjLENBQUMsaUJBQWYsR0FBbUMsY0FBYyxDQUFDLGdCQUFmLENBQWdDLElBQWhDLENBQXFDLElBQXJDLENBQW5DO0FBQ0EsY0FBYyxDQUFDLGlCQUFmLEdBQW1DLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFxQyxJQUFyQyxDQUFuQztBQUNBLGNBQWMsQ0FBQyxNQUFmLENBQXNCLEdBQXRCLENBQTBCLFVBQUEsQ0FBQyxFQUFJO0FBQzdCLEVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxDQUFDLENBQUMsU0FBRixDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBZjtBQUNBLEVBQUEsQ0FBQyxDQUFDLFVBQUYsR0FBZSxDQUFDLENBQUMsU0FBRixDQUFZLElBQVosQ0FBaUIsSUFBakIsQ0FBZjtBQUNELENBSEQ7QUFJQSxJQUFJLENBQUMsY0FBTCxDQUFvQixTQUFwQixDQUE4QixjQUE5QixJQUFnRCxHQUFoRDtBQUNBLElBQUksR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ2hCLEVBQUEsRUFBRSxFQUFFLE1BRFk7QUFFaEIsRUFBQSxJQUFJLEVBQUU7QUFDSixJQUFBLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FETDtBQUVKLElBQUEsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUZYO0FBR0osSUFBQSxtQkFBbUIsRUFBRSxFQUhqQjtBQUlKLElBQUEsbUJBQW1CLEVBQUUsRUFKakI7QUFLSixJQUFBLGtCQUFrQixFQUFFLEVBTGhCO0FBTUosSUFBQSxrQkFBa0IsRUFBRTtBQU5oQixHQUZVO0FBVWhCLEVBQUEsT0FBTyxFQUFFO0FBQ1AsSUFBQSxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFaLENBQWtCLE1BRG5CO0FBRVAsSUFBQSxZQUZPLDBCQUVRO0FBQ2IsV0FBSyxFQUFMLENBQVEsU0FBUixDQUFrQixNQUFsQixDQUF5QixJQUF6QixDQUE4QjtBQUM1QixRQUFBLEdBQUcsRUFBRSxFQUR1QjtBQUU1QixRQUFBLElBQUksRUFBRTtBQUZzQixPQUE5QjtBQUlELEtBUE07QUFRUCxJQUFBLGFBUk8sMkJBUVM7QUFDZCxXQUFLLEVBQUwsQ0FBUSxVQUFSLENBQW1CLE1BQW5CLENBQTBCLElBQTFCLENBQStCO0FBQzdCLFFBQUEsSUFBSSxFQUFFLEVBRHVCO0FBRTdCLFFBQUEsS0FBSyxFQUFFO0FBRnNCLE9BQS9CO0FBSUQsS0FiTTtBQWNQLElBQUEsaUJBZE8sK0JBY2E7QUFDbEIsV0FBSyxFQUFMLENBQVEsY0FBUixDQUF1QixNQUF2QixDQUE4QixJQUE5QixDQUFtQztBQUNqQyxRQUFBLElBQUksRUFBRSxFQUQyQjtBQUVqQyxRQUFBLEtBQUssRUFBRSxXQUYwQjtBQUdqQyxRQUFBLFNBQVMsRUFBRSxFQUhzQjtBQUlqQyxRQUFBLFNBQVMsRUFBRSxFQUpzQjtBQUtqQyxRQUFBLFVBQVUsRUFBRSxFQUxxQjtBQU1qQyxRQUFBLFVBQVUsRUFBRTtBQU5xQixPQUFuQztBQVFELEtBdkJNO0FBd0JQLElBQUEsYUF4Qk8seUJBd0JPLEdBeEJQLEVBd0JZLEtBeEJaLEVBd0JtQjtBQUN4QixNQUFBLEdBQUcsQ0FBQyxNQUFKLENBQVcsS0FBWCxFQUFrQixDQUFsQjtBQUNELEtBMUJNO0FBMkJQLElBQUEsaUJBM0JPLCtCQTJCeUI7QUFBQSxVQUFkLENBQWMsdUVBQVYsUUFBVTtBQUM5QixVQUFNLEtBQUssR0FBRyxLQUFLLEtBQUwsV0FBYyxDQUFkLG9CQUFkO0FBQ0EsVUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQXBCO0FBQ0EsVUFBRyxDQUFDLEtBQUQsSUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFwQixFQUE0QjtBQUM1QixVQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBRCxDQUFsQjtBQUNBLFVBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixJQUF0QixFQUNHLElBREgsQ0FDUSxVQUFBLElBQUksRUFBSTtBQUNaLFFBQUEsSUFBSSxXQUFJLENBQUosbUJBQUosR0FBNEIsSUFBNUI7QUFDQSxRQUFBLElBQUksV0FBSSxDQUFKLG1CQUFKLEdBQTRCLElBQTVCO0FBQ0QsT0FKSDtBQUtELEtBdENNO0FBdUNQLElBQUEsTUFBTSxFQUFFLGtCQUFXO0FBQ2pCLFVBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFLLEVBQXBCLENBQVgsQ0FBWDtBQURpQixVQUVWLGNBRlUsR0FFUSxFQUZSLENBRVYsY0FGVTtBQUFBLFVBR1YsbUJBSFUsR0FHaUMsSUFIakMsQ0FHVixtQkFIVTtBQUFBLFVBR1csa0JBSFgsR0FHaUMsSUFIakMsQ0FHVyxrQkFIWDtBQUlqQixVQUFNLG9CQUFvQixHQUFHLEtBQUssS0FBTCxDQUFXLG9CQUF4QztBQUNBLFVBQU0sbUJBQW1CLEdBQUcsS0FBSyxLQUFMLENBQVcsbUJBQXZDO0FBQ0EsTUFBQSxjQUFjLENBQUMsZ0JBQWYsR0FBa0MsY0FBYyxDQUFDLGlCQUFmLENBQWlDLEtBQWpDLENBQXVDLEdBQXZDLEVBQTRDLEdBQTVDLENBQWdELFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLElBQUYsRUFBSjtBQUFBLE9BQWpELENBQWxDO0FBQ0EsTUFBQSxjQUFjLENBQUMsZ0JBQWYsR0FBa0MsY0FBYyxDQUFDLGlCQUFmLENBQWlDLEtBQWpDLENBQXVDLEdBQXZDLEVBQTRDLEdBQTVDLENBQWdELFVBQUEsQ0FBQztBQUFBLGVBQUksQ0FBQyxDQUFDLElBQUYsRUFBSjtBQUFBLE9BQWpELENBQWxDO0FBQ0EsTUFBQSxjQUFjLENBQUMsTUFBZixDQUFzQixHQUF0QixDQUEwQixVQUFBLENBQUMsRUFBSTtBQUM3QixRQUFBLENBQUMsQ0FBQyxTQUFGLEdBQWMsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxLQUFiLENBQW1CLEdBQW5CLEVBQXdCLEdBQXhCLENBQTRCLFVBQUEsQ0FBQztBQUFBLGlCQUFJLENBQUMsQ0FBQyxJQUFGLEVBQUo7QUFBQSxTQUE3QixDQUFkO0FBQ0EsUUFBQSxDQUFDLENBQUMsU0FBRixHQUFjLENBQUMsQ0FBQyxVQUFGLENBQWEsS0FBYixDQUFtQixHQUFuQixFQUF3QixHQUF4QixDQUE0QixVQUFBLENBQUM7QUFBQSxpQkFBSSxDQUFDLENBQUMsSUFBRixFQUFKO0FBQUEsU0FBN0IsQ0FBZDtBQUNBLGVBQU8sQ0FBQyxDQUFDLFVBQVQ7QUFDQSxlQUFPLENBQUMsQ0FBQyxVQUFUO0FBQ0QsT0FMRCxFQVJpQixDQWNqQjs7QUFDQSxNQUFBLEVBQUUsQ0FBQyxTQUFILENBQWEsY0FBYixJQUErQixHQUEvQjtBQUVBLFVBQU0sUUFBUSxHQUFHLElBQUksUUFBSixFQUFqQjtBQUNBLGFBQU8sT0FBTyxDQUFDLE9BQVIsR0FDSixJQURJLENBQ0MsWUFBTTtBQUNWLFFBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsZ0JBQWhCLEVBQWtDLElBQUksQ0FBQyxTQUFMLENBQWUsRUFBZixDQUFsQzs7QUFDQSxZQUFHLG1CQUFILEVBQXdCO0FBQ3RCLFVBQUEsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsaUJBQWhCLEVBQW1DLG1CQUFuQztBQUNEOztBQUNELFlBQUcsa0JBQUgsRUFBdUI7QUFDckIsVUFBQSxRQUFRLENBQUMsTUFBVCxDQUFnQixnQkFBaEIsRUFBa0Msa0JBQWxDO0FBQ0Q7O0FBQ0QsZUFBTyxhQUFhLENBQUMsb0JBQUQsRUFBdUIsS0FBdkIsRUFBOEIsUUFBOUIsQ0FBcEI7QUFDRCxPQVZJLEVBV0osSUFYSSxDQVdDLFlBQU07QUFDVixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDQSxRQUFBLG9CQUFvQixDQUFDLEtBQXJCLEdBQTZCLElBQTdCO0FBQ0EsUUFBQSxtQkFBbUIsQ0FBQyxLQUFwQixHQUE0QixJQUE1QjtBQUNELE9BZkksV0FnQkUsVUFoQkYsQ0FBUDtBQWlCRDtBQTFFTTtBQVZPLENBQVIsQ0FBViIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5jb25zdCB7ZXh0ZW5zaW9uTGltaXR9ID0gZGF0YS51cGxvYWRTZXR0aW5ncztcclxuZXh0ZW5zaW9uTGltaXQuX2RlZmF1bHRXaGl0ZWxpc3QgPSBleHRlbnNpb25MaW1pdC5kZWZhdWx0V2hpdGVsaXN0LmpvaW4oJywgJyk7XHJcbmV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0QmxhY2tsaXN0ID0gZXh0ZW5zaW9uTGltaXQuZGVmYXVsdEJsYWNrbGlzdC5qb2luKCcsICcpO1xyXG5leHRlbnNpb25MaW1pdC5vdGhlcnMubWFwKG8gPT4ge1xyXG4gIG8uX2JsYWNrbGlzdCA9IG8uYmxhY2tsaXN0LmpvaW4oJywgJyk7XHJcbiAgby5fd2hpdGVsaXN0ID0gby53aGl0ZWxpc3Quam9pbignLCAnKTtcclxufSk7XHJcbmRhdGEudXBsb2FkU2V0dGluZ3Mud2F0ZXJtYXJrLmJ1eU5vV2F0ZXJtYXJrIC89IDEwMDtcclxudmFyIGFwcCA9IG5ldyBWdWUoe1xyXG4gIGVsOiBcIiNhcHBcIixcclxuICBkYXRhOiB7XHJcbiAgICB1czogZGF0YS51cGxvYWRTZXR0aW5ncyxcclxuICAgIGNlcnRMaXN0OiBkYXRhLmNlcnRMaXN0LFxyXG4gICAgbm9ybWFsV2F0ZXJtYXJrRGF0YTogJycsXHJcbiAgICBub3JtYWxXYXRlcm1hcmtGaWxlOiAnJyxcclxuICAgIHNtYWxsV2F0ZXJtYXJrRGF0YTogJycsXHJcbiAgICBzbWFsbFdhdGVybWFya0ZpbGU6ICcnLFxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICBhZGRTaXplTGltaXQoKSB7XHJcbiAgICAgIHRoaXMudXMuc2l6ZUxpbWl0Lm90aGVycy5wdXNoKHtcclxuICAgICAgICBleHQ6ICcnLFxyXG4gICAgICAgIHNpemU6IDBcclxuICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYWRkQ291bnRMaW1pdCgpIHtcclxuICAgICAgdGhpcy51cy5jb3VudExpbWl0Lm90aGVycy5wdXNoKHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICBjb3VudDogMFxyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGFkZEV4dGVuc2lvbkxpbWl0KCkge1xyXG4gICAgICB0aGlzLnVzLmV4dGVuc2lvbkxpbWl0Lm90aGVycy5wdXNoKHtcclxuICAgICAgICB0eXBlOiAnJyxcclxuICAgICAgICB1c2luZzogJ2JsYWNrbGlzdCcsXHJcbiAgICAgICAgYmxhY2tsaXN0OiBbXSxcclxuICAgICAgICB3aGl0ZWxpc3Q6IFtdLFxyXG4gICAgICAgIF9ibGFja2xpc3Q6ICcnLFxyXG4gICAgICAgIF93aGl0ZWxpc3Q6ICcnXHJcbiAgICAgIH0pXHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlRnJvbUFycihhcnIsIGluZGV4KSB7XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICB9LFxyXG4gICAgc2VsZWN0ZWRXYXRlcm1hcmsoYyA9ICdub3JtYWwnKSB7XHJcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy4kcmVmc1tgJHtjfVdhdGVybWFya0lucHV0YF07XHJcbiAgICAgIGNvbnN0IGZpbGVzID0gaW5wdXQuZmlsZXM7XHJcbiAgICAgIGlmKCFmaWxlcyB8fCAhZmlsZXMubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBmaWxlc1swXTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxyXG4gICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgc2VsZltgJHtjfVdhdGVybWFya0RhdGFgXSA9IGRhdGE7XHJcbiAgICAgICAgICBzZWxmW2Ake2N9V2F0ZXJtYXJrRmlsZWBdID0gZmlsZTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNvbnN0IHVzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnVzKSk7XHJcbiAgICAgIGNvbnN0IHtleHRlbnNpb25MaW1pdH0gPSB1cztcclxuICAgICAgY29uc3Qge25vcm1hbFdhdGVybWFya0ZpbGUsIHNtYWxsV2F0ZXJtYXJrRmlsZX0gPSB0aGlzO1xyXG4gICAgICBjb25zdCBub3JtYWxXYXRlcm1hcmtJbnB1dCA9IHRoaXMuJHJlZnMubm9ybWFsV2F0ZXJtYXJrSW5wdXQ7XHJcbiAgICAgIGNvbnN0IHNtYWxsV2F0ZXJtYXJrSW5wdXQgPSB0aGlzLiRyZWZzLnNtYWxsV2F0ZXJtYXJrSW5wdXQ7XHJcbiAgICAgIGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRCbGFja2xpc3QgPSBleHRlbnNpb25MaW1pdC5fZGVmYXVsdEJsYWNrbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcclxuICAgICAgZXh0ZW5zaW9uTGltaXQuZGVmYXVsdFdoaXRlbGlzdCA9IGV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0V2hpdGVsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xyXG4gICAgICBleHRlbnNpb25MaW1pdC5vdGhlcnMubWFwKG8gPT4ge1xyXG4gICAgICAgIG8uYmxhY2tsaXN0ID0gby5fYmxhY2tsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xyXG4gICAgICAgIG8ud2hpdGVsaXN0ID0gby5fd2hpdGVsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xyXG4gICAgICAgIGRlbGV0ZSBvLl9ibGFja2xpc3Q7XHJcbiAgICAgICAgZGVsZXRlIG8uX3doaXRlbGlzdDtcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIOenr+WIhuS5mOS7pTEwMOeUqOS6juWtmOWCqFxyXG4gICAgICB1cy53YXRlcm1hcmsuYnV5Tm9XYXRlcm1hcmsgKj0gMTAwO1xyXG5cclxuICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCd1cGxvYWRTZXR0aW5ncycsIEpTT04uc3RyaW5naWZ5KHVzKSk7XHJcbiAgICAgICAgICBpZihub3JtYWxXYXRlcm1hcmtGaWxlKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnbm9ybWFsV2F0ZXJtYXJrJywgbm9ybWFsV2F0ZXJtYXJrRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZihzbWFsbFdhdGVybWFya0ZpbGUpIHtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdzbWFsbFdhdGVybWFyaycsIHNtYWxsV2F0ZXJtYXJrRmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZSgnL2Uvc2V0dGluZ3MvdXBsb2FkJywgJ1BVVCcsIGZvcm1EYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHN3ZWV0U3VjY2Vzcygn5L+d5a2Y5oiQ5YqfJyk7XHJcbiAgICAgICAgICBub3JtYWxXYXRlcm1hcmtJbnB1dC52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICBzbWFsbFdhdGVybWFya0lucHV0LnZhbHVlID0gbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuIl19
