(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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
            method = "PATCH";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvbGlicmFyeS9saWJyYXJ5UGF0aC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsb0JBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBSUEsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLHVCQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQURiO0FBRUosUUFBQSxPQUFPLEVBQUUsRUFGTDtBQUdKLFFBQUEsT0FBTyxFQUFFLEVBSEw7QUFJSixRQUFBLE1BQU0sRUFBRSxFQUpKO0FBS0osUUFBQSxhQUFhLEVBQUUsRUFMWDtBQU1KLFFBQUEsVUFBVSxFQUFFLEVBTlI7QUFPSixRQUFBLElBQUksRUFBRTtBQUNKLFVBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixVQUFBLE1BQU0sRUFBRSxFQUZKO0FBR0osVUFBQSxJQUFJLEVBQUUsRUFIRjtBQUlKLFVBQUEsV0FBVyxFQUFFO0FBSlQ7QUFQRixPQUZXO0FBZ0JqQixNQUFBLFFBQVEsRUFBRTtBQUNSLFFBQUEsZUFEUSw2QkFDVTtBQUNoQixpQkFBTyxLQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsVUFBQSxDQUFDO0FBQUEsbUJBQUksQ0FBQyxDQUFDLEdBQU47QUFB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UixDQUFYO0FBa09EOztBQTFPSDtBQUFBO0FBQUEseUJBMk9PLFFBM09QLEVBMk9pQixPQTNPakIsRUEyTzBCO0FBQ3RCLFdBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLFdBQUssR0FBTCxDQUFTLElBQVQsQ0FBYyxPQUFkO0FBQ0Q7QUE5T0g7QUFBQTtBQUFBLDRCQStPVTtBQUNOLFdBQUssR0FBTCxDQUFTLEtBQVQ7QUFDRDtBQWpQSDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuTGlicmFyeVBhdGggPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuZG9tID0gJChcIiNtb2R1bGVMaWJyYXJ5UGF0aFwiKTtcclxuICAgIHNlbGYuZG9tLm1vZGFsKHtcclxuICAgICAgc2hvdzogZmFsc2UsXHJcbiAgICAgIGJhY2tkcm9wOiBcInN0YXRpY1wiXHJcbiAgICB9KTtcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiBcIiNtb2R1bGVMaWJyYXJ5UGF0aEFwcFwiLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgdWlkOiBOS0MuY29uZmlncy51aWQsXHJcbiAgICAgICAgZm9sZGVyczogW10sXHJcbiAgICAgICAgd2FybmluZzogXCJcIixcclxuICAgICAgICBmb2xkZXI6IFwiXCIsXHJcbiAgICAgICAgb3JpZ2luRm9sZGVyczogW10sXHJcbiAgICAgICAgcGVybWlzc2lvbjogW10sXHJcbiAgICAgICAgZm9ybToge1xyXG4gICAgICAgICAgdHlwZTogXCJcIixcclxuICAgICAgICAgIGZvbGRlcjogXCJcIixcclxuICAgICAgICAgIG5hbWU6IFwiXCIsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgY29tcHV0ZWQ6IHtcclxuICAgICAgICBvcmlnaW5Gb2xkZXJzSWQoKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5Gb2xkZXJzLm1hcChmID0+IGYuX2lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdGVkRm9sZGVySWQoKSB7XHJcbiAgICAgICAgICBpZih0aGlzLmZvbGRlcikgcmV0dXJuIHRoaXMuZm9sZGVyLl9pZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOiuoeeul+mrmOS6ruaoquaOkueahOihjOaVsFxyXG4gICAgICAgIGFjdGl2ZUxpbmUoKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9sZGVycywgZm9sZGVyfSA9IHRoaXM7XHJcbiAgICAgICAgICBsZXQgbGluZSA9IDA7XHJcbiAgICAgICAgICBjb25zdCBmdW5jID0gKGFycikgPT4ge1xyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgYSA9IGFycltpXTtcclxuICAgICAgICAgICAgICBsaW5lICsrO1xyXG4gICAgICAgICAgICAgIGlmKGEuX2lkID09PSBmb2xkZXIuX2lkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmKGEuZm9sZGVycyAmJiBhLmZvbGRlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuYyhhLmZvbGRlcnMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGZ1bmMoZm9sZGVycyk7XHJcbiAgICAgICAgICByZXR1cm4gbGluZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5hdigpIHtcclxuICAgICAgICAgIGlmKCF0aGlzLmZvbGRlcikgcmV0dXJuO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rm9sZGVyTmF2KHRoaXMuZm9sZGVyKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhdGgoKSB7XHJcbiAgICAgICAgICBpZighdGhpcy5uYXYpIHJldHVybjtcclxuICAgICAgICAgIHJldHVybiBcIi9cIiArIHRoaXMubmF2Lm1hcChuID0+IG4ubmFtZSkuam9pbihcIi9cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgcGVyKG5hbWUpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnBlcm1pc3Npb24uaW5jbHVkZXMobmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdWJtaXRGb3JtKCkge1xyXG4gICAgICAgICAgY29uc3QgZm9ybSA9IHRoaXMuZm9ybTtcclxuICAgICAgICAgIGNvbnN0IHt0eXBlLCBmb2xkZXIsIG5hbWUsIGRlc2NyaXB0aW9ufSA9IGZvcm07XHJcblxyXG4gICAgICAgICAgbGV0IG1ldGhvZCwgdXJsO1xyXG4gICAgICAgICAgaWYodHlwZSA9PT0gXCJjcmVhdGVcIikge1xyXG4gICAgICAgICAgICBtZXRob2QgPSBcIlBPU1RcIjtcclxuICAgICAgICAgICAgdXJsID0gYC9saWJyYXJ5LyR7Zm9sZGVyLl9pZH0vbGlzdGA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtZXRob2QgPSBcIlBBVENIXCI7XHJcbiAgICAgICAgICAgIHVybCA9IGAvbGlicmFyeS8ke2ZvbGRlci5faWR9YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5rY0FQSSh1cmwsIG1ldGhvZCwge1xyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZvcm0uZm9sZGVyID0gXCJcIjtcclxuICAgICAgICAgICAgICBpZih0eXBlID09PSBcImNyZWF0ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBmb2xkZXIuY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZm9sZGVyLmxvYWRlZCA9IGZhbHNlOyAgXHJcbiAgICAgICAgICAgICAgICBmb2xkZXIuZm9sZGVyQ291bnQgPSAoZm9sZGVyLmZvbGRlckNvdW50IHx8IDApICsgMTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnN3aXRjaEZvbGRlcihmb2xkZXIpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb2xkZXIubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgICAgICBmb2xkZXIuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvRm9ybSh0eXBlLCBmb2xkZXIpIHtcclxuICAgICAgICAgIHRoaXMuZm9ybS50eXBlID0gdHlwZTtcclxuICAgICAgICAgIGlmKHR5cGUgPT09IFwibW9kaWZ5XCIpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLm5hbWUgPSBmb2xkZXIubmFtZTtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmRlc2NyaXB0aW9uID0gZm9sZGVyLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLm5hbWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmZvcm0uZGVzY3JpcHRpb24gPSBcIlwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5mb3JtLmZvbGRlciA9IGZvbGRlcjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZvbGRlck5hdihmb2xkZXIpIHtcclxuICAgICAgICAgIGNvbnN0IHtvcmlnaW5Gb2xkZXJzfSA9IHRoaXM7XHJcbiAgICAgICAgICBsZXQgbGlkID0gZm9sZGVyLmxpZDtcclxuICAgICAgICAgIGNvbnN0IG5hdiA9IFtmb2xkZXJdO1xyXG4gICAgICAgICAgd2hpbGUobGlkKSB7XHJcbiAgICAgICAgICAgIGZvcihjb25zdCBmIG9mIG9yaWdpbkZvbGRlcnMpIHtcclxuICAgICAgICAgICAgICBpZihmLl9pZCAhPT0gbGlkKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICBuYXYudW5zaGlmdChmKTtcclxuICAgICAgICAgICAgICBsaWQgPSBmLmxpZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG5hdjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWtmOWFpea6kOaWh+S7tuWkueaVsOe7hFxyXG4gICAgICAgIHNhdmVUb09yaWdpbihmb2xkZXJzKSB7XHJcbiAgICAgICAgICBjb25zdCB7b3JpZ2luRm9sZGVyc0lkLCBvcmlnaW5Gb2xkZXJzfSA9IHNlbGYuYXBwO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZvbGRlciBvZiBmb2xkZXJzKSB7XHJcbiAgICAgICAgICAgIGlmKCFvcmlnaW5Gb2xkZXJzSWQuaW5jbHVkZXMoZm9sZGVyLl9pZCkpIG9yaWdpbkZvbGRlcnMucHVzaChmb2xkZXIpO1xyXG4gICAgICAgICAgICBjb25zdCB7Zm9sZGVycyA9IFtdfSA9IGZvbGRlcjtcclxuICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvT3JpZ2luKGZvbGRlcnMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5rua5Yqo5Yiw6auY5Lqu5aSEXHJcbiAgICAgICAgc2Nyb2xsVG9BY3RpdmUoKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmFjdGl2ZUxpbmU7XHJcbiAgICAgICAgICAgIGxpbmUgLT0gMztcclxuICAgICAgICAgICAgbGluZSA9IGxpbmU+MD9saW5lOiAwO1xyXG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSAzMCpsaW5lOyAvLyDmr4/kuIDmqKrmjpLljaAzMHB4KOS4jmNzc+iuvue9ruacieWFs++8jOiLpWNzc+aUueWKqOWImeatpOWkhOS5n+mcgOimgeWBmuebuOW6lOiwg+aVtOOAgilcclxuICAgICAgICAgICAgY29uc3QgbGlzdEJvZHkgPSB0aGlzLiRyZWZzLmxpc3RCb2R5O1xyXG4gICAgICAgICAgICBOS0MubWV0aG9kcy5zY3JvbGxUb3AobGlzdEJvZHksIGhlaWdodCk7XHJcbiAgICAgICAgICB9LCAxMDApXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDngrnlh7vnoa7lrppcclxuICAgICAgICBzdWJtaXQoKSB7XHJcbiAgICAgICAgICBpZighdGhpcy5mb2xkZXIpIHJldHVybjtcclxuICAgICAgICAgIHNlbGYuY2FsbGJhY2soe1xyXG4gICAgICAgICAgICBmb2xkZXI6IHRoaXMuZm9sZGVyLFxyXG4gICAgICAgICAgICBuYXY6IHRoaXMubmF2LFxyXG4gICAgICAgICAgICBwYXRoOiB0aGlzLnBhdGhcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5bGV5byA5paH5Lu25aS5XHJcbiAgICAgICAgc3dpdGNoRm9sZGVyKGYpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0Rm9sZGVyKGYpO1xyXG4gICAgICAgICAgaWYoZi5jbG9zZSkge1xyXG4gICAgICAgICAgICBmLmNsb3NlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIOWKoOi9veS4i+WxguaWh+S7tuWkuVxyXG4gICAgICAgICAgICBpZighZi5sb2FkZWQpIHtcclxuICAgICAgICAgICAgICB0aGlzLmdldEZvbGRlcnMoZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGYuY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oup5paH5Lu25aS5XHJcbiAgICAgICAgc2VsZWN0Rm9sZGVyKGYpIHtcclxuICAgICAgICAgIHRoaXMuZm9sZGVyID0gZjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWKoOi9veaWh+S7tuWkueWIl+ihqFxyXG4gICAgICAgIC8vIOm7mOiupOWPquWKoOi9vemhtuWxguaWh+S7tuWkuVxyXG4gICAgICAgIC8vIOWPr+mAmui/h2xpZOWKoOi9veaMh+WumueahOaWh+S7tuWkue+8jOW5tuiHquWKqOWumuS9jeOAgeWxleW8gOS4iue6p+ebruW9lVxyXG4gICAgICAgIGluaXRGb2xkZXJzKGxpZCkge1xyXG4gICAgICAgICAgY29uc3QgdXJsID0gYC9saWJyYXJ5P3R5cGU9aW5pdCZsaWQ9JHtsaWR9JnQ9JHtEYXRlLm5vdygpfWA7XHJcbiAgICAgICAgICBua2NBUEkodXJsLCBcIkdFVFwiKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZvbGRlciA9IGRhdGEuZm9sZGVyO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnBlcm1pc3Npb24gPSBkYXRhLnBlcm1pc3Npb247XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvT3JpZ2luKGRhdGEuZm9sZGVycyk7XHJcbiAgICAgICAgICAgICAgaWYobGlkKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5zY3JvbGxUb0FjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0Rm9sZGVycyhmb2xkZXIpIHtcclxuICAgICAgICAgIGxldCB1cmw7XHJcbiAgICAgICAgICBpZihmb2xkZXIpIHtcclxuICAgICAgICAgICAgdXJsID0gYC9saWJyYXJ5P3R5cGU9Z2V0Rm9sZGVycyZsaWQ9JHtmb2xkZXIuX2lkfSZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdXJsID0gYC9saWJyYXJ5P3R5cGU9Z2V0Rm9sZGVycyZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbmtjQVBJKHVybCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5wZXJtaXNzaW9uID0gZGF0YS5wZXJtaXNzaW9uO1xyXG4gICAgICAgICAgICAgIGlmKGZvbGRlcikgZm9sZGVyLmxvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgZGF0YS5mb2xkZXJzLm1hcChmID0+IHtcclxuICAgICAgICAgICAgICAgIGYuY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgZi5sb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGYuZm9sZGVycyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgIGYucGFyZW50ID0gZm9sZGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGlmKGZvbGRlcikge1xyXG4gICAgICAgICAgICAgICAgZm9sZGVyLmZvbGRlcnMgPSBkYXRhLmZvbGRlcnM7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLmZvbGRlcnMgPSBkYXRhLmZvbGRlcnM7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnNhdmVUb09yaWdpbihkYXRhLmZvbGRlcnMpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICBpZihmb2xkZXIpIGZvbGRlci5jbG9zZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW4ob3B0aW9ucyA9IHt9KSB7XHJcbiAgICAgICAgICBjb25zdCB7bGlkLCB3YXJuaW5nID0gXCJcIn0gPSBvcHRpb25zO1xyXG4gICAgICAgICAgdGhpcy53YXJuaW5nID0gd2FybmluZztcclxuICAgICAgICAgIGlmKGxpZCkge1xyXG4gICAgICAgICAgICB0aGlzLmZvbGRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEZvbGRlcnMobGlkKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmZvbGRlcnMgfHwgIXRoaXMuZm9sZGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICB0aGlzLmdldEZvbGRlcnMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvc2UoKSB7XHJcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgb3BlbihjYWxsYmFjaywgb3B0aW9ucykge1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgdGhpcy5hcHAub3BlbihvcHRpb25zKTtcclxuICB9XHJcbiAgY2xvc2UoKSB7XHJcbiAgICB0aGlzLmFwcC5jbG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuXHJcbiJdfQ==
