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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9wdWJsaWNNb2R1bGVzL2xpYnJhcnkvbGlicmFyeS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxPQUFaO0FBQ0Usa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUFBLFFBQ1osR0FEWSxHQUM4QixPQUQ5QixDQUNaLEdBRFk7QUFBQSxRQUNQLFFBRE8sR0FDOEIsT0FEOUIsQ0FDUCxRQURPO0FBQUEsUUFDRyxJQURILEdBQzhCLE9BRDlCLENBQ0csSUFESDtBQUFBLFFBQ1MsaUJBRFQsR0FDOEIsT0FEOUIsQ0FDUyxpQkFEVDtBQUVuQixRQUFNLElBQUksR0FBRyxJQUFiO0FBQ0EsSUFBQSxJQUFJLENBQUMsR0FBTCxHQUFXLElBQUksR0FBSixDQUFRO0FBQ2pCLE1BQUEsRUFBRSxFQUFFLGdCQURhO0FBRWpCLE1BQUEsSUFBSSxFQUFFO0FBQ0osUUFBQSxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQURiO0FBRUosUUFBQSxpQkFBaUIsRUFBakIsaUJBRkk7QUFHSixRQUFBLFFBQVEsRUFBRSxNQUhOO0FBR2M7QUFDbEIsUUFBQSxHQUFHLEVBQUUsRUFKRDtBQUtKLFFBQUEsT0FBTyxFQUFFLEVBTEw7QUFNSixRQUFBLEtBQUssRUFBRSxFQU5IO0FBT0osUUFBQSxHQUFHLEVBQUgsR0FQSTtBQVFKLFFBQUEsSUFBSSxFQUFKLElBUkk7QUFTSixRQUFBLElBQUksRUFBRSxNQVRGO0FBVUosUUFBQSxTQUFTLEVBQUUsRUFWUDtBQVdKLFFBQUEsS0FBSyxFQUFFLENBWEg7QUFZSixRQUFBLGFBQWEsRUFBRSxFQVpYO0FBYUosUUFBQSxJQUFJLEVBQUUsS0FiRjtBQWNKLFFBQUEsbUJBQW1CLEVBQUUsRUFkakI7QUFlSixRQUFBLFVBQVUsRUFBRSxFQWZSO0FBZ0JKLFFBQUEsY0FBYyxFQUFF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SSxDQUFDLEdBQUwsQ0FBUyxZQUFULENBQXNCLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBL0I7QUFDRCxhQVJILFdBU1MsVUFBUyxJQUFULEVBQWU7QUFDcEIsY0FBQSxVQUFVLENBQUMsSUFBRCxDQUFWO0FBQ0QsYUFYSDtBQVlELFdBaEJELEVBZ0JHO0FBQ0QsWUFBQSxLQUFLLEVBQUUsT0FETjtBQUVELFlBQUEsSUFBSSxFQUFFLENBQ0o7QUFDRSxjQUFBLEdBQUcsRUFBRSxPQURQO0FBRUUsY0FBQSxJQUFJLEVBQUUsTUFGUjtBQUdFLGNBQUEsS0FBSyxFQUFFLE9BSFQ7QUFJRSxjQUFBLEtBQUssRUFBRTtBQUpULGFBREksRUFPSjtBQUNFLGNBQUEsR0FBRyxFQUFFLFVBRFA7QUFFRSxjQUFBLEtBQUssRUFBRSxPQUZUO0FBR0UsY0FBQSxLQUFLLEVBQUU7QUFIVCxhQVBJO0FBRkwsV0FoQkg7QUFnQ0Q7QUF0aEJNO0FBckpRLEtBQVIsQ0FBWDtBQThxQkQ7O0FBbHJCSDtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuTGlicmFyeSA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCB7bGlkLCBmb2xkZXJJZCwgdExpZCwgdXBsb2FkUmVzb3VyY2VzSWR9ID0gb3B0aW9ucztcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZUxpYnJhcnlcIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHVpZDogTktDLmNvbmZpZ3MudWlkLFxyXG4gICAgICAgIHVwbG9hZFJlc291cmNlc0lkLFxyXG4gICAgICAgIHBhZ2VUeXBlOiBcImxpc3RcIiwgLy8gbGlzdDog5paH5Lu25YiX6KGoLCB1cGxvYWRlcjog5paH5Lu25LiK5LygXHJcbiAgICAgICAgbmF2OiBbXSxcclxuICAgICAgICBmb2xkZXJzOiBbXSxcclxuICAgICAgICBmaWxlczogW10sXHJcbiAgICAgICAgbGlkLFxyXG4gICAgICAgIHRMaWQsXHJcbiAgICAgICAgc29ydDogXCJ0aW1lXCIsXHJcbiAgICAgICAgaGlzdG9yaWVzOiBbXSxcclxuICAgICAgICBpbmRleDogMCxcclxuICAgICAgICBzZWxlY3RlZEZpbGVzOiBbXSxcclxuICAgICAgICBtYXJrOiBmYWxzZSxcclxuICAgICAgICBzZWxlY3RlZExpYnJhcmllc0lkOiBbXSxcclxuICAgICAgICBwZXJtaXNzaW9uOiBbXSxcclxuICAgICAgICBsYXN0SGlzdG9yeUxpZDogXCJcIixcclxuICAgICAgICBzZWxlY3RlZENhdGVnb3J5OiBcImJvb2tcIiwgLy8g5om56YeP5L+u5pS55paH5Lu257G75Z6LXHJcbiAgICAgICAgc2VsZWN0ZWRGb2xkZXI6IFwiXCIsIC8vIOaJuemHj+S/ruaUueaWh+S7tuebruW9lSDnm67lvZVJRFxyXG4gICAgICAgIHNlbGVjdGVkRm9sZGVyUGF0aDogXCJcIiwgLy8g5om56YeP5L+u5pS55paH5Lu255uu5b2VIOebruW9lei3r+W+hFxyXG4gICAgICAgIGxpc3RDYXRlZ29yaWVzOiBbXCJib29rXCIsIFwicGFwZXJcIiwgXCJwcm9ncmFtXCIsIFwibWVkaWFcIiwgXCJvdGhlclwiXSxcclxuICAgICAgICBjYXRlZ29yaWVzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlkOiBcImJvb2tcIixcclxuICAgICAgICAgICAgbmFtZTogXCLlm77kuaZcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IFwicGFwZXJcIixcclxuICAgICAgICAgICAgbmFtZTogXCLorrrmlodcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IFwicHJvZ3JhbVwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIueoi+W6j1wiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZDogXCJtZWRpYVwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIuWqkuS9k1wiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZDogXCJvdGhlclwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIuWFtuS7llwiXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBwcm90b2NvbDogdHJ1ZSwgLy8g5piv5ZCm5ZCM5oSP5Y2P6K6uXHJcbiAgICAgIH0sXHJcbiAgICAgIHdhdGNoOntcclxuICAgICAgICBsaXN0Q2F0ZWdvcmllcygpIHtcclxuICAgICAgICAgIHRoaXMuc2F2ZUNhdGVnb3JpZXNUb0xvY2FsU3RvcmFnZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbW91bnRlZCgpIHtcclxuICAgICAgICBpZihmb2xkZXJJZCkge1xyXG4gICAgICAgICAgdGhpcy5zYXZlVG9Mb2NhbFN0b3JhZ2UoZm9sZGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdldENhdGVnb3JpZXNGcm9tTG9jYWxTdG9yYWdlKCk7XHJcbiAgICAgICAgY29uc3QgbGlicmFyeVZpc2l0Rm9sZGVyTG9ncyA9IE5LQy5tZXRob2RzLmdldEZyb21Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzXCIpO1xyXG4gICAgICAgIGNvbnN0IGNoaWxkRm9sZGVySWQgPSBsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzW3RoaXMubGlkXTtcclxuICAgICAgICBjb25zdCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgaWYoY2hpbGRGb2xkZXJJZCAhPT0gdW5kZWZpbmVkICYmIGNoaWxkRm9sZGVySWQgIT09IHRoaXMubGlkKSB7XHJcbiAgICAgICAgICAvLyDlpoLmnpzmtY/op4jlmajmnKzlnLDlrZjmnInorr/pl67orrDlvZXvvIzliJnlhYjnoa7lrpror6XorrDlvZXkuK3nmoTmlofku7blpLnmmK/lkKblrZjlnKjvvIzlrZjlnKjliJnorr/pl67vvIzkuI3lrZjlnKjliJnmiZPlvIDpobblsYLmlofku7blpLnjgIJcclxuICAgICAgICAgIHRoaXMuZ2V0TGlzdChjaGlsZEZvbGRlcklkKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpc18uYWRkSGlzdG9yeSh0aGlzXy5saWQpO1xyXG4gICAgICAgICAgICAgIHRoaXNfLmFkZEZpbGVCeVJpZCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2ggKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzXy5nZXRMaXN0SW5mbyh0aGlzXy5saWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5nZXRMaXN0SW5mbyh0aGlzXy5saWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIXdpbmRvdy5Db21tb25Nb2RhbCkge1xyXG4gICAgICAgICAgaWYoIU5LQy5tb2R1bGVzLkNvbW1vbk1vZGFsKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXpgJrnlKjlvLnmoYZcIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuQ29tbW9uTW9kYWwgPSBuZXcgTktDLm1vZHVsZXMuQ29tbW9uTW9kYWwoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIXdpbmRvdy5SZXNvdXJjZUluZm8pIHtcclxuICAgICAgICAgIGlmKCFOS0MubW9kdWxlcy5SZXNvdXJjZUluZm8pIHtcclxuICAgICAgICAgICAgc3dlZXRFcnJvcihcIuacquW8leWFpei1hOa6kOS/oeaBr+aooeWdl1wiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5SZXNvdXJjZUluZm8gPSBuZXcgTktDLm1vZHVsZXMuUmVzb3VyY2VJbmZvKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF3aW5kb3cuU2VsZWN0UmVzb3VyY2UpIHtcclxuICAgICAgICAgIGlmKCFOS0MubW9kdWxlcy5TZWxlY3RSZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBzd2VldEVycm9yKFwi5pyq5byV5YWl6LWE5rqQ5L+h5oGv5qih5Z2XXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LlNlbGVjdFJlc291cmNlID0gbmV3IE5LQy5tb2R1bGVzLlNlbGVjdFJlc291cmNlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF3aW5kb3cuTGlicmFyeVBhdGgpIHtcclxuICAgICAgICAgIGlmKCFOS0MubW9kdWxlcy5MaWJyYXJ5UGF0aCkge1xyXG4gICAgICAgICAgICBzd2VldEVycm9yKFwi5pyq5byV5YWl5paH5bqT6Lev5b6E6YCJ5oup5qih5Z2XXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LkxpYnJhcnlQYXRoID0gbmV3IE5LQy5tb2R1bGVzLkxpYnJhcnlQYXRoKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5vbnBvcHN0YXRlO1xyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIHVwbG9hZGluZygpIHtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIHRoaXMuc2VsZWN0ZWRGaWxlcykge1xyXG4gICAgICAgICAgICBpZihmLnN0YXR1cyA9PT0gXCJ1cGxvYWRpbmdcIikgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXN0Rm9sZGVyKCkge1xyXG4gICAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMubmF2Lmxlbmd0aDtcclxuICAgICAgICAgIGlmKGxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmF2W2xlbmd0aCAtMl07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb2xkZXIoKSB7XHJcbiAgICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5uYXYubGVuZ3RoO1xyXG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5hdltsZW5ndGggLSAxXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7fVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9sZGVyTGlzdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtsaXN0Q2F0ZWdvcmllcywgZmlsZXMsIGZvbGRlcnMsIHVpZH0gPSB0aGlzO1xyXG4gICAgICAgICAgbGV0IGZpbGVzXyA9IGZpbGVzO1xyXG4gICAgICAgICAgaWYobGlzdENhdGVnb3JpZXMuaW5jbHVkZXMoXCJvd25cIikgJiYgdWlkKSB7XHJcbiAgICAgICAgICAgIGZpbGVzXyA9IGZpbGVzLmZpbHRlcihmID0+IGYudWlkID09PSB1aWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmlsZXNfID0gZmlsZXNfLmZpbHRlcihmID0+IGxpc3RDYXRlZ29yaWVzLmluY2x1ZGVzKGYuY2F0ZWdvcnkpKTtcclxuICAgICAgICAgIHJldHVybiBmb2xkZXJzLmNvbmNhdChmaWxlc18pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBsb2FkZWRDb3VudCgpIHtcclxuICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICBpZihmLnN0YXR1cyA9PT0gXCJ1cGxvYWRlZFwiKSBjb3VudCArKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW5VcGxvYWRlZENvdW50KCkge1xyXG4gICAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcy5tYXAoZiA9PiB7XHJcbiAgICAgICAgICAgIGlmKGYuc3RhdHVzID09PSBcIm5vdFVwbG9hZGVkXCIpIGNvdW50ICsrO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gY291bnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcclxuICAgICAgICBmb3JtYXQ6IE5LQy5tZXRob2RzLmZvcm1hdCxcclxuICAgICAgICBnZXRTaXplOiBOS0MubWV0aG9kcy50b29scy5nZXRTaXplLFxyXG4gICAgICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICAgICAgc2Nyb2xsVG86IE5LQy5tZXRob2RzLnNjcm9sbFRvcCxcclxuICAgICAgICBhZGRGaWxlQnlSaWQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7dXBsb2FkUmVzb3VyY2VzSWR9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCF1cGxvYWRSZXNvdXJjZXNJZCB8fCB1cGxvYWRSZXNvdXJjZXNJZC5sZW5ndGggPD0gMCkgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3QgcmlkID0gdXBsb2FkUmVzb3VyY2VzSWQuam9pbihcIi1cIik7XHJcbiAgICAgICAgICBua2NBUEkoYC9ycz9yaWQ9JHtyaWR9YCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgZGF0YS5yZXNvdXJjZXMubWFwKHIgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0ZWRGaWxlcy5wdXNoKHNlbGYuYXBwLmNyZWF0ZUZpbGUoXCJvbmxpbmVGaWxlXCIsIHIpKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5wYWdlVHlwZSA9IFwidXBsb2FkZXJcIjtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC51cGxvYWRSZXNvdXJjZXNJZCA9IFtdO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOa4heepuuacquS4iuS8oOeahOiusOW9lVxyXG4gICAgICAgIGNsZWFyVW5VcGxvYWRlZCgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcyA9IHRoaXMuc2VsZWN0ZWRGaWxlcy5maWx0ZXIoZiA9PiBmLnN0YXR1cyAhPT0gXCJub3RVcGxvYWRlZFwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaJuemHj+iuvue9ruaWh+S7tuebruW9lVxyXG4gICAgICAgIHNlbGVjdEZpbGVzRm9sZGVyKCkge1xyXG4gICAgICAgICAgY29uc3QgdGhpc18gPSB0aGlzO1xyXG4gICAgICAgICAgTGlicmFyeVBhdGgub3BlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7Zm9sZGVyLCBwYXRofSA9IGRhdGE7XHJcbiAgICAgICAgICAgIHRoaXNfLnNlbGVjdGVkRm9sZGVyID0gZm9sZGVyO1xyXG4gICAgICAgICAgICB0aGlzXy5zZWxlY3RlZEZvbGRlclBhdGggPSBwYXRoO1xyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsaWQ6IHRoaXMubGlkLFxyXG4gICAgICAgICAgICB3YXJuaW5nOiBcIuivpeaTjeS9nOWwhuimhuebluacrOmhteaJgOacieiuvue9ru+8jOivt+iwqOaFjuaTjeS9nOOAglwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOa4heepuuW3suaIkOWKn+S4iuS8oOeahOaWh+S7tuiusOW9lVxyXG4gICAgICAgIGNsZWFyVXBsb2FkZWQoKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMgPSB0aGlzLnNlbGVjdGVkRmlsZXMuZmlsdGVyKGYgPT4gZi5zdGF0dXMgIT09IFwidXBsb2FkZWRcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmibnph4/orr7nva7mlofku7bnmoTliIbnsbtcclxuICAgICAgICBtYXJrQ2F0ZWdvcnkoKSB7XHJcbiAgICAgICAgICBjb25zdCB7c2VsZWN0ZWRDYXRlZ29yeSwgc2VsZWN0ZWRGaWxlc30gPSB0aGlzO1xyXG4gICAgICAgICAgaWYoIXNlbGVjdGVkQ2F0ZWdvcnkpIHJldHVybjtcclxuICAgICAgICAgIHN3ZWV0UXVlc3Rpb24oXCLor6Xmk43kvZzlsIbopobnm5bmnKzpobXmiYDmnInorr7nva7vvIzor7flho3mrKHnoa7orqTjgIJcIilcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGVjdGVkRmlsZXMubWFwKGYgPT4gZi5jYXRlZ29yeSA9IHNlbGVjdGVkQ2F0ZWdvcnkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHt9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5om56YeP6K6+572u5paH5Lu255uu5b2VXHJcbiAgICAgICAgbWFya0ZvbGRlcigpIHtcclxuICAgICAgICAgIGNvbnN0IHtzZWxlY3RlZEZvbGRlciwgc2VsZWN0ZWRGb2xkZXJQYXRoLCBzZWxlY3RlZEZpbGVzfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZighc2VsZWN0ZWRGb2xkZXIpIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IHRoaXNfID0gdGhpcztcclxuICAgICAgICAgIHN3ZWV0UXVlc3Rpb24oYOivpeaTjeS9nOWwhuimhuebluacrOmhteaJgOacieiuvue9ru+8jOivt+WGjeasoeehruiupOOAgmApXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxlY3RlZEZpbGVzLm1hcChmID0+IHtcclxuICAgICAgICAgICAgICAgIGYuZm9sZGVyID0gc2VsZWN0ZWRGb2xkZXI7XHJcbiAgICAgICAgICAgICAgICBmLmZvbGRlclBhdGggPSBzZWxlY3RlZEZvbGRlclBhdGg7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgdGhpc18uc2VsZWN0ZWRGb2xkZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgIHRoaXNfLnNlbGVjdGVkRm9sZGVyUGF0aCA9IFwiXCI7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge30pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnvZHpobXliIfmjaLkuovku7ZcclxuICAgICAgICBvbnBvcHN0YXRlKGUpIHtcclxuICAgICAgICAgIGNvbnN0IHtzdGF0ZX0gPSBlO1xyXG4gICAgICAgICAgbGV0IGxpZCA9IHRoaXMubGlkO1xyXG4gICAgICAgICAgaWYoc3RhdGUgJiYgc3RhdGUubGlkKSBsaWQgPSBzdGF0ZS5saWQ7XHJcbiAgICAgICAgICB0aGlzLmdldExpc3QobGlkKVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliqDovb3mlofku7blpLnkv6Hmga/vvIzljIXlkKvplJnor6/lpITnkIZcclxuICAgICAgICBnZXRMaXN0SW5mbyhpZCwgc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgIHRoaXMuZ2V0TGlzdChpZCwgc2Nyb2xsVG9Ub3ApXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5hZGRIaXN0b3J5KGlkKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5hZGRGaWxlQnlSaWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgc3dlZXRFcnJvcihlcnIpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmr5Tlr7nmnYPpmZBwZXJtaXNzaW9uXHJcbiAgICAgICAgcGVyKG9wZXJhdGlvbikge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMucGVybWlzc2lvbi5pbmNsdWRlcyhvcGVyYXRpb24pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5byA5ZCv5aSa6YCJ5qGGXHJcbiAgICAgICAgbWFya0xpYnJhcnkoKSB7XHJcbiAgICAgICAgICB0aGlzLm1hcmsgPSAhdGhpcy5tYXJrO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZExpYnJhcmllc0lkID0gW107XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDpgInmi6kv5Y+W5raIIOWFqOmDqFxyXG4gICAgICAgIG1hcmtBbGwoKSB7XHJcbiAgICAgICAgICBpZih0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQubGVuZ3RoID09PSB0aGlzLmZvbGRlckxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaWJyYXJpZXNJZCA9IFtdO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpYnJhcmllc0lkID0gdGhpcy5mb2xkZXJMaXN0Lm1hcChmID0+IGYuX2lkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaJuemHj+WIoOmZpFxyXG4gICAgICAgIGRlbGV0ZUZvbGRlcnMoKSB7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZUZvbGRlcih0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5om56YeP56e75YqoXHJcbiAgICAgICAgbW92ZUZvbGRlcnMoKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdmVGb2xkZXIodGhpcy5zZWxlY3RlZExpYnJhcmllc0lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOagueaNruacrOWcsOaWh+S7tuaIluiAhXJlc291cmNl5a+56LGh5p6E5bu655So5LqO5LiK5Lyg55qE5paH5Lu25a+56LGhXHJcbiAgICAgICAgc2VsZWN0UGF0aChyKSB7XHJcbiAgICAgICAgICBMaWJyYXJ5UGF0aC5vcGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtmb2xkZXIsIHBhdGh9ID0gZGF0YTtcclxuICAgICAgICAgICAgci5mb2xkZXIgPSBmb2xkZXI7XHJcbiAgICAgICAgICAgIHIuZm9sZGVyUGF0aCA9IHBhdGg7XHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGxpZDogci5mb2xkZXI/ci5mb2xkZXIuX2lkOiBcIlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZUZpbGUodHlwZSwgcikge1xyXG4gICAgICAgICAgY29uc3Qge2ZvbGRlciwgZm9sZGVyUGF0aCwgX2lkLCB0b2MsIHJpZCwgY2F0ZWdvcnksIG5hbWUgPSBcIlwiLCBvbmFtZSwgZGVzY3JpcHRpb24gPSBcIlwiLCBzaXplfSA9IHI7XHJcbiAgICAgICAgICBjb25zdCBmaWxlID0ge1xyXG4gICAgICAgICAgICBfaWQsXHJcbiAgICAgICAgICAgIHR5cGUsXHJcbiAgICAgICAgICAgIHJpZCxcclxuICAgICAgICAgICAgbmFtZTogbmFtZSB8fCBvbmFtZSxcclxuICAgICAgICAgICAgc2l6ZSxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5IHx8IFwiXCIsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBmb2xkZXI6IGZvbGRlciB8fCB0aGlzLmZvbGRlcixcclxuICAgICAgICAgICAgZm9sZGVyUGF0aDogZm9sZGVyUGF0aCB8fCAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBzZWxmLmFwcC5uYXYubWFwKG4gPT4gbi5uYW1lKTtcclxuICAgICAgICAgICAgICByZXR1cm4gXCIvXCIgKyBuYW1lLmpvaW4oXCIvXCIpO1xyXG4gICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICBkYXRhOiByLFxyXG4gICAgICAgICAgICB0b2M6IHRvYyB8fCBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBzdGF0dXM6IFwibm90VXBsb2FkZWRcIiwgLy8gbm90VXBsb2FkZWQsIHVwbG9hZGluZywgdXBsb2FkZWRcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcclxuICAgICAgICAgICAgZXJyb3I6IFwiXCIsIC8vIOmUmeivr+S/oeaBr1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC4uKj8kL2lnLCBcIlwiKTtcclxuICAgICAgICAgIGlmKGZpbGUudHlwZSA9PT0gXCJsb2NhbEZpbGVcIikge1xyXG4gICAgICAgICAgICBpZihyLnR5cGUuaW5jbHVkZXMoXCJpbWFnZVwiKSkge1xyXG4gICAgICAgICAgICAgIGZpbGUuZXh0ID0gXCJtZWRpYVBpY3R1cmVcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBmaWxlLmV4dCA9IFwibWVkaWFBdHRhY2htZW50XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZihmaWxlLmV4dCA9PT0gXCJtZWRpYVBpY3R1cmVcIikge1xyXG4gICAgICAgICAgICBmaWxlLmVycm9yID0gXCLmmoLkuI3lhYHorrjkuIrkvKDlm77niYfliLDmloflupNcIjtcclxuICAgICAgICAgICAgZmlsZS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICB9IGVsc2UgaWYoZmlsZS5zaXplID4gMjAwICogMTAyNCAqIDEwMjQpIHtcclxuICAgICAgICAgICAgZmlsZS5lcnJvciA9IFwi5paH5Lu25aSn5bCP5LiN6IO96LaF6L+HMjAwTUJcIjtcclxuICAgICAgICAgICAgZmlsZS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZpbGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGFydFVwbG9hZCgpIHtcclxuICAgICAgICAgIHRoaXMudXBsb2FkRmlsZSgwLCB0aGlzLnNlbGVjdGVkRmlsZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlRmlsZShpbmRleCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDkuIrkvKDmlofku7ZcclxuICAgICAgICB1cGxvYWRGaWxlKGluZGV4LCBhcnIpIHtcclxuICAgICAgICAgIGlmKGluZGV4ID49IGFyci5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IGZpbGUgPSBhcnJbaW5kZXhdO1xyXG4gICAgICAgICAgY29uc3Qge3N0YXR1cywgZGlzYWJsZWR9ID0gZmlsZTtcclxuICAgICAgICAgIGlmKGRpc2FibGVkIHx8IHN0YXR1cyAhPT0gXCJub3RVcGxvYWRlZFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGUoaW5kZXggKyAxLCBhcnIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmlsZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICBmaWxlLnN0YXR1cyA9IFwidXBsb2FkaW5nXCI7XHJcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoIWZpbGUpIHRocm93IFwi5paH5Lu25byC5bi4XCI7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuY2hlY2tTdHJpbmcoZmlsZS5uYW1lLCB7XHJcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGg6IDUwMCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi5paH5Lu25ZCN56ewXCJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5jaGVja1N0cmluZyhmaWxlLmRlc2NyaXB0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMDAsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuaWh+S7tuivtOaYjlwiXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgaWYoIVtcIm1lZGlhXCIsIFwicGFwZXJcIiwgXCJib29rXCIsIFwicHJvZ3JhbVwiLCBcIm90aGVyXCJdLmluY2x1ZGVzKGZpbGUuY2F0ZWdvcnkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcIuacqumAieaLqeaWh+S7tuWIhuexu1wiO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZighZmlsZS5mb2xkZXIpIHRocm93IFwi5pyq6YCJ5oup55uu5b2VXCI7XHJcbiAgICAgICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTktDLm1ldGhvZHMuZ2V0RmlsZU1ENShmaWxlLmRhdGEpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5LiK5Lyg5pys5Zyw5paH5Lu2XHJcbiAgICAgICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZU5hbWVcIiwgZmlsZS5kYXRhLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwidHlwZVwiLCBcImNoZWNrTUQ1XCIpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwibWQ1XCIsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoXCIvclwiLCBcIlBPU1RcIiwgZm9ybURhdGEpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YSAmJiAhZGF0YS51cGxvYWRlZCAmJiBmaWxlLnR5cGUgPT09IFwibG9jYWxGaWxlXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlXCIsIGZpbGUuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZShcIi9yXCIsIFwiUE9TVFwiLCBmb3JtRGF0YSwgKGUsIHApID0+IHtcclxuICAgICAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IHA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAvLyDmm7/mjaLmnKzlnLDmlofku7bkv6Hmga8g57uf5LiA5Li657q/5LiK5paH5Lu25qih5byPXHJcbiAgICAgICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXNvdXJjZSA9IGRhdGEucjtcclxuICAgICAgICAgICAgICAgIGZpbGUuZGF0YSA9IHJlc291cmNlO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5leHQgPSByZXNvdXJjZS5tZWRpYVR5cGU7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnJpZCA9IHJlc291cmNlLnJpZDtcclxuICAgICAgICAgICAgICAgIGZpbGUudG9jID0gcmVzb3VyY2UudG9jO1xyXG4gICAgICAgICAgICAgICAgZmlsZS50eXBlID0gXCJvbmxpbmVGaWxlXCI7XHJcbiAgICAgICAgICAgICAgICBpZihmaWxlLmV4dCA9PT0gXCJtZWRpYVBpY3R1cmVcIikge1xyXG4gICAgICAgICAgICAgICAgICBmaWxlLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgdGhyb3cobmV3IEVycm9yKFwi5pqC5LiN5YWB6K645LiK5Lyg5Zu+54mH5Yiw5paH5bqTXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBpZihmaWxlLnR5cGUgPT09IFwibW9kaWZ5XCIpIHtcclxuICAgICAgICAgICAgICAgIC8vIOaJuemHj+S/ruaUuVxyXG4gICAgICAgICAgICAgICAgY29uc3Qge19pZCwgbmFtZSwgZGVzY3JpcHRpb24sIGNhdGVnb3J5fSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvbGlicmFyeS8ke19pZH1gLCBcIlBVVFwiLCBib2R5KTtcclxuXHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIOWwhue6v+S4iuaWh+S7tuaPkOS6pOWIsOaWh+W6k1xyXG4gICAgICAgICAgICAgICAgY29uc3Qge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lLCBkZXNjcmlwdGlvbiwgY2F0ZWdvcnksIHJpZCwgZm9sZGVyXHJcbiAgICAgICAgICAgICAgICB9ID0gZmlsZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJvZHkgPSB7XHJcbiAgICAgICAgICAgICAgICAgIHJpZCxcclxuICAgICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImJvZHlcIiwgSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5rY0FQSShgL2xpYnJhcnkvJHtmb2xkZXIuX2lkfWAsIFwiUE9TVFwiLCBib2R5KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBmaWxlLnN0YXR1cyA9IFwidXBsb2FkZWRcIjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgIGZpbGUuZXJyb3IgPSBkYXRhLmVycm9yIHx8IGRhdGE7XHJcbiAgICAgICAgICAgICAgZmlsZS5zdGF0dXMgPSBcIm5vdFVwbG9hZGVkXCI7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5maW5hbGx5KCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC51cGxvYWRGaWxlKGluZGV4KzEsIGFycik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDov5Tlm57kuIrkuIDlsYLmlofku7blpLlcclxuICAgICAgICBiYWNrKCkge1xyXG4gICAgICAgICAgaWYodGhpcy5sYXN0Rm9sZGVyKSB0aGlzLnNlbGVjdEZvbGRlcih0aGlzLmxhc3RGb2xkZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5YiH5o2i5Yiw5paH5Lu25LiK5LygXHJcbiAgICAgICAgdG9VcGxvYWQoKSB7XHJcbiAgICAgICAgICBpZih0aGlzLm1hcmspIHJldHVybjtcclxuICAgICAgICAgIHRoaXMucGFnZVR5cGUgPSBcInVwbG9hZGVyXCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliIfmjaLliLDmlofku7bliJfooahcclxuICAgICAgICB0b0xpc3QoKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdEZvbGRlcih0aGlzLmZvbGRlcik7XHJcbiAgICAgICAgICB0aGlzLnBhZ2VUeXBlID0gXCJsaXN0XCI7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDlsIbnlKjmiLflt7LpgInmi6nnmoTnrZvpgInliIbnsbvlrZjliLDmnKzlnLBcclxuICAgICAgICBzYXZlQ2F0ZWdvcmllc1RvTG9jYWxTdG9yYWdlKCkge1xyXG4gICAgICAgICAgY29uc3Qge2xpc3RDYXRlZ29yaWVzfSA9IHRoaXM7XHJcbiAgICAgICAgICBjb25zdCBsaWJyYXJ5TGlzdENhdGVnb3JpZXMgPSBOS0MubWV0aG9kcy5nZXRGcm9tTG9jYWxTdG9yYWdlKFwibGlicmFyeUxpc3RDYXRlZ29yaWVzXCIpO1xyXG4gICAgICAgICAgbGlicmFyeUxpc3RDYXRlZ29yaWVzW3RoaXMubGlkXSA9IGxpc3RDYXRlZ29yaWVzO1xyXG4gICAgICAgICAgTktDLm1ldGhvZHMuc2F2ZVRvTG9jYWxTdG9yYWdlKFwibGlicmFyeUxpc3RDYXRlZ29yaWVzXCIsIGxpYnJhcnlMaXN0Q2F0ZWdvcmllcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDor7vlj5bmnKzlnLDlrZjlgqjnmoTnrZvpgInliIbnsbtcclxuICAgICAgICBnZXRDYXRlZ29yaWVzRnJvbUxvY2FsU3RvcmFnZSgpIHtcclxuICAgICAgICAgIGNvbnN0IGxpYnJhcnlMaXN0Q2F0ZWdvcmllcyA9IE5LQy5tZXRob2RzLmdldEZyb21Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5TGlzdENhdGVnb3JpZXNcIik7XHJcbiAgICAgICAgICBjb25zdCBsaXN0Q2F0ZWdvcmllcyA9IGxpYnJhcnlMaXN0Q2F0ZWdvcmllc1t0aGlzLmxpZF07XHJcbiAgICAgICAgICBpZihsaXN0Q2F0ZWdvcmllcykge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RDYXRlZ29yaWVzID0gbGlzdENhdGVnb3JpZXM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmlofku7blpLnorr/pl67orrDlvZXlrZjliLDmtY/op4jlmajmnKzlnLBcclxuICAgICAgICBzYXZlVG9Mb2NhbFN0b3JhZ2UoaWQpIHtcclxuICAgICAgICAgIGNvbnN0IGxpYnJhcnlWaXNpdEZvbGRlckxvZ3MgPSBOS0MubWV0aG9kcy5nZXRGcm9tTG9jYWxTdG9yYWdlKFwibGlicmFyeVZpc2l0Rm9sZGVyTG9nc1wiKTtcclxuICAgICAgICAgIGxpYnJhcnlWaXNpdEZvbGRlckxvZ3NbdGhpcy5saWRdID0gaWQ7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy5zYXZlVG9Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzXCIsIGxpYnJhcnlWaXNpdEZvbGRlckxvZ3MpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5re75Yqg5LiA5p2h5rWP6KeI5Zmo5Y6G5Y+y6K6w5b2VXHJcbiAgICAgICAgYWRkSGlzdG9yeShsaWQpIHtcclxuICAgICAgICAgIC8vIOWIpOaWreaYr+WQpuS4uuebuOWQjOmhte+8jOebuOWQjOWImeS4jeWIm+W7uua1j+iniOWZqOWOhuWPsuiusOW9leOAglxyXG4gICAgICAgICAgaWYodGhpcy5sYXN0SGlzdG9yeUxpZCAmJiB0aGlzLmxhc3RIaXN0b3J5TGlkID09PSBsaWQpIHJldHVybjtcclxuICAgICAgICAgIGxldCB7aHJlZn0gPSB3aW5kb3cubG9jYXRpb247XHJcbiAgICAgICAgICBpZihocmVmLmluY2x1ZGVzKFwiI1wiKSkge1xyXG4gICAgICAgICAgICBocmVmID0gaHJlZi5yZXBsYWNlKC8jLiovaWcsIFwiXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHtsaWR9LCAncGFnZScsIGhyZWYgKyAnIycgKyBsaWQpO1xyXG4gICAgICAgICAgdGhpcy5sYXN0SGlzdG9yeUxpZCA9IGxpZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOiOt+WPluaWh+S7tuWIl+ihqFxyXG4gICAgICAgIGdldExpc3QoaWQsIHNjcm9sbFRvVG9wKSB7XHJcbiAgICAgICAgICBjb25zdCB1cmwgPSBgL2xpYnJhcnkvJHtpZH0/ZmlsZT10cnVlJm5hdj10cnVlJmZvbGRlcj10cnVlJnBlcm1pc3Npb249dHJ1ZSZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSh1cmwsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5uYXYgPSBkYXRhLm5hdjtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZpbGVzID0gZGF0YS5maWxlcztcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5wZXJtaXNzaW9uID0gZGF0YS5wZXJtaXNzaW9uO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnNhdmVUb0xvY2FsU3RvcmFnZShpZCk7XHJcbiAgICAgICAgICAgICAgaWYoc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNjcm9sbFRvKG51bGwsIDApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE9ubGluZUZpbGVzKCkge1xyXG4gICAgICAgICAgU2VsZWN0UmVzb3VyY2Uub3BlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7cmVzb3VyY2VzfSA9IGRhdGE7XHJcbiAgICAgICAgICAgIHJlc291cmNlcy5tYXAociA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0ZWRGaWxlcy5wdXNoKHNlbGYuYXBwLmNyZWF0ZUZpbGUoXCJvbmxpbmVGaWxlXCIsIHIpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGFsbG93ZWRFeHQ6IFtcImF0dGFjaG1lbnRcIiwgXCJ2aWRlb1wiLCBcImF1ZGlvXCJdLFxyXG4gICAgICAgICAgICBjb3VudExpbWl0OiA5OVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqeWujOacrOWcsOaWh+S7tlxyXG4gICAgICAgIHNlbGVjdGVkTG9jYWxGaWxlcygpIHtcclxuICAgICAgICAgIGNvbnN0IHtmaWxlcyA9IFtdfSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kdWxlTGlicmFyeUlucHV0XCIpO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzLnB1c2godGhpcy5jcmVhdGVGaWxlKFwibG9jYWxGaWxlXCIsIGZpbGUpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kdWxlTGlicmFyeUlucHV0XCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqeaWh+S7tuWkuVxyXG4gICAgICAgIHNlbGVjdEZvbGRlcihmb2xkZXIsIHNjcm9sbFRvVG9wKSB7XHJcbiAgICAgICAgICBpZih0aGlzLm1hcmspIHJldHVybjtcclxuICAgICAgICAgIGlmKGZvbGRlci50eXBlID09PSBcImZvbGRlclwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TGlzdEluZm8oZm9sZGVyLl9pZCwgc2Nyb2xsVG9Ub3ApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RGaWxlKGZvbGRlcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDngrnlh7vmlofku7blpLnnm67lvZXml7ZcclxuICAgICAgICBzZWxlY3ROYXZGb2xkZXIoZikge1xyXG4gICAgICAgICAgaWYodGhpcy5wYWdlVHlwZSAhPT0gXCJsaXN0XCIpIHtcclxuICAgICAgICAgICAgdGhpcy5wYWdlVHlwZSA9IFwibGlzdFwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RGb2xkZXIoZik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnp7vliqjmlofku7blpLnmiJbmlofku7ZcclxuICAgICAgICBtb3ZlRm9sZGVyKGxpYnJhcnlJZCkge1xyXG4gICAgICAgICAgbGV0IGZvbGRlcnNJZDtcclxuICAgICAgICAgIGlmKEFycmF5LmlzQXJyYXkobGlicmFyeUlkKSkge1xyXG4gICAgICAgICAgICBmb2xkZXJzSWQgPSBsaWJyYXJ5SWQ7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb2xkZXJzSWQgPSBbbGlicmFyeUlkXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBib2R5ID0ge307XHJcbiAgICAgICAgICBib2R5LmZvbGRlcnNJZCA9IGZvbGRlcnNJZDtcclxuXHJcbiAgICAgICAgICBjb25zdCB1cmwgPSBgL2xpYnJhcnkvJHt0aGlzLmZvbGRlci5faWR9L2xpc3RgO1xyXG4gICAgICAgICAgY29uc3QgbWV0aG9kID0gXCJQVVRcIjtcclxuXHJcbiAgICAgICAgICBMaWJyYXJ5UGF0aC5vcGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGJvZHkudGFyZ2V0Rm9sZGVySWQgPSBkYXRhLmZvbGRlci5faWQ7XHJcbiAgICAgICAgICAgIG5rY0FQSSh1cmwsIG1ldGhvZCwgYm9keSlcclxuICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKGDmiafooYzmiJDlip8ke2RhdGEuaWdub3JlQ291bnQ/IGDvvIzlhbHmnIkke2RhdGEuaWdub3JlQ291bnR95Liq6aG555uu5Zug5a2Y5Zyo5Yay56qB5oiW5LiN5piv5L2g6Ieq5bex5Y+R5biD55qE6ICM6KKr5b+955WlYDogXCJcIn1gKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLm1hcmsgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdEZvbGRlcihzZWxmLmFwcC5mb2xkZXIpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsaWQ6IHNlbGYuYXBwLmZvbGRlci5faWQsXHJcbiAgICAgICAgICAgIHdhcm5pbmc6IFwi5q2k5pON5L2c5LiN5Lya5L+d55WZ5Y6f5pyJ55uu5b2V57uT5p6E77yM5LiU5LiN5Y+v5oGi5aSN44CCXCJcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnvJbovpHmlofku7blpLlcclxuICAgICAgICBlZGl0Rm9sZGVyKGZvbGRlcikge1xyXG4gICAgICAgICAgaWYodGhpcy5tYXJrKSByZXR1cm47XHJcbiAgICAgICAgICBsZXQgdHlwZVN0ciA9IFwi5paH5Lu25aS5XCI7XHJcbiAgICAgICAgICBsZXQgbW9kYWxEYXRhID0gW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZG9tOiBcImlucHV0XCIsXHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGAke3R5cGVTdHJ95ZCN56ewYCxcclxuICAgICAgICAgICAgICB2YWx1ZTogZm9sZGVyLm5hbWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRvbTogXCJ0ZXh0YXJlYVwiLFxyXG4gICAgICAgICAgICAgIGxhYmVsOiBgJHt0eXBlU3RyfeeugOS7i2AsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IGZvbGRlci5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdO1xyXG4gICAgICAgICAgaWYoZm9sZGVyLnR5cGUgPT09IFwiZmlsZVwiKSB7XHJcbiAgICAgICAgICAgIHR5cGVTdHIgPSBcIuaWh+S7tlwiO1xyXG4gICAgICAgICAgICBtb2RhbERhdGEucHVzaCh7XHJcbiAgICAgICAgICAgICAgZG9tOiBcInJhZGlvXCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IFwi5paH5Lu25YiG57G7XCIsXHJcbiAgICAgICAgICAgICAgcmFkaW9zOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwi5Zu+5LmmXCIsXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBcImJvb2tcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogXCLorrrmlodcIixcclxuICAgICAgICAgICAgICAgICAgdmFsdWU6IFwicGFwZXJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogXCLnqIvluo9cIixcclxuICAgICAgICAgICAgICAgICAgdmFsdWU6IFwicHJvZ3JhbVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIuWqkuS9k1wiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIuWFtuS7llwiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJvdGhlclwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB2YWx1ZTogZm9sZGVyLmNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBDb21tb25Nb2RhbC5vcGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcmVzWzBdLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHJlc1sxXS52YWx1ZTtcclxuICAgICAgICAgICAgbGV0IGNhdGVnb3J5ID0gXCJcIjtcclxuICAgICAgICAgICAgaWYoZm9sZGVyLnR5cGUgPT09IFwiZmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgY2F0ZWdvcnkgPSByZXNbMl0udmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIW5hbWUpIHJldHVybiBzd2VldEVycm9yKFwi5ZCN56ew5LiN6IO95Li656m6XCIpO1xyXG4gICAgICAgICAgICBua2NBUEkoXCIvbGlicmFyeS9cIiArIGZvbGRlci5faWQsIFwiUFVUXCIsIHtcclxuICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgIGNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5zZWxlY3RGb2xkZXIoc2VsZi5hcHAuZm9sZGVyKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5Db21tb25Nb2RhbC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdGl0bGU6IGDnvJbovpEke3R5cGVTdHJ9YCxcclxuICAgICAgICAgICAgZGF0YTogbW9kYWxEYXRhXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWIoOmZpOaWh+S7tuWkuVxyXG4gICAgICAgIGRlbGV0ZUZvbGRlcihmb2xkZXJzSWQpIHtcclxuICAgICAgICAgIGlmKCFBcnJheS5pc0FycmF5KGZvbGRlcnNJZCkpIHtcclxuICAgICAgICAgICAgZm9sZGVyc0lkID0gW2ZvbGRlcnNJZF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZighZm9sZGVyc0lkLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgICAgICAgZm9sZGVyc0lkID0gZm9sZGVyc0lkLmpvaW4oXCItXCIpO1xyXG4gICAgICAgICAgc3dlZXRRdWVzdGlvbihg56Gu5a6a6KaB5omn6KGM5Yig6Zmk5pON5L2c77yfYClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgbmtjQVBJKGAvbGlicmFyeS8ke3NlbGYuYXBwLmZvbGRlci5faWR9L2xpc3Q/bGlkPSR7Zm9sZGVyc0lkfWAsIFwiREVMRVRFXCIpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGYuYXBwLm1hcmsgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0Rm9sZGVyKHNlbGYuYXBwLmZvbGRlcik7XHJcbiAgICAgICAgICAgICAgICAgIHN3ZWV0U3VjY2Vzcyhg5omn6KGM5oiQ5YqfJHtkYXRhLmlnbm9yZUNvdW50PyBg77yM5YWx5pyJJHtkYXRhLmlnbm9yZUNvdW50feS4qumhueebruWboOS4jeaYr+S9oOiHquW3seWPkeW4g+eahOiAjOiiq+W/veeVpWA6IFwiXCJ9YCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbigpe30pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDpgInmi6nmlofku7ZcclxuICAgICAgICBzZWxlY3RGaWxlKGZpbGUpIHtcclxuICAgICAgICAgIFJlc291cmNlSW5mby5vcGVuKHtsaWQ6IGZpbGUuX2lkfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliJvlu7rmlofku7blpLlcclxuICAgICAgICBjcmVhdGVGb2xkZXIoKSB7XHJcbiAgICAgICAgICBpZih0aGlzLm1hcmspIHJldHVybjtcclxuICAgICAgICAgIHdpbmRvdy5Db21tb25Nb2RhbC5vcGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcmVzWzBdLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHJlc1sxXS52YWx1ZTtcclxuICAgICAgICAgICAgaWYoIW5hbWUpIHJldHVybiBzd2VldEVycm9yKFwi5ZCN56ew5LiN6IO95Li656m6XCIpO1xyXG4gICAgICAgICAgICBua2NBUEkoXCIvbGlicmFyeS9cIiArIHNlbGYuYXBwLmZvbGRlci5faWQgKyBcIi9saXN0XCIsIFwiUE9TVFwiLCB7XHJcbiAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvblxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5paH5Lu25aS55Yib5bu65oiQ5YqfXCIpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LkNvbW1vbk1vZGFsLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFwcC5zZWxlY3RGb2xkZXIoc2VsZi5hcHAuZm9sZGVyKTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHRpdGxlOiBcIuaWsOW7uuaWh+S7tuWkuVwiLFxyXG4gICAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZG9tOiBcImlucHV0XCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBcIuaWh+S7tuWkueWQjeensFwiLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwiXCJcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRvbTogXCJ0ZXh0YXJlYVwiLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwi5paH5Lu25aS5566A5LuLXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIlxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxufTtcclxuIl19
