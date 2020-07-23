(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.Attachments = /*#__PURE__*/function () {
  function _class(options) {
    _classCallCheck(this, _class);

    var self = this;
    var pid = options.pid,
        fid = options.fid;
    if (!pid) return sweetError("附件模块初始化失败，id不能为空");
    this.app = new Vue({
      el: "#moduleAttachments",
      data: {
        pid: pid,
        // post ID
        fid: fid,
        // 存在文库的专业ID，可能为空。为空时不允许推送到文库
        loaded: false,
        // 是否已经加载完成
        mark: false,
        // 多选
        hidden: false,
        createFilePermission: false,
        // 是否有权限上传文件到文库
        attachments: []
      },
      mounted: function mounted() {
        this.getAttachments();

        if (!window.ResourceInfo) {
          if (!NKC.modules.ResourceInfo) {
            sweetError("未引入资源信息模块");
          } else {
            window.ResourceInfo = new NKC.modules.ResourceInfo();
          }
        }
      },
      computed: {
        selectedAttachmentCount: function selectedAttachmentCount() {
          var count = 0;
          this.attachments.map(function (a) {
            if (a.mark) count++;
          });
          return count;
        }
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        getSize: NKC.methods.tools.getSize,
        visitUrl: NKC.methods.visitUrl,
        format: NKC.methods.format,
        displayResourceInfo: function displayResourceInfo(r) {
          ResourceInfo.open({
            rid: r.rid
          });
        },
        postToLibrary: function postToLibrary() {
          var attachments = this.attachments;
          var rid = [];
          attachments.map(function (a) {
            if (a.mark) rid.push(a.rid);
          });
          if (rid.length === 0) return;
          rid = rid.join("-");
          this.visitUrl("/f/".concat(fid, "/library?t=upload&id=").concat(rid), true);
        },
        markAttachment: function markAttachment(mark) {
          this.attachments.map(function (a) {
            return a.mark = false;
          });
          this.mark = !!mark;
        },
        markAll: function markAll() {
          var attachments = this.attachments;
          var markCount = 0;
          this.attachments.map(function (a) {
            if (a.mark) markCount++;
          });
          var mark = attachments.length !== markCount;
          this.attachments.map(function (a) {
            return a.mark = mark;
          });
        },
        getAttachments: function getAttachments() {
          this.request().then(function (data) {
            self.app.createFilePermission = data.createFilePermission;
            data.resources.map(function (r) {
              r.mark = false;
            });
            self.app.attachments = data.resources;
            self.app.loaded = true;
          })["catch"](function (err) {
            sweetError(err);
          });
        },
        request: function request() {
          var pid = this.pid;
          return nkcAPI("/p/".concat(pid, "/resources?t=attachment"), "GET");
        }
      }
    });
  }

  _createClass(_class, [{
    key: "hide",
    value: function hide() {
      this.app.hidden = true;
    }
  }, {
    key: "show",
    value: function show() {
      this.app.hidden = false;
    }
  }]);

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2F0dGFjaG1lbnRzL2F0dGFjaG1lbnRzLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaO0FBQ0Usa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUNuQixRQUFNLElBQUksR0FBRyxJQUFiO0FBRG1CLFFBRVosR0FGWSxHQUVBLE9BRkEsQ0FFWixHQUZZO0FBQUEsUUFFUCxHQUZPLEdBRUEsT0FGQSxDQUVQLEdBRk87QUFHbkIsUUFBRyxDQUFDLEdBQUosRUFBUyxPQUFPLFVBQVUsQ0FBQyxrQkFBRCxDQUFqQjtBQUNULFNBQUssR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLG9CQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxHQUFHLEVBQUgsR0FESTtBQUNDO0FBQ0wsUUFBQSxHQUFHLEVBQUgsR0FGSTtBQUVDO0FBQ0wsUUFBQSxNQUFNLEVBQUUsS0FISjtBQUdXO0FBQ2YsUUFBQSxJQUFJLEVBQUUsS0FKRjtBQUlTO0FBQ2IsUUFBQSxNQUFNLEVBQUUsS0FMSjtBQU1KLFFBQUEsb0JBQW9CLEVBQUUsS0FObEI7QUFNeUI7QUFDN0IsUUFBQSxXQUFXLEVBQUU7QUFQVCxPQUZXO0FBV2pCLE1BQUEsT0FYaUIscUJBV1A7QUFDUixhQUFLLGNBQUw7O0FBQ0EsWUFBRyxDQUFDLE1BQU0sQ0FBQyxZQUFYLEVBQXlCO0FBQ3ZCLGNBQUcsQ0FBQyxHQUFHLENBQUMsT0FBSixDQUFZLFlBQWhCLEVBQThCO0FBQzVCLFlBQUEsVUFBVSxDQUFDLFdBQUQsQ0FBVjtBQUNELFdBRkQsTUFFTztBQUNMLFlBQUEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsSUFBSSxHQUFHLENBQUMsT0FBSixDQUFZLFlBQWhCLEVBQXRCO0FBQ0Q7QUFDRjtB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QUQsQ0FBVjtBQUNELFdBWEg7QUFZRCxTQTVDTTtBQTZDUCxRQUFBLE9BN0NPLHFCQTZDRztBQUFBLGNBQ0QsR0FEQyxHQUNNLElBRE4sQ0FDRCxHQURDO0FBRVIsaUJBQU8sTUFBTSxjQUFPLEdBQVAsOEJBQXFDLEtBQXJDLENBQWI7QUFDRDtBQWhETTtBQTlCUSxLQUFSLENBQVg7QUFpRkQ7O0FBdEZIO0FBQUE7QUFBQSwyQkF1RlM7QUFDTCxXQUFLLEdBQUwsQ0FBUyxNQUFULEdBQWtCLElBQWxCO0FBQ0Q7QUF6Rkg7QUFBQTtBQUFBLDJCQTBGUztBQUNMLFdBQUssR0FBTCxDQUFTLE1BQVQsR0FBa0IsS0FBbEI7QUFDRDtBQTVGSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuQXR0YWNobWVudHMgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBjb25zdCB7cGlkLCBmaWR9ID0gb3B0aW9ucztcclxuICAgIGlmKCFwaWQpIHJldHVybiBzd2VldEVycm9yKFwi6ZmE5Lu25qih5Z2X5Yid5aeL5YyW5aSx6LSl77yMaWTkuI3og73kuLrnqbpcIik7XHJcbiAgICB0aGlzLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogXCIjbW9kdWxlQXR0YWNobWVudHNcIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHBpZCwgLy8gcG9zdCBJRFxyXG4gICAgICAgIGZpZCwgLy8g5a2Y5Zyo5paH5bqT55qE5LiT5LiaSUTvvIzlj6/og73kuLrnqbrjgILkuLrnqbrml7bkuI3lhYHorrjmjqjpgIHliLDmloflupNcclxuICAgICAgICBsb2FkZWQ6IGZhbHNlLCAvLyDmmK/lkKblt7Lnu4/liqDovb3lrozmiJBcclxuICAgICAgICBtYXJrOiBmYWxzZSwgLy8g5aSa6YCJXHJcbiAgICAgICAgaGlkZGVuOiBmYWxzZSxcclxuICAgICAgICBjcmVhdGVGaWxlUGVybWlzc2lvbjogZmFsc2UsIC8vIOaYr+WQpuacieadg+mZkOS4iuS8oOaWh+S7tuWIsOaWh+W6k1xyXG4gICAgICAgIGF0dGFjaG1lbnRzOiBbXVxyXG4gICAgICB9LFxyXG4gICAgICBtb3VudGVkKCkge1xyXG4gICAgICAgIHRoaXMuZ2V0QXR0YWNobWVudHMoKTtcclxuICAgICAgICBpZighd2luZG93LlJlc291cmNlSW5mbykge1xyXG4gICAgICAgICAgaWYoIU5LQy5tb2R1bGVzLlJlc291cmNlSW5mbykge1xyXG4gICAgICAgICAgICBzd2VldEVycm9yKFwi5pyq5byV5YWl6LWE5rqQ5L+h5oGv5qih5Z2XXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LlJlc291cmNlSW5mbyA9IG5ldyBOS0MubW9kdWxlcy5SZXNvdXJjZUluZm8oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgc2VsZWN0ZWRBdHRhY2htZW50Q291bnQoKSB7XHJcbiAgICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgICAgdGhpcy5hdHRhY2htZW50cy5tYXAoYSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGEubWFyaykgY291bnQgKys7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBjb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgICAgICBnZXRTaXplOiBOS0MubWV0aG9kcy50b29scy5nZXRTaXplLFxyXG4gICAgICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcclxuICAgICAgICBmb3JtYXQ6IE5LQy5tZXRob2RzLmZvcm1hdCxcclxuICAgICAgICBkaXNwbGF5UmVzb3VyY2VJbmZvKHIpIHtcclxuICAgICAgICAgIFJlc291cmNlSW5mby5vcGVuKHtyaWQ6IHIucmlkfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwb3N0VG9MaWJyYXJ5KCkge1xyXG4gICAgICAgICAgY29uc3Qge2F0dGFjaG1lbnRzfSA9IHRoaXM7XHJcbiAgICAgICAgICBsZXQgcmlkID0gW107XHJcbiAgICAgICAgICBhdHRhY2htZW50cy5tYXAoYSA9PiB7XHJcbiAgICAgICAgICAgIGlmKGEubWFyaykgcmlkLnB1c2goYS5yaWQpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZihyaWQubGVuZ3RoID09PSAwKSByZXR1cm47XHJcbiAgICAgICAgICByaWQgPSByaWQuam9pbihcIi1cIik7XHJcbiAgICAgICAgICB0aGlzLnZpc2l0VXJsKGAvZi8ke2ZpZH0vbGlicmFyeT90PXVwbG9hZCZpZD0ke3JpZH1gLCB0cnVlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hcmtBdHRhY2htZW50KG1hcmspIHtcclxuICAgICAgICAgIHRoaXMuYXR0YWNobWVudHMubWFwKGEgPT4gYS5tYXJrID0gZmFsc2UpO1xyXG4gICAgICAgICAgdGhpcy5tYXJrID0gISFtYXJrO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFya0FsbCgpIHtcclxuICAgICAgICAgIGNvbnN0IHthdHRhY2htZW50c30gPSB0aGlzO1xyXG4gICAgICAgICAgbGV0IG1hcmtDb3VudCA9IDA7XHJcbiAgICAgICAgICB0aGlzLmF0dGFjaG1lbnRzLm1hcChhID0+IHtcclxuICAgICAgICAgICAgaWYoYS5tYXJrKSBtYXJrQ291bnQrKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgY29uc3QgbWFyayA9IGF0dGFjaG1lbnRzLmxlbmd0aCAhPT0gbWFya0NvdW50O1xyXG4gICAgICAgICAgdGhpcy5hdHRhY2htZW50cy5tYXAoYSA9PiBhLm1hcmsgPSBtYXJrKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0QXR0YWNobWVudHMoKSB7XHJcbiAgICAgICAgICB0aGlzLnJlcXVlc3QoKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5jcmVhdGVGaWxlUGVybWlzc2lvbiA9IGRhdGEuY3JlYXRlRmlsZVBlcm1pc3Npb247XHJcbiAgICAgICAgICAgICAgZGF0YS5yZXNvdXJjZXMubWFwKHIgPT4ge1xyXG4gICAgICAgICAgICAgICAgci5tYXJrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuYXR0YWNobWVudHMgPSBkYXRhLnJlc291cmNlcztcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXF1ZXN0KCkge1xyXG4gICAgICAgICAgY29uc3Qge3BpZH0gPSB0aGlzO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSShgL3AvJHtwaWR9L3Jlc291cmNlcz90PWF0dGFjaG1lbnRgLCBcIkdFVFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBoaWRlKCkge1xyXG4gICAgdGhpcy5hcHAuaGlkZGVuID0gdHJ1ZTtcclxuICB9XHJcbiAgc2hvdygpIHtcclxuICAgIHRoaXMuYXBwLmhpZGRlbiA9IGZhbHNlO1xyXG4gIH1cclxufTsiXX0=
