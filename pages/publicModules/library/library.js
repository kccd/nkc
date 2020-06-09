(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

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
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.selectedFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var f = _step.value;
              if (f.status === "uploading") return true;
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

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var file = _step2.value;
              this.selectedFiles.push(this.createFile("localFile", file));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvbGlicmFyeS9saWJyYXJ5Lm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxHQUFHLENBQUMsT0FBSixDQUFZLE9BQVo7QUFDRSxrQkFBWSxPQUFaLEVBQXFCO0FBQUE7O0FBQUEsUUFDWixHQURZLEdBQzhCLE9BRDlCLENBQ1osR0FEWTtBQUFBLFFBQ1AsUUFETyxHQUM4QixPQUQ5QixDQUNQLFFBRE87QUFBQSxRQUNHLElBREgsR0FDOEIsT0FEOUIsQ0FDRyxJQURIO0FBQUEsUUFDUyxpQkFEVCxHQUM4QixPQUQ5QixDQUNTLGlCQURUO0FBRW5CLFFBQU0sSUFBSSxHQUFHLElBQWI7QUFDQSxJQUFBLElBQUksQ0FBQyxHQUFMLEdBQVcsSUFBSSxHQUFKLENBQVE7QUFDakIsTUFBQSxFQUFFLEVBQUUsZ0JBRGE7QUFFakIsTUFBQSxJQUFJLEVBQUU7QUFDSixRQUFBLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBSixDQUFZLEdBRGI7QUFFSixRQUFBLGlCQUFpQixFQUFqQixpQkFGSTtBQUdKLFFBQUEsUUFBUSxFQUFFLE1BSE47QUFHYztBQUNsQixRQUFBLEdBQUcsRUFBRSxFQUpEO0FBS0osUUFBQSxPQUFPLEVBQUUsRUFMTDtBQU1KLFFBQUEsS0FBSyxFQUFFLEVBTkg7QUFPSixRQUFBLEdBQUcsRUFBSCxHQVBJO0FBUUosUUFBQSxJQUFJLEVBQUosSUFSSTtBQVNKLFFBQUEsSUFBSSxFQUFFLE1BVEY7QUFVSixRQUFBLFNBQVMsRUFBRSxFQVZQO0FBV0osUUFBQSxLQUFLLEVBQUUsQ0FYSDtBQVlKLFFBQUEsYUFBYSxFQUFFLEVBWlg7QUFhSixRQUFBLElBQUksRUFBRSxLQWJGO0FBY0osUUFBQSxtQkFBbUIsRUFBRSxFQWRqQjtBQWVKLFFBQUEsVUFBVSxFQUFFLEVBZlI7QUFnQkos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QUFGMEQsYUFBdEQsQ0FBTixDQUlHLElBSkgsQ0FJUSxZQUFXO0FBQ2YsY0FBQSxZQUFZLENBQUMsU0FBRCxDQUFaO0FBQ0EsY0FBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixLQUFuQjtBQUNBLGNBQUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxZQUFULENBQXNCLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBL0I7QUFDRCxhQVJILFdBU1MsVUFBUyxJQUFULEVBQWU7QUFDcEIsY0FBQSxVQUFVLENBQUMsSUFBRCxDQUFWO0FBQ0QsYUFYSDtBQVlELFdBaEJELEVBZ0JHO0FBQ0QsWUFBQSxLQUFLLEVBQUUsT0FETjtBQUVELFlBQUEsSUFBSSxFQUFFLENBQ0o7QUFDRSxjQUFBLEdBQUcsRUFBRSxPQURQO0FBRUUsY0FBQSxJQUFJLEVBQUUsTUFGUjtBQUdFLGNBQUEsS0FBSyxFQUFFLE9BSFQ7QUFJRSxjQUFBLEtBQUssRUFBRTtBQUpULGFBREksRUFPSjtBQUNFLGNBQUEsR0FBRyxFQUFFLFVBRFA7QUFFRSxjQUFBLEtBQUssRUFBRSxPQUZUO0FBR0UsY0FBQSxLQUFLLEVBQUU7QUFIVCxhQVBJO0FBRkwsV0FoQkg7QUFnQ0Q7QUF0aEJNO0FBckpRLEtBQVIsQ0FBWDtBQThxQkQ7O0FBbHJCSDtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiTktDLm1vZHVsZXMuTGlicmFyeSA9IGNsYXNzIHtcclxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICBjb25zdCB7bGlkLCBmb2xkZXJJZCwgdExpZCwgdXBsb2FkUmVzb3VyY2VzSWR9ID0gb3B0aW9ucztcclxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgc2VsZi5hcHAgPSBuZXcgVnVlKHtcclxuICAgICAgZWw6IFwiI21vZHVsZUxpYnJhcnlcIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHVpZDogTktDLmNvbmZpZ3MudWlkLFxyXG4gICAgICAgIHVwbG9hZFJlc291cmNlc0lkLFxyXG4gICAgICAgIHBhZ2VUeXBlOiBcImxpc3RcIiwgLy8gbGlzdDog5paH5Lu25YiX6KGoLCB1cGxvYWRlcjog5paH5Lu25LiK5LygXHJcbiAgICAgICAgbmF2OiBbXSxcclxuICAgICAgICBmb2xkZXJzOiBbXSxcclxuICAgICAgICBmaWxlczogW10sXHJcbiAgICAgICAgbGlkLFxyXG4gICAgICAgIHRMaWQsXHJcbiAgICAgICAgc29ydDogXCJ0aW1lXCIsXHJcbiAgICAgICAgaGlzdG9yaWVzOiBbXSxcclxuICAgICAgICBpbmRleDogMCxcclxuICAgICAgICBzZWxlY3RlZEZpbGVzOiBbXSxcclxuICAgICAgICBtYXJrOiBmYWxzZSxcclxuICAgICAgICBzZWxlY3RlZExpYnJhcmllc0lkOiBbXSxcclxuICAgICAgICBwZXJtaXNzaW9uOiBbXSxcclxuICAgICAgICBsYXN0SGlzdG9yeUxpZDogXCJcIixcclxuICAgICAgICBzZWxlY3RlZENhdGVnb3J5OiBcImJvb2tcIiwgLy8g5om56YeP5L+u5pS55paH5Lu257G75Z6LXHJcbiAgICAgICAgc2VsZWN0ZWRGb2xkZXI6IFwiXCIsIC8vIOaJuemHj+S/ruaUueaWh+S7tuebruW9lSDnm67lvZVJRFxyXG4gICAgICAgIHNlbGVjdGVkRm9sZGVyUGF0aDogXCJcIiwgLy8g5om56YeP5L+u5pS55paH5Lu255uu5b2VIOebruW9lei3r+W+hFxyXG4gICAgICAgIGxpc3RDYXRlZ29yaWVzOiBbXCJib29rXCIsIFwicGFwZXJcIiwgXCJwcm9ncmFtXCIsIFwibWVkaWFcIiwgXCJvdGhlclwiXSxcclxuICAgICAgICBjYXRlZ29yaWVzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlkOiBcImJvb2tcIixcclxuICAgICAgICAgICAgbmFtZTogXCLlm77kuaZcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IFwicGFwZXJcIixcclxuICAgICAgICAgICAgbmFtZTogXCLorrrmlodcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWQ6IFwicHJvZ3JhbVwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIueoi+W6j1wiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZDogXCJtZWRpYVwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIuWqkuS9k1wiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZDogXCJvdGhlclwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIuWFtuS7llwiXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBwcm90b2NvbDogdHJ1ZSwgLy8g5piv5ZCm5ZCM5oSP5Y2P6K6uXHJcbiAgICAgIH0sXHJcbiAgICAgIHdhdGNoOntcclxuICAgICAgICBsaXN0Q2F0ZWdvcmllcygpIHtcclxuICAgICAgICAgIHRoaXMuc2F2ZUNhdGVnb3JpZXNUb0xvY2FsU3RvcmFnZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbW91bnRlZCgpIHtcclxuICAgICAgICBpZihmb2xkZXJJZCkge1xyXG4gICAgICAgICAgdGhpcy5zYXZlVG9Mb2NhbFN0b3JhZ2UoZm9sZGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdldENhdGVnb3JpZXNGcm9tTG9jYWxTdG9yYWdlKCk7XHJcbiAgICAgICAgY29uc3QgbGlicmFyeVZpc2l0Rm9sZGVyTG9ncyA9IE5LQy5tZXRob2RzLmdldEZyb21Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzXCIpO1xyXG4gICAgICAgIGNvbnN0IGNoaWxkRm9sZGVySWQgPSBsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzW3RoaXMubGlkXTtcclxuICAgICAgICBjb25zdCB0aGlzXyA9IHRoaXM7XHJcbiAgICAgICAgaWYoY2hpbGRGb2xkZXJJZCAhPT0gdW5kZWZpbmVkICYmIGNoaWxkRm9sZGVySWQgIT09IHRoaXMubGlkKSB7XHJcbiAgICAgICAgICAvLyDlpoLmnpzmtY/op4jlmajmnKzlnLDlrZjmnInorr/pl67orrDlvZXvvIzliJnlhYjnoa7lrpror6XorrDlvZXkuK3nmoTmlofku7blpLnmmK/lkKblrZjlnKjvvIzlrZjlnKjliJnorr/pl67vvIzkuI3lrZjlnKjliJnmiZPlvIDpobblsYLmlofku7blpLnjgIJcclxuICAgICAgICAgIHRoaXMuZ2V0TGlzdChjaGlsZEZvbGRlcklkKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpc18uYWRkSGlzdG9yeSh0aGlzXy5saWQpO1xyXG4gICAgICAgICAgICAgIHRoaXNfLmFkZEZpbGVCeVJpZCgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2ggKChlcnIpID0+IHtcclxuICAgICAgICAgICAgICB0aGlzXy5nZXRMaXN0SW5mbyh0aGlzXy5saWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5nZXRMaXN0SW5mbyh0aGlzXy5saWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIXdpbmRvdy5Db21tb25Nb2RhbCkge1xyXG4gICAgICAgICAgaWYoIU5LQy5tb2R1bGVzLkNvbW1vbk1vZGFsKSB7XHJcbiAgICAgICAgICAgIHN3ZWV0RXJyb3IoXCLmnKrlvJXlhaXpgJrnlKjlvLnmoYZcIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB3aW5kb3cuQ29tbW9uTW9kYWwgPSBuZXcgTktDLm1vZHVsZXMuQ29tbW9uTW9kYWwoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIXdpbmRvdy5SZXNvdXJjZUluZm8pIHtcclxuICAgICAgICAgIGlmKCFOS0MubW9kdWxlcy5SZXNvdXJjZUluZm8pIHtcclxuICAgICAgICAgICAgc3dlZXRFcnJvcihcIuacquW8leWFpei1hOa6kOS/oeaBr+aooeWdl1wiKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5SZXNvdXJjZUluZm8gPSBuZXcgTktDLm1vZHVsZXMuUmVzb3VyY2VJbmZvKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF3aW5kb3cuU2VsZWN0UmVzb3VyY2UpIHtcclxuICAgICAgICAgIGlmKCFOS0MubW9kdWxlcy5TZWxlY3RSZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBzd2VldEVycm9yKFwi5pyq5byV5YWl6LWE5rqQ5L+h5oGv5qih5Z2XXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LlNlbGVjdFJlc291cmNlID0gbmV3IE5LQy5tb2R1bGVzLlNlbGVjdFJlc291cmNlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCF3aW5kb3cuTGlicmFyeVBhdGgpIHtcclxuICAgICAgICAgIGlmKCFOS0MubW9kdWxlcy5MaWJyYXJ5UGF0aCkge1xyXG4gICAgICAgICAgICBzd2VldEVycm9yKFwi5pyq5byV5YWl5paH5bqT6Lev5b6E6YCJ5oup5qih5Z2XXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LkxpYnJhcnlQYXRoID0gbmV3IE5LQy5tb2R1bGVzLkxpYnJhcnlQYXRoKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5vbnBvcHN0YXRlID0gdGhpcy5vbnBvcHN0YXRlO1xyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIHVwbG9hZGluZygpIHtcclxuICAgICAgICAgIGZvcihjb25zdCBmIG9mIHRoaXMuc2VsZWN0ZWRGaWxlcykge1xyXG4gICAgICAgICAgICBpZihmLnN0YXR1cyA9PT0gXCJ1cGxvYWRpbmdcIikgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXN0Rm9sZGVyKCkge1xyXG4gICAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMubmF2Lmxlbmd0aDtcclxuICAgICAgICAgIGlmKGxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubmF2W2xlbmd0aCAtMl07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb2xkZXIoKSB7XHJcbiAgICAgICAgICB2YXIgbGVuZ3RoID0gdGhpcy5uYXYubGVuZ3RoO1xyXG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5hdltsZW5ndGggLSAxXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7fVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9sZGVyTGlzdCgpIHtcclxuICAgICAgICAgIGNvbnN0IHtsaXN0Q2F0ZWdvcmllcywgZmlsZXMsIGZvbGRlcnMsIHVpZH0gPSB0aGlzO1xyXG4gICAgICAgICAgbGV0IGZpbGVzXyA9IGZpbGVzO1xyXG4gICAgICAgICAgaWYobGlzdENhdGVnb3JpZXMuaW5jbHVkZXMoXCJvd25cIikgJiYgdWlkKSB7XHJcbiAgICAgICAgICAgIGZpbGVzXyA9IGZpbGVzLmZpbHRlcihmID0+IGYudWlkID09PSB1aWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmlsZXNfID0gZmlsZXNfLmZpbHRlcihmID0+IGxpc3RDYXRlZ29yaWVzLmluY2x1ZGVzKGYuY2F0ZWdvcnkpKTtcclxuICAgICAgICAgIHJldHVybiBmb2xkZXJzLmNvbmNhdChmaWxlc18pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBsb2FkZWRDb3VudCgpIHtcclxuICAgICAgICAgIGxldCBjb3VudCA9IDA7IFxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzLm1hcChmID0+IHtcclxuICAgICAgICAgICAgaWYoZi5zdGF0dXMgPT09IFwidXBsb2FkZWRcIikgY291bnQgKys7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBjb3VudDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuVXBsb2FkZWRDb3VudCgpIHtcclxuICAgICAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICBpZihmLnN0YXR1cyA9PT0gXCJub3RVcGxvYWRlZFwiKSBjb3VudCArKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIGNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgfSxcclxuICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgIGdldFVybDogTktDLm1ldGhvZHMudG9vbHMuZ2V0VXJsLFxyXG4gICAgICAgIHZpc2l0VXJsOiBOS0MubWV0aG9kcy52aXNpdFVybCxcclxuICAgICAgICBmb3JtYXQ6IE5LQy5tZXRob2RzLmZvcm1hdCxcclxuICAgICAgICBnZXRTaXplOiBOS0MubWV0aG9kcy50b29scy5nZXRTaXplLFxyXG4gICAgICAgIGNoZWNrU3RyaW5nOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tTdHJpbmcsXHJcbiAgICAgICAgc2Nyb2xsVG86IE5LQy5tZXRob2RzLnNjcm9sbFRvcCxcclxuICAgICAgICBhZGRGaWxlQnlSaWQoKSB7XHJcbiAgICAgICAgICBjb25zdCB7dXBsb2FkUmVzb3VyY2VzSWR9ID0gdGhpcztcclxuICAgICAgICAgIGlmKCF1cGxvYWRSZXNvdXJjZXNJZCB8fCB1cGxvYWRSZXNvdXJjZXNJZC5sZW5ndGggPD0gMCkgcmV0dXJuO1xyXG4gICAgICAgICAgY29uc3QgcmlkID0gdXBsb2FkUmVzb3VyY2VzSWQuam9pbihcIi1cIik7XHJcbiAgICAgICAgICBua2NBUEkoYC9ycz9yaWQ9JHtyaWR9YCwgXCJHRVRcIilcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgZGF0YS5yZXNvdXJjZXMubWFwKHIgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0ZWRGaWxlcy5wdXNoKHNlbGYuYXBwLmNyZWF0ZUZpbGUoXCJvbmxpbmVGaWxlXCIsIHIpKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5wYWdlVHlwZSA9IFwidXBsb2FkZXJcIjtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC51cGxvYWRSZXNvdXJjZXNJZCA9IFtdO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOa4heepuuacquS4iuS8oOeahOiusOW9lVxyXG4gICAgICAgIGNsZWFyVW5VcGxvYWRlZCgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRGaWxlcyA9IHRoaXMuc2VsZWN0ZWRGaWxlcy5maWx0ZXIoZiA9PiBmLnN0YXR1cyAhPT0gXCJub3RVcGxvYWRlZFwiKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaJuemHj+iuvue9ruaWh+S7tuebruW9lVxyXG4gICAgICAgIHNlbGVjdEZpbGVzRm9sZGVyKCkge1xyXG4gICAgICAgICAgY29uc3QgdGhpc18gPSB0aGlzO1xyXG4gICAgICAgICAgTGlicmFyeVBhdGgub3BlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7Zm9sZGVyLCBwYXRofSA9IGRhdGE7XHJcbiAgICAgICAgICAgIHRoaXNfLnNlbGVjdGVkRm9sZGVyID0gZm9sZGVyO1xyXG4gICAgICAgICAgICB0aGlzXy5zZWxlY3RlZEZvbGRlclBhdGggPSBwYXRoO1xyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsaWQ6IHRoaXMubGlkLFxyXG4gICAgICAgICAgICB3YXJuaW5nOiBcIuivpeaTjeS9nOWwhuimhuebluacrOmhteaJgOacieiuvue9ru+8jOivt+iwqOaFjuaTjeS9nOOAglwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOa4heepuuW3suaIkOWKn+S4iuS8oOeahOaWh+S7tuiusOW9lVxyXG4gICAgICAgIGNsZWFyVXBsb2FkZWQoKSB7XHJcbiAgICAgICAgICB0aGlzLnNlbGVjdGVkRmlsZXMgPSB0aGlzLnNlbGVjdGVkRmlsZXMuZmlsdGVyKGYgPT4gZi5zdGF0dXMgIT09IFwidXBsb2FkZWRcIik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmibnph4/orr7nva7mlofku7bnmoTliIbnsbtcclxuICAgICAgICBtYXJrQ2F0ZWdvcnkoKSB7XHJcbiAgICAgICAgICBjb25zdCB7c2VsZWN0ZWRDYXRlZ29yeSwgc2VsZWN0ZWRGaWxlc30gPSB0aGlzO1xyXG4gICAgICAgICAgaWYoIXNlbGVjdGVkQ2F0ZWdvcnkpIHJldHVybjtcclxuICAgICAgICAgIHN3ZWV0UXVlc3Rpb24oXCLor6Xmk43kvZzlsIbopobnm5bmnKzpobXmiYDmnInorr7nva7vvIzor7flho3mrKHnoa7orqTjgIJcIilcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGVjdGVkRmlsZXMubWFwKGYgPT4gZi5jYXRlZ29yeSA9IHNlbGVjdGVkQ2F0ZWdvcnkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHt9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5om56YeP6K6+572u5paH5Lu255uu5b2VXHJcbiAgICAgICAgbWFya0ZvbGRlcigpIHtcclxuICAgICAgICAgIGNvbnN0IHtzZWxlY3RlZEZvbGRlciwgc2VsZWN0ZWRGb2xkZXJQYXRoLCBzZWxlY3RlZEZpbGVzfSA9IHRoaXM7XHJcbiAgICAgICAgICBpZighc2VsZWN0ZWRGb2xkZXIpIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IHRoaXNfID0gdGhpcztcclxuICAgICAgICAgIHN3ZWV0UXVlc3Rpb24oYOivpeaTjeS9nOWwhuimhuebluacrOmhteaJgOacieiuvue9ru+8jOivt+WGjeasoeehruiupOOAgmApXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxlY3RlZEZpbGVzLm1hcChmID0+IHtcclxuICAgICAgICAgICAgICAgIGYuZm9sZGVyID0gc2VsZWN0ZWRGb2xkZXI7XHJcbiAgICAgICAgICAgICAgICBmLmZvbGRlclBhdGggPSBzZWxlY3RlZEZvbGRlclBhdGg7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgdGhpc18uc2VsZWN0ZWRGb2xkZXIgPSBcIlwiO1xyXG4gICAgICAgICAgICAgIHRoaXNfLnNlbGVjdGVkRm9sZGVyUGF0aCA9IFwiXCI7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge30pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnvZHpobXliIfmjaLkuovku7ZcclxuICAgICAgICBvbnBvcHN0YXRlKGUpIHtcclxuICAgICAgICAgIGNvbnN0IHtzdGF0ZX0gPSBlO1xyXG4gICAgICAgICAgbGV0IGxpZCA9IHRoaXMubGlkO1xyXG4gICAgICAgICAgaWYoc3RhdGUgJiYgc3RhdGUubGlkKSBsaWQgPSBzdGF0ZS5saWQ7XHJcbiAgICAgICAgICB0aGlzLmdldExpc3QobGlkKVxyXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgICAgICBzd2VldEVycm9yKGVycik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliqDovb3mlofku7blpLnkv6Hmga/vvIzljIXlkKvplJnor6/lpITnkIZcclxuICAgICAgICBnZXRMaXN0SW5mbyhpZCwgc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgIHRoaXMuZ2V0TGlzdChpZCwgc2Nyb2xsVG9Ub3ApXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5hZGRIaXN0b3J5KGlkKTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5hZGRGaWxlQnlSaWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgc3dlZXRFcnJvcihlcnIpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmr5Tlr7nmnYPpmZBwZXJtaXNzaW9uXHJcbiAgICAgICAgcGVyKG9wZXJhdGlvbikge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMucGVybWlzc2lvbi5pbmNsdWRlcyhvcGVyYXRpb24pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5byA5ZCv5aSa6YCJ5qGGXHJcbiAgICAgICAgbWFya0xpYnJhcnkoKSB7XHJcbiAgICAgICAgICB0aGlzLm1hcmsgPSAhdGhpcy5tYXJrO1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZExpYnJhcmllc0lkID0gW107XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDpgInmi6kv5Y+W5raIIOWFqOmDqFxyXG4gICAgICAgIG1hcmtBbGwoKSB7XHJcbiAgICAgICAgICBpZih0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQubGVuZ3RoID09PSB0aGlzLmZvbGRlckxpc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaWJyYXJpZXNJZCA9IFtdO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpYnJhcmllc0lkID0gdGhpcy5mb2xkZXJMaXN0Lm1hcChmID0+IGYuX2lkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaJuemHj+WIoOmZpFxyXG4gICAgICAgIGRlbGV0ZUZvbGRlcnMoKSB7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZUZvbGRlcih0aGlzLnNlbGVjdGVkTGlicmFyaWVzSWQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5om56YeP56e75YqoXHJcbiAgICAgICAgbW92ZUZvbGRlcnMoKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdmVGb2xkZXIodGhpcy5zZWxlY3RlZExpYnJhcmllc0lkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOagueaNruacrOWcsOaWh+S7tuaIluiAhXJlc291cmNl5a+56LGh5p6E5bu655So5LqO5LiK5Lyg55qE5paH5Lu25a+56LGhXHJcbiAgICAgICAgc2VsZWN0UGF0aChyKSB7XHJcbiAgICAgICAgICBMaWJyYXJ5UGF0aC5vcGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHtmb2xkZXIsIHBhdGh9ID0gZGF0YTtcclxuICAgICAgICAgICAgci5mb2xkZXIgPSBmb2xkZXI7XHJcbiAgICAgICAgICAgIHIuZm9sZGVyUGF0aCA9IHBhdGg7XHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGxpZDogci5mb2xkZXI/ci5mb2xkZXIuX2lkOiBcIlwiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZUZpbGUodHlwZSwgcikge1xyXG4gICAgICAgICAgY29uc3Qge2ZvbGRlciwgZm9sZGVyUGF0aCwgX2lkLCB0b2MsIHJpZCwgY2F0ZWdvcnksIG5hbWUgPSBcIlwiLCBvbmFtZSwgZGVzY3JpcHRpb24gPSBcIlwiLCBzaXplfSA9IHI7XHJcbiAgICAgICAgICBjb25zdCBmaWxlID0ge1xyXG4gICAgICAgICAgICBfaWQsXHJcbiAgICAgICAgICAgIHR5cGUsXHJcbiAgICAgICAgICAgIHJpZCxcclxuICAgICAgICAgICAgbmFtZTogbmFtZSB8fCBvbmFtZSxcclxuICAgICAgICAgICAgc2l6ZSxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5IHx8IFwiXCIsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBmb2xkZXI6IGZvbGRlciB8fCB0aGlzLmZvbGRlcixcclxuICAgICAgICAgICAgZm9sZGVyUGF0aDogZm9sZGVyUGF0aCB8fCAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBzZWxmLmFwcC5uYXYubWFwKG4gPT4gbi5uYW1lKTtcclxuICAgICAgICAgICAgICByZXR1cm4gXCIvXCIgKyBuYW1lLmpvaW4oXCIvXCIpO1xyXG4gICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICBkYXRhOiByLFxyXG4gICAgICAgICAgICB0b2M6IHRvYyB8fCBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBzdGF0dXM6IFwibm90VXBsb2FkZWRcIiwgLy8gbm90VXBsb2FkZWQsIHVwbG9hZGluZywgdXBsb2FkZWRcclxuICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcclxuICAgICAgICAgICAgZXJyb3I6IFwiXCIsIC8vIOmUmeivr+S/oeaBr1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC9cXC4uKj8kL2lnLCBcIlwiKTtcclxuICAgICAgICAgIGlmKGZpbGUudHlwZSA9PT0gXCJsb2NhbEZpbGVcIikge1xyXG4gICAgICAgICAgICBpZihyLnR5cGUuaW5jbHVkZXMoXCJpbWFnZVwiKSkge1xyXG4gICAgICAgICAgICAgIGZpbGUuZXh0ID0gXCJtZWRpYVBpY3R1cmVcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBmaWxlLmV4dCA9IFwibWVkaWFBdHRhY2htZW50XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZihmaWxlLmV4dCA9PT0gXCJtZWRpYVBpY3R1cmVcIikge1xyXG4gICAgICAgICAgICBmaWxlLmVycm9yID0gXCLmmoLkuI3lhYHorrjkuIrkvKDlm77niYfliLDmloflupNcIjtcclxuICAgICAgICAgICAgZmlsZS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICB9IGVsc2UgaWYoZmlsZS5zaXplID4gMjAwICogMTAyNCAqIDEwMjQpIHtcclxuICAgICAgICAgICAgZmlsZS5lcnJvciA9IFwi5paH5Lu25aSn5bCP5LiN6IO96LaF6L+HMjAwTUJcIjtcclxuICAgICAgICAgICAgZmlsZS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZpbGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGFydFVwbG9hZCgpIHtcclxuICAgICAgICAgIHRoaXMudXBsb2FkRmlsZSgwLCB0aGlzLnNlbGVjdGVkRmlsZXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlRmlsZShpbmRleCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDkuIrkvKDmlofku7ZcclxuICAgICAgICB1cGxvYWRGaWxlKGluZGV4LCBhcnIpIHtcclxuICAgICAgICAgIGlmKGluZGV4ID49IGFyci5sZW5ndGgpIHJldHVybjtcclxuICAgICAgICAgIGNvbnN0IGZpbGUgPSBhcnJbaW5kZXhdO1xyXG4gICAgICAgICAgY29uc3Qge3N0YXR1cywgZGlzYWJsZWR9ID0gZmlsZTtcclxuICAgICAgICAgIGlmKGRpc2FibGVkIHx8IHN0YXR1cyAhPT0gXCJub3RVcGxvYWRlZFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGUoaW5kZXggKyAxLCBhcnIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmlsZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICBmaWxlLnN0YXR1cyA9IFwidXBsb2FkaW5nXCI7XHJcbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUoKVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoIWZpbGUpIHRocm93IFwi5paH5Lu25byC5bi4XCI7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuY2hlY2tTdHJpbmcoZmlsZS5uYW1lLCB7XHJcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGg6IDUwMCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwi5paH5Lu25ZCN56ewXCJcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5jaGVja1N0cmluZyhmaWxlLmRlc2NyaXB0aW9uLCB7XHJcbiAgICAgICAgICAgICAgICBtaW5MZW5ndGg6IDAsXHJcbiAgICAgICAgICAgICAgICBtYXhMZW5ndGg6IDEwMDAsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcIuaWh+S7tuivtOaYjlwiXHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgaWYoIVtcIm1lZGlhXCIsIFwicGFwZXJcIiwgXCJib29rXCIsIFwicHJvZ3JhbVwiLCBcIm90aGVyXCJdLmluY2x1ZGVzKGZpbGUuY2F0ZWdvcnkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcIuacqumAieaLqeaWh+S7tuWIhuexu1wiO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZighZmlsZS5mb2xkZXIpIHRocm93IFwi5pyq6YCJ5oup55uu5b2VXCI7XHJcbiAgICAgICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gTktDLm1ldGhvZHMuZ2V0RmlsZU1ENShmaWxlLmRhdGEpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgLy8g5LiK5Lyg5pys5Zyw5paH5Lu2XHJcbiAgICAgICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZU5hbWVcIiwgZmlsZS5kYXRhLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwidHlwZVwiLCBcImNoZWNrTUQ1XCIpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwibWQ1XCIsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5rY1VwbG9hZEZpbGUoXCIvclwiLCBcIlBPU1RcIiwgZm9ybURhdGEpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYoZGF0YSAmJiAhZGF0YS51cGxvYWRlZCAmJiBmaWxlLnR5cGUgPT09IFwibG9jYWxGaWxlXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlXCIsIGZpbGUuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmtjVXBsb2FkRmlsZShcIi9yXCIsIFwiUE9TVFwiLCBmb3JtRGF0YSwgKGUsIHApID0+IHtcclxuICAgICAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IHA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgICAvLyDmm7/mjaLmnKzlnLDmlofku7bkv6Hmga8g57uf5LiA5Li657q/5LiK5paH5Lu25qih5byPXHJcbiAgICAgICAgICAgICAgaWYoZmlsZS50eXBlID09PSBcImxvY2FsRmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXNvdXJjZSA9IGRhdGEucjtcclxuICAgICAgICAgICAgICAgIGZpbGUuZGF0YSA9IHJlc291cmNlO1xyXG4gICAgICAgICAgICAgICAgZmlsZS5leHQgPSByZXNvdXJjZS5tZWRpYVR5cGU7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnJpZCA9IHJlc291cmNlLnJpZDtcclxuICAgICAgICAgICAgICAgIGZpbGUudG9jID0gcmVzb3VyY2UudG9jO1xyXG4gICAgICAgICAgICAgICAgZmlsZS50eXBlID0gXCJvbmxpbmVGaWxlXCI7XHJcbiAgICAgICAgICAgICAgICBpZihmaWxlLmV4dCA9PT0gXCJtZWRpYVBpY3R1cmVcIikge1xyXG4gICAgICAgICAgICAgICAgICBmaWxlLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgdGhyb3cobmV3IEVycm9yKFwi5pqC5LiN5YWB6K645LiK5Lyg5Zu+54mH5Yiw5paH5bqTXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICBpZihmaWxlLnR5cGUgPT09IFwibW9kaWZ5XCIpIHtcclxuICAgICAgICAgICAgICAgIC8vIOaJuemHj+S/ruaUuVxyXG4gICAgICAgICAgICAgICAgY29uc3Qge19pZCwgbmFtZSwgZGVzY3JpcHRpb24sIGNhdGVnb3J5fSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvbGlicmFyeS8ke19pZH1gLCBcIlBBVENIXCIsIGJvZHkpO1xyXG5cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8g5bCG57q/5LiK5paH5Lu25o+Q5Lqk5Yiw5paH5bqTXHJcbiAgICAgICAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWUsIGRlc2NyaXB0aW9uLCBjYXRlZ29yeSwgcmlkLCBmb2xkZXJcclxuICAgICAgICAgICAgICAgIH0gPSBmaWxlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICAgICAgICAgICAgcmlkLFxyXG4gICAgICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwiYm9keVwiLCBKU09OLnN0cmluZ2lmeShib2R5KSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmtjQVBJKGAvbGlicmFyeS8ke2ZvbGRlci5faWR9YCwgXCJQT1NUXCIsIGJvZHkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgIGZpbGUuc3RhdHVzID0gXCJ1cGxvYWRlZFwiO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZGF0YSA9PiB7XHJcbiAgICAgICAgICAgICAgZmlsZS5lcnJvciA9IGRhdGEuZXJyb3IgfHwgZGF0YTtcclxuICAgICAgICAgICAgICBmaWxlLnN0YXR1cyA9IFwibm90VXBsb2FkZWRcIjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnVwbG9hZEZpbGUoaW5kZXgrMSwgYXJyKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOi/lOWbnuS4iuS4gOWxguaWh+S7tuWkuVxyXG4gICAgICAgIGJhY2soKSB7XHJcbiAgICAgICAgICBpZih0aGlzLmxhc3RGb2xkZXIpIHRoaXMuc2VsZWN0Rm9sZGVyKHRoaXMubGFzdEZvbGRlcik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliIfmjaLliLDmlofku7bkuIrkvKBcclxuICAgICAgICB0b1VwbG9hZCgpIHtcclxuICAgICAgICAgIGlmKHRoaXMubWFyaykgcmV0dXJuO1xyXG4gICAgICAgICAgdGhpcy5wYWdlVHlwZSA9IFwidXBsb2FkZXJcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWIh+aNouWIsOaWh+S7tuWIl+ihqFxyXG4gICAgICAgIHRvTGlzdCgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0Rm9sZGVyKHRoaXMuZm9sZGVyKTtcclxuICAgICAgICAgIHRoaXMucGFnZVR5cGUgPSBcImxpc3RcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWwhueUqOaIt+W3sumAieaLqeeahOetm+mAieWIhuexu+WtmOWIsOacrOWcsFxyXG4gICAgICAgIHNhdmVDYXRlZ29yaWVzVG9Mb2NhbFN0b3JhZ2UoKSB7XHJcbiAgICAgICAgICBjb25zdCB7bGlzdENhdGVnb3JpZXN9ID0gdGhpcztcclxuICAgICAgICAgIGNvbnN0IGxpYnJhcnlMaXN0Q2F0ZWdvcmllcyA9IE5LQy5tZXRob2RzLmdldEZyb21Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5TGlzdENhdGVnb3JpZXNcIik7XHJcbiAgICAgICAgICBsaWJyYXJ5TGlzdENhdGVnb3JpZXNbdGhpcy5saWRdID0gbGlzdENhdGVnb3JpZXM7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy5zYXZlVG9Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5TGlzdENhdGVnb3JpZXNcIiwgbGlicmFyeUxpc3RDYXRlZ29yaWVzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOivu+WPluacrOWcsOWtmOWCqOeahOetm+mAieWIhuexu1xyXG4gICAgICAgIGdldENhdGVnb3JpZXNGcm9tTG9jYWxTdG9yYWdlKCkge1xyXG4gICAgICAgICAgY29uc3QgbGlicmFyeUxpc3RDYXRlZ29yaWVzID0gTktDLm1ldGhvZHMuZ2V0RnJvbUxvY2FsU3RvcmFnZShcImxpYnJhcnlMaXN0Q2F0ZWdvcmllc1wiKTtcclxuICAgICAgICAgIGNvbnN0IGxpc3RDYXRlZ29yaWVzID0gbGlicmFyeUxpc3RDYXRlZ29yaWVzW3RoaXMubGlkXTtcclxuICAgICAgICAgIGlmKGxpc3RDYXRlZ29yaWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdENhdGVnb3JpZXMgPSBsaXN0Q2F0ZWdvcmllczsgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmlofku7blpLnorr/pl67orrDlvZXlrZjliLDmtY/op4jlmajmnKzlnLBcclxuICAgICAgICBzYXZlVG9Mb2NhbFN0b3JhZ2UoaWQpIHtcclxuICAgICAgICAgIGNvbnN0IGxpYnJhcnlWaXNpdEZvbGRlckxvZ3MgPSBOS0MubWV0aG9kcy5nZXRGcm9tTG9jYWxTdG9yYWdlKFwibGlicmFyeVZpc2l0Rm9sZGVyTG9nc1wiKTtcclxuICAgICAgICAgIGxpYnJhcnlWaXNpdEZvbGRlckxvZ3NbdGhpcy5saWRdID0gaWQ7XHJcbiAgICAgICAgICBOS0MubWV0aG9kcy5zYXZlVG9Mb2NhbFN0b3JhZ2UoXCJsaWJyYXJ5VmlzaXRGb2xkZXJMb2dzXCIsIGxpYnJhcnlWaXNpdEZvbGRlckxvZ3MpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5re75Yqg5LiA5p2h5rWP6KeI5Zmo5Y6G5Y+y6K6w5b2VXHJcbiAgICAgICAgYWRkSGlzdG9yeShsaWQpIHtcclxuICAgICAgICAgIC8vIOWIpOaWreaYr+WQpuS4uuebuOWQjOmhte+8jOebuOWQjOWImeS4jeWIm+W7uua1j+iniOWZqOWOhuWPsuiusOW9leOAglxyXG4gICAgICAgICAgaWYodGhpcy5sYXN0SGlzdG9yeUxpZCAmJiB0aGlzLmxhc3RIaXN0b3J5TGlkID09PSBsaWQpIHJldHVybjtcclxuICAgICAgICAgIGxldCB7aHJlZn0gPSB3aW5kb3cubG9jYXRpb247XHJcbiAgICAgICAgICBpZihocmVmLmluY2x1ZGVzKFwiI1wiKSkge1xyXG4gICAgICAgICAgICBocmVmID0gaHJlZi5yZXBsYWNlKC8jLiovaWcsIFwiXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHtsaWR9LCAncGFnZScsIGhyZWYgKyAnIycgKyBsaWQpO1xyXG4gICAgICAgICAgdGhpcy5sYXN0SGlzdG9yeUxpZCA9IGxpZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOiOt+WPluaWh+S7tuWIl+ihqFxyXG4gICAgICAgIGdldExpc3QoaWQsIHNjcm9sbFRvVG9wKSB7XHJcbiAgICAgICAgICBjb25zdCB1cmwgPSBgL2xpYnJhcnkvJHtpZH0/ZmlsZT10cnVlJm5hdj10cnVlJmZvbGRlcj10cnVlJnBlcm1pc3Npb249dHJ1ZSZ0PSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgICAgICAgcmV0dXJuIG5rY0FQSSh1cmwsIFwiR0VUXCIpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5uYXYgPSBkYXRhLm5hdjtcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5mb2xkZXJzID0gZGF0YS5mb2xkZXJzO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLmZpbGVzID0gZGF0YS5maWxlcztcclxuICAgICAgICAgICAgICBzZWxmLmFwcC5wZXJtaXNzaW9uID0gZGF0YS5wZXJtaXNzaW9uO1xyXG4gICAgICAgICAgICAgIHNlbGYuYXBwLnNhdmVUb0xvY2FsU3RvcmFnZShpZCk7XHJcbiAgICAgICAgICAgICAgaWYoc2Nyb2xsVG9Ub3ApIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNjcm9sbFRvKG51bGwsIDApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNlbGVjdE9ubGluZUZpbGVzKCkge1xyXG4gICAgICAgICAgU2VsZWN0UmVzb3VyY2Uub3BlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB7cmVzb3VyY2VzfSA9IGRhdGE7XHJcbiAgICAgICAgICAgIHJlc291cmNlcy5tYXAociA9PiB7XHJcbiAgICAgICAgICAgICAgc2VsZi5hcHAuc2VsZWN0ZWRGaWxlcy5wdXNoKHNlbGYuYXBwLmNyZWF0ZUZpbGUoXCJvbmxpbmVGaWxlXCIsIHIpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGFsbG93ZWRFeHQ6IFtcImF0dGFjaG1lbnRcIiwgXCJ2aWRlb1wiLCBcImF1ZGlvXCJdLFxyXG4gICAgICAgICAgICBjb3VudExpbWl0OiA5OVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqeWujOacrOWcsOaWh+S7tlxyXG4gICAgICAgIHNlbGVjdGVkTG9jYWxGaWxlcygpIHtcclxuICAgICAgICAgIGNvbnN0IHtmaWxlcyA9IFtdfSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kdWxlTGlicmFyeUlucHV0XCIpO1xyXG4gICAgICAgICAgZm9yKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEZpbGVzLnB1c2godGhpcy5jcmVhdGVGaWxlKFwibG9jYWxGaWxlXCIsIGZpbGUpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kdWxlTGlicmFyeUlucHV0XCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqeaWh+S7tuWkuVxyXG4gICAgICAgIHNlbGVjdEZvbGRlcihmb2xkZXIsIHNjcm9sbFRvVG9wKSB7XHJcbiAgICAgICAgICBpZih0aGlzLm1hcmspIHJldHVybjtcclxuICAgICAgICAgIGlmKGZvbGRlci50eXBlID09PSBcImZvbGRlclwiKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TGlzdEluZm8oZm9sZGVyLl9pZCwgc2Nyb2xsVG9Ub3ApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RGaWxlKGZvbGRlcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDngrnlh7vmlofku7blpLnnm67lvZXml7ZcclxuICAgICAgICBzZWxlY3ROYXZGb2xkZXIoZikge1xyXG4gICAgICAgICAgaWYodGhpcy5wYWdlVHlwZSAhPT0gXCJsaXN0XCIpIHtcclxuICAgICAgICAgICAgdGhpcy5wYWdlVHlwZSA9IFwibGlzdFwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zZWxlY3RGb2xkZXIoZik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnp7vliqjmlofku7blpLnmiJbmlofku7ZcclxuICAgICAgICBtb3ZlRm9sZGVyKGxpYnJhcnlJZCkge1xyXG4gICAgICAgICAgbGV0IGZvbGRlcnNJZDtcclxuICAgICAgICAgIGlmKEFycmF5LmlzQXJyYXkobGlicmFyeUlkKSkge1xyXG4gICAgICAgICAgICBmb2xkZXJzSWQgPSBsaWJyYXJ5SWQ7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb2xkZXJzSWQgPSBbbGlicmFyeUlkXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBib2R5ID0ge307XHJcbiAgICAgICAgICBib2R5LmZvbGRlcnNJZCA9IGZvbGRlcnNJZDtcclxuXHJcbiAgICAgICAgICBjb25zdCB1cmwgPSBgL2xpYnJhcnkvJHt0aGlzLmZvbGRlci5faWR9L2xpc3RgO1xyXG4gICAgICAgICAgY29uc3QgbWV0aG9kID0gXCJQQVRDSFwiO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBMaWJyYXJ5UGF0aC5vcGVuKChkYXRhKSA9PiB7XHJcbiAgICAgICAgICAgIGJvZHkudGFyZ2V0Rm9sZGVySWQgPSBkYXRhLmZvbGRlci5faWQ7XHJcbiAgICAgICAgICAgIG5rY0FQSSh1cmwsIG1ldGhvZCwgYm9keSlcclxuICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKGDmiafooYzmiJDlip8ke2RhdGEuaWdub3JlQ291bnQ/IGDvvIzlhbHmnIkke2RhdGEuaWdub3JlQ291bnR95Liq6aG555uu5Zug5a2Y5Zyo5Yay56qB5oiW5LiN5piv5L2g6Ieq5bex5Y+R5biD55qE6ICM6KKr5b+955WlYDogXCJcIn1gKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLm1hcmsgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdEZvbGRlcihzZWxmLmFwcC5mb2xkZXIpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLmNhdGNoKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsaWQ6IHNlbGYuYXBwLmZvbGRlci5faWQsXHJcbiAgICAgICAgICAgIHdhcm5pbmc6IFwi5q2k5pON5L2c5LiN5Lya5L+d55WZ5Y6f5pyJ55uu5b2V57uT5p6E77yM5LiU5LiN5Y+v5oGi5aSN44CCXCJcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnvJbovpHmlofku7blpLlcclxuICAgICAgICBlZGl0Rm9sZGVyKGZvbGRlcikge1xyXG4gICAgICAgICAgaWYodGhpcy5tYXJrKSByZXR1cm47XHJcbiAgICAgICAgICBsZXQgdHlwZVN0ciA9IFwi5paH5Lu25aS5XCI7XHJcbiAgICAgICAgICBsZXQgbW9kYWxEYXRhID0gW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZG9tOiBcImlucHV0XCIsXHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IGAke3R5cGVTdHJ95ZCN56ewYCxcclxuICAgICAgICAgICAgICB2YWx1ZTogZm9sZGVyLm5hbWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGRvbTogXCJ0ZXh0YXJlYVwiLFxyXG4gICAgICAgICAgICAgIGxhYmVsOiBgJHt0eXBlU3RyfeeugOS7i2AsXHJcbiAgICAgICAgICAgICAgdmFsdWU6IGZvbGRlci5kZXNjcmlwdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdO1xyXG4gICAgICAgICAgaWYoZm9sZGVyLnR5cGUgPT09IFwiZmlsZVwiKSB7XHJcbiAgICAgICAgICAgIHR5cGVTdHIgPSBcIuaWh+S7tlwiO1xyXG4gICAgICAgICAgICBtb2RhbERhdGEucHVzaCh7XHJcbiAgICAgICAgICAgICAgZG9tOiBcInJhZGlvXCIsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IFwi5paH5Lu25YiG57G7XCIsXHJcbiAgICAgICAgICAgICAgcmFkaW9zOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwi5Zu+5LmmXCIsXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBcImJvb2tcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogXCLorrrmlodcIixcclxuICAgICAgICAgICAgICAgICAgdmFsdWU6IFwicGFwZXJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgbmFtZTogXCLnqIvluo9cIixcclxuICAgICAgICAgICAgICAgICAgdmFsdWU6IFwicHJvZ3JhbVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIuWqkuS9k1wiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIuWFtuS7llwiLFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogXCJvdGhlclwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB2YWx1ZTogZm9sZGVyLmNhdGVnb3J5XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBDb21tb25Nb2RhbC5vcGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcmVzWzBdLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHJlc1sxXS52YWx1ZTtcclxuICAgICAgICAgICAgbGV0IGNhdGVnb3J5ID0gXCJcIjtcclxuICAgICAgICAgICAgaWYoZm9sZGVyLnR5cGUgPT09IFwiZmlsZVwiKSB7XHJcbiAgICAgICAgICAgICAgY2F0ZWdvcnkgPSByZXNbMl0udmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIW5hbWUpIHJldHVybiBzd2VldEVycm9yKFwi5ZCN56ew5LiN6IO95Li656m6XCIpO1xyXG4gICAgICAgICAgICBua2NBUEkoXCIvbGlicmFyeS9cIiArIGZvbGRlci5faWQsIFwiUEFUQ0hcIiwge1xyXG4gICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgY2F0ZWdvcnlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdEZvbGRlcihzZWxmLmFwcC5mb2xkZXIpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LkNvbW1vbk1vZGFsLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgc3dlZXRFcnJvcihkYXRhKTtcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB0aXRsZTogYOe8lui+kSR7dHlwZVN0cn1gLFxyXG4gICAgICAgICAgICBkYXRhOiBtb2RhbERhdGFcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Yig6Zmk5paH5Lu25aS5XHJcbiAgICAgICAgZGVsZXRlRm9sZGVyKGZvbGRlcnNJZCkge1xyXG4gICAgICAgICAgaWYoIUFycmF5LmlzQXJyYXkoZm9sZGVyc0lkKSkge1xyXG4gICAgICAgICAgICBmb2xkZXJzSWQgPSBbZm9sZGVyc0lkXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmKCFmb2xkZXJzSWQubGVuZ3RoKSByZXR1cm47XHJcbiAgICAgICAgICBmb2xkZXJzSWQgPSBmb2xkZXJzSWQuam9pbihcIi1cIik7XHJcbiAgICAgICAgICBzd2VldFF1ZXN0aW9uKGDnoa7lrpropoHmiafooYzliKDpmaTmk43kvZzvvJ9gKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBua2NBUEkoYC9saWJyYXJ5LyR7c2VsZi5hcHAuZm9sZGVyLl9pZH0vbGlzdD9saWQ9JHtmb2xkZXJzSWR9YCwgXCJERUxFVEVcIilcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgc2VsZi5hcHAubWFyayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICBzZWxmLmFwcC5zZWxlY3RGb2xkZXIoc2VsZi5hcHAuZm9sZGVyKTtcclxuICAgICAgICAgICAgICAgICAgc3dlZXRTdWNjZXNzKGDmiafooYzmiJDlip8ke2RhdGEuaWdub3JlQ291bnQ/IGDvvIzlhbHmnIkke2RhdGEuaWdub3JlQ291bnR95Liq6aG555uu5Zug5LiN5piv5L2g6Ieq5bex5Y+R5biD55qE6ICM6KKr5b+955WlYDogXCJcIn1gKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICBzd2VldEVycm9yKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCl7fSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOmAieaLqeaWh+S7tlxyXG4gICAgICAgIHNlbGVjdEZpbGUoZmlsZSkge1xyXG4gICAgICAgICAgUmVzb3VyY2VJbmZvLm9wZW4oe2xpZDogZmlsZS5faWR9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWIm+W7uuaWh+S7tuWkuVxyXG4gICAgICAgIGNyZWF0ZUZvbGRlcigpIHtcclxuICAgICAgICAgIGlmKHRoaXMubWFyaykgcmV0dXJuO1xyXG4gICAgICAgICAgd2luZG93LkNvbW1vbk1vZGFsLm9wZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSByZXNbMF0udmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gcmVzWzFdLnZhbHVlO1xyXG4gICAgICAgICAgICBpZighbmFtZSkgcmV0dXJuIHN3ZWV0RXJyb3IoXCLlkI3np7DkuI3og73kuLrnqbpcIik7XHJcbiAgICAgICAgICAgIG5rY0FQSShcIi9saWJyYXJ5L1wiICsgc2VsZi5hcHAuZm9sZGVyLl9pZCArIFwiL2xpc3RcIiwgXCJQT1NUXCIsIHtcclxuICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLmlofku7blpLnliJvlu7rmiJDlip9cIik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuQ29tbW9uTW9kYWwuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuYXBwLnNlbGVjdEZvbGRlcihzZWxmLmFwcC5mb2xkZXIpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHN3ZWV0RXJyb3IoZGF0YSk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdGl0bGU6IFwi5paw5bu65paH5Lu25aS5XCIsXHJcbiAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkb206IFwiaW5wdXRcIixcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IFwi5paH5Lu25aS55ZCN56ewXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIlxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZG9tOiBcInRleHRhcmVhXCIsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogXCLmlofku7blpLnnroDku4tcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG59O1xyXG4iXX0=
