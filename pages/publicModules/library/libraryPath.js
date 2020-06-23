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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvbGlicmFyeS9saWJyYXJ5UGF0aC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWjtBQUNFLG9CQUFjO0FBQUE7O0FBQ1osUUFBTSxJQUFJLEdBQUcsSUFBYjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxDQUFDLENBQUMsb0JBQUQsQ0FBWjtBQUNBLElBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQWU7QUFDYixNQUFBLElBQUksRUFBRSxLQURPO0FBRWIsTUFBQSxRQUFRLEVBQUU7QUFGRyxLQUFmO0FBSUEsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLHVCQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQURiO0FBRUosUUFBQSxPQUFPLEVBQUUsRUFGTDtBQUdKLFFBQUEsT0FBTyxFQUFFLEVBSEw7QUFJSixRQUFBLE1BQU0sRUFBRSxFQUpKO0FBS0osUUFBQSxhQUFhLEVBQUUsRUFMWDtBQU1KLFFBQUEsVUFBVSxFQUFFLEVBTlI7QUFPSixRQUFBLElBQUksRUFBRTtBQUNKLFVBQUEsSUFBSSxFQUFFLEVBREY7QUFFSixVQUFBLE1BQU0sRUFBRSxFQUZKO0FBR0osVUFBQSxJQUFJLEVBQUUsRUFIRjtBQUlKLFVBQUEsV0FBVyxFQUFFO0FBSlQ7QUFQRixPQUZXO0FBZ0JqQixNQUFBLFFBQVEsRUFBRTtBQUNSLFFBQUEsZUFEUSw2QkFDVTtBQUNoQixpQkFBTyxLQUFLLGFBQUwsQ0FBbUIsR0FBbkIsQ0FBdUIsVUFBQSxDQUFDO0FBQUEsbUJBQUksQ0FBQyxDQUFDLEdB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QSxXQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsT0FBZDtBQUNEO0FBOU9IO0FBQUE7QUFBQSw0QkErT1U7QUFDTixXQUFLLEdBQUwsQ0FBUyxLQUFUO0FBQ0Q7QUFqUEg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLkxpYnJhcnlQYXRoID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlTGlicmFyeVBhdGhcIik7XHJcbiAgICBzZWxmLmRvbS5tb2RhbCh7XHJcbiAgICAgIHNob3c6IGZhbHNlLFxyXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxyXG4gICAgfSk7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogXCIjbW9kdWxlTGlicmFyeVBhdGhBcHBcIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHVpZDogTktDLmNvbmZpZ3MudWlkLFxyXG4gICAgICAgIGZvbGRlcnM6IFtdLFxyXG4gICAgICAgIHdhcm5pbmc6IFwiXCIsXHJcbiAgICAgICAgZm9sZGVyOiBcIlwiLFxyXG4gICAgICAgIG9yaWdpbkZvbGRlcnM6IFtdLFxyXG4gICAgICAgIHBlcm1pc3Npb246IFtdLFxyXG4gICAgICAgIGZvcm06IHtcclxuICAgICAgICAgIHR5cGU6IFwiXCIsXHJcbiAgICAgICAgICBmb2xkZXI6IFwiXCIsXHJcbiAgICAgICAgICBuYW1lOiBcIlwiLFxyXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiXCJcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgb3JpZ2luRm9sZGVyc0lkKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luRm9sZGVycy5tYXAoZiA9PiBmLl9pZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWxlY3RlZEZvbGRlcklkKCkge1xyXG4gICAgICAgICAgaWYodGhpcy5mb2xkZXIpIHJldHVybiB0aGlzLmZvbGRlci5faWQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDorqHnrpfpq5jkuq7mqKrmjpLnmoTooYzmlbBcclxuICAgICAgICBhY3RpdmVMaW5lKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZvbGRlcnMsIGZvbGRlcn0gPSB0aGlzO1xyXG4gICAgICAgICAgbGV0IGxpbmUgPSAwO1xyXG4gICAgICAgICAgY29uc3QgZnVuYyA9IChhcnIpID0+IHtcclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGEgPSBhcnJbaV07XHJcbiAgICAgICAgICAgICAgbGluZSArKztcclxuICAgICAgICAgICAgICBpZihhLl9pZCA9PT0gZm9sZGVyLl9pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZihhLmZvbGRlcnMgJiYgYS5mb2xkZXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmMoYS5mb2xkZXJzKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBmdW5jKGZvbGRlcnMpO1xyXG4gICAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYXYoKSB7XHJcbiAgICAgICAgICBpZighdGhpcy5mb2xkZXIpIHJldHVybjtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZvbGRlck5hdih0aGlzLmZvbGRlcik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYXRoKCkge1xyXG4gICAgICAgICAgaWYoIXRoaXMubmF2KSByZXR1cm47XHJcbiAgICAgICAgICByZXR1cm4gXCIvXCIgKyB0aGlzLm5hdi5tYXAobiA9PiBuLm5hbWUpLmpvaW4oXCIvXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIHBlcihuYW1lKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5wZXJtaXNzaW9uLmluY2x1ZGVzKG5hbWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3VibWl0Rm9ybSgpIHtcclxuICAgICAgICAgIGNvbnN0IGZvcm0gPSB0aGlzLmZvcm07XHJcbiAgICAgICAgICBjb25zdCB7dHlwZSwgZm9sZGVyLCBuYW1lLCBkZXNjcmlwdGlvbn0gPSBmb3JtO1xyXG5cclxuICAgICAgICAgIGxldCBtZXRob2QsIHVybDtcclxuICAgICAgICAgIGlmKHR5cGUgPT09IFwiY3JlYXRlXCIpIHtcclxuICAgICAgICAgICAgbWV0aG9kID0gXCJQT1NUXCI7XHJcbiAgICAgICAgICAgIHVybCA9IGAvbGlicmFyeS8ke2ZvbGRlci5faWR9L2xpc3RgO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbWV0aG9kID0gXCJQQVRDSFwiO1xyXG4gICAgICAgICAgICB1cmwgPSBgL2xpYnJhcnkvJHtmb2xkZXIuX2lkfWA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBua2NBUEkodXJsLCBtZXRob2QsIHtcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb25cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5mb3JtLmZvbGRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgaWYodHlwZSA9PT0gXCJjcmVhdGVcIikge1xyXG4gICAgICAgICAgICAgICAgZm9sZGVyLmNsb3NlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGZvbGRlci5sb2FkZWQgPSBmYWxzZTsgIFxyXG4gICAgICAgICAgICAgICAgZm9sZGVyLmZvbGRlckNvdW50ID0gKGZvbGRlci5mb2xkZXJDb3VudCB8fCAwKSArIDE7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5zd2l0Y2hGb2xkZXIoZm9sZGVyKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9sZGVyLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgZm9sZGVyLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b0Zvcm0odHlwZSwgZm9sZGVyKSB7XHJcbiAgICAgICAgICB0aGlzLmZvcm0udHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICBpZih0eXBlID09PSBcIm1vZGlmeVwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5uYW1lID0gZm9sZGVyLm5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5kZXNjcmlwdGlvbiA9IGZvbGRlci5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybS5uYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgdGhpcy5mb3JtLmRlc2NyaXB0aW9uID0gXCJcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZm9ybS5mb2xkZXIgPSBmb2xkZXI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRGb2xkZXJOYXYoZm9sZGVyKSB7XHJcbiAgICAgICAgICBjb25zdCB7b3JpZ2luRm9sZGVyc30gPSB0aGlzO1xyXG4gICAgICAgICAgbGV0IGxpZCA9IGZvbGRlci5saWQ7XHJcbiAgICAgICAgICBjb25zdCBuYXYgPSBbZm9sZGVyXTtcclxuICAgICAgICAgIHdoaWxlKGxpZCkge1xyXG4gICAgICAgICAgICBmb3IoY29uc3QgZiBvZiBvcmlnaW5Gb2xkZXJzKSB7XHJcbiAgICAgICAgICAgICAgaWYoZi5faWQgIT09IGxpZCkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgbmF2LnVuc2hpZnQoZik7XHJcbiAgICAgICAgICAgICAgbGlkID0gZi5saWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBuYXY7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDlrZjlhaXmupDmlofku7blpLnmlbDnu4RcclxuICAgICAgICBzYXZlVG9PcmlnaW4oZm9sZGVycykge1xyXG4gICAgICAgICAgY29uc3Qge29yaWdpbkZvbGRlcnNJZCwgb3JpZ2luRm9sZGVyc30gPSBzZWxmLmFwcDtcclxuICAgICAgICAgIGZvcihjb25zdCBmb2xkZXIgb2YgZm9sZGVycykge1xyXG4gICAgICAgICAgICBpZighb3JpZ2luRm9sZGVyc0lkLmluY2x1ZGVzKGZvbGRlci5faWQpKSBvcmlnaW5Gb2xkZXJzLnB1c2goZm9sZGVyKTtcclxuICAgICAgICAgICAgY29uc3Qge2ZvbGRlcnMgPSBbXX0gPSBmb2xkZXI7XHJcbiAgICAgICAgICAgIHNlbGYuYXBwLnNhdmVUb09yaWdpbihmb2xkZXJzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOa7muWKqOWIsOmrmOS6ruWkhFxyXG4gICAgICAgIHNjcm9sbFRvQWN0aXZlKCkge1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsaW5lID0gdGhpcy5hY3RpdmVMaW5lO1xyXG4gICAgICAgICAgICBsaW5lIC09IDM7XHJcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lPjA/bGluZTogMDtcclxuICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gMzAqbGluZTsgLy8g5q+P5LiA5qiq5o6S5Y2gMzBweCjkuI5jc3Porr7nva7mnInlhbPvvIzoi6Vjc3PmlLnliqjliJnmraTlpITkuZ/pnIDopoHlgZrnm7jlupTosIPmlbTjgIIpXHJcbiAgICAgICAgICAgIGNvbnN0IGxpc3RCb2R5ID0gdGhpcy4kcmVmcy5saXN0Qm9keTtcclxuICAgICAgICAgICAgTktDLm1ldGhvZHMuc2Nyb2xsVG9wKGxpc3RCb2R5LCBoZWlnaHQpO1xyXG4gICAgICAgICAgfSwgMTAwKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g54K55Ye756Gu5a6aXHJcbiAgICAgICAgc3VibWl0KCkge1xyXG4gICAgICAgICAgaWYoIXRoaXMuZm9sZGVyKSByZXR1cm47XHJcbiAgICAgICAgICBzZWxmLmNhbGxiYWNrKHtcclxuICAgICAgICAgICAgZm9sZGVyOiB0aGlzLmZvbGRlcixcclxuICAgICAgICAgICAgbmF2OiB0aGlzLm5hdixcclxuICAgICAgICAgICAgcGF0aDogdGhpcy5wYXRoXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWxleW8gOaWh+S7tuWkuVxyXG4gICAgICAgIHN3aXRjaEZvbGRlcihmKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdEZvbGRlcihmKTtcclxuICAgICAgICAgIGlmKGYuY2xvc2UpIHtcclxuICAgICAgICAgICAgZi5jbG9zZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyDliqDovb3kuIvlsYLmlofku7blpLlcclxuICAgICAgICAgICAgaWYoIWYubG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5nZXRGb2xkZXJzKGYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmLmNsb3NlID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqeaWh+S7tuWkuVxyXG4gICAgICAgIHNlbGVjdEZvbGRlcihmKSB7XHJcbiAgICAgICAgICB0aGlzLmZvbGRlciA9IGY7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliqDovb3mlofku7blpLnliJfooahcclxuICAgICAgICAvLyDpu5jorqTlj6rliqDovb3pobblsYLmlofku7blpLlcclxuICAgICAgICAvLyDlj6/pgJrov4dsaWTliqDovb3mjIflrprnmoTmlofku7blpLnvvIzlubboh6rliqjlrprkvY3jgIHlsZXlvIDkuIrnuqfnm67lvZVcclxuICAgICAgICBpbml0Rm9sZGVycyhsaWQpIHtcclxuICAgICAgICAgIGNvbnN0IHVybCA9IGAvbGlicmFyeT90eXBlPWluaXQmbGlkPSR7bGlkfSZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICAgICAgbmtjQVBJKHVybCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuZm9sZGVycyA9IGRhdGEuZm9sZGVycztcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXIgPSBkYXRhLmZvbGRlcjtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5wZXJtaXNzaW9uID0gZGF0YS5wZXJtaXNzaW9uO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnNhdmVUb09yaWdpbihkYXRhLmZvbGRlcnMpO1xyXG4gICAgICAgICAgICAgIGlmKGxpZCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2Nyb2xsVG9BY3RpdmUoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldEZvbGRlcnMoZm9sZGVyKSB7XHJcbiAgICAgICAgICBsZXQgdXJsO1xyXG4gICAgICAgICAgaWYoZm9sZGVyKSB7XHJcbiAgICAgICAgICAgIHVybCA9IGAvbGlicmFyeT90eXBlPWdldEZvbGRlcnMmbGlkPSR7Zm9sZGVyLl9pZH0mdD0ke0RhdGUubm93KCl9YDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVybCA9IGAvbGlicmFyeT90eXBlPWdldEZvbGRlcnMmdD0ke0RhdGUubm93KCl9YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5rY0FQSSh1cmwsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAucGVybWlzc2lvbiA9IGRhdGEucGVybWlzc2lvbjtcclxuICAgICAgICAgICAgICBpZihmb2xkZXIpIGZvbGRlci5sb2FkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGRhdGEuZm9sZGVycy5tYXAoZiA9PiB7XHJcbiAgICAgICAgICAgICAgICBmLmNsb3NlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGYubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmLmZvbGRlcnMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGlmKGZvbGRlcikge1xyXG4gICAgICAgICAgICAgICAgICBmLnBhcmVudCA9IGZvbGRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBpZihmb2xkZXIpIHtcclxuICAgICAgICAgICAgICAgIGZvbGRlci5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBzZWxmLmFwcC5zYXZlVG9PcmlnaW4oZGF0YS5mb2xkZXJzKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZm9sZGVyKSBmb2xkZXIuY2xvc2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcGVuKG9wdGlvbnMgPSB7fSkge1xyXG4gICAgICAgICAgY29uc3Qge2xpZCwgd2FybmluZyA9IFwiXCJ9ID0gb3B0aW9ucztcclxuICAgICAgICAgIHRoaXMud2FybmluZyA9IHdhcm5pbmc7XHJcbiAgICAgICAgICBpZihsaWQpIHtcclxuICAgICAgICAgICAgdGhpcy5mb2xkZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRGb2xkZXJzKGxpZCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZighdGhpcy5mb2xkZXJzIHx8ICF0aGlzLmZvbGRlcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5nZXRGb2xkZXJzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNlbGYuZG9tLm1vZGFsKFwic2hvd1wiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlKCkge1xyXG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJoaWRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIG9wZW4oY2FsbGJhY2ssIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgIHRoaXMuYXBwLm9wZW4ob3B0aW9ucyk7XHJcbiAgfVxyXG4gIGNsb3NlKCkge1xyXG4gICAgdGhpcy5hcHAuY2xvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4iXX0=
