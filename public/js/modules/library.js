"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

NKC.modules.Library =
/*#__PURE__*/
function () {
  function _class(fid) {
    _classCallCheck(this, _class);

    var self = this;
    self.app = new Vue({
      el: "#moduleLibrary",
      data: {
        selectedFolders: [],
        folders: [],
        resources: [],
        fid: fid,
        sort: "time",
        library: "",
        forum: ""
      },
      mounted: function mounted() {
        this.getList("fid", this.fid);

        if (!window.CommonModal) {
          if (!NKC.modules.CommonModal) {
            sweetError("未引入通用弹框");
          } else {
            window.CommonModal = new NKC.modules.CommonModal();
          }
        }
      },
      computed: {
        list: function list() {
          var sort = this.sort;
          var resources_ = this.resources;
          var folders_ = this.folders;

          if (sort === "time") {
            var resourcesObj = {},
                foldersObj = {};
            var resourceTimeList = [],
                folderTimeList = [];
            resources_.map(function (r) {
              var t = new Date(r.toc).getTime();
              resourcesObj[t] = r;
              resourceTimeList.push(t);
            });
            folders_.map(function (f) {
              var t = new Date(f.toc).getTime();
              foldersObj[t] = f;
              folderTimeList.push(t);
            });
            resourceTimeList.sort();
            folderTimeList.sort();
            var resources = [],
                folders = [];

            for (var _i = 0, _resourceTimeList = resourceTimeList; _i < _resourceTimeList.length; _i++) {
              var t = _resourceTimeList[_i];
              resources.push(resourcesObj[t]);
            }

            for (var _i2 = 0, _folderTimeList = folderTimeList; _i2 < _folderTimeList.length; _i2++) {
              var _t = _folderTimeList[_i2];
              folders.push(foldersObj[_t]);
            }

            return {
              folders: folders,
              resources: resources
            };
          }
        }
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        // 打开时，仅根据fid加载列表
        initList: function initList() {},
        // type: fid, lid
        getList: function getList(type, id) {
          var url = "/library/list";

          if (type === "fid") {
            url += "?fid=".concat(id);
          } else {
            url += "?lid=".concat(id);
          }

          nkcAPI(url, "GET").then(function (data) {
            if (type === "fid") {
              self.app.forum = data.forum;
            }

            self.app.library = data.library;
            self.app.selectedFolders = data.nav;
            self.app.folders = data.list.folders;
            self.app.resources = data.list.resources;
          })["catch"](function (data) {
            sweetError(data);
          });
        },
        // 选择文件夹
        selectFolder: function selectFolder(folder) {
          this.getList("lid", folder._id);
        },
        // 选择文件
        selectFile: function selectFile(resource) {
          if (!window.ResourceInfo) {
            if (!NKC.modules.ResourceInfo) {
              sweetError("未资源信息模块");
            } else {
              window.ResourceInfo = new NKC.modules.ResourceInfo();
            }
          }

          ResourceInfo.open({
            rid: resource.rid
          });
        },
        // 创建文件夹
        createFolder: function createFolder() {
          window.CommonModal.open(function (res) {
            var name = res[0].value;
            var description = res[1].value;
            if (!name) return sweetError("名称不能为空");
            nkcAPI("/library/list", "POST", {
              lid: self.app.library._id,
              name: name,
              description: description
            }).then(function (data) {
              sweetSuccess("文件夹创建成功");
              window.CommonModal.close();
              self.app.folders.push(data.library);
            })["catch"](function (data) {
              sweetError(data);
            });
          }, {
            title: "创建文件夹",
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