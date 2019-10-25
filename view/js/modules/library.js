NKC.modules.Library = class {
  constructor(lid) {
    const self = this;
    self.app = new Vue({
      el: "#moduleLibrary",
      data: {
        uid: NKC.configs.uid,
        pageType: "list", // list: 文件列表, uploader: 文件上传
        nav: [],
        folders: [],
        files: [],
        lid,
        sort: "time",
        histories: [],
        index: 0,
        selectedFiles: [],
        mark: false,
        selectedLibrariesId: [],
        permission: []
      },
      mounted() {
        this.getList(this.lid);
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
      },
      computed: {
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
          return this.folders.concat(this.files);
        }
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        visitUrl: NKC.methods.visitUrl,
        format: NKC.methods.format,
        getSize: NKC.methods.tools.getSize,
        checkString: NKC.methods.checkData.checkString,
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
            const {folder, folderPath} = data;
            r.folder = folder;
            r.folderPath = folderPath;
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
          if(type === "folder") {
            
          }
          if(file.type === "localFile") {
            if(type.includes("image")) {
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
                minLengh: 1,
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
              // 上传本地文件
              if(file.type === "localFile") {
                const formData = new FormData();
                formData.append("file", file.data);
                return nkcUploadFile("/r", "POST", formData, (e, p) => {
                  file.progress = p;
                });
              }
            })
            .then(data => {
              // 替换本地文件信息 同一为线上文件模式
              if(file.type === "localFile") {
                const resource = data.r;
                file.data = resource;
                file.ext = resource.ext;
                file.rid = resource.rid;
                file.toc = resource.toc;
                file.type = "onlineFile";
              }
            })
            .then(() => {
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
            })
            .then(() => {
              file.status = "uploaded";
            })
            .catch(data => {
              file.error = data.error || data;
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
        // 获取文件列表
        getList(id) {
          const url = `/library/${id}?file=true&nav=true&folder=true&permission=true&t=${Date.now()}`;
          nkcAPI(url, "GET")
            .then(function(data) {
              self.app.nav = data.nav;
              self.app.folders = data.folders;
              self.app.files = data.files;
              self.app.permission = data.permission;
            })
            .catch(function(data) {
              sweetError(data);
            })
        },
        selecteOnlineFiles() {
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
        seletedFiles() {
          const {files = []} = document.getElementById("moduleLibraryInput");
          for(const file of files) {
            this.selectedFiles.push(this.createFile("localFile", file));
          }
        },
        // 选择文件夹
        selectFolder(folder) {
          if(this.mark) return;
          if(folder.type === "folder") {
            this.getList(folder._id);
          } else {
            this.selectFile(folder);
          }
        },
        // 移动文件夹或文件
        moveFolder(libraryId) {
          sweetQuestion("确定要执行移动操作？此操作不会保留原有目录结构，且不可恢复。")
            .then(() => {
              let foldersId;
              if(Array.isArray(libraryId)) {
                foldersId = libraryId;
              } else {
                foldersId = [libraryId];
              }

              const body = {};
              body.foldersId = foldersId;

              const url = `/library/${this.folder._id}/list`;
              const method = "PATCH";
              
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
                lid: self.app.folder._id
              })
            })
            .catch(() => {})
        },
        // 编辑文件夹
        editFolder(folder) {
          if(this.mark) return;
          let typeStr = "文件夹";
          if(folder.type === "file") {
            typeStr = "文件";
          }
          CommonModal.open(function(res) {
            const name = res[0].value;
            const description = res[1].value;
            if(!name) return sweetError("名称不能为空");
            nkcAPI("/library/" + folder._id, "PATCH", {
              name,
              description
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
            data: [
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
            ]
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
