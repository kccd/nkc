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
        folders: [],
        folder: ""
      },
      computed: {
        selectedFolderId() {
          if(this.folder) return this.folder._id;
        }
      },
      mounted() {
        
      },
      methods: {
        submit() {
          if(!this.folder) return;
          nkcAPI(`/library/${this.folder._id}?path=true&t=${Date.now()}`, "GET")
            .then(data => {
              self.callback({
                folder: this.folder,
                folderPath: data.path
              });
              this.close();
            })
            .catch(data => {
              sweetError(data);
            })
        },
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
        selectFolder(f) {
          this.folder = f;
        },
        initFolders(lid) {
          const url = `/library?type=init&lid=${lid}`;
          nkcAPI(url, "GET")
            .then(data => {
              self.app.folders = data.folders;
              self.app.folder = data.folder;
            })
            .catch(data => {
              sweetError(data);
            });
        },
        getFolders(folder) {
          let url;
          if(folder) {
            url = `/library?type=getFolders&lid=${folder._id}`;
          } else {
            url = `/library?type=getFolders`;
          }
          nkcAPI(url, "GET")
            .then((data) => {
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
            })
            .catch((data) => {
              if(folder) folder.close = true;
              sweetError(data);
            })
        },
        open(options = {}) {
          const {lid} = options;
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


