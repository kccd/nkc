NKC.modules.LibraryPath = class {
  constructor() {
    const self = this;
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
        originFoldersId() {
          return this.originFolders.map(f => f._id);
        },
        selectedFolderId() {
          if(this.folder) return this.folder._id;
        },
        // 计算高亮横排的行数
        activeLine() {
          const {folders, folder} = this;
          let line = 0;
          const func = (arr) => {
            for(let i = 0; i < arr.length; i++) {
              const a = arr[i];
              line ++;
              if(a._id === folder._id) {
                return;
              } else if(a.folders && a.folders.length) {
                return func(a.folders);
              }
            }
          };
          func(folders);
          return line;
        },
        nav() {
          if(!this.folder) return;
          return this.getFolderNav(this.folder);
        },
        path() {
          if(!this.nav) return;
          return "/" + this.nav.map(n => n.name).join("/");
        }
      },
      methods: {
        per(name) {
          return this.permission.includes(name);
        },
        submitForm() {
          const form = this.form;
          const {type, folder, name, description} = form;

          let method, url;
          if(type === "create") {
            method = "POST";
            url = `/library/${folder._id}/list`;
          } else {
            method = "PATCH";
            url = `/library/${folder._id}`;
          }
          nkcAPI(url, method, {
            name,
            description
          })
            .then(() => {
              self.app.form.folder = "";
              if(type === "create") {
                folder.close = true;
                folder.loaded = false;  
                folder.folderCount = (folder.folderCount || 0) + 1;
                self.app.switchFolder(folder);
              } else {
                folder.name = name;
                folder.description = description;
              }
              
            })
            .catch(err => {
              sweetError(err);
            })
        },
        toForm(type, folder) {
          this.form.type = type;
          if(type === "modify") {
            this.form.name = folder.name;
            this.form.description = folder.description;
          } else {
            this.form.name = "";
            this.form.description = "";
          }
          this.form.folder = folder;
        },
        getFolderNav(folder) {
          const {originFolders} = this;
          let lid = folder.lid;
          const nav = [folder];
          while(lid) {
            for(const f of originFolders) {
              if(f._id !== lid) continue;
              nav.unshift(f);
              lid = f.lid;
            }
          }
          return nav;
        },
        // 存入源文件夹数组
        saveToOrigin(folders) {
          const {originFoldersId, originFolders} = self.app;
          for(const folder of folders) {
            if(!originFoldersId.includes(folder._id)) originFolders.push(folder);
            const {folders = []} = folder;
            self.app.saveToOrigin(folders);
          }
        },
        // 滚动到高亮处
        scrollToActive() {
          setTimeout(() => {
            let line = this.activeLine;
            line -= 3;
            line = line>0?line: 0;
            const height = 30*line; // 每一横排占30px(与css设置有关，若css改动则此处也需要做相应调整。)
            const listBody = this.$refs.listBody;
            NKC.methods.scrollTop(listBody, height);
          }, 100)
        },
        // 点击确定
        submit() {
          if(!this.folder) return;
          self.callback({
            folder: this.folder,
            nav: this.nav,
            path: this.path
          });
          this.close();
        },
        // 展开文件夹
        switchFolder(f) {
          this.selectFolder(f);
          if(f.close) {
            f.close = false;
            // 加载下层文件夹
            if(!f.loaded) {
              this.getFolders(f);
            }
          } else {
            f.close = true;
          }
        },
        // 选择文件夹
        selectFolder(f) {
          this.folder = f;
        },
        // 加载文件夹列表
        // 默认只加载顶层文件夹
        // 可通过lid加载指定的文件夹，并自动定位、展开上级目录
        initFolders(lid) {
          const url = `/library?type=init&lid=${lid}&t=${Date.now()}`;
          nkcAPI(url, "GET")
            .then(data => {
              self.app.folders = data.folders;
              self.app.folder = data.folder;
              self.app.permission = data.permission;
              self.app.saveToOrigin(data.folders);
              if(lid) {
                self.app.scrollToActive();
              }
            })
            .catch(data => {
              sweetError(data);
            });
        },
        getFolders(folder) {
          let url;
          if(folder) {
            url = `/library?type=getFolders&lid=${folder._id}&t=${Date.now()}`;
          } else {
            url = `/library?type=getFolders&t=${Date.now()}`;
          }
          nkcAPI(url, "GET")
            .then((data) => {
              self.app.permission = data.permission;
              if(folder) folder.loaded = true;
              data.folders.map(f => {
                f.close = true;
                f.loaded = false;
                f.folders = [];
                if(folder) {
                  f.parent = folder;
                }
              });
              if(folder) {
                folder.folders = data.folders;
              } else {
                self.app.folders = data.folders;
              }
              self.app.saveToOrigin(data.folders);
            })
            .catch((data) => {
              if(folder) folder.close = true;
              sweetError(data);
            })
        },
        open(options = {}) {
          const {lid, warning = ""} = options;
          this.warning = warning;
          if(lid) {
            this.folder = "";
            this.initFolders(lid);
          } else {
            if(!this.folders || !this.folders.length) {
              this.getFolders();
            }
          }
          self.dom.modal("show");
        },
        close() {
          self.dom.modal("hide");
        }
      }
    });
  }
  open(callback, options) {
    this.callback = callback;
    this.app.open(options);
  }
  close() {
    this.app.close();
  }
}


