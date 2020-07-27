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
              return nkcAPI("/library/".concat(_id), "PUT", body);
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
            file.error = data.error || data.message || data;
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
          var method = "PUT";
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
            nkcAPI("/library/" + folder._id, "PUT", {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2xpYnJhcnkvbGlicmFyeS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxPQUFaO0FBQ0Usa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUFBLFFBQ1osR0FEWSxHQUM4QixPQUQ5QixDQUNaLEdBRFk7QUFBQSxRQUNQLFFBRE8sR0FDOEIsT0FEOUIsQ0FDUCxRQURPO0FBQUEsUUFDRyxJQURILEdBQzhCLE9BRDlCLENBQ0csSUFESDtBQUFBLFFBQ1MsaUJBRFQsR0FDOEIsT0FEOUIsQ0FDUyxpQkFEVDtBQUVuQixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLGdCQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQURiO0FBRUosUUFBQSxpQkFBaUIsRUFBakIsaUJBRkk7QUFHSixRQUFBLFFBQVEsRUFBRSxNQUhOO0FBR2M7QUFDbEIsUUFBQSxHQUFHLEVBQUUsRUFKRDtBQUtKLFFBQUEsT0FBTyxFQUFFLEVBTEw7QUFNSixRQUFBLEtBQUssRUFBRSxFQU5IO0FBT0osUUFBQSxHQUFHLEVBQUgsR0FQSTtBQVFKLFFBQUEsSUFBSSxFQUFKLElBUkk7QUFTSixRQUFBLElBQUksRUFBRSxNQVRGO0FBVUosUUFBQSxTQUFTLEVBQUUsRUFWUDtBQVdKLFFBQUEsS0FBSyxFQUFFLENBWEg7QUFZSixRQUFBLGFBQWEsRUFBRSxFQVpYO0FBYUosUUFBQSxJQUFJLEVBQUUsS0FiRjtBQWNKLFFBQUEsbUJBQW1CLEVBQUUsRUFkakI7QUFlSixRQUFBLFVBQVUsRUFBRSxFQWZSO0FBZ0JKLFFBQUEsY0FBYyxFQUFF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bUIsS0FBbkI7QUFDQSxjQUFBLElBQUksQ0FBQyxHQUFMLENBQVMsWUFBVCxDQUFzQixJQUFJLENBQUMsR0FBTCxDQUFTLE1BQS9CO0FBQ0QsYUFSSCxXQVNTLFVBQVMsSUFBVCxFQUFlO0FBQ3BCLGNBQUEsVUFBVSxDQUFDLElBQUQsQ0FBVjtBQUNELGFBWEg7QUFZRCxXQWhCRCxFQWdCRztBQUNELFlBQUEsS0FBSyxFQUFFLE9BRE47QUFFRCxZQUFBLElBQUksRUFBRSxDQUNKO0FBQ0UsY0FBQSxHQUFHLEVBQUUsT0FEUDtBQUVFLGNBQUEsSUFBSSxFQUFFLE1BRlI7QUFHRSxjQUFBLEtBQUssRUFBRSxPQUhUO0FBSUUsY0FBQSxLQUFLLEVBQUU7QUFKVCxhQURJLEVBT0o7QUFDRSxjQUFBLEdBQUcsRUFBRSxVQURQO0FBRUUsY0FBQSxLQUFLLEVBQUUsT0FGVDtBQUdFLGNBQUEsS0FBSyxFQUFFO0FBSFQsYUFQSTtBQUZMLFdBaEJIO0FBZ0NEO0FBdGhCTTtBQXJKUSxLQUFSLENBQVg7QUE4cUJEOztBQWxyQkg7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIk5LQy5tb2R1bGVzLkxpYnJhcnkgPSBjbGFzcyB7XHJcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgY29uc3Qge2xpZCwgZm9sZGVySWQsIHRMaWQsIHVwbG9hZFJlc291cmNlc0lkfSA9IG9wdGlvbnM7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuYXBwID0gbmV3IFZ1ZSh7XHJcbiAgICAgIGVsOiBcIiNtb2R1bGVMaWJyYXJ5XCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB1aWQ6IE5LQy5jb25maWdzLnVpZCxcclxuICAgICAgICB1cGxvYWRSZXNvdXJjZXNJZCxcclxuICAgICAgICBwYWdlVHlwZTogXCJsaXN0XCIsIC8vIGxpc3Q6IOaWh+S7tuWIl+ihqCwgdXBsb2FkZXI6IOaWh+S7tuS4iuS8oFxyXG4gICAgICAgIG5hdjogW10sXHJcbiAgICAgICAgZm9sZGVyczogW10sXHJcbiAgICAgICAgZmlsZXM6IFtdLFxyXG4gICAgICAgIGxpZCxcclxuICAgICAgICB0TGlkLFxyXG4gICAgICAgIHNvcnQ6IFwidGltZVwiLFxyXG4gICAgICAgIGhpc3RvcmllczogW10sXHJcbiAgICAgICAgaW5kZXg6IDAsXHJcbiAgICAgICAgc2VsZWN0ZWRGaWxlczogW10sXHJcbiAgICAgICAgbWFyazogZmFsc2UsXHJcbiAgICAgICAgc2VsZWN0ZWRMaWJyYXJpZXNJZDogW10sXHJcbiAgICAgICAgcGVybWlzc2lvbjogW10sXHJcbiAgICAgICAgbGFzdEhpc3RvcnlMaWQ6IFwiXCIsXHJcbiAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeTogXCJib29rXCIsIC8vIOaJuemHj+S/ruaUueaWh+S7tuexu+Wei1xyXG4gICAgICAgIHNlbGVjdGVkRm9sZGVyOiBcIlwiLCAvLyDmibnph4/kv67mlLnmlofku7bnm67lvZUg55uu5b2VSURcclxuICAgICAgICBzZWxlY3RlZEZvbGRlclBhdGg6IFwiXCIsIC8vIOaJuemHj+S/ruaUueaWh+S7tuebruW9lSDnm67lvZXot6/lvoRcclxuICAgICAgICBsaXN0Q2F0ZWdvcmllczogW1wiYm9va1wiLCBcInBhcGVyXCIsIFwicHJvZ3JhbVwiLCBcIm1lZGlhXCIsIFwib3RoZXJcIl0sXHJcbiAgICAgICAgY2F0ZWdvcmllczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZDogXCJib29rXCIsXHJcbiAgICAgICAgICAgIG5hbWU6IFwi5Zu+5LmmXCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlkOiBcInBhcGVyXCIsXHJcbiAgICAgICAgICAgIG5hbWU6IFwi6K665paHXCJcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlkOiBcInByb2dyYW1cIixcclxuICAgICAgICAgICAgbmFtZTogXCLnqIvluo9cIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IFwibWVkaWFcIixcclxuICAgICAgICAgICAgbmFtZTogXCLlqpLkvZNcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IFwib3RoZXJcIixcclxuICAgICAgICAgICAgbmFtZTogXCLlhbbku5ZcIlxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgcHJvdG9jb2w6IHRydWUsIC8vIOaYr+WQpuWQjOaEj+WNj+iurlxyXG4gICAgICB9LFxyXG4gICAgICB3YXRjaDp7XHJcbiAgICAgICAgbGlzdENhdGVnb3JpZXMoKSB7XHJcbiAgICAgICAgICB0aGlzLnNhdmVDYXRlZ29yaWVzVG9Mb2NhbFN0b3JhZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG1vdW50ZWQoKSB7XHJcbiAgICAgICAgaWYoZm9sZGVySWQpIHtcclxuICAgICAgICAgIHRoaXMuc2F2ZVRvTG9jYWxTdG9yYWdlKGZvbGRlcklkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nZXRDYXRlZ29yaWVzRnJvbUxvY2FsU3RvcmFnZSgpO1xyXG4gICAgICAgIGNvbnN0IGxpYnJhcnlWaXNpdEZvbGRlckxvZ3MgPSBOS0MubWV0aG9kcy5nZXRGcm9tTG9jYWxTdG9yYWdlKFwibGlicmFyeVZpc2l0Rm9sZGVyTG9nc1wiKTtcclxuICAgICAgICBjb25zdCBjaGlsZEZvbGRlcklkID0gbGlicmFyeVZpc2l0Rm9sZGVyTG9nc1t0aGlzLmxpZF07XHJcbiAgICAgICAgY29uc3QgdGhpc18gPSB0aGlzO1xyXG4gICAgICAgIGlmKGNoaWxkRm9sZGVySWQgIT09IHVuZGVmaW5lZCAmJiBjaGlsZEZvbGRlcklkICE9PSB0aGlzLmxpZCkge1xyXG4gICAgICAgICAgLy8g5aaC5p6c5rWP6KeI5Zmo5pys5Zyw5a2Y5pyJ6K6/6Zeu6K6w5b2V77yM5YiZ5YWI56Gu5a6a6K+l6K6w5b2V5Lit55qE5paH5Lu25aS55piv5ZCm5a2Y5Zyo77yM5a2Y5Zyo5YiZ6K6/6Zeu77yM5LiN5a2Y5Zyo5YiZ5omT5byA6aG25bGC5paH5Lu25aS544CCXHJcbiAgICAgICAgICB0aGlzLmdldExpc3QoY2hpbGRGb2xkZXJJZClcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXNfLmFkZEhpc3RvcnkodGhpc18ubGlkKTtcclxuICAgICAgICAgICAgICB0aGlzXy5hZGRGaWxlQnlSaWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoICgoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpc18uZ2V0TGlzdEluZm8odGhpc18ubGlkKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZ2V0TGlzdEluZm8odGhpc18ubGlkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCF3aW5kb3cuQ29tbW9uTW9kYWwpIHtcclxuICAgICAgICAgIGlmKCFOS0MubW9kdWxlcy5Db21tb25Nb2RhbCkge1xyXG4gICAgICAgICAgICBzd2VldEVycm9yKFwi5pyq5byV5YWl6YCa55So5by55qGGXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LkNvbW1vbk1vZGFsID0gbmV3IE5LQy5tb2R1bGVzLkNvbW1vbk1vZGFsKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF3aW5kb3cuUmVzb3VyY2VJbmZvKSB7XHJcbiAgICAgICAgICBpZighTktDLm1vZHVsZXMuUmVzb3VyY2VJbmZvKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXotYTmupDkv6Hmga/mqKHlnZdcIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuUmVzb3VyY2VJbmZvID0gbmV3IE5LQy5tb2R1bGVzLlJlc291cmNlSW5mbygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighd2luZG93LlNlbGVjdFJlc291cmNlKSB7XHJcbiAgICAgICAgICBpZighTktDLm1vZHVsZXMuU2VsZWN0UmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgc3dlZXRFcnJvcihcIuacquW8leWFpei1hOa6kOS/oeaBr+aooeWdl1wiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5TZWxlY3RSZXNvdXJjZSA9IG5ldyBOS0MubW9kdWxlcy5TZWxlY3RSZXNvdXJjZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighd2luZG93LkxpYnJhcnlQYXRoKSB7XHJcbiAgICAgICAgICBpZighTktDLm1vZHVsZXMuTGlicmFyeVBhdGgpIHtcclxuICAgICAgICAgICAgc3dlZXRFcnJvcihcIuacquW8leWFpeaWh+W6k+i3r+W+hOmAieaLqeaooeWdl1wiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5MaWJyYXJ5UGF0aCA9IG5ldyBOS0MubW9kdWxlcy5MaWJyYXJ5UGF0aCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cub25wb3BzdGF0ZSA9IHRoaXMub25wb3BzdGF0ZTtcclxuICAgICAgfSxcclxuICAgICAgY29tcHV0ZWQ6IHtcclxuICAgICAgICB1cGxvYWRpbmcoKSB7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZiBvZiB0aGlzLnNlbGVjdGVkRmlsZXMpIHtcclxuICAgICAgICAgICAgaWYoZi5zdGF0dXMgPT09IFwidXBsb2FkaW5nXCIpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGFzdEZvbGRlcigpIHtcclxuICAgICAgICAgIHZhciBsZW5ndGggPSB0aGlzLm5hdi5sZW5ndGg7XHJcbiAgICAgICAgICBpZihsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5hdltsZW5ndGggLTJdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9sZGVyKCkge1xyXG4gICAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMubmF2Lmxlbmd0aDtcclxuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uYXZbbGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4ge31cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvbGRlckxpc3QoKSB7XHJcbiAgICAgICAgICBjb25zdCB7bGlzdENhdGVnb3JpZXMsIGZpbGVzLCBmb2xkZXJzLCB1aWR9ID0gdGhpcztcclxuICAgICAgICAgIGxldCBmaWxlc18gPSBmaWxlcztcclxuICAgICAgICAgIGlmKGxpc3RDYXRlZ29yaWVzLmluY2x1ZGVzKFwib3duXCIpICYmIHVpZCkge1xyXG4gICAgICAgICAgICBmaWxlc18gPSBmaWxlcy5maWx0ZXIoZiA9PiBmLnVpZCA9PT0gdWlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZpbGVzXyA9IGZpbGVzXy5maWx0ZXIoZiA9PiBsaXN0Q2F0ZWdvcmllcy5pbmNsdWRlcyhmLmNhdGVnb3J5KSk7XHJcbiAgICAgICAgICByZXR1cm4gZm9sZGVycy5jb25jYXQoZmlsZXNfKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwbG9hZGVkQ291bnQoKSB7XHJcbiAgICAgICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzLm1hcChmID0+IHtcclxuICAgICAgICAgICAgaWYoZi5zdGF0dXMgPT09IFwidXBsb2FkZWRcIikgY291bnQgKys7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBjb3VudDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuVXBsb2FkZWRDb3VudCgpIHtcclxuICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICBpZihmLnN0YXR1cyA9PT0gXCJub3RVcGxvYWRlZFwiKSBjb3VudCArKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgICAgICB2aXNpdFVybDogTktDLm1ldGhvZHMudmlzaXRVcmwsXHJcbiAgICAgICAgZm9ybWF0OiBOS0MubWV0aG9kcy5mb3JtYXQsXHJcbiAgICAgICAgZ2V0U2l6ZTogTktDLm1ldGhvZHMudG9vbHMuZ2V0U2l6ZSxcclxuICAgICAgICBjaGVja1N0cmluZzogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrU3RyaW5nLFxyXG4gICAgICAgIHNjcm9sbFRvOiBOS0MubWV0aG9kcy5zY3JvbGxUb3AsXHJcbiAgICAgICAgYWRkRmlsZUJ5UmlkKCkge1xyXG4gICAgICAgICAgY29uc3Qge3VwbG9hZFJlc291cmNlc0lkfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZighdXBsb2FkUmVzb3VyY2VzSWQgfHwgdXBsb2FkUmVzb3VyY2VzSWQubGVuZ3RoIDw9IDApIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IHVwbG9hZFJlc291cmNlc0lkLmpvaW4oXCItXCIpO1xyXG4gICAgICAgICAgbmtjQVBJKGAvcnM/cmlkPSR7cmlkfWAsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIGRhdGEucmVzb3VyY2VzLm1hcChyID0+IHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdGVkRmlsZXMucHVzaChzZWxmLmFwcC5jcmVhdGVGaWxlKFwib25saW5lRmlsZVwiLCByKSk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAucGFnZVR5cGUgPSBcInVwbG9hZGVyXCI7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAudXBsb2FkUmVzb3VyY2VzSWQgPSBbXTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmuIXnqbrmnKrkuIrkvKDnmoTorrDlvZVcclxuICAgICAgICBjbGVhclVuVXBsb2FkZWQoKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMgPSB0aGlzLnNlbGVjdGVkRmlsZXMuZmlsdGVyKGYgPT4gZi5zdGF0dXMgIT09IFwibm90VXBsb2FkZWRcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmibnph4/orr7nva7mlofku7bnm67lvZVcclxuICAgICAgICBzZWxlY3RGaWxlc0ZvbGRlcigpIHtcclxuICAgICAgICAgIGNvbnN0IHRoaXNfID0gdGhpcztcclxuICAgICAgICAgIExpYnJhcnlQYXRoLm9wZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgY29uc3Qge2ZvbGRlciwgcGF0aH0gPSBkYXRhO1xyXG4gICAgICAgICAgICB0aGlzXy5zZWxlY3RlZEZvbGRlciA9IGZvbGRlcjtcclxuICAgICAgICAgICAgdGhpc18uc2VsZWN0ZWRGb2xkZXJQYXRoID0gcGF0aDtcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgbGlkOiB0aGlzLmxpZCxcclxuICAgICAgICAgICAgd2FybmluZzogXCLor6Xmk43kvZzlsIbopobnm5bmnKzpobXmiYDmnInorr7nva7vvIzor7fosKjmhY7mk43kvZzjgIJcIlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmuIXnqbrlt7LmiJDlip/kuIrkvKDnmoTmlofku7borrDlvZVcclxuICAgICAgICBjbGVhclVwbG9hZGVkKCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzID0gdGhpcy5zZWxlY3RlZEZpbGVzLmZpbHRlcihmID0+IGYuc3RhdHVzICE9PSBcInVwbG9hZGVkXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5om56YeP6K6+572u5paH5Lu255qE5YiG57G7XHJcbiAgICAgICAgbWFya0NhdGVnb3J5KCkge1xyXG4gICAgICAgICAgY29uc3Qge3NlbGVjdGVkQ2F0ZWdvcnksIHNlbGVjdGVkRmlsZXN9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCFzZWxlY3RlZENhdGVnb3J5KSByZXR1cm47XHJcbiAgICAgICAgICBzd2VldFF1ZXN0aW9uKFwi6K+l5pON5L2c5bCG6KaG55uW5pys6aG15omA5pyJ6K6+572u77yM6K+35YaN5qyh56Gu6K6k44CCXCIpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxlY3RlZEZpbGVzLm1hcChmID0+IGYuY2F0ZWdvcnkgPSBzZWxlY3RlZENhdGVnb3J5KTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7fSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaJuemHj+iuvue9ruaWh+S7tuebruW9lVxyXG4gICAgICAgIG1hcmtGb2xkZXIoKSB7XHJcbiAgICAgICAgICBjb25zdCB7c2VsZWN0ZWRGb2xkZXIsIHNlbGVjdGVkRm9sZGVyUGF0aCwgc2VsZWN0ZWRGaWxlc30gPSB0aGlzO1xyXG4gICAgICAgICAgaWYoIXNlbGVjdGVkRm9sZGVyKSByZXR1cm47XHJcbiAgICAgICAgICBjb25zdCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgICBzd2VldFF1ZXN0aW9uKGDor6Xmk43kvZzlsIbopobnm5bmnKzpobXmiYDmnInorr7nva7vvIzor7flho3mrKHnoa7orqTjgIJgKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlcy5tYXAoZiA9PiB7XHJcbiAgICAgICAgICAgICAgICBmLmZvbGRlciA9IHNlbGVjdGVkRm9sZGVyO1xyXG4gICAgICAgICAgICAgICAgZi5mb2xkZXJQYXRoID0gc2VsZWN0ZWRGb2xkZXJQYXRoO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHRoaXNfLnNlbGVjdGVkRm9sZGVyID0gXCJcIjtcclxuICAgICAgICAgICAgICB0aGlzXy5zZWxlY3RlZEZvbGRlclBhdGggPSBcIlwiO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHt9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g572R6aG15YiH5o2i5LqL5Lu2XHJcbiAgICAgICAgb25wb3BzdGF0ZShlKSB7XHJcbiAgICAgICAgICBjb25zdCB7c3RhdGV9ID0gZTtcclxuICAgICAgICAgIGxldCBsaWQgPSB0aGlzLmxpZDtcclxuICAgICAgICAgIGlmKHN0YXRlICYmIHN0YXRlLmxpZCkgbGlkID0gc3RhdGUubGlkO1xyXG4gICAgICAgICAgdGhpcy5nZXRMaXN0KGxpZClcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgc3dlZXRFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Yqg6L295paH5Lu25aS55L+h5oGv77yM5YyF5ZCr6ZSZ6K+v5aSE55CGXHJcbiAgICAgICAgZ2V0TGlzdEluZm8oaWQsIHNjcm9sbFRvVG9wKSB7XHJcbiAgICAgICAgICB0aGlzLmdldExpc3QoaWQsIHNjcm9sbFRvVG9wKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuYWRkSGlzdG9yeShpZCk7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuYWRkRmlsZUJ5UmlkKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZXJyKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5q+U5a+55p2D6ZmQcGVybWlzc2lvblxyXG4gICAgICAgIHBlcihvcGVyYXRpb24pIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnBlcm1pc3Npb24uaW5jbHVkZXMob3BlcmF0aW9uKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOW8gOWQr+WkmumAieahhlxyXG4gICAgICAgIG1hcmtMaWJyYXJ5KCkge1xyXG4gICAgICAgICAgdGhpcy5tYXJrID0gIXRoaXMubWFyaztcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaWJyYXJpZXNJZCA9IFtdO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oupL+WPlua2iCDlhajpg6hcclxuICAgICAgICBtYXJrQWxsKCkge1xyXG4gICAgICAgICAgaWYodGhpcy5zZWxlY3RlZExpYnJhcmllc0lkLmxlbmd0aCA9PT0gdGhpcy5mb2xkZXJMaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQgPSBbXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaWJyYXJpZXNJZCA9IHRoaXMuZm9sZGVyTGlzdC5tYXAoZiA9PiBmLl9pZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmibnph4/liKDpmaRcclxuICAgICAgICBkZWxldGVGb2xkZXJzKCkge1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVGb2xkZXIodGhpcy5zZWxlY3RlZExpYnJhcmllc0lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaJuemHj+enu+WKqFxyXG4gICAgICAgIG1vdmVGb2xkZXJzKCkge1xyXG4gICAgICAgICAgdGhpcy5tb3ZlRm9sZGVyKHRoaXMuc2VsZWN0ZWRMaWJyYXJpZXNJZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmoLnmja7mnKzlnLDmlofku7bmiJbogIVyZXNvdXJjZeWvueixoeaehOW7uueUqOS6juS4iuS8oOeahOaWh+S7tuWvueixoVxyXG4gICAgICAgIHNlbGVjdFBhdGgocikge1xyXG4gICAgICAgICAgTGlicmFyeVBhdGgub3BlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7Zm9sZGVyLCBwYXRofSA9IGRhdGE7XHJcbiAgICAgICAgICAgIHIuZm9sZGVyID0gZm9sZGVyO1xyXG4gICAgICAgICAgICByLmZvbGRlclBhdGggPSBwYXRoO1xyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsaWQ6IHIuZm9sZGVyP3IuZm9sZGVyLl9pZDogXCJcIlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVGaWxlKHR5cGUsIHIpIHtcclxuICAgICAgICAgIGNvbnN0IHtmb2xkZXIsIGZvbGRlclBhdGgsIF9pZCwgdG9jLCByaWQsIGNhdGVnb3J5LCBuYW1lID0gXCJcIiwgb25hbWUsIGRlc2NyaXB0aW9uID0gXCJcIiwgc2l6ZX0gPSByO1xyXG4gICAgICAgICAgY29uc3QgZmlsZSA9IHtcclxuICAgICAgICAgICAgX2lkLFxyXG4gICAgICAgICAgICB0eXBlLFxyXG4gICAgICAgICAgICByaWQsXHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUgfHwgb25hbWUsXHJcbiAgICAgICAgICAgIHNpemUsXHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSB8fCBcIlwiLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgZm9sZGVyOiBmb2xkZXIgfHwgdGhpcy5mb2xkZXIsXHJcbiAgICAgICAgICAgIGZvbGRlclBhdGg6IGZvbGRlclBhdGggfHwgKCgpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gc2VsZi5hcHAubmF2Lm1hcChuID0+IG4ubmFtZSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFwiL1wiICsgbmFtZS5qb2luKFwiL1wiKTtcclxuICAgICAgICAgICAgfSkoKSxcclxuICAgICAgICAgICAgZGF0YTogcixcclxuICAgICAgICAgICAgdG9jOiB0b2MgfHwgbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgc3RhdHVzOiBcIm5vdFVwbG9hZGVkXCIsIC8vIG5vdFVwbG9hZGVkLCB1cGxvYWRpbmcsIHVwbG9hZGVkXHJcbiAgICAgICAgICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXHJcbiAgICAgICAgICAgIGVycm9yOiBcIlwiLCAvLyDplJnor6/kv6Hmga9cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvXFwuLio/JC9pZywgXCJcIik7XHJcbiAgICAgICAgICBpZihmaWxlLnR5cGUgPT09IFwibG9jYWxGaWxlXCIpIHtcclxuICAgICAgICAgICAgaWYoci50eXBlLmluY2x1ZGVzKFwiaW1hZ2VcIikpIHtcclxuICAgICAgICAgICAgICBmaWxlLmV4dCA9IFwibWVkaWFQaWN0dXJlXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZmlsZS5leHQgPSBcIm1lZGlhQXR0YWNobWVudFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYoZmlsZS5leHQgPT09IFwibWVkaWFQaWN0dXJlXCIpIHtcclxuICAgICAgICAgICAgZmlsZS5lcnJvciA9IFwi5pqC5LiN5YWB6K645LiK5Lyg5Zu+54mH5Yiw5paH5bqTXCI7XHJcbiAgICAgICAgICAgIGZpbGUuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgfSBlbHNlIGlmKGZpbGUuc2l6ZSA+IDIwMCAqIDEwMjQgKiAxMDI0KSB7XHJcbiAgICAgICAgICAgIGZpbGUuZXJyb3IgPSBcIuaWh+S7tuWkp+Wwj+S4jeiDvei2hei/hzIwME1CXCI7XHJcbiAgICAgICAgICAgIGZpbGUuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBmaWxlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhcnRVcGxvYWQoKSB7XHJcbiAgICAgICAgICB0aGlzLnVwbG9hZEZpbGUoMCwgdGhpcy5zZWxlY3RlZEZpbGVzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZUZpbGUoaW5kZXgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5LiK5Lyg5paH5Lu2XHJcbiAgICAgICAgdXBsb2FkRmlsZShpbmRleCwgYXJyKSB7XHJcbiAgICAgICAgICBpZihpbmRleCA+PSBhcnIubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgICAgICBjb25zdCBmaWxlID0gYXJyW2luZGV4XTtcclxuICAgICAgICAgIGNvbnN0IHtzdGF0dXMsIGRpc2FibGVkfSA9IGZpbGU7XHJcbiAgICAgICAgICBpZihkaXNhYmxlZCB8fCBzdGF0dXMgIT09IFwibm90VXBsb2FkZWRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51cGxvYWRGaWxlKGluZGV4ICsgMSwgYXJyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZpbGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgZmlsZS5zdGF0dXMgPSBcInVwbG9hZGluZ1wiO1xyXG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmKCFmaWxlKSB0aHJvdyBcIuaWh+S7tuW8guW4uFwiO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmNoZWNrU3RyaW5nKGZpbGUubmFtZSwge1xyXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxyXG4gICAgICAgICAgICAgICAgbWF4TGVuZ3RoOiA1MDAsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuaWh+S7tuWQjeensFwiXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuY2hlY2tTdHJpbmcoZmlsZS5kZXNjcmlwdGlvbiwge1xyXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4TGVuZ3RoOiAxMDAwLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogXCLmlofku7bor7TmmI5cIlxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIGlmKCFbXCJtZWRpYVwiLCBcInBhcGVyXCIsIFwiYm9va1wiLCBcInByb2dyYW1cIiwgXCJvdGhlclwiXS5pbmNsdWRlcyhmaWxlLmNhdGVnb3J5KSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCLmnKrpgInmi6nmlofku7bliIbnsbtcIjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYoIWZpbGUuZm9sZGVyKSB0aHJvdyBcIuacqumAieaLqeebruW9lVwiO1xyXG4gICAgICAgICAgICAgIGlmKGZpbGUudHlwZSA9PT0gXCJsb2NhbEZpbGVcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE5LQy5tZXRob2RzLmdldEZpbGVNRDUoZmlsZS5kYXRhKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIOS4iuS8oOacrOWcsOaWh+S7tlxyXG4gICAgICAgICAgICAgIGlmKGZpbGUudHlwZSA9PT0gXCJsb2NhbEZpbGVcIikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImZpbGVOYW1lXCIsIGZpbGUuZGF0YS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInR5cGVcIiwgXCJjaGVja01ENVwiKTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcIm1kNVwiLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBua2NVcGxvYWRGaWxlKFwiL3JcIiwgXCJQT1NUXCIsIGZvcm1EYXRhKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIGlmKGRhdGEgJiYgIWRhdGEudXBsb2FkZWQgJiYgZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZVwiLCBmaWxlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoXCIvclwiLCBcIlBPU1RcIiwgZm9ybURhdGEsIChlLCBwKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIGZpbGUucHJvZ3Jlc3MgPSBwO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5pu/5o2i5pys5Zyw5paH5Lu25L+h5oGvIOe7n+S4gOS4uue6v+S4iuaWh+S7tuaooeW8j1xyXG4gICAgICAgICAgICAgIGlmKGZpbGUudHlwZSA9PT0gXCJsb2NhbEZpbGVcIikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzb3VyY2UgPSBkYXRhLnI7XHJcbiAgICAgICAgICAgICAgICBmaWxlLmRhdGEgPSByZXNvdXJjZTtcclxuICAgICAgICAgICAgICAgIGZpbGUuZXh0ID0gcmVzb3VyY2UubWVkaWFUeXBlO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5yaWQgPSByZXNvdXJjZS5yaWQ7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnRvYyA9IHJlc291cmNlLnRvYztcclxuICAgICAgICAgICAgICAgIGZpbGUudHlwZSA9IFwib25saW5lRmlsZVwiO1xyXG4gICAgICAgICAgICAgICAgaWYoZmlsZS5leHQgPT09IFwibWVkaWFQaWN0dXJlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgZmlsZS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgIHRocm93KG5ldyBFcnJvcihcIuaaguS4jeWFgeiuuOS4iuS8oOWbvueJh+WIsOaWh+W6k1wiKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcIm1vZGlmeVwiKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmibnph4/kv67mlLlcclxuICAgICAgICAgICAgICAgIGNvbnN0IHtfaWQsIG5hbWUsIGRlc2NyaXB0aW9uLCBjYXRlZ29yeX0gPSBmaWxlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5rY0FQSShgL2xpYnJhcnkvJHtfaWR9YCwgXCJQVVRcIiwgYm9keSk7XHJcblxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyDlsIbnur/kuIrmlofku7bmj5DkuqTliLDmloflupNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgICAgICAgbmFtZSwgZGVzY3JpcHRpb24sIGNhdGVnb3J5LCByaWQsIGZvbGRlclxyXG4gICAgICAgICAgICAgICAgfSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgICByaWQsXHJcbiAgICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJib2R5XCIsIEpTT04uc3RyaW5naWZ5KGJvZHkpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBua2NBUEkoYC9saWJyYXJ5LyR7Zm9sZGVyLl9pZH1gLCBcIlBPU1RcIiwgYm9keSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgZmlsZS5zdGF0dXMgPSBcInVwbG9hZGVkXCI7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChkYXRhID0+IHtcclxuICAgICAgICAgICAgICBmaWxlLmVycm9yID0gZGF0YS5lcnJvciB8fCBkYXRhLm1lc3NhZ2UgfHwgZGF0YTtcclxuICAgICAgICAgICAgICBmaWxlLnN0YXR1cyA9IFwibm90VXBsb2FkZWRcIjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnVwbG9hZEZpbGUoaW5kZXgrMSwgYXJyKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOi/lOWbnuS4iuS4gOWxguaWh+S7tuWkuVxyXG4gICAgICAgIGJhY2soKSB7XHJcbiAgICAgICAgICBpZih0aGlzLmxhc3RGb2xkZXIpIHRoaXMuc2VsZWN0Rm9sZGVyKHRoaXMubGFzdEZvbGRlcik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliIfmjaLliLDmlofku7bkuIrkvKBcclxuICAgICAgICB0b1VwbG9hZCgpIHtcclxuICAgICAgICAgIGlmKHRoaXMubWFyaykgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5wYWdlVHlwZSA9IFwidXBsb2FkZXJcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWIh+aNouWIsOaWh+S7tuWIl+ihqFxyXG4gICAgICAgIHRvTGlzdCgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0Rm9sZGVyKHRoaXMuZm9sZGVyKTtcclxuICAgICAgICAgIHRoaXMucGFnZVR5cGUgPSBcImxpc3RcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWwhueUqOaIt+W3sumAieaLqeeahOetm+mAieWIhuexu+WtmOWIsOacrOWcsFxyXG4gICAgICAgIHNhdmVDYXRlZ29yaWVzVG9Mb2NhbFN0b3JhZ2UoKSB7XHJcbiAgICAgICAgICBjb25zdCB7bGlzdENhdGVnb3JpZXN9ID0gdGhpcztcclxuICAgICAgICAgIGNvbnN0IGxpYnJhcnlMaXN0Q2F0ZWdvcmllcyA9IE5LQy5tZXRob2RzLmdldEZyb21Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5TGlzdENhdGVnb3JpZXNcIik7XHJcbiAgICAgICAgICBsaWJyYXJ5TGlzdENhdGVnb3JpZXNbdGhpcy5saWRdID0gbGlzdENhdGVnb3JpZXM7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy5zYXZlVG9Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5TGlzdENhdGVnb3JpZXNcIiwgbGlicmFyeUxpc3RDYXRlZ29yaWVzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOivu+WPluacrOWcsOWtmOWCqOeahOetm+mAieWIhuexu1xyXG4gICAgICAgIGdldENhdGVnb3JpZXNGcm9tTG9jYWxTdG9yYWdlKCkge1xyXG4gICAgICAgICAgY29uc3QgbGlicmFyeUxpc3RDYXRlZ29yaWVzID0gTktDLm1ldGhvZHMuZ2V0RnJvbUxvY2FsU3RvcmFnZShcImxpYnJhcnlMaXN0Q2F0ZWdvcmllc1wiKTtcclxuICAgICAgICAgIGNvbnN0IGxpc3RDYXRlZ29yaWVzID0gbGlicmFyeUxpc3RDYXRlZ29yaWVzW3RoaXMubGlkXTtcclxuICAgICAgICAgIGlmKGxpc3RDYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdENhdGVnb3JpZXMgPSBsaXN0Q2F0ZWdvcmllcztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaWh+S7tuWkueiuv+mXruiusOW9leWtmOWIsOa1j+iniOWZqOacrOWcsFxyXG4gICAgICAgIHNhdmVUb0xvY2FsU3RvcmFnZShpZCkge1xyXG4gICAgICAgICAgY29uc3QgbGlicmFyeVZpc2l0Rm9sZGVyTG9ncyA9IE5LQy5tZXRob2RzLmdldEZyb21Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzXCIpO1xyXG4gICAgICAgICAgbGlicmFyeVZpc2l0Rm9sZGVyTG9nc1t0aGlzLmxpZF0gPSBpZDtcclxuICAgICAgICAgIE5LQy5tZXRob2RzLnNhdmVUb0xvY2FsU3RvcmFnZShcImxpYnJhcnlWaXNpdEZvbGRlckxvZ3NcIiwgbGlicmFyeVZpc2l0Rm9sZGVyTG9ncyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmt7vliqDkuIDmnaHmtY/op4jlmajljoblj7LorrDlvZVcclxuICAgICAgICBhZGRIaXN0b3J5KGxpZCkge1xyXG4gICAgICAgICAgLy8g5Yik5pat5piv5ZCm5Li655u45ZCM6aG177yM55u45ZCM5YiZ5LiN5Yib5bu65rWP6KeI5Zmo5Y6G5Y+y6K6w5b2V44CCXHJcbiAgICAgICAgICBpZih0aGlzLmxhc3RIaXN0b3J5TGlkICYmIHRoaXMubGFzdEhpc3RvcnlMaWQgPT09IGxpZCkgcmV0dXJuO1xyXG4gICAgICAgICAgbGV0IHtocmVmfSA9IHdpbmRvdy5sb2NhdGlvbjtcclxuICAgICAgICAgIGlmKGhyZWYuaW5jbHVkZXMoXCIjXCIpKSB7XHJcbiAgICAgICAgICAgIGhyZWYgPSBocmVmLnJlcGxhY2UoLyMuKi9pZywgXCJcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoe2xpZH0sICdwYWdlJywgaHJlZiArICcjJyArIGxpZCk7XHJcbiAgICAgICAgICB0aGlzLmxhc3RIaXN0b3J5TGlkID0gbGlkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6I635Y+W5paH5Lu25YiX6KGoXHJcbiAgICAgICAgZ2V0TGlzdChpZCwgc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgIGNvbnN0IHVybCA9IGAvbGlicmFyeS8ke2lkfT9maWxlPXRydWUmbmF2PXRydWUmZm9sZGVyPXRydWUmcGVybWlzc2lvbj10cnVlJnQ9JHtEYXRlLm5vdygpfWA7XHJcbiAgICAgICAgICByZXR1cm4gbmtjQVBJKHVybCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLm5hdiA9IGRhdGEubmF2O1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZvbGRlcnMgPSBkYXRhLmZvbGRlcnM7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuZmlsZXMgPSBkYXRhLmZpbGVzO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnBlcm1pc3Npb24gPSBkYXRhLnBlcm1pc3Npb247XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2F2ZVRvTG9jYWxTdG9yYWdlKGlkKTtcclxuICAgICAgICAgICAgICBpZihzY3JvbGxUb1RvcCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2Nyb2xsVG8obnVsbCwgMCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2VsZWN0T25saW5lRmlsZXMoKSB7XHJcbiAgICAgICAgICBTZWxlY3RSZXNvdXJjZS5vcGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtyZXNvdXJjZXN9ID0gZGF0YTtcclxuICAgICAgICAgICAgcmVzb3VyY2VzLm1hcChyID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5zZWxlY3RlZEZpbGVzLnB1c2goc2VsZi5hcHAuY3JlYXRlRmlsZShcIm9ubGluZUZpbGVcIiwgcikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgYWxsb3dlZEV4dDogW1wiYXR0YWNobWVudFwiLCBcInZpZGVvXCIsIFwiYXVkaW9cIl0sXHJcbiAgICAgICAgICAgIGNvdW50TGltaXQ6IDk5XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oup5a6M5pys5Zyw5paH5Lu2XHJcbiAgICAgICAgc2VsZWN0ZWRMb2NhbEZpbGVzKCkge1xyXG4gICAgICAgICAgY29uc3Qge2ZpbGVzID0gW119ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2R1bGVMaWJyYXJ5SW5wdXRcIik7XHJcbiAgICAgICAgICBmb3IoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMucHVzaCh0aGlzLmNyZWF0ZUZpbGUoXCJsb2NhbEZpbGVcIiwgZmlsZSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2R1bGVMaWJyYXJ5SW5wdXRcIikudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g6YCJ5oup5paH5Lu25aS5XHJcbiAgICAgICAgc2VsZWN0Rm9sZGVyKGZvbGRlciwgc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgIGlmKHRoaXMubWFyaykgcmV0dXJuO1xyXG4gICAgICAgICAgaWYoZm9sZGVyLnR5cGUgPT09IFwiZm9sZGVyXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRMaXN0SW5mbyhmb2xkZXIuX2lkLCBzY3JvbGxUb1RvcCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdEZpbGUoZm9sZGVyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOeCueWHu+aWh+S7tuWkueebruW9leaXtlxyXG4gICAgICAgIHNlbGVjdE5hdkZvbGRlcihmKSB7XHJcbiAgICAgICAgICBpZih0aGlzLnBhZ2VUeXBlICE9PSBcImxpc3RcIikge1xyXG4gICAgICAgICAgICB0aGlzLnBhZ2VUeXBlID0gXCJsaXN0XCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdEZvbGRlcihmKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOenu+WKqOaWh+S7tuWkueaIluaWh+S7tlxyXG4gICAgICAgIG1vdmVGb2xkZXIobGlicmFyeUlkKSB7XHJcbiAgICAgICAgICBsZXQgZm9sZGVyc0lkO1xyXG4gICAgICAgICAgaWYoQXJyYXkuaXNBcnJheShsaWJyYXJ5SWQpKSB7XHJcbiAgICAgICAgICAgIGZvbGRlcnNJZCA9IGxpYnJhcnlJZDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvbGRlcnNJZCA9IFtsaWJyYXJ5SWRdO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGJvZHkgPSB7fTtcclxuICAgICAgICAgIGJvZHkuZm9sZGVyc0lkID0gZm9sZGVyc0lkO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHVybCA9IGAvbGlicmFyeS8ke3RoaXMuZm9sZGVyLl9pZH0vbGlzdGA7XHJcbiAgICAgICAgICBjb25zdCBtZXRob2QgPSBcIlBVVFwiO1xyXG5cclxuICAgICAgICAgIExpYnJhcnlQYXRoLm9wZW4oKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgYm9keS50YXJnZXRGb2xkZXJJZCA9IGRhdGEuZm9sZGVyLl9pZDtcclxuICAgICAgICAgICAgbmtjQVBJKHVybCwgbWV0aG9kLCBib2R5KVxyXG4gICAgICAgICAgICAgIC50aGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoYOaJp+ihjOaIkOWKnyR7ZGF0YS5pZ25vcmVDb3VudD8gYO+8jOWFseaciSR7ZGF0YS5pZ25vcmVDb3VudH3kuKrpobnnm67lm6DlrZjlnKjlhrLnqoHmiJbkuI3mmK/kvaDoh6rlt7Hlj5HluIPnmoTogIzooqvlv73nlaVgOiBcIlwifWApO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAubWFyayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0Rm9sZGVyKHNlbGYuYXBwLmZvbGRlcik7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGxpZDogc2VsZi5hcHAuZm9sZGVyLl9pZCxcclxuICAgICAgICAgICAgd2FybmluZzogXCLmraTmk43kvZzkuI3kvJrkv53nlZnljp/mnInnm67lvZXnu5PmnoTvvIzkuJTkuI3lj6/mgaLlpI3jgIJcIlxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOe8lui+keaWh+S7tuWkuVxyXG4gICAgICAgIGVkaXRGb2xkZXIoZm9sZGVyKSB7XHJcbiAgICAgICAgICBpZih0aGlzLm1hcmspIHJldHVybjtcclxuICAgICAgICAgIGxldCB0eXBlU3RyID0gXCLmlofku7blpLlcIjtcclxuICAgICAgICAgIGxldCBtb2RhbERhdGEgPSBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBkb206IFwiaW5wdXRcIixcclxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICBsYWJlbDogYCR7dHlwZVN0cn3lkI3np7BgLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBmb2xkZXIubmFtZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZG9tOiBcInRleHRhcmVhXCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGAke3R5cGVTdHJ9566A5LuLYCxcclxuICAgICAgICAgICAgICB2YWx1ZTogZm9sZGVyLmRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIF07XHJcbiAgICAgICAgICBpZihmb2xkZXIudHlwZSA9PT0gXCJmaWxlXCIpIHtcclxuICAgICAgICAgICAgdHlwZVN0ciA9IFwi5paH5Lu2XCI7XHJcbiAgICAgICAgICAgIG1vZGFsRGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICBkb206IFwicmFkaW9cIixcclxuICAgICAgICAgICAgICBsYWJlbDogXCLmlofku7bliIbnsbtcIixcclxuICAgICAgICAgICAgICByYWRpb3M6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogXCLlm77kuaZcIixcclxuICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiYm9va1wiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIuiuuuaWh1wiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJwYXBlclwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIueoi+W6j1wiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJwcm9ncmFtXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwi5aqS5L2TXCIsXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIm1lZGlhXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwi5YW25LuWXCIsXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIm90aGVyXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBmb2xkZXIuY2F0ZWdvcnlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIENvbW1vbk1vZGFsLm9wZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSByZXNbMF0udmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gcmVzWzFdLnZhbHVlO1xyXG4gICAgICAgICAgICBsZXQgY2F0ZWdvcnkgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZihmb2xkZXIudHlwZSA9PT0gXCJmaWxlXCIpIHtcclxuICAgICAgICAgICAgICBjYXRlZ29yeSA9IHJlc1syXS52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZighbmFtZSkgcmV0dXJuIHN3ZWV0RXJyb3IoXCLlkI3np7DkuI3og73kuLrnqbpcIik7XHJcbiAgICAgICAgICAgIG5rY0FQSShcIi9saWJyYXJ5L1wiICsgZm9sZGVyLl9pZCwgXCJQVVRcIiwge1xyXG4gICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgY2F0ZWdvcnlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdEZvbGRlcihzZWxmLmFwcC5mb2xkZXIpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LkNvbW1vbk1vZGFsLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB0aXRsZTogYOe8lui+kSR7dHlwZVN0cn1gLFxyXG4gICAgICAgICAgICBkYXRhOiBtb2RhbERhdGFcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Yig6Zmk5paH5Lu25aS5XHJcbiAgICAgICAgZGVsZXRlRm9sZGVyKGZvbGRlcnNJZCkge1xyXG4gICAgICAgICAgaWYoIUFycmF5LmlzQXJyYXkoZm9sZGVyc0lkKSkge1xyXG4gICAgICAgICAgICBmb2xkZXJzSWQgPSBbZm9sZGVyc0lkXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmKCFmb2xkZXJzSWQubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgICAgICBmb2xkZXJzSWQgPSBmb2xkZXJzSWQuam9pbihcIi1cIik7XHJcbiAgICAgICAgICBzd2VldFF1ZXN0aW9uKGDnoa7lrpropoHmiafooYzliKDpmaTmk43kvZzvvJ9gKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBua2NBUEkoYC9saWJyYXJ5LyR7c2VsZi5hcHAuZm9sZGVyLl9pZH0vbGlzdD9saWQ9JHtmb2xkZXJzSWR9YCwgXCJERUxFVEVcIilcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgc2VsZi5hcHAubWFyayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICBzZWxmLmFwcC5zZWxlY3RGb2xkZXIoc2VsZi5hcHAuZm9sZGVyKTtcclxuICAgICAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKGDmiafooYzmiJDlip8ke2RhdGEuaWdub3JlQ291bnQ/IGDvvIzlhbHmnIkke2RhdGEuaWdub3JlQ291bnR95Liq6aG555uu5Zug5LiN5piv5L2g6Ieq5bex5Y+R5biD55qE6ICM6KKr5b+955WlYDogXCJcIn1gKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCl7fSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqeaWh+S7tlxyXG4gICAgICAgIHNlbGVjdEZpbGUoZmlsZSkge1xyXG4gICAgICAgICAgUmVzb3VyY2VJbmZvLm9wZW4oe2xpZDogZmlsZS5faWR9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWIm+W7uuaWh+S7tuWkuVxyXG4gICAgICAgIGNyZWF0ZUZvbGRlcigpIHtcclxuICAgICAgICAgIGlmKHRoaXMubWFyaykgcmV0dXJuO1xyXG4gICAgICAgICAgd2luZG93LkNvbW1vbk1vZGFsLm9wZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSByZXNbMF0udmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gcmVzWzFdLnZhbHVlO1xyXG4gICAgICAgICAgICBpZighbmFtZSkgcmV0dXJuIHN3ZWV0RXJyb3IoXCLlkI3np7DkuI3og73kuLrnqbpcIik7XHJcbiAgICAgICAgICAgIG5rY0FQSShcIi9saWJyYXJ5L1wiICsgc2VsZi5hcHAuZm9sZGVyLl9pZCArIFwiL2xpc3RcIiwgXCJQT1NUXCIsIHtcclxuICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmlofku7blpLnliJvlu7rmiJDlip9cIik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuQ29tbW9uTW9kYWwuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdEZvbGRlcihzZWxmLmFwcC5mb2xkZXIpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdGl0bGU6IFwi5paw5bu65paH5Lu25aS5XCIsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkb206IFwiaW5wdXRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwi5paH5Lu25aS55ZCN56ewXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIlxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZG9tOiBcInRleHRhcmVhXCIsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCLmlofku7blpLnnroDku4tcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG59O1xyXG4iXX0=
