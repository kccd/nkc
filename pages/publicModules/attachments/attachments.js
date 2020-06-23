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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvYXR0YWNobWVudHMvYXR0YWNobWVudHMubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVo7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQ25CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFEbUIsUUFFWixHQUZZLEdBRUEsT0FGQSxDQUVaLEdBRlk7QUFBQSxRQUVQLEdBRk8sR0FFQSxPQUZBLENBRVAsR0FGTztBQUduQixRQUFHLENBQUMsR0FBSixFQUFTLE9BQU8sVUFBVSxDQUFDLGtCQUFELENBQWpCO0FBQ1QsU0FBSyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsb0JBRGE7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLEdBQUcsRUFBSCxHQURJO0FBQ0M7QUFDTCxRQUFBLEdBQUcsRUFBSCxHQUZJO0FBRUM7QUFDTCxRQUFBLE1BQU0sRUFBRSxLQUhKO0FBR1c7QUFDZixRQUFBLElBQUksRUFBRSxLQUpGO0FBSVM7QUFDYixRQUFBLE1BQU0sRUFBRSxLQUxKO0FBTUosUUFBQSxvQkFBb0IsRUFBRSxLQU5sQjtBQU15QjtBQUM3QixRQUFBLFdBQVcsRUFBRTtBQVBULE9BRlc7QUFXakIsTUFBQSxPQVhpQixxQkFXUDtBQUNSLGFBQUssY0FBTDs7QUFDQSxZQUFHLENBQUMsTUFBTSxDQUFDLFlBQVgsRUFBeUI7QUFDdkIsY0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFBaEIsRUFBOEI7QUFDNUIsWUFBQSxVQUFVLENBQUMsV0FBRCxDQUFWO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsWUFBQSxNQUFNLENBQUMsWUFBUCxHQUFzQixJQUFJLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFB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Q1osWUFBQSxVQUFVLENBQUMsR0FBRCxDQUFWO0FBQ0QsV0FYSDtBQVlELFNBNUNNO0FBNkNQLFFBQUEsT0E3Q08scUJBNkNHO0FBQUEsY0FDRCxHQURDLEdBQ00sSUFETixDQUNELEdBREM7QUFFUixpQkFBTyxNQUFNLGNBQU8sR0FBUCw4QkFBcUMsS0FBckMsQ0FBYjtBQUNEO0FBaERNO0FBOUJRLEtBQVIsQ0FBWDtBQWlGRDs7QUF0Rkg7QUFBQTtBQUFBLDJCQXVGUztBQUNMLFdBQUssR0FBTCxDQUFTLE1BQVQsR0FBa0IsSUFBbEI7QUFDRDtBQXpGSDtBQUFBO0FBQUEsMkJBMEZTO0FBQ0wsV0FBSyxHQUFMLENBQVMsTUFBVCxHQUFrQixLQUFsQjtBQUNEO0FBNUZIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5BdHRhY2htZW50cyA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIGNvbnN0IHtwaWQsIGZpZH0gPSBvcHRpb25zO1xyXG4gICAgaWYoIXBpZCkgcmV0dXJuIHN3ZWV0RXJyb3IoXCLpmYTku7bmqKHlnZfliJ3lp4vljJblpLHotKXvvIxpZOS4jeiDveS4uuepulwiKTtcclxuICAgIHRoaXMuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiBcIiNtb2R1bGVBdHRhY2htZW50c1wiLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgcGlkLCAvLyBwb3N0IElEXHJcbiAgICAgICAgZmlkLCAvLyDlrZjlnKjmloflupPnmoTkuJPkuJpJRO+8jOWPr+iDveS4uuepuuOAguS4uuepuuaXtuS4jeWFgeiuuOaOqOmAgeWIsOaWh+W6k1xyXG4gICAgICAgIGxvYWRlZDogZmFsc2UsIC8vIOaYr+WQpuW3sue7j+WKoOi9veWujOaIkFxyXG4gICAgICAgIG1hcms6IGZhbHNlLCAvLyDlpJrpgIlcclxuICAgICAgICBoaWRkZW46IGZhbHNlLFxyXG4gICAgICAgIGNyZWF0ZUZpbGVQZXJtaXNzaW9uOiBmYWxzZSwgLy8g5piv5ZCm5pyJ5p2D6ZmQ5LiK5Lyg5paH5Lu25Yiw5paH5bqTXHJcbiAgICAgICAgYXR0YWNobWVudHM6IFtdXHJcbiAgICAgIH0sXHJcbiAgICAgIG1vdW50ZWQoKSB7XHJcbiAgICAgICAgdGhpcy5nZXRBdHRhY2htZW50cygpO1xyXG4gICAgICAgIGlmKCF3aW5kb3cuUmVzb3VyY2VJbmZvKSB7XHJcbiAgICAgICAgICBpZighTktDLm1vZHVsZXMuUmVzb3VyY2VJbmZvKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXotYTmupDkv6Hmga/mqKHlnZdcIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuUmVzb3VyY2VJbmZvID0gbmV3IE5LQy5tb2R1bGVzLlJlc291cmNlSW5mbygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgY29tcHV0ZWQ6IHtcclxuICAgICAgICBzZWxlY3RlZEF0dGFjaG1lbnRDb3VudCgpIHtcclxuICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICB0aGlzLmF0dGFjaG1lbnRzLm1hcChhID0+IHtcclxuICAgICAgICAgICAgaWYoYS5tYXJrKSBjb3VudCArKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgICAgIGdldFNpemU6IE5LQy5tZXRob2RzLnRvb2xzLmdldFNpemUsXHJcbiAgICAgICAgdmlzaXRVcmw6IE5LQy5tZXRob2RzLnZpc2l0VXJsLFxyXG4gICAgICAgIGZvcm1hdDogTktDLm1ldGhvZHMuZm9ybWF0LFxyXG4gICAgICAgIGRpc3BsYXlSZXNvdXJjZUluZm8ocikge1xyXG4gICAgICAgICAgUmVzb3VyY2VJbmZvLm9wZW4oe3JpZDogci5yaWR9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBvc3RUb0xpYnJhcnkoKSB7XHJcbiAgICAgICAgICBjb25zdCB7YXR0YWNobWVudHN9ID0gdGhpcztcclxuICAgICAgICAgIGxldCByaWQgPSBbXTtcclxuICAgICAgICAgIGF0dGFjaG1lbnRzLm1hcChhID0+IHtcclxuICAgICAgICAgICAgaWYoYS5tYXJrKSByaWQucHVzaChhLnJpZCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmKHJpZC5sZW5ndGggPT09IDApIHJldHVybjtcclxuICAgICAgICAgIHJpZCA9IHJpZC5qb2luKFwiLVwiKTtcclxuICAgICAgICAgIHRoaXMudmlzaXRVcmwoYC9mLyR7ZmlkfS9saWJyYXJ5P3Q9dXBsb2FkJmlkPSR7cmlkfWAsIHRydWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFya0F0dGFjaG1lbnQobWFyaykge1xyXG4gICAgICAgICAgdGhpcy5hdHRhY2htZW50cy5tYXAoYSA9PiBhLm1hcmsgPSBmYWxzZSk7XHJcbiAgICAgICAgICB0aGlzLm1hcmsgPSAhIW1hcms7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtYXJrQWxsKCkge1xyXG4gICAgICAgICAgY29uc3Qge2F0dGFjaG1lbnRzfSA9IHRoaXM7XHJcbiAgICAgICAgICBsZXQgbWFya0NvdW50ID0gMDtcclxuICAgICAgICAgIHRoaXMuYXR0YWNobWVudHMubWFwKGEgPT4ge1xyXG4gICAgICAgICAgICBpZihhLm1hcmspIG1hcmtDb3VudCsrO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb25zdCBtYXJrID0gYXR0YWNobWVudHMubGVuZ3RoICE9PSBtYXJrQ291bnQ7XHJcbiAgICAgICAgICB0aGlzLmF0dGFjaG1lbnRzLm1hcChhID0+IGEubWFyayA9IG1hcmspXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRBdHRhY2htZW50cygpIHtcclxuICAgICAgICAgIHRoaXMucmVxdWVzdCgpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmNyZWF0ZUZpbGVQZXJtaXNzaW9uID0gZGF0YS5jcmVhdGVGaWxlUGVybWlzc2lvbjtcclxuICAgICAgICAgICAgICBkYXRhLnJlc291cmNlcy5tYXAociA9PiB7XHJcbiAgICAgICAgICAgICAgICByLm1hcmsgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5hdHRhY2htZW50cyA9IGRhdGEucmVzb3VyY2VzO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlcXVlc3QoKSB7XHJcbiAgICAgICAgICBjb25zdCB7cGlkfSA9IHRoaXM7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvcC8ke3BpZH0vcmVzb3VyY2VzP3Q9YXR0YWNobWVudGAsIFwiR0VUXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGhpZGUoKSB7XHJcbiAgICB0aGlzLmFwcC5oaWRkZW4gPSB0cnVlO1xyXG4gIH1cclxuICBzaG93KCkge1xyXG4gICAgdGhpcy5hcHAuaGlkZGVuID0gZmFsc2U7XHJcbiAgfVxyXG59OyJdfQ==
