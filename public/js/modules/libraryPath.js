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
        warning: "",
        folder: "",
        originFolders: []
      },
      computed: {
        originFoldersId: function originFoldersId() {
          return this.originFolders.map(function (f) {
            return f._id;
          });
        },
        selectedFolderId: function selectedFolderId() {
          if (this.folder) return this.folder._id;
        },
        // 计算高亮横排的行数
        activeLine: function activeLine() {
          var folders = this.folders,
              folder = this.folder;
          var line = 0;

          var func = function func(arr) {
            for (var i = 0; i < arr.length; i++) {
              var a = arr[i];
              line++;

              if (a._id === folder._id) {
                return;
              } else if (a.folders && a.folders.length) {
                return func(a.folders);
              }
            }
          };

          func(folders);
          return line;
        },
        nav: function nav() {
          if (!this.folder) return;
          return this.getFolderNav(this.folder);
        },
        path: function path() {
          if (!this.nav) return;
          return "/" + this.nav.map(function (n) {
            return n.name;
          }).join("/");
        }
      },
      methods: {
        getFolderNav: function getFolderNav(folder) {
          var originFolders = this.originFolders;
          var lid = folder.lid;
          var nav = [folder];

          while (lid) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = originFolders[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var f = _step.value;
                if (f._id !== lid) continue;
                nav.unshift(f);
                lid = f.lid;
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }

          return nav;
        },
        // 存入源文件夹数组
        saveToOrigin: function saveToOrigin(folders) {
          var _self$app = self.app,
              originFoldersId = _self$app.originFoldersId,
              originFolders = _self$app.originFolders;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = folders[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var folder = _step2.value;
              if (!originFoldersId.includes(folder._id)) originFolders.push(folder);

              var _folder$folders = folder.folders,
                  _folders = _folder$folders === void 0 ? [] : _folder$folders;

              self.app.saveToOrigin(_folders);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        },
        // 滚动到高亮处
        scrollToActive: function scrollToActive() {
          var _this = this;

          setTimeout(function () {
            var line = _this.activeLine;
            line -= 3;
            line = line > 0 ? line : 0;
            var height = 30 * line; // 每一横排占30px(与css设置有关，若css改动则此处也需要做相应调整。)

            var listBody = _this.$refs.listBody;
            NKC.methods.scrollTo({
              dom: listBody,
              top: height,
              behavior: "smooth"
            });
          }, 100);
        },
        // 点击确定
        submit: function submit() {
          if (!this.folder) return;
          self.callback({
            folder: this.folder,
            nav: this.nav,
            path: this.path
          });
          this.close();
        },
        // 展开文件夹
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
        // 选择文件夹
        selectFolder: function selectFolder(f) {
          this.folder = f;
        },
        // 加载文件夹列表
        // 默认只加载顶层文件夹
        // 可通过lid加载指定的文件夹，并自动定位、展开上级目录
        initFolders: function initFolders(lid) {
          var url = "/library?type=init&lid=".concat(lid, "&t=").concat(Date.now());
          nkcAPI(url, "GET").then(function (data) {
            self.app.folders = data.folders;
            self.app.folder = data.folder;
            self.app.saveToOrigin(data.folders);

            if (lid) {
              self.app.scrollToActive();
            }
          })["catch"](function (data) {
            sweetError(data);
          });
        },
        getFolders: function getFolders(folder) {
          var url;

          if (folder) {
            url = "/library?type=getFolders&lid=".concat(folder._id, "&t=").concat(Date.now());
          } else {
            url = "/library?type=getFolders&t=".concat(Date.now());
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

            self.app.saveToOrigin(data.folders);
          })["catch"](function (data) {
            if (folder) folder.close = true;
            sweetError(data);
          });
        },
        open: function open() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var lid = options.lid,
              _options$warning = options.warning,
              warning = _options$warning === void 0 ? "" : _options$warning;
          this.warning = warning;

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