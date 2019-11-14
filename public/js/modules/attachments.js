"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.Attachments =
/*#__PURE__*/
function () {
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