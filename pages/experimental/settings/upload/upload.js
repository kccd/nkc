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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvdXBsb2FkL3VwbG9hZC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFYO0lBQ08sYyxHQUFrQixJQUFJLENBQUMsYyxDQUF2QixjO0FBQ1AsY0FBYyxDQUFDLGlCQUFmLEdBQW1DLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFxQyxJQUFyQyxDQUFuQztBQUNBLGNBQWMsQ0FBQyxpQkFBZixHQUFtQyxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBaEMsQ0FBcUMsSUFBckMsQ0FBbkM7QUFDQSxjQUFjLENBQUMsTUFBZixDQUFzQixHQUF0QixDQUEwQixVQUFBLENBQUMsRUFBSTtBQUM3QixFQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQWY7QUFDQSxFQUFBLENBQUMsQ0FBQyxVQUFGLEdBQWUsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQWY7QUFDRCxDQUhEO0FBSUEsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDaEIsRUFBQSxFQUFFLEVBQUUsTUFEWTtBQUVoQixFQUFBLElBQUksRUFBRTtBQUNKLElBQUEsRUFBRSxFQUFFLElBQUksQ0FBQyxjQURMO0FBRUosSUFBQSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBRlg7QUFHSixJQUFBLG1CQUFtQixFQUFFLEVBSGpCO0FBSUosSUFBQSxtQkFBbUIsRUFBRSxFQUpqQjtBQUtKLElBQUEsa0JBQWtCLEVBQUUsRUFMaEI7QUFNSixJQUFBLGtCQUFrQixFQUFFO0FBTmhCLEdBRlU7QUFVaEIsRUFBQSxPQUFPLEVBQUU7QUFDUCxJQUFBLE1BQU0sRUFB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Q0FBUixDQUFWIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XG5jb25zdCB7ZXh0ZW5zaW9uTGltaXR9ID0gZGF0YS51cGxvYWRTZXR0aW5ncztcbmV4dGVuc2lvbkxpbWl0Ll9kZWZhdWx0V2hpdGVsaXN0ID0gZXh0ZW5zaW9uTGltaXQuZGVmYXVsdFdoaXRlbGlzdC5qb2luKCcsICcpO1xuZXh0ZW5zaW9uTGltaXQuX2RlZmF1bHRCbGFja2xpc3QgPSBleHRlbnNpb25MaW1pdC5kZWZhdWx0QmxhY2tsaXN0LmpvaW4oJywgJyk7XG5leHRlbnNpb25MaW1pdC5vdGhlcnMubWFwKG8gPT4ge1xuICBvLl9ibGFja2xpc3QgPSBvLmJsYWNrbGlzdC5qb2luKCcsICcpO1xuICBvLl93aGl0ZWxpc3QgPSBvLndoaXRlbGlzdC5qb2luKCcsICcpO1xufSk7XG52YXIgYXBwID0gbmV3IFZ1ZSh7XG4gIGVsOiBcIiNhcHBcIixcbiAgZGF0YToge1xuICAgIHVzOiBkYXRhLnVwbG9hZFNldHRpbmdzLFxuICAgIGNlcnRMaXN0OiBkYXRhLmNlcnRMaXN0LFxuICAgIG5vcm1hbFdhdGVybWFya0RhdGE6ICcnLFxuICAgIG5vcm1hbFdhdGVybWFya0ZpbGU6ICcnLFxuICAgIHNtYWxsV2F0ZXJtYXJrRGF0YTogJycsXG4gICAgc21hbGxXYXRlcm1hcmtGaWxlOiAnJyxcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxuICAgIGFkZFNpemVMaW1pdCgpIHtcbiAgICAgIHRoaXMudXMuc2l6ZUxpbWl0Lm90aGVycy5wdXNoKHtcbiAgICAgICAgZXh0OiAnJyxcbiAgICAgICAgc2l6ZTogMFxuICAgICAgfSk7XG4gICAgfSxcbiAgICBhZGRDb3VudExpbWl0KCkge1xuICAgICAgdGhpcy51cy5jb3VudExpbWl0Lm90aGVycy5wdXNoKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIGNvdW50OiAwXG4gICAgICB9KVxuICAgIH0sXG4gICAgYWRkRXh0ZW5zaW9uTGltaXQoKSB7XG4gICAgICB0aGlzLnVzLmV4dGVuc2lvbkxpbWl0Lm90aGVycy5wdXNoKHtcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHVzaW5nOiAnYmxhY2tsaXN0JyxcbiAgICAgICAgYmxhY2tsaXN0OiBbXSxcbiAgICAgICAgd2hpdGVsaXN0OiBbXSxcbiAgICAgICAgX2JsYWNrbGlzdDogJycsXG4gICAgICAgIF93aGl0ZWxpc3Q6ICcnXG4gICAgICB9KVxuICAgIH0sXG4gICAgcmVtb3ZlRnJvbUFycihhcnIsIGluZGV4KSB7XG4gICAgICBhcnIuc3BsaWNlKGluZGV4LCAxKVxuICAgIH0sXG4gICAgc2VsZWN0ZWRXYXRlcm1hcmsoYyA9ICdub3JtYWwnKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IHRoaXMuJHJlZnNbYCR7Y31XYXRlcm1hcmtJbnB1dGBdO1xuICAgICAgY29uc3QgZmlsZXMgPSBpbnB1dC5maWxlcztcbiAgICAgIGlmKCFmaWxlcyB8fCAhZmlsZXMubGVuZ3RoKSByZXR1cm47XG4gICAgICBjb25zdCBmaWxlID0gZmlsZXNbMF07XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIE5LQy5tZXRob2RzLmZpbGVUb1VybChmaWxlKVxuICAgICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgICBzZWxmW2Ake2N9V2F0ZXJtYXJrRGF0YWBdID0gZGF0YTtcbiAgICAgICAgICBzZWxmW2Ake2N9V2F0ZXJtYXJrRmlsZWBdID0gZmlsZTtcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCB1cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy51cykpO1xuICAgICAgY29uc3Qge2V4dGVuc2lvbkxpbWl0fSA9IHVzO1xuICAgICAgY29uc3Qge25vcm1hbFdhdGVybWFya0ZpbGUsIHNtYWxsV2F0ZXJtYXJrRmlsZX0gPSB0aGlzO1xuICAgICAgY29uc3Qgbm9ybWFsV2F0ZXJtYXJrSW5wdXQgPSB0aGlzLiRyZWZzLm5vcm1hbFdhdGVybWFya0lucHV0O1xuICAgICAgY29uc3Qgc21hbGxXYXRlcm1hcmtJbnB1dCA9IHRoaXMuJHJlZnMuc21hbGxXYXRlcm1hcmtJbnB1dDtcbiAgICAgIGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRCbGFja2xpc3QgPSBleHRlbnNpb25MaW1pdC5fZGVmYXVsdEJsYWNrbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcbiAgICAgIGV4dGVuc2lvbkxpbWl0LmRlZmF1bHRXaGl0ZWxpc3QgPSBleHRlbnNpb25MaW1pdC5fZGVmYXVsdFdoaXRlbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcbiAgICAgIGV4dGVuc2lvbkxpbWl0Lm90aGVycy5tYXAobyA9PiB7XG4gICAgICAgIG8uYmxhY2tsaXN0ID0gby5fYmxhY2tsaXN0LnNwbGl0KCcsJykubWFwKGUgPT4gZS50cmltKCkpO1xuICAgICAgICBvLndoaXRlbGlzdCA9IG8uX3doaXRlbGlzdC5zcGxpdCgnLCcpLm1hcChlID0+IGUudHJpbSgpKTtcbiAgICAgICAgZGVsZXRlIG8uX2JsYWNrbGlzdDtcbiAgICAgICAgZGVsZXRlIG8uX3doaXRlbGlzdDtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3VwbG9hZFNldHRpbmdzJywgSlNPTi5zdHJpbmdpZnkodXMpKTtcbiAgICAgICAgICBpZihub3JtYWxXYXRlcm1hcmtGaWxlKSB7XG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ25vcm1hbFdhdGVybWFyaycsIG5vcm1hbFdhdGVybWFya0ZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihzbWFsbFdhdGVybWFya0ZpbGUpIHtcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnc21hbGxXYXRlcm1hcmsnLCBzbWFsbFdhdGVybWFya0ZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZSgnL2Uvc2V0dGluZ3MvdXBsb2FkJywgJ1BBVENIJywgZm9ybURhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgc3dlZXRTdWNjZXNzKCfkv53lrZjmiJDlip8nKTtcbiAgICAgICAgICBub3JtYWxXYXRlcm1hcmtJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgc21hbGxXYXRlcm1hcmtJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChzd2VldEVycm9yKTtcbiAgICB9XG4gIH1cbn0pO1xuXG4iXX0=
