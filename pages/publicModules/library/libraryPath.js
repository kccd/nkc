(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvbGlicmFyeS9saWJyYXJ5UGF0aC5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztBQ0FBLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWjtBQUFBO0FBQUE7QUFDRSxvQkFBYztBQUFBOztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsQ0FBQyxDQUFDLG9CQUFELENBQVo7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsS0FETztBQUViLE1BQUEsUUFBUSxFQUFFO0FBRkcsS0FBZjtBQUlBLElBQUEsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLEdBQUosQ0FBUTtBQUNqQixNQUFBLEVBQUUsRUFBRSx1QkFEYTtBQUVqQixNQUFBLElBQUksRUFBRTtBQUNKLFFBQUEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FEYjtBQUVKLFFBQUEsT0FBTyxFQUFFLEVBRkw7QUFHSixRQUFBLE9BQU8sRUFBRSxFQUhMO0FBSUosUUFBQSxNQUFNLEVBQUUsRUFKSjtBQUtKLFFBQUEsYUFBYSxFQUFFLEVBTFg7QUFNSixRQUFBLFVBQVUsRUFBRSxFQU5SO0FBT0osUUFBQSxJQUFJLEVBQUU7QUFDSixVQUFBLElBQUksRUFBRSxFQURGO0FBRUosVUFBQSxNQUFNLEVBQUUsRUFGSjtBQUdKLFVBQUEsSUFBSSxFQUFFLEVBSEY7QUFJSixVQUFBLFdBQVcsRUFBRTtBQUpUO0FBUEYsT0FGVztBQWdCakIsTUFBQSxRQUFRLEVBQUU7QUFDUixRQUFBLGVBRFEsNkJBQ1U7QUFDaEIsaUJBQU8sS0FBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLFVBQUEsQ0FBQztBQUFBLG1CQUFJLENBQUMsQ0FB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O0FBbERRLEtBQVIsQ0FBWDtBQWtPRDs7QUExT0g7QUFBQTtBQUFBLHlCQTJPTyxRQTNPUCxFQTJPaUIsT0EzT2pCLEVBMk8wQjtBQUN0QixXQUFLLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxXQUFLLEdBQUwsQ0FBUyxJQUFULENBQWMsT0FBZDtBQUNEO0FBOU9IO0FBQUE7QUFBQSw0QkErT1U7QUFDTixXQUFLLEdBQUwsQ0FBUyxLQUFUO0FBQ0Q7QUFqUEg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLkxpYnJhcnlQYXRoID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBzZWxmLmRvbSA9ICQoXCIjbW9kdWxlTGlicmFyeVBhdGhcIik7XG4gICAgc2VsZi5kb20ubW9kYWwoe1xuICAgICAgc2hvdzogZmFsc2UsXG4gICAgICBiYWNrZHJvcDogXCJzdGF0aWNcIlxuICAgIH0pO1xuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XG4gICAgICBlbDogXCIjbW9kdWxlTGlicmFyeVBhdGhBcHBcIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdWlkOiBOS0MuY29uZmlncy51aWQsXG4gICAgICAgIGZvbGRlcnM6IFtdLFxuICAgICAgICB3YXJuaW5nOiBcIlwiLFxuICAgICAgICBmb2xkZXI6IFwiXCIsXG4gICAgICAgIG9yaWdpbkZvbGRlcnM6IFtdLFxuICAgICAgICBwZXJtaXNzaW9uOiBbXSxcbiAgICAgICAgZm9ybToge1xuICAgICAgICAgIHR5cGU6IFwiXCIsXG4gICAgICAgICAgZm9sZGVyOiBcIlwiLFxuICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiXCJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIG9yaWdpbkZvbGRlcnNJZCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5Gb2xkZXJzLm1hcChmID0+IGYuX2lkKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2VsZWN0ZWRGb2xkZXJJZCgpIHtcbiAgICAgICAgICBpZih0aGlzLmZvbGRlcikgcmV0dXJuIHRoaXMuZm9sZGVyLl9pZDtcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6K6h566X6auY5Lqu5qiq5o6S55qE6KGM5pWwXG4gICAgICAgIGFjdGl2ZUxpbmUoKSB7XG4gICAgICAgICAgY29uc3Qge2ZvbGRlcnMsIGZvbGRlcn0gPSB0aGlzO1xuICAgICAgICAgIGxldCBsaW5lID0gMDtcbiAgICAgICAgICBjb25zdCBmdW5jID0gKGFycikgPT4ge1xuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBjb25zdCBhID0gYXJyW2ldO1xuICAgICAgICAgICAgICBsaW5lICsrO1xuICAgICAgICAgICAgICBpZihhLl9pZCA9PT0gZm9sZGVyLl9pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmKGEuZm9sZGVycyAmJiBhLmZvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmMoYS5mb2xkZXJzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgZnVuYyhmb2xkZXJzKTtcbiAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgfSxcbiAgICAgICAgbmF2KCkge1xuICAgICAgICAgIGlmKCF0aGlzLmZvbGRlcikgcmV0dXJuO1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZvbGRlck5hdih0aGlzLmZvbGRlcik7XG4gICAgICAgIH0sXG4gICAgICAgIHBhdGgoKSB7XG4gICAgICAgICAgaWYoIXRoaXMubmF2KSByZXR1cm47XG4gICAgICAgICAgcmV0dXJuIFwiL1wiICsgdGhpcy5uYXYubWFwKG4gPT4gbi5uYW1lKS5qb2luKFwiL1wiKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgcGVyKG5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wZXJtaXNzaW9uLmluY2x1ZGVzKG5hbWUpO1xuICAgICAgICB9LFxuICAgICAgICBzdWJtaXRGb3JtKCkge1xuICAgICAgICAgIGNvbnN0IGZvcm0gPSB0aGlzLmZvcm07XG4gICAgICAgICAgY29uc3Qge3R5cGUsIGZvbGRlciwgbmFtZSwgZGVzY3JpcHRpb259ID0gZm9ybTtcblxuICAgICAgICAgIGxldCBtZXRob2QsIHVybDtcbiAgICAgICAgICBpZih0eXBlID09PSBcImNyZWF0ZVwiKSB7XG4gICAgICAgICAgICBtZXRob2QgPSBcIlBPU1RcIjtcbiAgICAgICAgICAgIHVybCA9IGAvbGlicmFyeS8ke2ZvbGRlci5faWR9L2xpc3RgO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXRob2QgPSBcIlBBVENIXCI7XG4gICAgICAgICAgICB1cmwgPSBgL2xpYnJhcnkvJHtmb2xkZXIuX2lkfWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5rY0FQSSh1cmwsIG1ldGhvZCwge1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uXG4gICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgc2VsZi5hcHAuZm9ybS5mb2xkZXIgPSBcIlwiO1xuICAgICAgICAgICAgICBpZih0eXBlID09PSBcImNyZWF0ZVwiKSB7XG4gICAgICAgICAgICAgICAgZm9sZGVyLmNsb3NlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBmb2xkZXIubG9hZGVkID0gZmFsc2U7ICBcbiAgICAgICAgICAgICAgICBmb2xkZXIuZm9sZGVyQ291bnQgPSAoZm9sZGVyLmZvbGRlckNvdW50IHx8IDApICsgMTtcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5zd2l0Y2hGb2xkZXIoZm9sZGVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb2xkZXIubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgZm9sZGVyLmRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHRvRm9ybSh0eXBlLCBmb2xkZXIpIHtcbiAgICAgICAgICB0aGlzLmZvcm0udHlwZSA9IHR5cGU7XG4gICAgICAgICAgaWYodHlwZSA9PT0gXCJtb2RpZnlcIikge1xuICAgICAgICAgICAgdGhpcy5mb3JtLm5hbWUgPSBmb2xkZXIubmFtZTtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5kZXNjcmlwdGlvbiA9IGZvbGRlci5kZXNjcmlwdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mb3JtLm5hbWUgPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5mb3JtLmRlc2NyaXB0aW9uID0gXCJcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5mb3JtLmZvbGRlciA9IGZvbGRlcjtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Rm9sZGVyTmF2KGZvbGRlcikge1xuICAgICAgICAgIGNvbnN0IHtvcmlnaW5Gb2xkZXJzfSA9IHRoaXM7XG4gICAgICAgICAgbGV0IGxpZCA9IGZvbGRlci5saWQ7XG4gICAgICAgICAgY29uc3QgbmF2ID0gW2ZvbGRlcl07XG4gICAgICAgICAgd2hpbGUobGlkKSB7XG4gICAgICAgICAgICBmb3IoY29uc3QgZiBvZiBvcmlnaW5Gb2xkZXJzKSB7XG4gICAgICAgICAgICAgIGlmKGYuX2lkICE9PSBsaWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICBuYXYudW5zaGlmdChmKTtcbiAgICAgICAgICAgICAgbGlkID0gZi5saWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuYXY7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWtmOWFpea6kOaWh+S7tuWkueaVsOe7hFxuICAgICAgICBzYXZlVG9PcmlnaW4oZm9sZGVycykge1xuICAgICAgICAgIGNvbnN0IHtvcmlnaW5Gb2xkZXJzSWQsIG9yaWdpbkZvbGRlcnN9ID0gc2VsZi5hcHA7XG4gICAgICAgICAgZm9yKGNvbnN0IGZvbGRlciBvZiBmb2xkZXJzKSB7XG4gICAgICAgICAgICBpZighb3JpZ2luRm9sZGVyc0lkLmluY2x1ZGVzKGZvbGRlci5faWQpKSBvcmlnaW5Gb2xkZXJzLnB1c2goZm9sZGVyKTtcbiAgICAgICAgICAgIGNvbnN0IHtmb2xkZXJzID0gW119ID0gZm9sZGVyO1xuICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvT3JpZ2luKGZvbGRlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5rua5Yqo5Yiw6auY5Lqu5aSEXG4gICAgICAgIHNjcm9sbFRvQWN0aXZlKCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGxpbmUgPSB0aGlzLmFjdGl2ZUxpbmU7XG4gICAgICAgICAgICBsaW5lIC09IDM7XG4gICAgICAgICAgICBsaW5lID0gbGluZT4wP2xpbmU6IDA7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHQgPSAzMCpsaW5lOyAvLyDmr4/kuIDmqKrmjpLljaAzMHB4KOS4jmNzc+iuvue9ruacieWFs++8jOiLpWNzc+aUueWKqOWImeatpOWkhOS5n+mcgOimgeWBmuebuOW6lOiwg+aVtOOAgilcbiAgICAgICAgICAgIGNvbnN0IGxpc3RCb2R5ID0gdGhpcy4kcmVmcy5saXN0Qm9keTtcbiAgICAgICAgICAgIE5LQy5tZXRob2RzLnNjcm9sbFRvcChsaXN0Qm9keSwgaGVpZ2h0KTtcbiAgICAgICAgICB9LCAxMDApXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOeCueWHu+ehruWumlxuICAgICAgICBzdWJtaXQoKSB7XG4gICAgICAgICAgaWYoIXRoaXMuZm9sZGVyKSByZXR1cm47XG4gICAgICAgICAgc2VsZi5jYWxsYmFjayh7XG4gICAgICAgICAgICBmb2xkZXI6IHRoaXMuZm9sZGVyLFxuICAgICAgICAgICAgbmF2OiB0aGlzLm5hdixcbiAgICAgICAgICAgIHBhdGg6IHRoaXMucGF0aFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5bGV5byA5paH5Lu25aS5XG4gICAgICAgIHN3aXRjaEZvbGRlcihmKSB7XG4gICAgICAgICAgdGhpcy5zZWxlY3RGb2xkZXIoZik7XG4gICAgICAgICAgaWYoZi5jbG9zZSkge1xuICAgICAgICAgICAgZi5jbG9zZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8g5Yqg6L295LiL5bGC5paH5Lu25aS5XG4gICAgICAgICAgICBpZighZi5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy5nZXRGb2xkZXJzKGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmLmNsb3NlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOmAieaLqeaWh+S7tuWkuVxuICAgICAgICBzZWxlY3RGb2xkZXIoZikge1xuICAgICAgICAgIHRoaXMuZm9sZGVyID0gZjtcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Yqg6L295paH5Lu25aS55YiX6KGoXG4gICAgICAgIC8vIOm7mOiupOWPquWKoOi9vemhtuWxguaWh+S7tuWkuVxuICAgICAgICAvLyDlj6/pgJrov4dsaWTliqDovb3mjIflrprnmoTmlofku7blpLnvvIzlubboh6rliqjlrprkvY3jgIHlsZXlvIDkuIrnuqfnm67lvZVcbiAgICAgICAgaW5pdEZvbGRlcnMobGlkKSB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYC9saWJyYXJ5P3R5cGU9aW5pdCZsaWQ9JHtsaWR9JnQ9JHtEYXRlLm5vdygpfWA7XG4gICAgICAgICAgbmtjQVBJKHVybCwgXCJHRVRcIilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xuICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXIgPSBkYXRhLmZvbGRlcjtcbiAgICAgICAgICAgICAgc2VsZi5hcHAucGVybWlzc2lvbiA9IGRhdGEucGVybWlzc2lvbjtcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvT3JpZ2luKGRhdGEuZm9sZGVycyk7XG4gICAgICAgICAgICAgIGlmKGxpZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNjcm9sbFRvQWN0aXZlKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Rm9sZGVycyhmb2xkZXIpIHtcbiAgICAgICAgICBsZXQgdXJsO1xuICAgICAgICAgIGlmKGZvbGRlcikge1xuICAgICAgICAgICAgdXJsID0gYC9saWJyYXJ5P3R5cGU9Z2V0Rm9sZGVycyZsaWQ9JHtmb2xkZXIuX2lkfSZ0PSR7RGF0ZS5ub3coKX1gO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgPSBgL2xpYnJhcnk/dHlwZT1nZXRGb2xkZXJzJnQ9JHtEYXRlLm5vdygpfWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5rY0FQSSh1cmwsIFwiR0VUXCIpXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICBzZWxmLmFwcC5wZXJtaXNzaW9uID0gZGF0YS5wZXJtaXNzaW9uO1xuICAgICAgICAgICAgICBpZihmb2xkZXIpIGZvbGRlci5sb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBkYXRhLmZvbGRlcnMubWFwKGYgPT4ge1xuICAgICAgICAgICAgICAgIGYuY2xvc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGYubG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZi5mb2xkZXJzID0gW107XG4gICAgICAgICAgICAgICAgaWYoZm9sZGVyKSB7XG4gICAgICAgICAgICAgICAgICBmLnBhcmVudCA9IGZvbGRlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZihmb2xkZXIpIHtcbiAgICAgICAgICAgICAgICBmb2xkZXIuZm9sZGVycyA9IGRhdGEuZm9sZGVycztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuYXBwLnNhdmVUb09yaWdpbihkYXRhLmZvbGRlcnMpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICBpZihmb2xkZXIpIGZvbGRlci5jbG9zZSA9IHRydWU7XG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICBvcGVuKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICAgIGNvbnN0IHtsaWQsIHdhcm5pbmcgPSBcIlwifSA9IG9wdGlvbnM7XG4gICAgICAgICAgdGhpcy53YXJuaW5nID0gd2FybmluZztcbiAgICAgICAgICBpZihsaWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9sZGVyID0gXCJcIjtcbiAgICAgICAgICAgIHRoaXMuaW5pdEZvbGRlcnMobGlkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYoIXRoaXMuZm9sZGVycyB8fCAhdGhpcy5mb2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICB0aGlzLmdldEZvbGRlcnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi5kb20ubW9kYWwoXCJzaG93XCIpO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZSgpIHtcbiAgICAgICAgICBzZWxmLmRvbS5tb2RhbChcImhpZGVcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBvcGVuKGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuYXBwLm9wZW4ob3B0aW9ucyk7XG4gIH1cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5hcHAuY2xvc2UoKTtcbiAgfVxufVxuXG5cbiJdfQ==
