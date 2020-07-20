(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.Library = /*#__PURE__*/function () {
  function _class(options) {
    _classCallCheck(this, _class);

    var lid = options.lid,
        folderId = options.folderId,
        tLid = options.tLid,
        uploadResourcesId = options.uploadResourcesId;
    var self = this;
    self.app = new Vue({
      el: "#moduleLibrary",
      data: {
        uid: NKC.configs.uid,
        uploadResourcesId: uploadResourcesId,
        pageType: "list",
        // list: 文件列表, uploader: 文件上传
        nav: [],
        folders: [],
        files: [],
        lid: lid,
        tLid: tLid,
        sort: "time",
        histories: [],
        index: 0,
        selectedFiles: [],
        mark: false,
        selectedLibrariesId: [],
        permission: [],
        lastHistoryLid: "",
        selectedCategory: "book",
        // 批量修改文件类型
        selectedFolder: "",
        // 批量修改文件目录 目录ID
        selectedFolderPath: "",
        // 批量修改文件目录 目录路径
        listCategories: ["book", "paper", "program", "media", "other"],
        categories: [{
          id: "book",
          name: "图书"
        }, {
          id: "paper",
          name: "论文"
        }, {
          id: "program",
          name: "程序"
        }, {
          id: "media",
          name: "媒体"
        }, {
          id: "other",
          name: "其他"
        }],
        protocol: true // 是否同意协议

      },
      watch: {
        listCategories: function listCategories() {
          this.saveCategoriesToLocalStorage();
        }
      },
      mounted: function mounted() {
        if (folderId) {
          this.saveToLocalStorage(folderId);
        }

        this.getCategoriesFromLocalStorage();
        var libraryVisitFolderLogs = NKC.methods.getFromLocalStorage("libraryVisitFolderLogs");
        var childFolderId = libraryVisitFolderLogs[this.lid];
        var this_ = this;

        if (childFolderId !== undefined && childFolderId !== this.lid) {
          // 如果浏览器本地存有访问记录，则先确定该记录中的文件夹是否存在，存在则访问，不存在则打开顶层文件夹。
          this.getList(childFolderId).then(function () {
            this_.addHistory(this_.lid);
            this_.addFileByRid();
          })["catch"](function (err) {
            this_.getListInfo(this_.lid);
          });
        } else {
          this.getListInfo(this_.lid);
        }

        if (!window.CommonModal) {
          if (!NKC.modules.CommonModal) {
            sweetError("未引入通用弹框");
          } else {
            window.CommonModal = new NKC.modules.CommonModal();
          }
        }

        if (!window.ResourceInfo) {
          if (!NKC.modules.ResourceInfo) {
            sweetError("未引入资源信息模块");
          } else {
            window.ResourceInfo = new NKC.modules.ResourceInfo();
          }
        }

        if (!window.SelectResource) {
          if (!NKC.modules.SelectResource) {
            sweetError("未引入资源信息模块");
          } else {
            window.SelectResource = new NKC.modules.SelectResource();
          }
        }

        if (!window.LibraryPath) {
          if (!NKC.modules.LibraryPath) {
            sweetError("未引入文库路径选择模块");
          } else {
            window.LibraryPath = new NKC.modules.LibraryPath();
          }
        }

        window.onpopstate = this.onpopstate;
      },
      computed: {
        uploading: function uploading() {
          var _iterator = _createForOfIteratorHelper(this.selectedFiles),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var f = _step.value;
              if (f.status === "uploading") return true;
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        },
        lastFolder: function lastFolder() {
          var length = this.nav.length;

          if (length > 1) {
            return this.nav[length - 2];
          }
        },
        folder: function folder() {
          var length = this.nav.length;

          if (length !== 0) {
            return this.nav[length - 1];
          } else {
            return {};
          }
        },
        folderList: function folderList() {
          var listCategories = this.listCategories,
              files = this.files,
              folders = this.folders,
              uid = this.uid;
          var files_ = files;

          if (listCategories.includes("own") && uid) {
            files_ = files.filter(function (f) {
              return f.uid === uid;
            });
          }

          files_ = files_.filter(function (f) {
            return listCategories.includes(f.category);
          });
          return folders.concat(files_);
        },
        uploadedCount: function uploadedCount() {
          var count = 0;
          this.selectedFiles.map(function (f) {
            if (f.status === "uploaded") count++;
          });
          return count;
        },
        unUploadedCount: function unUploadedCount() {
          var count = 0;
          this.selectedFiles.map(function (f) {
            if (f.status === "notUploaded") count++;
          });
          return count;
        }
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        visitUrl: NKC.methods.visitUrl,
        format: NKC.methods.format,
        getSize: NKC.methods.tools.getSize,
        checkString: NKC.methods.checkData.checkString,
        scrollTo: NKC.methods.scrollTop,
        addFileByRid: function addFileByRid() {
          var uploadResourcesId = this.uploadResourcesId;
          if (!uploadResourcesId || uploadResourcesId.length <= 0) return;
          var rid = uploadResourcesId.join("-");
          nkcAPI("/rs?rid=".concat(rid), "GET").then(function (data) {
            data.resources.map(function (r) {
              self.app.selectedFiles.push(self.app.createFile("onlineFile", r));
            });
            self.app.pageType = "uploader";
            self.app.uploadResourcesId = [];
          })["catch"](sweetError);
        },
        // 清空未上传的记录
        clearUnUploaded: function clearUnUploaded() {
          this.selectedFiles = this.selectedFiles.filter(function (f) {
            return f.status !== "notUploaded";
          });
        },
        // 批量设置文件目录
        selectFilesFolder: function selectFilesFolder() {
          var this_ = this;
          LibraryPath.open(function (data) {
            var folder = data.folder,
                path = data.path;
            this_.selectedFolder = folder;
            this_.selectedFolderPath = path;
          }, {
            lid: this.lid,
            warning: "该操作将覆盖本页所有设置，请谨慎操作。"
          });
        },
        // 清空已成功上传的文件记录
        clearUploaded: function clearUploaded() {
          this.selectedFiles = this.selectedFiles.filter(function (f) {
            return f.status !== "uploaded";
          });
        },
        // 批量设置文件的分类
        markCategory: function markCategory() {
          var selectedCategory = this.selectedCategory,
              selectedFiles = this.selectedFiles;
          if (!selectedCategory) return;
          sweetQuestion("该操作将覆盖本页所有设置，请再次确认。").then(function () {
            selectedFiles.map(function (f) {
              return f.category = selectedCategory;
            });
          })["catch"](function (err) {});
        },
        // 批量设置文件目录
        markFolder: function markFolder() {
          var selectedFolder = this.selectedFolder,
              selectedFolderPath = this.selectedFolderPath,
              selectedFiles = this.selectedFiles;
          if (!selectedFolder) return;
          var this_ = this;
          sweetQuestion("\u8BE5\u64CD\u4F5C\u5C06\u8986\u76D6\u672C\u9875\u6240\u6709\u8BBE\u7F6E\uFF0C\u8BF7\u518D\u6B21\u786E\u8BA4\u3002").then(function () {
            selectedFiles.map(function (f) {
              f.folder = selectedFolder;
              f.folderPath = selectedFolderPath;
            });
            this_.selectedFolder = "";
            this_.selectedFolderPath = "";
          })["catch"](function (err) {});
        },
        // 网页切换事件
        onpopstate: function onpopstate(e) {
          var state = e.state;
          var lid = this.lid;
          if (state && state.lid) lid = state.lid;
          this.getList(lid)["catch"](function (err) {
            sweetError(err);
          });
        },
        // 加载文件夹信息，包含错误处理
        getListInfo: function getListInfo(id, scrollToTop) {
          this.getList(id, scrollToTop).then(function () {
            self.app.addHistory(id);
            self.app.addFileByRid();
          })["catch"](function (err) {
            sweetError(err);
          });
        },
        // 比对权限permission
        per: function per(operation) {
          return this.permission.includes(operation);
        },
        // 开启多选框
        markLibrary: function markLibrary() {
          this.mark = !this.mark;
          this.selectedLibrariesId = [];
        },
        // 选择/取消 全部
        markAll: function markAll() {
          if (this.selectedLibrariesId.length === this.folderList.length) {
            this.selectedLibrariesId = [];
          } else {
            this.selectedLibrariesId = this.folderList.map(function (f) {
              return f._id;
            });
          }
        },
        // 批量删除
        deleteFolders: function deleteFolders() {
          this.deleteFolder(this.selectedLibrariesId);
        },
        // 批量移动
        moveFolders: function moveFolders() {
          this.moveFolder(this.selectedLibrariesId);
        },
        // 根据本地文件或者resource对象构建用于上传的文件对象
        selectPath: function selectPath(r) {
          LibraryPath.open(function (data) {
            var folder = data.folder,
                path = data.path;
            r.folder = folder;
            r.folderPath = path;
          }, {
            lid: r.folder ? r.folder._id : ""
          });
        },
        createFile: function createFile(type, r) {
          var folder = r.folder,
              folderPath = r.folderPath,
              _id = r._id,
              toc = r.toc,
              rid = r.rid,
              category = r.category,
              _r$name = r.name,
              name = _r$name === void 0 ? "" : _r$name,
              oname = r.oname,
              _r$description = r.description,
              description = _r$description === void 0 ? "" : _r$description,
              size = r.size;
          var file = {
            _id: _id,
            type: type,
            rid: rid,
            name: name || oname,
            size: size,
            category: category || "",
            description: description,
            folder: folder || this.folder,
            folderPath: folderPath || function () {
              var name = self.app.nav.map(function (n) {
                return n.name;
              });
              return "/" + name.join("/");
            }(),
            data: r,
            toc: toc || new Date(),
            status: "notUploaded",
            // notUploaded, uploading, uploaded
            disabled: false,
            progress: 0,
            error: "" // 错误信息

          };
          file.name = file.name.replace(/\..*?$/ig, "");

          if (file.type === "localFile") {
            if (r.type.includes("image")) {
              file.ext = "mediaPicture";
            } else {
              file.ext = "mediaAttachment";
            }
          }

          if (file.ext === "mediaPicture") {
            file.error = "暂不允许上传图片到文库";
            file.disabled = true;
          } else if (file.size > 200 * 1024 * 1024) {
            file.error = "文件大小不能超过200MB";
            file.disabled = true;
          }

          return file;
        },
        startUpload: function startUpload() {
          this.uploadFile(0, this.selectedFiles);
        },
        removeFile: function removeFile(index) {
          this.selectedFiles.splice(index, 1);
        },
        // 上传文件
        uploadFile: function uploadFile(index, arr) {
          if (index >= arr.length) return;
          var file = arr[index];
          var status = file.status,
              disabled = file.disabled;

          if (disabled || status !== "notUploaded") {
            return this.uploadFile(index + 1, arr);
          }

          file.error = "";
          file.status = "uploading";
          Promise.resolve().then(function () {
            if (!file) throw "文件异常";
            self.app.checkString(file.name, {
              minLength: 1,
              maxLength: 500,
              name: "文件名称"
            });
            self.app.checkString(file.description, {
              minLength: 0,
              maxLength: 1000,
              name: "文件说明"
            });

            if (!["media", "paper", "book", "program", "other"].includes(file.category)) {
              throw "未选择文件分类";
            }

            if (!file.folder) throw "未选择目录";

            if (file.type === "localFile") {
              return NKC.methods.getFileMD5(file.data);
            }
          }).then(function (data) {
            // 上传本地文件
            if (file.type === "localFile") {
              var formData = new FormData();
              formData.append("fileName", file.data.name);
              formData.append("type", "checkMD5");
              formData.append("md5", data);
              return nkcUploadFile("/r", "POST", formData);
            }
          }).then(function (data) {
            if (data && !data.uploaded && file.type === "localFile") {
              var formData = new FormData();
              formData.append("file", file.data);
              return nkcUploadFile("/r", "POST", formData, function (e, p) {
                file.progress = p;
              });
            } else {
              return data;
            }
          }).then(function (data) {
            // 替换本地文件信息 统一为线上文件模式
            if (file.type === "localFile") {
              var resource = data.r;
              file.data = resource;
              file.ext = resource.mediaType;
              file.rid = resource.rid;
              file.toc = resource.toc;
              file.type = "onlineFile";

              if (file.ext === "mediaPicture") {
                file.disabled = true;
                throw new Error("暂不允许上传图片到文库");
              }
            }
          }).then(function () {
            if (file.type === "modify") {
              // 批量修改
              var _id = file._id,
                  name = file.name,
                  description = file.description,
                  category = file.category;
              var body = {
                name: name,
                description: description,
                category: category
              };
              return nkcAPI("/library/".concat(_id), "PATCH", body);
            } else {
              // 将线上文件提交到文库
              var _name = file.name,
                  _description = file.description,
                  _category = file.category,
                  rid = file.rid,
                  folder = file.folder;
              var _body = {
                rid: rid,
                name: _name,
                description: _description,
                category: _category
              };
              var formData = new FormData();
              formData.append("body", JSON.stringify(_body));
              return nkcAPI("/library/".concat(folder._id), "POST", _body);
            }
          }).then(function () {
            file.status = "uploaded";
          })["catch"](function (data) {
            file.error = data.error || data;
            file.status = "notUploaded";
          })["finally"](function () {
            self.app.uploadFile(index + 1, arr);
          });
        },
        // 返回上一层文件夹
        back: function back() {
          if (this.lastFolder) this.selectFolder(this.lastFolder);
        },
        // 切换到文件上传
        toUpload: function toUpload() {
          if (this.mark) return;
          this.pageType = "uploader";
        },
        // 切换到文件列表
        toList: function toList() {
          this.selectFolder(this.folder);
          this.pageType = "list";
        },
        // 将用户已选择的筛选分类存到本地
        saveCategoriesToLocalStorage: function saveCategoriesToLocalStorage() {
          var listCategories = this.listCategories;
          var libraryListCategories = NKC.methods.getFromLocalStorage("libraryListCategories");
          libraryListCategories[this.lid] = listCategories;
          NKC.methods.saveToLocalStorage("libraryListCategories", libraryListCategories);
        },
        // 读取本地存储的筛选分类
        getCategoriesFromLocalStorage: function getCategoriesFromLocalStorage() {
          var libraryListCategories = NKC.methods.getFromLocalStorage("libraryListCategories");
          var listCategories = libraryListCategories[this.lid];

          if (listCategories) {
            this.listCategories = listCategories;
          }
        },
        // 文件夹访问记录存到浏览器本地
        saveToLocalStorage: function saveToLocalStorage(id) {
          var libraryVisitFolderLogs = NKC.methods.getFromLocalStorage("libraryVisitFolderLogs");
          libraryVisitFolderLogs[this.lid] = id;
          NKC.methods.saveToLocalStorage("libraryVisitFolderLogs", libraryVisitFolderLogs);
        },
        // 添加一条浏览器历史记录
        addHistory: function addHistory(lid) {
          // 判断是否为相同页，相同则不创建浏览器历史记录。
          if (this.lastHistoryLid && this.lastHistoryLid === lid) return;
          var href = window.location.href;

          if (href.includes("#")) {
            href = href.replace(/#.*/ig, "");
          }

          window.history.pushState({
            lid: lid
          }, 'page', href + '#' + lid);
          this.lastHistoryLid = lid;
        },
        // 获取文件列表
        getList: function getList(id, scrollToTop) {
          var url = "/library/".concat(id, "?file=true&nav=true&folder=true&permission=true&t=").concat(Date.now());
          return nkcAPI(url, "GET").then(function (data) {
            self.app.nav = data.nav;
            self.app.folders = data.folders;
            self.app.files = data.files;
            self.app.permission = data.permission;
            self.app.saveToLocalStorage(id);

            if (scrollToTop) {
              self.app.scrollTo(null, 0);
            }
          });
        },
        selectOnlineFiles: function selectOnlineFiles() {
          SelectResource.open(function (data) {
            var resources = data.resources;
            resources.map(function (r) {
              self.app.selectedFiles.push(self.app.createFile("onlineFile", r));
            });
          }, {
            allowedExt: ["attachment", "video", "audio"],
            countLimit: 99
          });
        },
        // 选择完本地文件
        selectedLocalFiles: function selectedLocalFiles() {
          var _document$getElementB = document.getElementById("moduleLibraryInput"),
              _document$getElementB2 = _document$getElementB.files,
              files = _document$getElementB2 === void 0 ? [] : _document$getElementB2;

          var _iterator2 = _createForOfIteratorHelper(files),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var file = _step2.value;
              this.selectedFiles.push(this.createFile("localFile", file));
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }

          document.getElementById("moduleLibraryInput").value = "";
        },
        // 选择文件夹
        selectFolder: function selectFolder(folder, scrollToTop) {
          if (this.mark) return;

          if (folder.type === "folder") {
            this.getListInfo(folder._id, scrollToTop);
          } else {
            this.selectFile(folder);
          }
        },
        // 点击文件夹目录时
        selectNavFolder: function selectNavFolder(f) {
          if (this.pageType !== "list") {
            this.pageType = "list";
          }

          this.selectFolder(f);
        },
        // 移动文件夹或文件
        moveFolder: function moveFolder(libraryId) {
          var foldersId;

          if (Array.isArray(libraryId)) {
            foldersId = libraryId;
          } else {
            foldersId = [libraryId];
          }

          var body = {};
          body.foldersId = foldersId;
          var url = "/library/".concat(this.folder._id, "/list");
          var method = "PATCH";
          LibraryPath.open(function (data) {
            body.targetFolderId = data.folder._id;
            nkcAPI(url, method, body).then(function (data) {
              sweetSuccess("\u6267\u884C\u6210\u529F".concat(data.ignoreCount ? "\uFF0C\u5171\u6709".concat(data.ignoreCount, "\u4E2A\u9879\u76EE\u56E0\u5B58\u5728\u51B2\u7A81\u6216\u4E0D\u662F\u4F60\u81EA\u5DF1\u53D1\u5E03\u7684\u800C\u88AB\u5FFD\u7565") : ""));
              self.app.mark = false;
              self.app.selectFolder(self.app.folder);
            })["catch"](function (data) {
              sweetError(data);
            });
          }, {
            lid: self.app.folder._id,
            warning: "此操作不会保留原有目录结构，且不可恢复。"
          });
        },
        // 编辑文件夹
        editFolder: function editFolder(folder) {
          if (this.mark) return;
          var typeStr = "文件夹";
          var modalData = [{
            dom: "input",
            type: "text",
            label: "".concat(typeStr, "\u540D\u79F0"),
            value: folder.name
          }, {
            dom: "textarea",
            label: "".concat(typeStr, "\u7B80\u4ECB"),
            value: folder.description
          }];

          if (folder.type === "file") {
            typeStr = "文件";
            modalData.push({
              dom: "radio",
              label: "文件分类",
              radios: [{
                name: "图书",
                value: "book"
              }, {
                name: "论文",
                value: "paper"
              }, {
                name: "程序",
                value: "program"
              }, {
                name: "媒体",
                value: "media"
              }, {
                name: "其他",
                value: "other"
              }],
              value: folder.category
            });
          }

          CommonModal.open(function (res) {
            var name = res[0].value;
            var description = res[1].value;
            var category = "";

            if (folder.type === "file") {
              category = res[2].value;
            }

            if (!name) return sweetError("名称不能为空");
            nkcAPI("/library/" + folder._id, "PATCH", {
              name: name,
              description: description,
              category: category
            }).then(function () {
              self.app.selectFolder(self.app.folder);
              window.CommonModal.close();
            })["catch"](function (data) {
              sweetError(data);
            });
          }, {
            title: "\u7F16\u8F91".concat(typeStr),
            data: modalData
          });
        },
        // 删除文件夹
        deleteFolder: function deleteFolder(foldersId) {
          if (!Array.isArray(foldersId)) {
            foldersId = [foldersId];
          }

          if (!foldersId.length) return;
          foldersId = foldersId.join("-");
          sweetQuestion("\u786E\u5B9A\u8981\u6267\u884C\u5220\u9664\u64CD\u4F5C\uFF1F").then(function () {
            nkcAPI("/library/".concat(self.app.folder._id, "/list?lid=").concat(foldersId), "DELETE").then(function (data) {
              self.app.mark = false;
              self.app.selectFolder(self.app.folder);
              sweetSuccess("\u6267\u884C\u6210\u529F".concat(data.ignoreCount ? "\uFF0C\u5171\u6709".concat(data.ignoreCount, "\u4E2A\u9879\u76EE\u56E0\u4E0D\u662F\u4F60\u81EA\u5DF1\u53D1\u5E03\u7684\u800C\u88AB\u5FFD\u7565") : ""));
            })["catch"](function (data) {
              sweetError(data);
            });
          })["catch"](function () {});
        },
        // 选择文件
        selectFile: function selectFile(file) {
          ResourceInfo.open({
            lid: file._id
          });
        },
        // 创建文件夹
        createFolder: function createFolder() {
          if (this.mark) return;
          window.CommonModal.open(function (res) {
            var name = res[0].value;
            var description = res[1].value;
            if (!name) return sweetError("名称不能为空");
            nkcAPI("/library/" + self.app.folder._id + "/list", "POST", {
              name: name,
              description: description
            }).then(function () {
              sweetSuccess("文件夹创建成功");
              window.CommonModal.close();
              self.app.selectFolder(self.app.folder);
            })["catch"](function (data) {
              sweetError(data);
            });
          }, {
            title: "新建文件夹",
            data: [{
              dom: "input",
              type: "text",
              label: "文件夹名称",
              value: ""
            }, {
              dom: "textarea",
              label: "文件夹简介",
              value: ""
            }]
          });
        }
      }
    });
  }

  return _class;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvbGlicmFyeS9saWJyYXJ5Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLE9BQVo7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQUEsUUFDWixHQURZLEdBQzhCLE9BRDlCLENBQ1osR0FEWTtBQUFBLFFBQ1AsUUFETyxHQUM4QixPQUQ5QixDQUNQLFFBRE87QUFBQSxRQUNHLElBREgsR0FDOEIsT0FEOUIsQ0FDRyxJQURIO0FBQUEsUUFDUyxpQkFEVCxHQUM4QixPQUQ5QixDQUNTLGlCQURUO0FBRW5CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsZ0JBRGE7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEdBRGI7QUFFSixRQUFBLGlCQUFpQixFQUFqQixpQkFGSTtBQUdKLFFBQUEsUUFBUSxFQUFFLE1BSE47QUFHYztBQUNsQixRQUFBLEdBQUcsRUFBRSxFQUpEO0FBS0osUUFBQSxPQUFPLEVBQUUsRUFMTDtBQU1KLFFBQUEsS0FBSyxFQUFFLEVBTkg7QUFPSixRQUFBLEdBQUcsRUFBSCxHQVBJO0FBUUosUUFBQSxJQUFJLEVBQUosSUFSSTtBQVNKLFFBQUEsSUFBSSxFQUFFLE1BVEY7QUFVSixRQUFBLFNBQVMsRUFBRSxFQVZQO0FBV0osUUFBQSxLQUFLLEVBQUUsQ0FYSDtBQVlKLFFBQUEsYUFBYSxFQUFFLEVBWlg7QUFhSixRQUFBLElBQUksRUFBRSxLQWJGO0FBY0osUUFBQSxtQkFBbUIsRUFBRSxFQWRqQjtBQWVKLFFBQUEsVUFBVSxFQUFFLEVBZlI7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LEtBQW5CO0FBQ0EsY0FBQSxJQUFJLENBQUMsR0FBTCxDQUFTLFlBQVQsQ0FBc0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUEvQjtBQUNELGFBUkgsV0FTUyxVQUFTLElBQVQsRUFBZTtBQUNwQixjQUFBLFVBQVUsQ0FBQyxJQUFELENBQVY7QUFDRCxhQVhIO0FBWUQsV0FoQkQsRUFnQkc7QUFDRCxZQUFBLEtBQUssRUFBRSxPQUROO0FBRUQsWUFBQSxJQUFJLEVBQUUsQ0FDSjtBQUNFLGNBQUEsR0FBRyxFQUFFLE9BRFA7QUFFRSxjQUFBLElBQUksRUFBRSxNQUZSO0FBR0UsY0FBQSxLQUFLLEVBQUUsT0FIVDtBQUlFLGNBQUEsS0FBSyxFQUFFO0FBSlQsYUFESSxFQU9KO0FBQ0UsY0FBQSxHQUFHLEVBQUUsVUFEUDtBQUVFLGNBQUEsS0FBSyxFQUFFLE9BRlQ7QUFHRSxjQUFBLEtBQUssRUFBRTtBQUhULGFBUEk7QUFGTCxXQWhCSDtBQWdDRDtBQXRoQk07QUFySlEsS0FBUixDQUFYO0FBOHFCRDs7QUFsckJIO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJOS0MubW9kdWxlcy5MaWJyYXJ5ID0gY2xhc3Mge1xyXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHtsaWQsIGZvbGRlcklkLCB0TGlkLCB1cGxvYWRSZXNvdXJjZXNJZH0gPSBvcHRpb25zO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLmFwcCA9IG5ldyBWdWUoe1xyXG4gICAgICBlbDogXCIjbW9kdWxlTGlicmFyeVwiLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgdWlkOiBOS0MuY29uZmlncy51aWQsXHJcbiAgICAgICAgdXBsb2FkUmVzb3VyY2VzSWQsXHJcbiAgICAgICAgcGFnZVR5cGU6IFwibGlzdFwiLCAvLyBsaXN0OiDmlofku7bliJfooagsIHVwbG9hZGVyOiDmlofku7bkuIrkvKBcclxuICAgICAgICBuYXY6IFtdLFxyXG4gICAgICAgIGZvbGRlcnM6IFtdLFxyXG4gICAgICAgIGZpbGVzOiBbXSxcclxuICAgICAgICBsaWQsXHJcbiAgICAgICAgdExpZCxcclxuICAgICAgICBzb3J0OiBcInRpbWVcIixcclxuICAgICAgICBoaXN0b3JpZXM6IFtdLFxyXG4gICAgICAgIGluZGV4OiAwLFxyXG4gICAgICAgIHNlbGVjdGVkRmlsZXM6IFtdLFxyXG4gICAgICAgIG1hcms6IGZhbHNlLFxyXG4gICAgICAgIHNlbGVjdGVkTGlicmFyaWVzSWQ6IFtdLFxyXG4gICAgICAgIHBlcm1pc3Npb246IFtdLFxyXG4gICAgICAgIGxhc3RIaXN0b3J5TGlkOiBcIlwiLFxyXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IFwiYm9va1wiLCAvLyDmibnph4/kv67mlLnmlofku7bnsbvlnotcclxuICAgICAgICBzZWxlY3RlZEZvbGRlcjogXCJcIiwgLy8g5om56YeP5L+u5pS55paH5Lu255uu5b2VIOebruW9lUlEXHJcbiAgICAgICAgc2VsZWN0ZWRGb2xkZXJQYXRoOiBcIlwiLCAvLyDmibnph4/kv67mlLnmlofku7bnm67lvZUg55uu5b2V6Lev5b6EXHJcbiAgICAgICAgbGlzdENhdGVnb3JpZXM6IFtcImJvb2tcIiwgXCJwYXBlclwiLCBcInByb2dyYW1cIiwgXCJtZWRpYVwiLCBcIm90aGVyXCJdLFxyXG4gICAgICAgIGNhdGVnb3JpZXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IFwiYm9va1wiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIuWbvuS5plwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZDogXCJwYXBlclwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIuiuuuaWh1wiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZDogXCJwcm9ncmFtXCIsXHJcbiAgICAgICAgICAgIG5hbWU6IFwi56iL5bqPXCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlkOiBcIm1lZGlhXCIsXHJcbiAgICAgICAgICAgIG5hbWU6IFwi5aqS5L2TXCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlkOiBcIm90aGVyXCIsXHJcbiAgICAgICAgICAgIG5hbWU6IFwi5YW25LuWXCJcclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIHByb3RvY29sOiB0cnVlLCAvLyDmmK/lkKblkIzmhI/ljY/orq5cclxuICAgICAgfSxcclxuICAgICAgd2F0Y2g6e1xyXG4gICAgICAgIGxpc3RDYXRlZ29yaWVzKCkge1xyXG4gICAgICAgICAgdGhpcy5zYXZlQ2F0ZWdvcmllc1RvTG9jYWxTdG9yYWdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBtb3VudGVkKCkge1xyXG4gICAgICAgIGlmKGZvbGRlcklkKSB7XHJcbiAgICAgICAgICB0aGlzLnNhdmVUb0xvY2FsU3RvcmFnZShmb2xkZXJJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2V0Q2F0ZWdvcmllc0Zyb21Mb2NhbFN0b3JhZ2UoKTtcclxuICAgICAgICBjb25zdCBsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzID0gTktDLm1ldGhvZHMuZ2V0RnJvbUxvY2FsU3RvcmFnZShcImxpYnJhcnlWaXNpdEZvbGRlckxvZ3NcIik7XHJcbiAgICAgICAgY29uc3QgY2hpbGRGb2xkZXJJZCA9IGxpYnJhcnlWaXNpdEZvbGRlckxvZ3NbdGhpcy5saWRdO1xyXG4gICAgICAgIGNvbnN0IHRoaXNfID0gdGhpcztcclxuICAgICAgICBpZihjaGlsZEZvbGRlcklkICE9PSB1bmRlZmluZWQgJiYgY2hpbGRGb2xkZXJJZCAhPT0gdGhpcy5saWQpIHtcclxuICAgICAgICAgIC8vIOWmguaenOa1j+iniOWZqOacrOWcsOWtmOacieiuv+mXruiusOW9le+8jOWImeWFiOehruWumuivpeiusOW9leS4reeahOaWh+S7tuWkueaYr+WQpuWtmOWcqO+8jOWtmOWcqOWImeiuv+mXru+8jOS4jeWtmOWcqOWImeaJk+W8gOmhtuWxguaWh+S7tuWkueOAglxyXG4gICAgICAgICAgdGhpcy5nZXRMaXN0KGNoaWxkRm9sZGVySWQpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzXy5hZGRIaXN0b3J5KHRoaXNfLmxpZCk7XHJcbiAgICAgICAgICAgICAgdGhpc18uYWRkRmlsZUJ5UmlkKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCAoKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXNfLmdldExpc3RJbmZvKHRoaXNfLmxpZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdldExpc3RJbmZvKHRoaXNfLmxpZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZighd2luZG93LkNvbW1vbk1vZGFsKSB7XHJcbiAgICAgICAgICBpZighTktDLm1vZHVsZXMuQ29tbW9uTW9kYWwpIHtcclxuICAgICAgICAgICAgc3dlZXRFcnJvcihcIuacquW8leWFpemAmueUqOW8ueahhlwiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5Db21tb25Nb2RhbCA9IG5ldyBOS0MubW9kdWxlcy5Db21tb25Nb2RhbCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighd2luZG93LlJlc291cmNlSW5mbykge1xyXG4gICAgICAgICAgaWYoIU5LQy5tb2R1bGVzLlJlc291cmNlSW5mbykge1xyXG4gICAgICAgICAgICBzd2VldEVycm9yKFwi5pyq5byV5YWl6LWE5rqQ5L+h5oGv5qih5Z2XXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LlJlc291cmNlSW5mbyA9IG5ldyBOS0MubW9kdWxlcy5SZXNvdXJjZUluZm8oKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIXdpbmRvdy5TZWxlY3RSZXNvdXJjZSkge1xyXG4gICAgICAgICAgaWYoIU5LQy5tb2R1bGVzLlNlbGVjdFJlc291cmNlKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXotYTmupDkv6Hmga/mqKHlnZdcIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuU2VsZWN0UmVzb3VyY2UgPSBuZXcgTktDLm1vZHVsZXMuU2VsZWN0UmVzb3VyY2UoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIXdpbmRvdy5MaWJyYXJ5UGF0aCkge1xyXG4gICAgICAgICAgaWYoIU5LQy5tb2R1bGVzLkxpYnJhcnlQYXRoKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXmloflupPot6/lvoTpgInmi6nmqKHlnZdcIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuTGlicmFyeVBhdGggPSBuZXcgTktDLm1vZHVsZXMuTGlicmFyeVBhdGgoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93Lm9ucG9wc3RhdGUgPSB0aGlzLm9ucG9wc3RhdGU7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgdXBsb2FkaW5nKCkge1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGYgb2YgdGhpcy5zZWxlY3RlZEZpbGVzKSB7XHJcbiAgICAgICAgICAgIGlmKGYuc3RhdHVzID09PSBcInVwbG9hZGluZ1wiKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxhc3RGb2xkZXIoKSB7XHJcbiAgICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5uYXYubGVuZ3RoO1xyXG4gICAgICAgICAgaWYobGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uYXZbbGVuZ3RoIC0yXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvbGRlcigpIHtcclxuICAgICAgICAgIHZhciBsZW5ndGggPSB0aGlzLm5hdi5sZW5ndGg7XHJcbiAgICAgICAgICBpZihsZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmF2W2xlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHt9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb2xkZXJMaXN0KCkge1xyXG4gICAgICAgICAgY29uc3Qge2xpc3RDYXRlZ29yaWVzLCBmaWxlcywgZm9sZGVycywgdWlkfSA9IHRoaXM7XHJcbiAgICAgICAgICBsZXQgZmlsZXNfID0gZmlsZXM7XHJcbiAgICAgICAgICBpZihsaXN0Q2F0ZWdvcmllcy5pbmNsdWRlcyhcIm93blwiKSAmJiB1aWQpIHtcclxuICAgICAgICAgICAgZmlsZXNfID0gZmlsZXMuZmlsdGVyKGYgPT4gZi51aWQgPT09IHVpZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmaWxlc18gPSBmaWxlc18uZmlsdGVyKGYgPT4gbGlzdENhdGVnb3JpZXMuaW5jbHVkZXMoZi5jYXRlZ29yeSkpO1xyXG4gICAgICAgICAgcmV0dXJuIGZvbGRlcnMuY29uY2F0KGZpbGVzXyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGxvYWRlZENvdW50KCkge1xyXG4gICAgICAgICAgbGV0IGNvdW50ID0gMDsgXHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICBpZihmLnN0YXR1cyA9PT0gXCJ1cGxvYWRlZFwiKSBjb3VudCArKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW5VcGxvYWRlZENvdW50KCkge1xyXG4gICAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcy5tYXAoZiA9PiB7XHJcbiAgICAgICAgICAgIGlmKGYuc3RhdHVzID09PSBcIm5vdFVwbG9hZGVkXCIpIGNvdW50ICsrO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgZ2V0VXJsOiBOS0MubWV0aG9kcy50b29scy5nZXRVcmwsXHJcbiAgICAgICAgdmlzaXRVcmw6IE5LQy5tZXRob2RzLnZpc2l0VXJsLFxyXG4gICAgICAgIGZvcm1hdDogTktDLm1ldGhvZHMuZm9ybWF0LFxyXG4gICAgICAgIGdldFNpemU6IE5LQy5tZXRob2RzLnRvb2xzLmdldFNpemUsXHJcbiAgICAgICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgICAgICBzY3JvbGxUbzogTktDLm1ldGhvZHMuc2Nyb2xsVG9wLFxyXG4gICAgICAgIGFkZEZpbGVCeVJpZCgpIHtcclxuICAgICAgICAgIGNvbnN0IHt1cGxvYWRSZXNvdXJjZXNJZH0gPSB0aGlzO1xyXG4gICAgICAgICAgaWYoIXVwbG9hZFJlc291cmNlc0lkIHx8IHVwbG9hZFJlc291cmNlc0lkLmxlbmd0aCA8PSAwKSByZXR1cm47XHJcbiAgICAgICAgICBjb25zdCByaWQgPSB1cGxvYWRSZXNvdXJjZXNJZC5qb2luKFwiLVwiKTtcclxuICAgICAgICAgIG5rY0FQSShgL3JzP3JpZD0ke3JpZH1gLCBcIkdFVFwiKVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBkYXRhLnJlc291cmNlcy5tYXAociA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5zZWxlY3RlZEZpbGVzLnB1c2goc2VsZi5hcHAuY3JlYXRlRmlsZShcIm9ubGluZUZpbGVcIiwgcikpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnBhZ2VUeXBlID0gXCJ1cGxvYWRlclwiO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnVwbG9hZFJlc291cmNlc0lkID0gW107XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChzd2VldEVycm9yKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5riF56m65pyq5LiK5Lyg55qE6K6w5b2VXHJcbiAgICAgICAgY2xlYXJVblVwbG9hZGVkKCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzID0gdGhpcy5zZWxlY3RlZEZpbGVzLmZpbHRlcihmID0+IGYuc3RhdHVzICE9PSBcIm5vdFVwbG9hZGVkXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5om56YeP6K6+572u5paH5Lu255uu5b2VXHJcbiAgICAgICAgc2VsZWN0RmlsZXNGb2xkZXIoKSB7XHJcbiAgICAgICAgICBjb25zdCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgICBMaWJyYXJ5UGF0aC5vcGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtmb2xkZXIsIHBhdGh9ID0gZGF0YTtcclxuICAgICAgICAgICAgdGhpc18uc2VsZWN0ZWRGb2xkZXIgPSBmb2xkZXI7XHJcbiAgICAgICAgICAgIHRoaXNfLnNlbGVjdGVkRm9sZGVyUGF0aCA9IHBhdGg7XHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGxpZDogdGhpcy5saWQsXHJcbiAgICAgICAgICAgIHdhcm5pbmc6IFwi6K+l5pON5L2c5bCG6KaG55uW5pys6aG15omA5pyJ6K6+572u77yM6K+36LCo5oWO5pON5L2c44CCXCJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5riF56m65bey5oiQ5Yqf5LiK5Lyg55qE5paH5Lu26K6w5b2VXHJcbiAgICAgICAgY2xlYXJVcGxvYWRlZCgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcyA9IHRoaXMuc2VsZWN0ZWRGaWxlcy5maWx0ZXIoZiA9PiBmLnN0YXR1cyAhPT0gXCJ1cGxvYWRlZFwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaJuemHj+iuvue9ruaWh+S7tueahOWIhuexu1xyXG4gICAgICAgIG1hcmtDYXRlZ29yeSgpIHtcclxuICAgICAgICAgIGNvbnN0IHtzZWxlY3RlZENhdGVnb3J5LCBzZWxlY3RlZEZpbGVzfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZighc2VsZWN0ZWRDYXRlZ29yeSkgcmV0dXJuO1xyXG4gICAgICAgICAgc3dlZXRRdWVzdGlvbihcIuivpeaTjeS9nOWwhuimhuebluacrOmhteaJgOacieiuvue9ru+8jOivt+WGjeasoeehruiupOOAglwiKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlcy5tYXAoZiA9PiBmLmNhdGVnb3J5ID0gc2VsZWN0ZWRDYXRlZ29yeSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge30pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmibnph4/orr7nva7mlofku7bnm67lvZVcclxuICAgICAgICBtYXJrRm9sZGVyKCkge1xyXG4gICAgICAgICAgY29uc3Qge3NlbGVjdGVkRm9sZGVyLCBzZWxlY3RlZEZvbGRlclBhdGgsIHNlbGVjdGVkRmlsZXN9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCFzZWxlY3RlZEZvbGRlcikgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3QgdGhpc18gPSB0aGlzO1xyXG4gICAgICAgICAgc3dlZXRRdWVzdGlvbihg6K+l5pON5L2c5bCG6KaG55uW5pys6aG15omA5pyJ6K6+572u77yM6K+35YaN5qyh56Gu6K6k44CCYClcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGVjdGVkRmlsZXMubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICAgICAgZi5mb2xkZXIgPSBzZWxlY3RlZEZvbGRlcjtcclxuICAgICAgICAgICAgICAgIGYuZm9sZGVyUGF0aCA9IHNlbGVjdGVkRm9sZGVyUGF0aDtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB0aGlzXy5zZWxlY3RlZEZvbGRlciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgdGhpc18uc2VsZWN0ZWRGb2xkZXJQYXRoID0gXCJcIjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7fSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOe9kemhteWIh+aNouS6i+S7tlxyXG4gICAgICAgIG9ucG9wc3RhdGUoZSkge1xyXG4gICAgICAgICAgY29uc3Qge3N0YXRlfSA9IGU7XHJcbiAgICAgICAgICBsZXQgbGlkID0gdGhpcy5saWQ7XHJcbiAgICAgICAgICBpZihzdGF0ZSAmJiBzdGF0ZS5saWQpIGxpZCA9IHN0YXRlLmxpZDtcclxuICAgICAgICAgIHRoaXMuZ2V0TGlzdChsaWQpXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWKoOi9veaWh+S7tuWkueS/oeaBr++8jOWMheWQq+mUmeivr+WkhOeQhlxyXG4gICAgICAgIGdldExpc3RJbmZvKGlkLCBzY3JvbGxUb1RvcCkge1xyXG4gICAgICAgICAgdGhpcy5nZXRMaXN0KGlkLCBzY3JvbGxUb1RvcClcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmFkZEhpc3RvcnkoaWQpO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmFkZEZpbGVCeVJpZCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOavlOWvueadg+mZkHBlcm1pc3Npb25cclxuICAgICAgICBwZXIob3BlcmF0aW9uKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5wZXJtaXNzaW9uLmluY2x1ZGVzKG9wZXJhdGlvbik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDlvIDlkK/lpJrpgInmoYZcclxuICAgICAgICBtYXJrTGlicmFyeSgpIHtcclxuICAgICAgICAgIHRoaXMubWFyayA9ICF0aGlzLm1hcms7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQgPSBbXTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqS/lj5bmtogg5YWo6YOoXHJcbiAgICAgICAgbWFya0FsbCgpIHtcclxuICAgICAgICAgIGlmKHRoaXMuc2VsZWN0ZWRMaWJyYXJpZXNJZC5sZW5ndGggPT09IHRoaXMuZm9sZGVyTGlzdC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpYnJhcmllc0lkID0gW107XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQgPSB0aGlzLmZvbGRlckxpc3QubWFwKGYgPT4gZi5faWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5om56YeP5Yig6ZmkXHJcbiAgICAgICAgZGVsZXRlRm9sZGVycygpIHtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlRm9sZGVyKHRoaXMuc2VsZWN0ZWRMaWJyYXJpZXNJZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmibnph4/np7vliqhcclxuICAgICAgICBtb3ZlRm9sZGVycygpIHtcclxuICAgICAgICAgIHRoaXMubW92ZUZvbGRlcih0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5qC55o2u5pys5Zyw5paH5Lu25oiW6ICFcmVzb3VyY2Xlr7nosaHmnoTlu7rnlKjkuo7kuIrkvKDnmoTmlofku7blr7nosaFcclxuICAgICAgICBzZWxlY3RQYXRoKHIpIHtcclxuICAgICAgICAgIExpYnJhcnlQYXRoLm9wZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qge2ZvbGRlciwgcGF0aH0gPSBkYXRhO1xyXG4gICAgICAgICAgICByLmZvbGRlciA9IGZvbGRlcjtcclxuICAgICAgICAgICAgci5mb2xkZXJQYXRoID0gcGF0aDtcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgbGlkOiByLmZvbGRlcj9yLmZvbGRlci5faWQ6IFwiXCJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlRmlsZSh0eXBlLCByKSB7XHJcbiAgICAgICAgICBjb25zdCB7Zm9sZGVyLCBmb2xkZXJQYXRoLCBfaWQsIHRvYywgcmlkLCBjYXRlZ29yeSwgbmFtZSA9IFwiXCIsIG9uYW1lLCBkZXNjcmlwdGlvbiA9IFwiXCIsIHNpemV9ID0gcjtcclxuICAgICAgICAgIGNvbnN0IGZpbGUgPSB7XHJcbiAgICAgICAgICAgIF9pZCxcclxuICAgICAgICAgICAgdHlwZSxcclxuICAgICAgICAgICAgcmlkLFxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lIHx8IG9uYW1lLFxyXG4gICAgICAgICAgICBzaXplLFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnkgfHwgXCJcIixcclxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIGZvbGRlcjogZm9sZGVyIHx8IHRoaXMuZm9sZGVyLFxyXG4gICAgICAgICAgICBmb2xkZXJQYXRoOiBmb2xkZXJQYXRoIHx8ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHNlbGYuYXBwLm5hdi5tYXAobiA9PiBuLm5hbWUpO1xyXG4gICAgICAgICAgICAgIHJldHVybiBcIi9cIiArIG5hbWUuam9pbihcIi9cIik7XHJcbiAgICAgICAgICAgIH0pKCksXHJcbiAgICAgICAgICAgIGRhdGE6IHIsXHJcbiAgICAgICAgICAgIHRvYzogdG9jIHx8IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgIHN0YXR1czogXCJub3RVcGxvYWRlZFwiLCAvLyBub3RVcGxvYWRlZCwgdXBsb2FkaW5nLCB1cGxvYWRlZFxyXG4gICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxyXG4gICAgICAgICAgICBlcnJvcjogXCJcIiwgLy8g6ZSZ6K+v5L+h5oGvXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgZmlsZS5uYW1lID0gZmlsZS5uYW1lLnJlcGxhY2UoL1xcLi4qPyQvaWcsIFwiXCIpO1xyXG4gICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgIGlmKHIudHlwZS5pbmNsdWRlcyhcImltYWdlXCIpKSB7XHJcbiAgICAgICAgICAgICAgZmlsZS5leHQgPSBcIm1lZGlhUGljdHVyZVwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGZpbGUuZXh0ID0gXCJtZWRpYUF0dGFjaG1lbnRcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmKGZpbGUuZXh0ID09PSBcIm1lZGlhUGljdHVyZVwiKSB7XHJcbiAgICAgICAgICAgIGZpbGUuZXJyb3IgPSBcIuaaguS4jeWFgeiuuOS4iuS8oOWbvueJh+WIsOaWh+W6k1wiO1xyXG4gICAgICAgICAgICBmaWxlLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgIH0gZWxzZSBpZihmaWxlLnNpemUgPiAyMDAgKiAxMDI0ICogMTAyNCkge1xyXG4gICAgICAgICAgICBmaWxlLmVycm9yID0gXCLmlofku7blpKflsI/kuI3og73otoXov4cyMDBNQlwiO1xyXG4gICAgICAgICAgICBmaWxlLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZmlsZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXJ0VXBsb2FkKCkge1xyXG4gICAgICAgICAgdGhpcy51cGxvYWRGaWxlKDAsIHRoaXMuc2VsZWN0ZWRGaWxlcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVGaWxlKGluZGV4KSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOS4iuS8oOaWh+S7tlxyXG4gICAgICAgIHVwbG9hZEZpbGUoaW5kZXgsIGFycikge1xyXG4gICAgICAgICAgaWYoaW5kZXggPj0gYXJyLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3QgZmlsZSA9IGFycltpbmRleF07XHJcbiAgICAgICAgICBjb25zdCB7c3RhdHVzLCBkaXNhYmxlZH0gPSBmaWxlO1xyXG4gICAgICAgICAgaWYoZGlzYWJsZWQgfHwgc3RhdHVzICE9PSBcIm5vdFVwbG9hZGVkXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXBsb2FkRmlsZShpbmRleCArIDEsIGFycik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmaWxlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgIGZpbGUuc3RhdHVzID0gXCJ1cGxvYWRpbmdcIjtcclxuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBpZighZmlsZSkgdGhyb3cgXCLmlofku7blvILluLhcIjtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5jaGVja1N0cmluZyhmaWxlLm5hbWUsIHtcclxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgICAgIG1heExlbmd0aDogNTAwLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogXCLmlofku7blkI3np7BcIlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmNoZWNrU3RyaW5nKGZpbGUuZGVzY3JpcHRpb24sIHtcclxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDogMCxcclxuICAgICAgICAgICAgICAgIG1heExlbmd0aDogMTAwMCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi5paH5Lu26K+05piOXCJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBpZighW1wibWVkaWFcIiwgXCJwYXBlclwiLCBcImJvb2tcIiwgXCJwcm9ncmFtXCIsIFwib3RoZXJcIl0uaW5jbHVkZXMoZmlsZS5jYXRlZ29yeSkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IFwi5pyq6YCJ5oup5paH5Lu25YiG57G7XCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmKCFmaWxlLmZvbGRlcikgdGhyb3cgXCLmnKrpgInmi6nnm67lvZVcIjtcclxuICAgICAgICAgICAgICBpZihmaWxlLnR5cGUgPT09IFwibG9jYWxGaWxlXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBOS0MubWV0aG9kcy5nZXRGaWxlTUQ1KGZpbGUuZGF0YSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAvLyDkuIrkvKDmnKzlnLDmlofku7ZcclxuICAgICAgICAgICAgICBpZihmaWxlLnR5cGUgPT09IFwibG9jYWxGaWxlXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlTmFtZVwiLCBmaWxlLmRhdGEubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJ0eXBlXCIsIFwiY2hlY2tNRDVcIik7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJtZDVcIiwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZShcIi9yXCIsIFwiUE9TVFwiLCBmb3JtRGF0YSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICBpZihkYXRhICYmICFkYXRhLnVwbG9hZGVkICYmIGZpbGUudHlwZSA9PT0gXCJsb2NhbEZpbGVcIikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVcIiwgZmlsZS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKFwiL3JcIiwgXCJQT1NUXCIsIGZvcm1EYXRhLCAoZSwgcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gcDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOabv+aNouacrOWcsOaWh+S7tuS/oeaBryDnu5/kuIDkuLrnur/kuIrmlofku7bmqKHlvI9cclxuICAgICAgICAgICAgICBpZihmaWxlLnR5cGUgPT09IFwibG9jYWxGaWxlXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gZGF0YS5yO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5kYXRhID0gcmVzb3VyY2U7XHJcbiAgICAgICAgICAgICAgICBmaWxlLmV4dCA9IHJlc291cmNlLm1lZGlhVHlwZTtcclxuICAgICAgICAgICAgICAgIGZpbGUucmlkID0gcmVzb3VyY2UucmlkO1xyXG4gICAgICAgICAgICAgICAgZmlsZS50b2MgPSByZXNvdXJjZS50b2M7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnR5cGUgPSBcIm9ubGluZUZpbGVcIjtcclxuICAgICAgICAgICAgICAgIGlmKGZpbGUuZXh0ID09PSBcIm1lZGlhUGljdHVyZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZpbGUuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICB0aHJvdyhuZXcgRXJyb3IoXCLmmoLkuI3lhYHorrjkuIrkvKDlm77niYfliLDmloflupNcIikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmKGZpbGUudHlwZSA9PT0gXCJtb2RpZnlcIikge1xyXG4gICAgICAgICAgICAgICAgLy8g5om56YeP5L+u5pS5XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7X2lkLCBuYW1lLCBkZXNjcmlwdGlvbiwgY2F0ZWdvcnl9ID0gZmlsZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBua2NBUEkoYC9saWJyYXJ5LyR7X2lkfWAsIFwiUEFUQ0hcIiwgYm9keSk7XHJcblxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDlsIbnur/kuIrmlofku7bmj5DkuqTliLDmloflupNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgICAgICAgbmFtZSwgZGVzY3JpcHRpb24sIGNhdGVnb3J5LCByaWQsIGZvbGRlclxyXG4gICAgICAgICAgICAgICAgfSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgICByaWQsXHJcbiAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJib2R5XCIsIEpTT04uc3RyaW5naWZ5KGJvZHkpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBua2NBUEkoYC9saWJyYXJ5LyR7Zm9sZGVyLl9pZH1gLCBcIlBPU1RcIiwgYm9keSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgZmlsZS5zdGF0dXMgPSBcInVwbG9hZGVkXCI7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBmaWxlLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhO1xyXG4gICAgICAgICAgICAgIGZpbGUuc3RhdHVzID0gXCJub3RVcGxvYWRlZFwiO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuZmluYWxseSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAudXBsb2FkRmlsZShpbmRleCsxLCBhcnIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6L+U5Zue5LiK5LiA5bGC5paH5Lu25aS5XHJcbiAgICAgICAgYmFjaygpIHtcclxuICAgICAgICAgIGlmKHRoaXMubGFzdEZvbGRlcikgdGhpcy5zZWxlY3RGb2xkZXIodGhpcy5sYXN0Rm9sZGVyKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWIh+aNouWIsOaWh+S7tuS4iuS8oFxyXG4gICAgICAgIHRvVXBsb2FkKCkge1xyXG4gICAgICAgICAgaWYodGhpcy5tYXJrKSByZXR1cm47XHJcbiAgICAgICAgICB0aGlzLnBhZ2VUeXBlID0gXCJ1cGxvYWRlclwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5YiH5o2i5Yiw5paH5Lu25YiX6KGoXHJcbiAgICAgICAgdG9MaXN0KCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RGb2xkZXIodGhpcy5mb2xkZXIpO1xyXG4gICAgICAgICAgdGhpcy5wYWdlVHlwZSA9IFwibGlzdFwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5bCG55So5oi35bey6YCJ5oup55qE562b6YCJ5YiG57G75a2Y5Yiw5pys5ZywXHJcbiAgICAgICAgc2F2ZUNhdGVnb3JpZXNUb0xvY2FsU3RvcmFnZSgpIHtcclxuICAgICAgICAgIGNvbnN0IHtsaXN0Q2F0ZWdvcmllc30gPSB0aGlzO1xyXG4gICAgICAgICAgY29uc3QgbGlicmFyeUxpc3RDYXRlZ29yaWVzID0gTktDLm1ldGhvZHMuZ2V0RnJvbUxvY2FsU3RvcmFnZShcImxpYnJhcnlMaXN0Q2F0ZWdvcmllc1wiKTtcclxuICAgICAgICAgIGxpYnJhcnlMaXN0Q2F0ZWdvcmllc1t0aGlzLmxpZF0gPSBsaXN0Q2F0ZWdvcmllcztcclxuICAgICAgICAgIE5LQy5tZXRob2RzLnNhdmVUb0xvY2FsU3RvcmFnZShcImxpYnJhcnlMaXN0Q2F0ZWdvcmllc1wiLCBsaWJyYXJ5TGlzdENhdGVnb3JpZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6K+75Y+W5pys5Zyw5a2Y5YKo55qE562b6YCJ5YiG57G7XHJcbiAgICAgICAgZ2V0Q2F0ZWdvcmllc0Zyb21Mb2NhbFN0b3JhZ2UoKSB7XHJcbiAgICAgICAgICBjb25zdCBsaWJyYXJ5TGlzdENhdGVnb3JpZXMgPSBOS0MubWV0aG9kcy5nZXRGcm9tTG9jYWxTdG9yYWdlKFwibGlicmFyeUxpc3RDYXRlZ29yaWVzXCIpO1xyXG4gICAgICAgICAgY29uc3QgbGlzdENhdGVnb3JpZXMgPSBsaWJyYXJ5TGlzdENhdGVnb3JpZXNbdGhpcy5saWRdO1xyXG4gICAgICAgICAgaWYobGlzdENhdGVnb3JpZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0Q2F0ZWdvcmllcyA9IGxpc3RDYXRlZ29yaWVzOyBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaWh+S7tuWkueiuv+mXruiusOW9leWtmOWIsOa1j+iniOWZqOacrOWcsFxyXG4gICAgICAgIHNhdmVUb0xvY2FsU3RvcmFnZShpZCkge1xyXG4gICAgICAgICAgY29uc3QgbGlicmFyeVZpc2l0Rm9sZGVyTG9ncyA9IE5LQy5tZXRob2RzLmdldEZyb21Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzXCIpO1xyXG4gICAgICAgICAgbGlicmFyeVZpc2l0Rm9sZGVyTG9nc1t0aGlzLmxpZF0gPSBpZDtcclxuICAgICAgICAgIE5LQy5tZXRob2RzLnNhdmVUb0xvY2FsU3RvcmFnZShcImxpYnJhcnlWaXNpdEZvbGRlckxvZ3NcIiwgbGlicmFyeVZpc2l0Rm9sZGVyTG9ncyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmt7vliqDkuIDmnaHmtY/op4jlmajljoblj7LorrDlvZVcclxuICAgICAgICBhZGRIaXN0b3J5KGxpZCkge1xyXG4gICAgICAgICAgLy8g5Yik5pat5piv5ZCm5Li655u45ZCM6aG177yM55u45ZCM5YiZ5LiN5Yib5bu65rWP6KeI5Zmo5Y6G5Y+y6K6w5b2V44CCXHJcbiAgICAgICAgICBpZih0aGlzLmxhc3RIaXN0b3J5TGlkICYmIHRoaXMubGFzdEhpc3RvcnlMaWQgPT09IGxpZCkgcmV0dXJuO1xyXG4gICAgICAgICAgbGV0IHtocmVmfSA9IHdpbmRvdy5sb2NhdGlvbjtcclxuICAgICAgICAgIGlmKGhyZWYuaW5jbHVkZXMoXCIjXCIpKSB7XHJcbiAgICAgICAgICAgIGhyZWYgPSBocmVmLnJlcGxhY2UoLyMuKi9pZywgXCJcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe2xpZH0sICdwYWdlJywgaHJlZiArICcjJyArIGxpZCk7XHJcbiAgICAgICAgICB0aGlzLmxhc3RIaXN0b3J5TGlkID0gbGlkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6I635Y+W5paH5Lu25YiX6KGoXHJcbiAgICAgICAgZ2V0TGlzdChpZCwgc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgIGNvbnN0IHVybCA9IGAvbGlicmFyeS8ke2lkfT9maWxlPXRydWUmbmF2PXRydWUmZm9sZGVyPXRydWUmcGVybWlzc2lvbj10cnVlJnQ9JHtEYXRlLm5vdygpfWA7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKHVybCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLm5hdiA9IGRhdGEubmF2O1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZvbGRlcnMgPSBkYXRhLmZvbGRlcnM7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuZmlsZXMgPSBkYXRhLmZpbGVzO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnBlcm1pc3Npb24gPSBkYXRhLnBlcm1pc3Npb247XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvTG9jYWxTdG9yYWdlKGlkKTtcclxuICAgICAgICAgICAgICBpZihzY3JvbGxUb1RvcCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2Nyb2xsVG8obnVsbCwgMCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0T25saW5lRmlsZXMoKSB7XHJcbiAgICAgICAgICBTZWxlY3RSZXNvdXJjZS5vcGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtyZXNvdXJjZXN9ID0gZGF0YTtcclxuICAgICAgICAgICAgcmVzb3VyY2VzLm1hcChyID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5zZWxlY3RlZEZpbGVzLnB1c2goc2VsZi5hcHAuY3JlYXRlRmlsZShcIm9ubGluZUZpbGVcIiwgcikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWxsb3dlZEV4dDogW1wiYXR0YWNobWVudFwiLCBcInZpZGVvXCIsIFwiYXVkaW9cIl0sXHJcbiAgICAgICAgICAgIGNvdW50TGltaXQ6IDk5XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oup5a6M5pys5Zyw5paH5Lu2XHJcbiAgICAgICAgc2VsZWN0ZWRMb2NhbEZpbGVzKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZpbGVzID0gW119ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2R1bGVMaWJyYXJ5SW5wdXRcIik7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMucHVzaCh0aGlzLmNyZWF0ZUZpbGUoXCJsb2NhbEZpbGVcIiwgZmlsZSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2R1bGVMaWJyYXJ5SW5wdXRcIikudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oup5paH5Lu25aS5XHJcbiAgICAgICAgc2VsZWN0Rm9sZGVyKGZvbGRlciwgc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgIGlmKHRoaXMubWFyaykgcmV0dXJuO1xyXG4gICAgICAgICAgaWYoZm9sZGVyLnR5cGUgPT09IFwiZm9sZGVyXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRMaXN0SW5mbyhmb2xkZXIuX2lkLCBzY3JvbGxUb1RvcCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdEZpbGUoZm9sZGVyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOeCueWHu+aWh+S7tuWkueebruW9leaXtlxyXG4gICAgICAgIHNlbGVjdE5hdkZvbGRlcihmKSB7XHJcbiAgICAgICAgICBpZih0aGlzLnBhZ2VUeXBlICE9PSBcImxpc3RcIikge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VUeXBlID0gXCJsaXN0XCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdEZvbGRlcihmKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOenu+WKqOaWh+S7tuWkueaIluaWh+S7tlxyXG4gICAgICAgIG1vdmVGb2xkZXIobGlicmFyeUlkKSB7XHJcbiAgICAgICAgICBsZXQgZm9sZGVyc0lkO1xyXG4gICAgICAgICAgaWYoQXJyYXkuaXNBcnJheShsaWJyYXJ5SWQpKSB7XHJcbiAgICAgICAgICAgIGZvbGRlcnNJZCA9IGxpYnJhcnlJZDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvbGRlcnNJZCA9IFtsaWJyYXJ5SWRdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGJvZHkgPSB7fTtcclxuICAgICAgICAgIGJvZHkuZm9sZGVyc0lkID0gZm9sZGVyc0lkO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHVybCA9IGAvbGlicmFyeS8ke3RoaXMuZm9sZGVyLl9pZH0vbGlzdGA7XHJcbiAgICAgICAgICBjb25zdCBtZXRob2QgPSBcIlBBVENIXCI7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIExpYnJhcnlQYXRoLm9wZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgYm9keS50YXJnZXRGb2xkZXJJZCA9IGRhdGEuZm9sZGVyLl9pZDtcclxuICAgICAgICAgICAgbmtjQVBJKHVybCwgbWV0aG9kLCBib2R5KVxyXG4gICAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoYOaJp+ihjOaIkOWKnyR7ZGF0YS5pZ25vcmVDb3VudD8gYO+8jOWFseaciSR7ZGF0YS5pZ25vcmVDb3VudH3kuKrpobnnm67lm6DlrZjlnKjlhrLnqoHmiJbkuI3mmK/kvaDoh6rlt7Hlj5HluIPnmoTogIzooqvlv73nlaVgOiBcIlwifWApO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAubWFyayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0Rm9sZGVyKHNlbGYuYXBwLmZvbGRlcik7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGxpZDogc2VsZi5hcHAuZm9sZGVyLl9pZCxcclxuICAgICAgICAgICAgd2FybmluZzogXCLmraTmk43kvZzkuI3kvJrkv53nlZnljp/mnInnm67lvZXnu5PmnoTvvIzkuJTkuI3lj6/mgaLlpI3jgIJcIlxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOe8lui+keaWh+S7tuWkuVxyXG4gICAgICAgIGVkaXRGb2xkZXIoZm9sZGVyKSB7XHJcbiAgICAgICAgICBpZih0aGlzLm1hcmspIHJldHVybjtcclxuICAgICAgICAgIGxldCB0eXBlU3RyID0gXCLmlofku7blpLlcIjtcclxuICAgICAgICAgIGxldCBtb2RhbERhdGEgPSBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkb206IFwiaW5wdXRcIixcclxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICBsYWJlbDogYCR7dHlwZVN0cn3lkI3np7BgLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBmb2xkZXIubmFtZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZG9tOiBcInRleHRhcmVhXCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGAke3R5cGVTdHJ9566A5LuLYCxcclxuICAgICAgICAgICAgICB2YWx1ZTogZm9sZGVyLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF07XHJcbiAgICAgICAgICBpZihmb2xkZXIudHlwZSA9PT0gXCJmaWxlXCIpIHtcclxuICAgICAgICAgICAgdHlwZVN0ciA9IFwi5paH5Lu2XCI7XHJcbiAgICAgICAgICAgIG1vZGFsRGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICBkb206IFwicmFkaW9cIixcclxuICAgICAgICAgICAgICBsYWJlbDogXCLmlofku7bliIbnsbtcIixcclxuICAgICAgICAgICAgICByYWRpb3M6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogXCLlm77kuaZcIixcclxuICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiYm9va1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIuiuuuaWh1wiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJwYXBlclwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIueoi+W6j1wiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJwcm9ncmFtXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwi5aqS5L2TXCIsXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIm1lZGlhXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwi5YW25LuWXCIsXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIm90aGVyXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBmb2xkZXIuY2F0ZWdvcnlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIENvbW1vbk1vZGFsLm9wZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSByZXNbMF0udmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gcmVzWzFdLnZhbHVlO1xyXG4gICAgICAgICAgICBsZXQgY2F0ZWdvcnkgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZihmb2xkZXIudHlwZSA9PT0gXCJmaWxlXCIpIHtcclxuICAgICAgICAgICAgICBjYXRlZ29yeSA9IHJlc1syXS52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZighbmFtZSkgcmV0dXJuIHN3ZWV0RXJyb3IoXCLlkI3np7DkuI3og73kuLrnqbpcIik7XHJcbiAgICAgICAgICAgIG5rY0FQSShcIi9saWJyYXJ5L1wiICsgZm9sZGVyLl9pZCwgXCJQQVRDSFwiLCB7XHJcbiAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICBjYXRlZ29yeVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0Rm9sZGVyKHNlbGYuYXBwLmZvbGRlcik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuQ29tbW9uTW9kYWwuY2xvc2UoKTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHRpdGxlOiBg57yW6L6RJHt0eXBlU3RyfWAsXHJcbiAgICAgICAgICAgIGRhdGE6IG1vZGFsRGF0YVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliKDpmaTmlofku7blpLlcclxuICAgICAgICBkZWxldGVGb2xkZXIoZm9sZGVyc0lkKSB7XHJcbiAgICAgICAgICBpZighQXJyYXkuaXNBcnJheShmb2xkZXJzSWQpKSB7XHJcbiAgICAgICAgICAgIGZvbGRlcnNJZCA9IFtmb2xkZXJzSWRdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYoIWZvbGRlcnNJZC5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICAgIGZvbGRlcnNJZCA9IGZvbGRlcnNJZC5qb2luKFwiLVwiKTtcclxuICAgICAgICAgIHN3ZWV0UXVlc3Rpb24oYOehruWumuimgeaJp+ihjOWIoOmZpOaTjeS9nO+8n2ApXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIG5rY0FQSShgL2xpYnJhcnkvJHtzZWxmLmFwcC5mb2xkZXIuX2lkfS9saXN0P2xpZD0ke2ZvbGRlcnNJZH1gLCBcIkRFTEVURVwiKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICBzZWxmLmFwcC5tYXJrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdEZvbGRlcihzZWxmLmFwcC5mb2xkZXIpO1xyXG4gICAgICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoYOaJp+ihjOaIkOWKnyR7ZGF0YS5pZ25vcmVDb3VudD8gYO+8jOWFseaciSR7ZGF0YS5pZ25vcmVDb3VudH3kuKrpobnnm67lm6DkuI3mmK/kvaDoh6rlt7Hlj5HluIPnmoTogIzooqvlv73nlaVgOiBcIlwifWApO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKXt9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oup5paH5Lu2XHJcbiAgICAgICAgc2VsZWN0RmlsZShmaWxlKSB7XHJcbiAgICAgICAgICBSZXNvdXJjZUluZm8ub3Blbih7bGlkOiBmaWxlLl9pZH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Yib5bu65paH5Lu25aS5XHJcbiAgICAgICAgY3JlYXRlRm9sZGVyKCkge1xyXG4gICAgICAgICAgaWYodGhpcy5tYXJrKSByZXR1cm47XHJcbiAgICAgICAgICB3aW5kb3cuQ29tbW9uTW9kYWwub3BlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHJlc1swXS52YWx1ZTtcclxuICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSByZXNbMV0udmFsdWU7XHJcbiAgICAgICAgICAgIGlmKCFuYW1lKSByZXR1cm4gc3dlZXRFcnJvcihcIuWQjeensOS4jeiDveS4uuepulwiKTtcclxuICAgICAgICAgICAgbmtjQVBJKFwiL2xpYnJhcnkvXCIgKyBzZWxmLmFwcC5mb2xkZXIuX2lkICsgXCIvbGlzdFwiLCBcIlBPU1RcIiwge1xyXG4gICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb25cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHN3ZWV0U3VjY2VzcyhcIuaWh+S7tuWkueWIm+W7uuaIkOWKn1wiKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5Db21tb25Nb2RhbC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0Rm9sZGVyKHNlbGYuYXBwLmZvbGRlcik7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB0aXRsZTogXCLmlrDlu7rmlofku7blpLlcIixcclxuICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRvbTogXCJpbnB1dFwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCLmlofku7blpLnlkI3np7BcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkb206IFwidGV4dGFyZWFcIixcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIuaWh+S7tuWkueeugOS7i1wiLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwiXCJcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbn07XHJcbiJdfQ==
