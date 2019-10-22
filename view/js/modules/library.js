NKC.modules.Library = class {
  constructor(fid) {
    const self = this;
    self.app = new Vue({
      el: "#moduleLibrary",
      data: {
        selectedFolders: [],
        folders: [],
        resources: [],
        fid,
        sort: "time",
        library: "",
        forum: ""
      },
      mounted() {
        this.getList("fid", this.fid);
        if(!window.CommonModal) {
          if(!NKC.modules.CommonModal) {
            sweetError("未引入通用弹框");
          } else {
            window.CommonModal = new NKC.modules.CommonModal();
          }
        }
      },
      computed: {
        list() {
          const sort = this.sort;
          const resources_ = this.resources;
          const folders_ = this.folders;

          if(sort === "time") {
            const resourcesObj = {}, foldersObj = {};
            const resourceTimeList = [], folderTimeList = [];
            resources_.map(r => {
              const t = (new Date(r.toc)).getTime();
              resourcesObj[t] = r;
              resourceTimeList.push(t);
            });

            folders_.map(f => {
              const t = (new Date(f.toc)).getTime();
              foldersObj[t] = f;
              folderTimeList.push(t);
            });
            
            resourceTimeList.sort();
            folderTimeList.sort();

            const resources = [], folders = [];
            for(const t of resourceTimeList) {
              resources.push(resourcesObj[t]);
            }
            for(const t of folderTimeList) {
              folders.push(foldersObj[t]);
            }
            
            return {
              folders: folders,
              resources: resources
            }
          }
        }
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        // 打开时，仅根据fid加载列表
        initList() {
          
        },
        // type: fid, lid
        getList(type, id) {
          let url = "/library/list";
          if(type === "fid") {
            url += `?fid=${id}`;
          } else {
            url += `?lid=${id}`;
          }
          nkcAPI(url, "GET")
            .then(function(data) {
              if(type === "fid") {
                self.app.forum = data.forum;
              }
              self.app.library = data.library;
              self.app.selectedFolders = data.nav;
              self.app.folders = data.list.folders;
              self.app.resources = data.list.resources;
            })
            .catch(function(data) {
              sweetError(data);
            })
        },
        // 选择文件夹
        selectFolder(folder) {
          this.getList("lid", folder._id);
        },
        // 选择文件
        selectFile(resource) {
          if(!window.ResourceInfo) {
            if(!NKC.modules.ResourceInfo) {
              sweetError("未资源信息模块");
            } else {
              window.ResourceInfo = new NKC.modules.ResourceInfo();
            }
          }
          ResourceInfo.open({rid: resource.rid});
        },
        // 创建文件夹
        createFolder() {
          window.CommonModal.open(function(res) {
            const name = res[0].value;
            const description = res[1].value;
            if(!name) return sweetError("名称不能为空");
            nkcAPI("/library/list", "POST", {
              lid: self.app.library._id,
              name,
              description
            })
              .then(function(data) {
                sweetSuccess("文件夹创建成功");
                window.CommonModal.close();
                self.app.folders.push(data.library);
              })
              .catch(function(data) {
                sweetError(data);
              })
          }, {
            title: "创建文件夹",
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
