"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.LibraryPath =
/*#__PURE__*/
function () {
  function _class() {
    _classCallCheck(this, _class);

    var self = this;
    self.dom = $("#moduleLibraryPath");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: "#moduleLibraryPathApp",
      data: {
        folders: [],
        folder: ""
      },
      computed: {
        selectedFolderId: function selectedFolderId() {
          if (this.folder) return this.folder._id;
        }
      },
      mounted: function mounted() {},
      methods: {
        submit: function submit() {
          var _this = this;

          if (!this.folder) return;
          nkcAPI("/library/".concat(this.folder._id, "?path=true&t=").concat(Date.now()), "GET").then(function (data) {
            self.callback({
              folder: _this.folder,
              folderPath: data.path
            });

            _this.close();
          })["catch"](function (data) {
            sweetError(data);
          });
        },
        switchFolder: function switchFolder(f) {
          this.selectFolder(f);

          if (f.close) {
            f.close = false; // 加载下层文件夹

            if (!f.loaded) {
              this.getFolders(f);
            }
          } else {
            f.close = true;
          }
        },
        selectFolder: function selectFolder(f) {
          this.folder = f;
        },
        initFolders: function initFolders(lid) {
          var url = "/library?type=init&lid=".concat(lid);
          nkcAPI(url, "GET").then(function (data) {
            self.app.folders = data.folders;
            self.app.folder = data.folder;
          })["catch"](function (data) {
            sweetError(data);
          });
        },
        getFolders: function getFolders(folder) {
          var url;

          if (folder) {
            url = "/library?type=getFolders&lid=".concat(folder._id);
          } else {
            url = "/library?type=getFolders";
          }

          nkcAPI(url, "GET").then(function (data) {
            if (folder) folder.loaded = true;
            data.folders.map(function (f) {
              f.close = true;
              f.loaded = false;
              f.folders = [];

              if (folder) {
                f.parent = folder;
              }
            });

            if (folder) {
              folder.folders = data.folders;
            } else {
              self.app.folders = data.folders;
            }
          })["catch"](function (data) {
            if (folder) folder.close = true;
            sweetError(data);
          });
        },
        open: function open() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var lid = options.lid;

          if (lid) {
            this.folder = "";
            this.initFolders(lid);
          } else {
            if (!this.folders || !this.folders.length) {
              this.getFolders();
            }
          }

          self.dom.modal("show");
        },
        close: function close() {
          self.dom.modal("hide");
        }
      }
    });
  }

  _createClass(_class, [{
    key: "open",
    value: function open(callback, options) {
      this.callback = callback;
      this.app.open(options);
    }
  }, {
    key: "close",
    value: function close() {
      this.app.close();
    }
  }]);

  return _class;
}();