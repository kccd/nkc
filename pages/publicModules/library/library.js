NKC.modules.Library = class {
  constructor(options) {
    const {lid, folderId, tLid, uploadResourcesId} = options;
    const self = this;
    self.app = new Vue({
      el: "#moduleLibrary",
      data: {
        uid: NKC.configs.uid,
        uploadResourcesId,
        pageType: "list", // list: 文件列表, uploader: 文件上传
        nav: [],
        folders: [],
        files: [],
        lid,
        tLid,
        sort: "time",
        histories: [],
        index: 0,
        selectedFiles: [],
        mark: false,
        selectedLibrariesId: [],
        permission: [],
        lastHistoryLid: "",
        selectedCategory: "book", // 批量修改文件类型
        selectedFolder: "", // 批量修改文件目录 目录ID
        selectedFolderPath: "", // 批量修改文件目录 目录路径
        listCategories: ["book", "paper", "program", "media", "other"],
        categories: [
          {
            id: "book",
            name: "图书"
          },
          {
            id: "paper",
            name: "论文"
          },
          {
            id: "program",
            name: "程序"
          },
          {
            id: "media",
            name: "媒体"
          },
          {
            id: "other",
            name: "其他"
          }
        ],
        protocol: true, // 是否同意协议
      },
      watch:{
        listCategories() {
          this.saveCategoriesToLocalStorage();
        }
      },
      mounted() {
        if(folderId) {
          this.saveToLocalStorage(folderId);
        }
        this.getCategoriesFromLocalStorage();
        const libraryVisitFolderLogs = NKC.methods.getFromLocalStorage("libraryVisitFolderLogs");
        const childFolderId = libraryVisitFolderLogs[this.lid];
        const this_ = this;
        if(childFolderId !== undefined && childFolderId !== this.lid) {
          // 如果浏览器本地存有访问记录，则先确定该记录中的文件夹是否存在，存在则访问，不存在则打开顶层文件夹。
          this.getList(childFolderId)
            .then(() => {
              this_.addHistory(this_.lid);
              this_.addFileByRid();
            })
            .catch ((err) => {
              this_.getListInfo(this_.lid);
            });
        } else {
          this.getListInfo(this_.lid);
        }

        if(!window.CommonModal) {
          if(!NKC.modules.CommonModal) {
            sweetError("未引入通用弹框");
          } else {
            window.CommonModal = new NKC.modules.CommonModal();
          }
        }
        if(!window.ResourceInfo) {
          if(!NKC.modules.ResourceInfo) {
            sweetError("未引入资源信息模块");
          } else {
            window.ResourceInfo = new NKC.modules.ResourceInfo();
          }
        }
        if(!window.SelectResource) {
          if(!NKC.modules.SelectResource) {
            sweetError("未引入资源信息模块");
          } else {
            window.SelectResource = new NKC.modules.SelectResource();
          }
        }
        if(!window.LibraryPath) {
          if(!NKC.modules.LibraryPath) {
            sweetError("未引入文库路径选择模块");
          } else {
            window.LibraryPath = new NKC.modules.LibraryPath();
          }
        }
        window.onpopstate = this.onpopstate;
      },
      computed: {
        uploading() {
          for(const f of this.selectedFiles) {
            if(f.status === "uploading") return true;
          }
        },
        lastFolder() {
          var length = this.nav.length;
          if(length > 1) {
            return this.nav[length -2];
          }
        },
        folder() {
          var length = this.nav.length;
          if(length !== 0) {
            return this.nav[length - 1];
          } else {
            return {}
          }
        },
        folderList() {
          const {listCategories, files, folders, uid} = this;
          let files_ = files;
          if(listCategories.includes("own") && uid) {
            files_ = files.filter(f => f.uid === uid);
          }
          files_ = files_.filter(f => listCategories.includes(f.category));
          return folders.concat(files_);
        },
        uploadedCount() {
          let count = 0;
          this.selectedFiles.map(f => {
            if(f.status === "uploaded") count ++;
          });
          return count;
        },
        unUploadedCount() {
          let count = 0;
          this.selectedFiles.map(f => {
            if(f.status === "notUploaded") count ++;
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
        complain(id){
          if(!window.complaintSelector)
            window.complaintSelector = new NKC.modules.ComplaintSelector();
            complaintSelector.open("library", id)
        },
        addFileByRid() {
          const {uploadResourcesId} = this;
          if(!uploadResourcesId || uploadResourcesId.length <= 0) return;
          const rid = uploadResourcesId.join("-");
          nkcAPI(`/rs?rid=${rid}`, "GET")
            .then(data => {
              data.resources.map(r => {
                self.app.selectedFiles.push(self.app.createFile("onlineFile", r));
              });
              self.app.pageType = "uploader";
              self.app.uploadResourcesId = [];
            })
            .catch(sweetError)
        },
        // 清空未上传的记录
        clearUnUploaded() {
          this.selectedFiles = this.selectedFiles.filter(f => f.status !== "notUploaded");
        },
        // 批量设置文件目录
        selectFilesFolder() {
          const this_ = this;
          LibraryPath.open((data) => {
            const {folder, path} = data;
            this_.selectedFolder = folder;
            this_.selectedFolderPath = path;
          }, {
            lid: this.lid,
            warning: "该操作将覆盖本页所有设置，请谨慎操作。"
          });
        },
        // 清空已成功上传的文件记录
        clearUploaded() {
          this.selectedFiles = this.selectedFiles.filter(f => f.status !== "uploaded");
        },
        // 批量设置文件的分类
        markCategory() {
          const {selectedCategory, selectedFiles} = this;
          if(!selectedCategory) return;
          sweetQuestion("该操作将覆盖本页所有设置，请再次确认。")
            .then(() => {
              selectedFiles.map(f => f.category = selectedCategory);
            })
            .catch(err => {})
        },
        // 批量设置文件目录
        markFolder() {
          const {selectedFolder, selectedFolderPath, selectedFiles} = this;
          if(!selectedFolder) return;
          const this_ = this;
          sweetQuestion(`该操作将覆盖本页所有设置，请再次确认。`)
            .then(() => {
              selectedFiles.map(f => {
                f.folder = selectedFolder;
                f.folderPath = selectedFolderPath;
              });
              this_.selectedFolder = "";
              this_.selectedFolderPath = "";
            })
            .catch(err => {})
        },
        // 网页切换事件
        onpopstate(e) {
          const {state} = e;
          let lid = this.lid;
          if(state && state.lid) lid = state.lid;
          this.getList(lid)
            .catch(err => {
              sweetError(err);
            })
        },
        // 加载文件夹信息，包含错误处理
        getListInfo(id, scrollToTop) {
          this.getList(id, scrollToTop)
            .then(() => {
              self.app.addHistory(id);
              self.app.addFileByRid();
            })
            .catch(err => {
              sweetError(err)
            })
        },
        // 比对权限permission
        per(operation) {
          return this.permission.includes(operation);
        },
        // 开启多选框
        markLibrary() {
          this.mark = !this.mark;
          this.selectedLibrariesId = [];
        },
        // 选择/取消 全部
        markAll() {
          if(this.selectedLibrariesId.length === this.folderList.length) {
            this.selectedLibrariesId = [];
          } else {
            this.selectedLibrariesId = this.folderList.map(f => f._id);
          }
        },
        // 批量删除
        deleteFolders() {
          this.deleteFolder(this.selectedLibrariesId);
        },
        // 批量移动
        moveFolders() {
          this.moveFolder(this.selectedLibrariesId);
        },
        // 根据本地文件或者resource对象构建用于上传的文件对象
        selectPath(r) {
          LibraryPath.open((data) => {
            const {folder, path} = data;
            r.folder = folder;
            r.folderPath = path;
          }, {
            lid: r.folder?r.folder._id: ""
          });
        },
        createFile(type, r) {
          const {folder, folderPath, _id, toc, rid, category, name = "", oname, description = "", size} = r;
          const file = {
            _id,
            type,
            rid,
            name: name || oname,
            size,
            category: category || "",
            description,
            folder: folder || this.folder,
            folderPath: folderPath || (() => {
              const name = self.app.nav.map(n => n.name);
              return "/" + name.join("/");
            })(),
            data: r,
            toc: toc || new Date(),
            status: "notUploaded", // notUploaded, uploading, uploaded
            disabled: false,
            progress: 0,
            error: "", // 错误信息
          };
          file.name = file.name.replace(/\..*?$/ig, "");
          if(file.type === "localFile") {
            if(r.type.includes("image")) {
              file.ext = "mediaPicture";
            } else {
              file.ext = "mediaAttachment";
            }
          }

          if(file.ext === "mediaPicture") {
            file.error = "暂不允许上传图片到文库";
            file.disabled = true;
          } else if(file.size > 200 * 1024 * 1024) {
            file.error = "文件大小不能超过200MB";
            file.disabled = true;
          }

          return file;
        },
        startUpload() {
          this.uploadFile(0, this.selectedFiles);
        },
        removeFile(index) {
          this.selectedFiles.splice(index, 1);
        },
        // 上传文件
        uploadFile(index, arr) {
          if(index >= arr.length) return;
          const file = arr[index];
          const {status, disabled} = file;
          if(disabled || status !== "notUploaded") {
            return this.uploadFile(index + 1, arr);
          }
          file.error = "";
          file.status = "uploading";
          Promise.resolve()
            .then(() => {
              if(!file) throw "文件异常";
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
              if(!["media", "paper", "book", "program", "other"].includes(file.category)) {
                throw "未选择文件分类";
              }
              if(!file.folder) throw "未选择目录";
              if(file.type === "localFile") {
                return NKC.methods.getFileMD5(file.data);
              }
            })
            .then(data => {
              // 上传本地文件
              if(file.type === "localFile") {
                const formData = new FormData();
                formData.append("fileName", file.data.name);
                formData.append("type", "checkMD5");
                formData.append("md5", data);
                return nkcUploadFile("/r", "POST", formData);
              }
            })
            .then(data => {
              if(data && !data.uploaded && file.type === "localFile") {
                const formData = new FormData();
                formData.append("file", file.data);
                return nkcUploadFile("/r", "POST", formData, (e, p) => {
                  file.progress = p;
                });
              } else {
                return data;
              }
            })
            .then(data => {
              // 替换本地文件信息 统一为线上文件模式
              if(file.type === "localFile") {
                const resource = data.r;
                file.data = resource;
                file.ext = resource.mediaType;
                file.rid = resource.rid;
                file.toc = resource.toc;
                file.type = "onlineFile";
                if(file.ext === "mediaPicture") {
                  file.disabled = true;
                  throw(new Error("暂不允许上传图片到文库"));
                }
              }
            })
            .then(() => {
              if(file.type === "modify") {
                // 批量修改
                const {_id, name, description, category} = file;
                const body = {
                  name,
                  description,
                  category
                };
                return nkcAPI(`/library/${_id}`, "PUT", body);

              } else {
                // 将线上文件提交到文库
                const {
                  name, description, category, rid, folder
                } = file;
                const body = {
                  rid,
                  name,
                  description,
                  category
                };
                const formData = new FormData();
                formData.append("body", JSON.stringify(body));
                return nkcAPI(`/library/${folder._id}`, "POST", body);
              }
            })
            .then(() => {
              file.status = "uploaded";
            })
            .catch(data => {
              file.error = data.error || data.message || data;
              file.status = "notUploaded";
            })
            .finally(() => {
              self.app.uploadFile(index+1, arr);
            })
        },
        // 返回上一层文件夹
        back() {
          if(this.lastFolder) this.selectFolder(this.lastFolder);
        },
        // 切换到文件上传
        toUpload() {
          if(this.mark) return;
          this.pageType = "uploader";
        },
        // 切换到文件列表
        toList() {
          this.selectFolder(this.folder);
          this.pageType = "list";
        },
        // 将用户已选择的筛选分类存到本地
        saveCategoriesToLocalStorage() {
          const {listCategories} = this;
          const libraryListCategories = NKC.methods.getFromLocalStorage("libraryListCategories");
          libraryListCategories[this.lid] = listCategories;
          NKC.methods.saveToLocalStorage("libraryListCategories", libraryListCategories);
        },
        // 读取本地存储的筛选分类
        getCategoriesFromLocalStorage() {
          const libraryListCategories = NKC.methods.getFromLocalStorage("libraryListCategories");
          const listCategories = libraryListCategories[this.lid];
          if(listCategories) {
            this.listCategories = listCategories;
          }
        },
        // 文件夹访问记录存到浏览器本地
        saveToLocalStorage(id) {
          const libraryVisitFolderLogs = NKC.methods.getFromLocalStorage("libraryVisitFolderLogs");
          libraryVisitFolderLogs[this.lid] = id;
          NKC.methods.saveToLocalStorage("libraryVisitFolderLogs", libraryVisitFolderLogs);
        },
        // 添加一条浏览器历史记录
        addHistory(lid) {
          // 判断是否为相同页，相同则不创建浏览器历史记录。
          if(this.lastHistoryLid && this.lastHistoryLid === lid) return;
          let {href} = window.location;
          if(href.includes("#")) {
            href = href.replace(/#.*/ig, "");
          }
          window.history.pushState({lid}, 'page', href + '#' + lid);
          this.lastHistoryLid = lid;
        },
        // 获取文件列表
        getList(id, scrollToTop) {
          const url = `/library/${id}?file=true&nav=true&folder=true&permission=true&t=${Date.now()}`;
          return nkcAPI(url, "GET")
            .then(function(data) {
              self.app.nav = data.nav;
              self.app.folders = data.folders;
              self.app.files = data.files;
              self.app.permission = data.permission;
              self.app.saveToLocalStorage(id);
              if(scrollToTop) {
                self.app.scrollTo(null, 0);
              }
            })
        },
        selectOnlineFiles() {
          SelectResource.open((data) => {
            const {resources} = data;
            resources.map(r => {
              self.app.selectedFiles.push(self.app.createFile("onlineFile", r));
            });
          }, {
            allowedExt: ["attachment", "video", "audio"],
            countLimit: 99
          })
        },
        // 选择完本地文件
        selectedLocalFiles() {
          const {files = []} = document.getElementById("moduleLibraryInput");
          for(const file of files) {
            this.selectedFiles.push(this.createFile("localFile", file));
          }
          document.getElementById("moduleLibraryInput").value = "";
        },
        // 选择文件夹
        selectFolder(folder, scrollToTop) {
          if(this.mark) return;
          if(folder.type === "folder") {
            this.getListInfo(folder._id, scrollToTop);
          } else {
            this.selectFile(folder);
          }
        },
        // 点击文件夹目录时
        selectNavFolder(f) {
          if(this.pageType !== "list") {
            this.pageType = "list";
          }
          this.selectFolder(f);
        },
        // 移动文件夹或文件
        moveFolder(libraryId) {
          let foldersId;
          if(Array.isArray(libraryId)) {
            foldersId = libraryId;
          } else {
            foldersId = [libraryId];
          }

          const body = {};
          body.foldersId = foldersId;

          const url = `/library/${this.folder._id}/list`;
          const method = "PUT";

          LibraryPath.open((data) => {
            body.targetFolderId = data.folder._id;
            nkcAPI(url, method, body)
              .then((data) => {
                sweetSuccess(`执行成功${data.ignoreCount? `，共有${data.ignoreCount}个项目因存在冲突或不是你自己发布的而被忽略`: ""}`);
                self.app.mark = false;
                self.app.selectFolder(self.app.folder);
              })
              .catch(data => {
                sweetError(data);
              })
          }, {
            lid: self.app.folder._id,
            warning: "此操作不会保留原有目录结构，且不可恢复。"
          })
        },
        // 编辑文件夹
        editFolder(folder) {
          if(this.mark) return;
          let typeStr = "文件夹";
          let modalData = [
            {
              dom: "input",
              type: "text",
              label: `${typeStr}名称`,
              value: folder.name
            },
            {
              dom: "textarea",
              label: `${typeStr}简介`,
              value: folder.description
            }
          ];
          if(folder.type === "file") {
            typeStr = "文件";
            modalData.push({
              dom: "radio",
              label: "文件分类",
              radios: [
                {
                  name: "图书",
                  value: "book"
                },
                {
                  name: "论文",
                  value: "paper"
                },
                {
                  name: "程序",
                  value: "program"
                },
                {
                  name: "媒体",
                  value: "media"
                },
                {
                  name: "其他",
                  value: "other"
                }
              ],
              value: folder.category
            })
          }
          CommonModal.open(function(res) {
            const name = res[0].value;
            const description = res[1].value;
            let category = "";
            if(folder.type === "file") {
              category = res[2].value;
            }
            if(!name) return sweetError("名称不能为空");
            nkcAPI("/library/" + folder._id, "PUT", {
              name,
              description,
              category
            })
              .then(function() {
                self.app.selectFolder(self.app.folder);
                window.CommonModal.close();
              })
              .catch(function(data) {
                sweetError(data);
              })
          }, {
            title: `编辑${typeStr}`,
            data: modalData
          });
        },
        // 删除文件夹
        deleteFolder(foldersId) {
          if(!Array.isArray(foldersId)) {
            foldersId = [foldersId];
          }
          if(!foldersId.length) return;
          foldersId = foldersId.join("-");
          sweetQuestion(`确定要执行删除操作？`)
            .then(function() {
              nkcAPI(`/library/${self.app.folder._id}/list?lid=${foldersId}`, "DELETE")
                .then(function(data) {
                  self.app.mark = false;
                  self.app.selectFolder(self.app.folder);
                  sweetSuccess(`执行成功${data.ignoreCount? `，共有${data.ignoreCount}个项目因不是你自己发布的而被忽略`: ""}`);
                })
                .catch(function(data) {
                  sweetError(data);
                })
            })
            .catch(function(){})
        },
        // 选择文件
        selectFile(file) {
          ResourceInfo.open({lid: file._id});
        },
        // 创建文件夹
        createFolder() {
          if(this.mark) return;
          window.CommonModal.open(function(res) {
            const name = res[0].value;
            const description = res[1].value;
            if(!name) return sweetError("名称不能为空");
            nkcAPI("/library/" + self.app.folder._id + "/list", "POST", {
              name,
              description
            })
              .then(function() {
                sweetSuccess("文件夹创建成功");
                window.CommonModal.close();
                self.app.selectFolder(self.app.folder);
              })
              .catch(function(data) {
                sweetError(data);
              })
          }, {
            title: "新建文件夹",
            data: [
              {
                dom: "input",
                type: "text",
                label: "文件夹名称",
                value: ""
              },
              {
                dom: "textarea",
                label: "文件夹简介",
                value: ""
              }
            ]
          })
        }
      }
    })
  }

};
