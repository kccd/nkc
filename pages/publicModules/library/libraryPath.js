(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

NKC.modules.LibraryPath = /*#__PURE__*/function () {
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
        uid: NKC.configs.uid,
        folders: [],
        warning: "",
        folder: "",
        originFolders: [],
        permission: [],
        form: {
          type: "",
          folder: "",
          name: "",
          description: ""
        }
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
        per: function per(name) {
          return this.permission.includes(name);
        },
        submitForm: function submitForm() {
          var form = this.form;
          var type = form.type,
              folder = form.folder,
              name = form.name,
              description = form.description;
          var method, url;

          if (type === "create") {
            method = "POST";
            url = "/library/".concat(folder._id, "/list");
          } else {
            method = "PUT";
            url = "/library/".concat(folder._id);
          }

          nkcAPI(url, method, {
            name: name,
            description: description
          }).then(function () {
            self.app.form.folder = "";

            if (type === "create") {
              folder.close = true;
              folder.loaded = false;
              folder.folderCount = (folder.folderCount || 0) + 1;
              self.app.switchFolder(folder);
            } else {
              folder.name = name;
              folder.description = description;
            }
          })["catch"](function (err) {
            sweetError(err);
          });
        },
        toForm: function toForm(type, folder) {
          this.form.type = type;

          if (type === "modify") {
            this.form.name = folder.name;
            this.form.description = folder.description;
          } else {
            this.form.name = "";
            this.form.description = "";
          }

          this.form.folder = folder;
        },
        getFolderNav: function getFolderNav(folder) {
          var originFolders = this.originFolders;
          var lid = folder.lid;
          var nav = [folder];

          while (lid) {
            var _iterator = _createForOfIteratorHelper(originFolders),
                _step;

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var f = _step.value;
                if (f._id !== lid) continue;
                nav.unshift(f);
                lid = f.lid;
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          }

          return nav;
        },
        // 存入源文件夹数组
        saveToOrigin: function saveToOrigin(folders) {
          var _self$app = self.app,
              originFoldersId = _self$app.originFoldersId,
              originFolders = _self$app.originFolders;

          var _iterator2 = _createForOfIteratorHelper(folders),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var folder = _step2.value;
              if (!originFoldersId.includes(folder._id)) originFolders.push(folder);

              var _folder$folders = folder.folders,
                  _folders = _folder$folders === void 0 ? [] : _folder$folders;

              self.app.saveToOrigin(_folders);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
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
            NKC.methods.scrollTop(listBody, height);
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
            self.app.permission = data.permission;
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
            self.app.permission = data.permission;
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2xpYnJhcnkvbGlicmFyeVBhdGgubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVo7QUFDRSxvQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLG9CQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx1QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FEYjtBQUVKLFFBQUEsT0FBTyxFQUFFLEVBRkw7QUFHSixRQUFBLE9BQU8sRUFBRSxFQUhMO0FBSUosUUFBQSxNQUFNLEVBQUUsRUFKSjtBQUtKLFFBQUEsYUFBYSxFQUFFLEVBTFg7QUFNSixRQUFBLFVBQVUsRUFBRSxFQU5SO0FBT0osUUFBQSxJQUFJLEVBQUU7QUFDSixVQUFBLElBQUksRUFBRSxFQURGO0FBRUosVUFBQSxNQUFNLEVBQUUsRUFGSjtBQUdKLFVBQUEsSUFBSSxFQUFFLEVBSEY7QUFJSixVQUFBLFdBQVcsRUFBRTtBQUpUO0FBUEYsT0FGVztBQWdCakIsTUFBQSxRQUFRLEVBQUU7QUFDUixRQUFBLGVBRFEsNkJBQ1U7QUFDaEIsaUJBQU8sS0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLFVBQUEsQ0FBQztBQUFBLG1CQUFJLENBQUMsQ0FBQyxHQUFOO0FBQUEsV0FBeEIsQ0FBUDtBQUNELFNBSE87QUFJUixRQUFBLGdCQUpRLDhCQUlXO0FBQ2pCLGNBQUcsS0FBSyxNQUFSLEVBQWdCLE9BQU8sS0FBSyxNQUFMLENBQVksR0FBbkI7QUFDakIsU0FOTztBQU9SO0FBQ0EsUUFBQSxVQVJRLHdCQVFLO0FBQUEsY0FDSixPQURJLEdBQ2UsSUFEZixDQUNKLE9BREk7QUFBQSxjQUNLLE1BREwsR0FDZSxJQURmLENBQ0ssTUFETDtBQUVYLGNBQUksSUFBSSxHQUFHLENBQVg7O0FBQ0EsY0FBTSxJQUFJLEdBQUcsU0FBUCxJQUFPLENBQUMsR0FBRCxFQUFTO0FBQ3BCLGlCQUFJLElBQUksQ0FBQyxHQUFHLENBQVosRUFBZSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQXZCLEVBQStCLENBQUMsRUFBaEMsRUFBb0M7QUFDbEMsa0JBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFELENBQWI7QUFDQSxjQUFBLElBQUk7O0FBQ0osa0JBQUcsQ0FBQyxDQUFDLEdBQUYsS0FBVSxNQUFNLENBQUMsR0FBcEIsRUFBeUI7QUFDdkI7QUFDRCxlQUZELE1BRU8sSUFBRyxDQUFDLENBQUMsT0FBRixJQUFhLENBQUMsQ0FBQyxPQUFGLENBQVUsTUFBMUIsRUFBa0M7QUFDdkMsdUJBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFILENBQVg7QUFDRDtBQUNGO0FBQ0YsV0FWRDs7QUFXQSxVQUFBLElBQUksQ0FBQyxPQUFELENBQUo7QUFDQSxpQkFBTyxJQUFQO0FBQ0QsU0F4Qk87QUF5QlIsUUFBQSxHQXpCUSxpQkF5QkY7QUFDSixjQUFHLENBQUMsS0FBSyxNQUFULEVBQWlCO0FBQ2pCLGlCQUFPLEtBQUssWUFBTCxDQUFrQixLQUFLLE1BQXZCLENBQVA7QUFDRCxTQTVCTztBQTZCUixRQUFBLElBN0JRLGtCQTZCRDtBQUNMLGNBQUcsQ0FBQyxLQUFLLEdBQVQsRUFBYztBQUNkLGlCQUFPLE1BQU0sS0FBSyxHQUFMLENBQVMsR0FBVCxDQUFhLFVBQUEsQ0FBQztBQUFBLG1CQUFJLENBQUMsQ0FBQyxJQUFOO0FBQUEsV0FBZCxFQUEwQixJQUExQixDQUErQixHQUEvQixDQUFiO0FBQ0Q7QUFoQ08sT0FoQk87QUFrRGpCLE1BQUEsT0FBTyxFQUFFO0FBQ1AsUUFBQSxHQURPLGVBQ0gsSUFERyxFQUNHO0FBQ1IsaUJBQU8sS0FBSyxVQUFMLENBQWdCLFFBQWhCLENBQXlCLElBQXpCLENBQVA7QUFDRCxTQUhNO0FBSVAsUUFBQSxVQUpPLHdCQUlNO0FBQ1gsY0FBTSxJQUFJLEdBQUcsS0FBSyxJQUFsQjtBQURXLGNBRUosSUFGSSxHQUUrQixJQUYvQixDQUVKLElBRkk7QUFBQSxjQUVFLE1BRkYsR0FFK0IsSUFGL0IsQ0FFRSxNQUZGO0FBQUEsY0FFVSxJQUZWLEdBRStCLElBRi9CLENBRVUsSUFGVjtBQUFBLGNBRWdCLFdBRmhCLEdBRStCLElBRi9CLENBRWdCLFdBRmhCO0FBSVgsY0FBSSxNQUFKLEVBQVksR0FBWjs7QUFDQSxjQUFHLElBQUksS0FBSyxRQUFaLEVBQXNCO0FBQ3BCLFlBQUEsTUFBTSxHQUFHLE1BQVQ7QUFDQSxZQUFBLEdBQUcsc0JBQWUsTUFBTSxDQUFDLEdBQXRCLFVBQUg7QUFDRCxXQUhELE1BR087QUFDTCxZQUFBLE1BQU0sR0FBRyxLQUFUO0FBQ0EsWUFBQSxHQUFHLHNCQUFlLE1BQU0sQ0FBQyxHQUF0QixDQUFIO0FBQ0Q7O0FBQ0QsVUFBQSxNQUFNLENBQUMsR0FBRCxFQUFNLE1BQU4sRUFBYztBQUNsQixZQUFBLElBQUksRUFBSixJQURrQjtBQUVsQixZQUFBLFdBQVcsRUFBWDtBQUZrQixXQUFkLENBQU4sQ0FJRyxJQUpILENBSVEsWUFBTTtBQUNWLFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQWMsTUFBZCxHQUF1QixFQUF2Qjs7QUFDQSxnQkFBRyxJQUFJLEtBQUssUUFBWixFQUFzQjtBQUNwQixjQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBZjtBQUNBLGNBQUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsS0FBaEI7QUFDQSxjQUFBLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLENBQUMsTUFBTSxDQUFDLFdBQVAsSUFBc0IsQ0FBdkIsSUFBNEIsQ0FBakQ7QUFDQSxjQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsWUFBVCxDQUFzQixNQUF0QjtBQUNELGFBTEQsTUFLTztBQUNMLGNBQUEsTUFBTSxDQUFDLElBQVAsR0FBYyxJQUFkO0FBQ0EsY0FBQSxNQUFNLENBQUMsV0FBUCxHQUFxQixXQUFyQjtBQUNEO0FBRUYsV0FoQkgsV0FpQlMsVUFBQSxHQUFHLEVBQUk7QUFDWixZQUFBLFVBQVUsQ0FBQyxHQUFELENBQVY7QUFDRCxXQW5CSDtBQW9CRCxTQXBDTTtBQXFDUCxRQUFBLE1BckNPLGtCQXFDQSxJQXJDQSxFQXFDTSxNQXJDTixFQXFDYztBQUNuQixlQUFLLElBQUwsQ0FBVSxJQUFWLEdBQWlCLElBQWpCOztBQUNBLGNBQUcsSUFBSSxLQUFLLFFBQVosRUFBc0I7QUFDcEIsaUJBQUssSUFBTCxDQUFVLElBQVYsR0FBaUIsTUFBTSxDQUFDLElBQXhCO0FBQ0EsaUJBQUssSUFBTCxDQUFVLFdBQVYsR0FBd0IsTUFBTSxDQUFDLFdBQS9CO0FBQ0QsV0FIRCxNQUdPO0FBQ0wsaUJBQUssSUFBTCxDQUFVLElBQVYsR0FBaUIsRUFBakI7QUFDQSxpQkFBSyxJQUFMLENBQVUsV0FBVixHQUF3QixFQUF4QjtBQUNEOztBQUNELGVBQUssSUFBTCxDQUFVLE1BQVYsR0FBbUIsTUFBbkI7QUFDRCxTQS9DTTtBQWdEUCxRQUFBLFlBaERPLHdCQWdETSxNQWhETixFQWdEYztBQUFBLGNBQ1osYUFEWSxHQUNLLElBREwsQ0FDWixhQURZO0FBRW5CLGNBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFqQjtBQUNBLGNBQU0sR0FBRyxHQUFHLENBQUMsTUFBRCxDQUFaOztBQUNBLGlCQUFNLEdBQU4sRUFBVztBQUFBLHVEQUNNLGFBRE47QUFBQTs7QUFBQTtBQUNULGtFQUE4QjtBQUFBLG9CQUFwQixDQUFvQjtBQUM1QixvQkFBRyxDQUFDLENBQUMsR0FBRixLQUFVLEdBQWIsRUFBa0I7QUFDbEIsZ0JBQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxDQUFaO0FBQ0EsZ0JBQUEsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFSO0FBQ0Q7QUFMUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTVY7O0FBQ0QsaUJBQU8sR0FBUDtBQUNELFNBNURNO0FBNkRQO0FBQ0EsUUFBQSxZQTlETyx3QkE4RE0sT0E5RE4sRUE4RGU7QUFBQSwwQkFDcUIsSUFBSSxDQUFDLEdBRDFCO0FBQUEsY0FDYixlQURhLGFBQ2IsZUFEYTtBQUFBLGNBQ0ksYUFESixhQUNJLGFBREo7O0FBQUEsc0RBRUEsT0FGQTtBQUFBOztBQUFBO0FBRXBCLG1FQUE2QjtBQUFBLGtCQUFuQixNQUFtQjtBQUMzQixrQkFBRyxDQUFDLGVBQWUsQ0FBQyxRQUFoQixDQUF5QixNQUFNLENBQUMsR0FBaEMsQ0FBSixFQUEwQyxhQUFhLENBQUMsSUFBZCxDQUFtQixNQUFuQjs7QUFEZixvQ0FFSixNQUZJLENBRXBCLE9BRm9CO0FBQUEsa0JBRXBCLFFBRm9CLGdDQUVWLEVBRlU7O0FBRzNCLGNBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxZQUFULENBQXNCLFFBQXRCO0FBQ0Q7QUFObUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU9yQixTQXJFTTtBQXNFUDtBQUNBLFFBQUEsY0F2RU8sNEJBdUVVO0FBQUE7O0FBQ2YsVUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLGdCQUFJLElBQUksR0FBRyxLQUFJLENBQUMsVUFBaEI7QUFDQSxZQUFBLElBQUksSUFBSSxDQUFSO0FBQ0EsWUFBQSxJQUFJLEdBQUcsSUFBSSxHQUFDLENBQUwsR0FBTyxJQUFQLEdBQWEsQ0FBcEI7QUFDQSxnQkFBTSxNQUFNLEdBQUcsS0FBRyxJQUFsQixDQUplLENBSVM7O0FBQ3hCLGdCQUFNLFFBQVEsR0FBRyxLQUFJLENBQUMsS0FBTCxDQUFXLFFBQTVCO0FBQ0EsWUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLFNBQVosQ0FBc0IsUUFBdEIsRUFBZ0MsTUFBaEM7QUFDRCxXQVBTLEVBT1AsR0FQTyxDQUFWO0FBUUQsU0FoRk07QUFpRlA7QUFDQSxRQUFBLE1BbEZPLG9CQWtGRTtBQUNQLGNBQUcsQ0FBQyxLQUFLLE1BQVQsRUFBaUI7QUFDakIsVUFBQSxJQUFJLENBQUMsUUFBTCxDQUFjO0FBQ1osWUFBQSxNQUFNLEVBQUUsS0FBSyxNQUREO0FBRVosWUFBQSxHQUFHLEVBQUUsS0FBSyxHQUZFO0FBR1osWUFBQSxJQUFJLEVBQUUsS0FBSztBQUhDLFdBQWQ7QUFLQSxlQUFLLEtBQUw7QUFDRCxTQTFGTTtBQTJGUDtBQUNBLFFBQUEsWUE1Rk8sd0JBNEZNLENBNUZOLEVBNEZTO0FBQ2QsZUFBSyxZQUFMLENBQWtCLENBQWxCOztBQUNBLGNBQUcsQ0FBQyxDQUFDLEtBQUwsRUFBWTtBQUNWLFlBQUEsQ0FBQyxDQUFDLEtBQUYsR0FBVSxLQUFWLENBRFUsQ0FFVjs7QUFDQSxnQkFBRyxDQUFDLENBQUMsQ0FBQyxNQUFOLEVBQWM7QUFDWixtQkFBSyxVQUFMLENBQWdCLENBQWhCO0FBQ0Q7QUFDRixXQU5ELE1BTU87QUFDTCxZQUFBLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBVjtBQUNEO0FBQ0YsU0F2R007QUF3R1A7QUFDQSxRQUFBLFlBekdPLHdCQXlHTSxDQXpHTixFQXlHUztBQUNkLGVBQUssTUFBTCxHQUFjLENBQWQ7QUFDRCxTQTNHTTtBQTRHUDtBQUNBO0FBQ0E7QUFDQSxRQUFBLFdBL0dPLHVCQStHSyxHQS9HTCxFQStHVTtBQUNmLGNBQU0sR0FBRyxvQ0FBNkIsR0FBN0IsZ0JBQXNDLElBQUksQ0FBQyxHQUFMLEVBQXRDLENBQVQ7QUFDQSxVQUFBLE1BQU0sQ0FBQyxHQUFELEVBQU0sS0FBTixDQUFOLENBQ0csSUFESCxDQUNRLFVBQUEsSUFBSSxFQUFJO0FBQ1osWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQVQsR0FBbUIsSUFBSSxDQUFDLE9BQXhCO0FBQ0EsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsR0FBa0IsSUFBSSxDQUFDLE1BQXZCO0FBQ0EsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFVBQVQsR0FBc0IsSUFBSSxDQUFDLFVBQTNCO0FBQ0EsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFlBQVQsQ0FBc0IsSUFBSSxDQUFDLE9BQTNCOztBQUNBLGdCQUFHLEdBQUgsRUFBUTtBQUNOLGNBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxjQUFUO0FBQ0Q7QUFDRixXQVRILFdBVVMsVUFBQSxJQUFJLEVBQUk7QUFDYixZQUFBLFVBQVUsQ0FBQyxJQUFELENBQVY7QUFDRCxXQVpIO0FBYUQsU0E5SE07QUErSFAsUUFBQSxVQS9ITyxzQkErSEksTUEvSEosRUErSFk7QUFDakIsY0FBSSxHQUFKOztBQUNBLGNBQUcsTUFBSCxFQUFXO0FBQ1QsWUFBQSxHQUFHLDBDQUFtQyxNQUFNLENBQUMsR0FBMUMsZ0JBQW1ELElBQUksQ0FBQyxHQUFMLEVBQW5ELENBQUg7QUFDRCxXQUZELE1BRU87QUFDTCxZQUFBLEdBQUcsd0NBQWlDLElBQUksQ0FBQyxHQUFMLEVBQWpDLENBQUg7QUFDRDs7QUFDRCxVQUFBLE1BQU0sQ0FBQyxHQUFELEVBQU0sS0FBTixDQUFOLENBQ0csSUFESCxDQUNRLFVBQUMsSUFBRCxFQUFVO0FBQ2QsWUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFVBQVQsR0FBc0IsSUFBSSxDQUFDLFVBQTNCO0FBQ0EsZ0JBQUcsTUFBSCxFQUFXLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQWhCO0FBQ1gsWUFBQSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBaUIsVUFBQSxDQUFDLEVBQUk7QUFDcEIsY0FBQSxDQUFDLENBQUMsS0FBRixHQUFVLElBQVY7QUFDQSxjQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVcsS0FBWDtBQUNBLGNBQUEsQ0FBQyxDQUFDLE9BQUYsR0FBWSxFQUFaOztBQUNBLGtCQUFHLE1BQUgsRUFBVztBQUNULGdCQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVcsTUFBWDtBQUNEO0FBQ0YsYUFQRDs7QUFRQSxnQkFBRyxNQUFILEVBQVc7QUFDVCxjQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUksQ0FBQyxPQUF0QjtBQUNELGFBRkQsTUFFTztBQUNMLGNBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEdBQW1CLElBQUksQ0FBQyxPQUF4QjtBQUNEOztBQUNELFlBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxZQUFULENBQXNCLElBQUksQ0FBQyxPQUEzQjtBQUNELFdBbEJILFdBbUJTLFVBQUMsSUFBRCxFQUFVO0FBQ2YsZ0JBQUcsTUFBSCxFQUFXLE1BQU0sQ0FBQyxLQUFQLEdBQWUsSUFBZjtBQUNYLFlBQUEsVUFBVSxDQUFDLElBQUQsQ0FBVjtBQUNELFdBdEJIO0FBdUJELFNBN0pNO0FBOEpQLFFBQUEsSUE5Sk8sa0JBOEpZO0FBQUEsY0FBZCxPQUFjLHVFQUFKLEVBQUk7QUFBQSxjQUNWLEdBRFUsR0FDVyxPQURYLENBQ1YsR0FEVTtBQUFBLGlDQUNXLE9BRFgsQ0FDTCxPQURLO0FBQUEsY0FDTCxPQURLLGlDQUNLLEVBREw7QUFFakIsZUFBSyxPQUFMLEdBQWUsT0FBZjs7QUFDQSxjQUFHLEdBQUgsRUFBUTtBQUNOLGlCQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixHQUFqQjtBQUNELFdBSEQsTUFHTztBQUNMLGdCQUFHLENBQUMsS0FBSyxPQUFOLElBQWlCLENBQUMsS0FBSyxPQUFMLENBQWEsTUFBbEMsRUFBMEM7QUFDeEMsbUJBQUssVUFBTDtBQUNEO0FBQ0Y7O0FBQ0QsVUFBQSxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFmO0FBQ0QsU0ExS007QUEyS1AsUUFBQSxLQTNLTyxtQkEyS0M7QUFDTixVQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLE1BQWY7QUFDRDtBQTdLTTtBQWxEUSxLQUFSLENBQVg7QUFrT0Q7O0FBMU9IO0FBQUE7QUFBQSx5QkEyT08sUUEzT1AsRUEyT2lCLE9BM09qQixFQTJPMEI7QUFDdEIsV0FBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsV0FBSyxHQUFMLENBQVMsSUFBVCxDQUFjLE9BQWQ7QUFDRDtBQTlPSDtBQUFBO0FBQUEsNEJBK09VO0FBQ04sV0FBSyxHQUFMLENBQVMsS0FBVDtBQUNEO0FBalBIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5MaWJyYXJ5UGF0aCA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5kb20gPSAkKFwiI21vZHVsZUxpYnJhcnlQYXRoXCIpO1xyXG4gICAgc2VsZi5kb20ubW9kYWwoe1xyXG4gICAgICBzaG93OiBmYWxzZSxcclxuICAgICAgYmFja2Ryb3A6IFwic3RhdGljXCJcclxuICAgIH0pO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZUxpYnJhcnlQYXRoQXBwXCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcclxuICAgICAgICBmb2xkZXJzOiBbXSxcclxuICAgICAgICB3YXJuaW5nOiBcIlwiLFxyXG4gICAgICAgIGZvbGRlcjogXCJcIixcclxuICAgICAgICBvcmlnaW5Gb2xkZXJzOiBbXSxcclxuICAgICAgICBwZXJtaXNzaW9uOiBbXSxcclxuICAgICAgICBmb3JtOiB7XHJcbiAgICAgICAgICB0eXBlOiBcIlwiLFxyXG4gICAgICAgICAgZm9sZGVyOiBcIlwiLFxyXG4gICAgICAgICAgbmFtZTogXCJcIixcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIG9yaWdpbkZvbGRlcnNJZCgpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLm9yaWdpbkZvbGRlcnMubWFwKGYgPT4gZi5faWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0ZWRGb2xkZXJJZCgpIHtcclxuICAgICAgICAgIGlmKHRoaXMuZm9sZGVyKSByZXR1cm4gdGhpcy5mb2xkZXIuX2lkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6K6h566X6auY5Lqu5qiq5o6S55qE6KGM5pWwXHJcbiAgICAgICAgYWN0aXZlTGluZSgpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb2xkZXJzLCBmb2xkZXJ9ID0gdGhpcztcclxuICAgICAgICAgIGxldCBsaW5lID0gMDtcclxuICAgICAgICAgIGNvbnN0IGZ1bmMgPSAoYXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBjb25zdCBhID0gYXJyW2ldO1xyXG4gICAgICAgICAgICAgIGxpbmUgKys7XHJcbiAgICAgICAgICAgICAgaWYoYS5faWQgPT09IGZvbGRlci5faWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYoYS5mb2xkZXJzICYmIGEuZm9sZGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jKGEuZm9sZGVycyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgZnVuYyhmb2xkZXJzKTtcclxuICAgICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmF2KCkge1xyXG4gICAgICAgICAgaWYoIXRoaXMuZm9sZGVyKSByZXR1cm47XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRGb2xkZXJOYXYodGhpcy5mb2xkZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGF0aCgpIHtcclxuICAgICAgICAgIGlmKCF0aGlzLm5hdikgcmV0dXJuO1xyXG4gICAgICAgICAgcmV0dXJuIFwiL1wiICsgdGhpcy5uYXYubWFwKG4gPT4gbi5uYW1lKS5qb2luKFwiL1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBwZXIobmFtZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMucGVybWlzc2lvbi5pbmNsdWRlcyhuYW1lKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1Ym1pdEZvcm0oKSB7XHJcbiAgICAgICAgICBjb25zdCBmb3JtID0gdGhpcy5mb3JtO1xyXG4gICAgICAgICAgY29uc3Qge3R5cGUsIGZvbGRlciwgbmFtZSwgZGVzY3JpcHRpb259ID0gZm9ybTtcclxuXHJcbiAgICAgICAgICBsZXQgbWV0aG9kLCB1cmw7XHJcbiAgICAgICAgICBpZih0eXBlID09PSBcImNyZWF0ZVwiKSB7XHJcbiAgICAgICAgICAgIG1ldGhvZCA9IFwiUE9TVFwiO1xyXG4gICAgICAgICAgICB1cmwgPSBgL2xpYnJhcnkvJHtmb2xkZXIuX2lkfS9saXN0YDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1ldGhvZCA9IFwiUFVUXCI7XHJcbiAgICAgICAgICAgIHVybCA9IGAvbGlicmFyeS8ke2ZvbGRlci5faWR9YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5rY0FQSSh1cmwsIG1ldGhvZCwge1xyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZvcm0uZm9sZGVyID0gXCJcIjtcclxuICAgICAgICAgICAgICBpZih0eXBlID09PSBcImNyZWF0ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBmb2xkZXIuY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9sZGVyLmxvYWRlZCA9IGZhbHNlOyAgXHJcbiAgICAgICAgICAgICAgICBmb2xkZXIuZm9sZGVyQ291bnQgPSAoZm9sZGVyLmZvbGRlckNvdW50IHx8IDApICsgMTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnN3aXRjaEZvbGRlcihmb2xkZXIpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb2xkZXIubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICBmb2xkZXIuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvRm9ybSh0eXBlLCBmb2xkZXIpIHtcclxuICAgICAgICAgIHRoaXMuZm9ybS50eXBlID0gdHlwZTtcclxuICAgICAgICAgIGlmKHR5cGUgPT09IFwibW9kaWZ5XCIpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLm5hbWUgPSBmb2xkZXIubmFtZTtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmRlc2NyaXB0aW9uID0gZm9sZGVyLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLm5hbWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZGVzY3JpcHRpb24gPSBcIlwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5mb3JtLmZvbGRlciA9IGZvbGRlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZvbGRlck5hdihmb2xkZXIpIHtcclxuICAgICAgICAgIGNvbnN0IHtvcmlnaW5Gb2xkZXJzfSA9IHRoaXM7XHJcbiAgICAgICAgICBsZXQgbGlkID0gZm9sZGVyLmxpZDtcclxuICAgICAgICAgIGNvbnN0IG5hdiA9IFtmb2xkZXJdO1xyXG4gICAgICAgICAgd2hpbGUobGlkKSB7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBmIG9mIG9yaWdpbkZvbGRlcnMpIHtcclxuICAgICAgICAgICAgICBpZihmLl9pZCAhPT0gbGlkKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICBuYXYudW5zaGlmdChmKTtcclxuICAgICAgICAgICAgICBsaWQgPSBmLmxpZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5hdjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWtmOWFpea6kOaWh+S7tuWkueaVsOe7hFxyXG4gICAgICAgIHNhdmVUb09yaWdpbihmb2xkZXJzKSB7XHJcbiAgICAgICAgICBjb25zdCB7b3JpZ2luRm9sZGVyc0lkLCBvcmlnaW5Gb2xkZXJzfSA9IHNlbGYuYXBwO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZvbGRlciBvZiBmb2xkZXJzKSB7XHJcbiAgICAgICAgICAgIGlmKCFvcmlnaW5Gb2xkZXJzSWQuaW5jbHVkZXMoZm9sZGVyLl9pZCkpIG9yaWdpbkZvbGRlcnMucHVzaChmb2xkZXIpO1xyXG4gICAgICAgICAgICBjb25zdCB7Zm9sZGVycyA9IFtdfSA9IGZvbGRlcjtcclxuICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvT3JpZ2luKGZvbGRlcnMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5rua5Yqo5Yiw6auY5Lqu5aSEXHJcbiAgICAgICAgc2Nyb2xsVG9BY3RpdmUoKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmFjdGl2ZUxpbmU7XHJcbiAgICAgICAgICAgIGxpbmUgLT0gMztcclxuICAgICAgICAgICAgbGluZSA9IGxpbmU+MD9saW5lOiAwO1xyXG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSAzMCpsaW5lOyAvLyDmr4/kuIDmqKrmjpLljaAzMHB4KOS4jmNzc+iuvue9ruacieWFs++8jOiLpWNzc+aUueWKqOWImeatpOWkhOS5n+mcgOimgeWBmuebuOW6lOiwg+aVtOOAgilcclxuICAgICAgICAgICAgY29uc3QgbGlzdEJvZHkgPSB0aGlzLiRyZWZzLmxpc3RCb2R5O1xyXG4gICAgICAgICAgICBOS0MubWV0aG9kcy5zY3JvbGxUb3AobGlzdEJvZHksIGhlaWdodCk7XHJcbiAgICAgICAgICB9LCAxMDApXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDngrnlh7vnoa7lrppcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBpZighdGhpcy5mb2xkZXIpIHJldHVybjtcclxuICAgICAgICAgIHNlbGYuY2FsbGJhY2soe1xyXG4gICAgICAgICAgICBmb2xkZXI6IHRoaXMuZm9sZGVyLFxyXG4gICAgICAgICAgICBuYXY6IHRoaXMubmF2LFxyXG4gICAgICAgICAgICBwYXRoOiB0aGlzLnBhdGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5bGV5byA5paH5Lu25aS5XHJcbiAgICAgICAgc3dpdGNoRm9sZGVyKGYpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0Rm9sZGVyKGYpO1xyXG4gICAgICAgICAgaWYoZi5jbG9zZSkge1xyXG4gICAgICAgICAgICBmLmNsb3NlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIOWKoOi9veS4i+WxguaWh+S7tuWkuVxyXG4gICAgICAgICAgICBpZighZi5sb2FkZWQpIHtcclxuICAgICAgICAgICAgICB0aGlzLmdldEZvbGRlcnMoZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGYuY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oup5paH5Lu25aS5XHJcbiAgICAgICAgc2VsZWN0Rm9sZGVyKGYpIHtcclxuICAgICAgICAgIHRoaXMuZm9sZGVyID0gZjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWKoOi9veaWh+S7tuWkueWIl+ihqFxyXG4gICAgICAgIC8vIOm7mOiupOWPquWKoOi9vemhtuWxguaWh+S7tuWkuVxyXG4gICAgICAgIC8vIOWPr+mAmui/h2xpZOWKoOi9veaMh+WumueahOaWh+S7tuWkue+8jOW5tuiHquWKqOWumuS9jeOAgeWxleW8gOS4iue6p+ebruW9lVxyXG4gICAgICAgIGluaXRGb2xkZXJzKGxpZCkge1xyXG4gICAgICAgICAgY29uc3QgdXJsID0gYC9saWJyYXJ5P3R5cGU9aW5pdCZsaWQ9JHtsaWR9JnQ9JHtEYXRlLm5vdygpfWA7XHJcbiAgICAgICAgICBua2NBUEkodXJsLCBcIkdFVFwiKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZvbGRlciA9IGRhdGEuZm9sZGVyO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnBlcm1pc3Npb24gPSBkYXRhLnBlcm1pc3Npb247XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvT3JpZ2luKGRhdGEuZm9sZGVycyk7XHJcbiAgICAgICAgICAgICAgaWYobGlkKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5zY3JvbGxUb0FjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9sZGVycyhmb2xkZXIpIHtcclxuICAgICAgICAgIGxldCB1cmw7XHJcbiAgICAgICAgICBpZihmb2xkZXIpIHtcclxuICAgICAgICAgICAgdXJsID0gYC9saWJyYXJ5P3R5cGU9Z2V0Rm9sZGVycyZsaWQ9JHtmb2xkZXIuX2lkfSZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdXJsID0gYC9saWJyYXJ5P3R5cGU9Z2V0Rm9sZGVycyZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbmtjQVBJKHVybCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5wZXJtaXNzaW9uID0gZGF0YS5wZXJtaXNzaW9uO1xyXG4gICAgICAgICAgICAgIGlmKGZvbGRlcikgZm9sZGVyLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgZGF0YS5mb2xkZXJzLm1hcChmID0+IHtcclxuICAgICAgICAgICAgICAgIGYuY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZi5sb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGYuZm9sZGVycyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgIGYucGFyZW50ID0gZm9sZGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGlmKGZvbGRlcikge1xyXG4gICAgICAgICAgICAgICAgZm9sZGVyLmZvbGRlcnMgPSBkYXRhLmZvbGRlcnM7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLmZvbGRlcnMgPSBkYXRhLmZvbGRlcnM7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnNhdmVUb09yaWdpbihkYXRhLmZvbGRlcnMpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICBpZihmb2xkZXIpIGZvbGRlci5jbG9zZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW4ob3B0aW9ucyA9IHt9KSB7XHJcbiAgICAgICAgICBjb25zdCB7bGlkLCB3YXJuaW5nID0gXCJcIn0gPSBvcHRpb25zO1xyXG4gICAgICAgICAgdGhpcy53YXJuaW5nID0gd2FybmluZztcclxuICAgICAgICAgIGlmKGxpZCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvbGRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEZvbGRlcnMobGlkKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmZvbGRlcnMgfHwgIXRoaXMuZm9sZGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmdldEZvbGRlcnMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgb3BlbihjYWxsYmFjaywgb3B0aW9ucykge1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgdGhpcy5hcHAub3BlbihvcHRpb25zKTtcclxuICB9XHJcbiAgY2xvc2UoKSB7XHJcbiAgICB0aGlzLmFwcC5jbG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbiJdfQ==
