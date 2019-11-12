"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.Attachments =
/*#__PURE__*/
function () {
  function _class(options) {
    _classCallCheck(this, _class);

    var self = this;
    var pid = options.pid;
    if (!pid) return sweetError("附件模块初始化失败，id不能为空");
    this.app = new Vue({
      el: "#moduleAttachments",
      data: {
        pid: pid,
        // post ID
        loaded: false,
        // 是否已经加载完成
        attachments: []
      },
      mounted: function mounted() {
        this.getAttachments();
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        getSize: NKC.methods.tools.getSize,
        visitUrl: NKC.methods.visitUrl,
        format: NKC.methods.format,
        getAttachments: function getAttachments() {
          this.request().then(function (data) {
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

  return _class;
}();