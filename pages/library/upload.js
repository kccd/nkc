var SelectResource, SelectForum, SelectImage;
var data = NKC.methods.getDataById("data");
var forum = data.forum;
var app = new Vue({
  el: "#app",
  data: {
    resource: "",
    name: "",
    description: "",
    category: "",
    labels: [],
    forums: data.forum? [data.forum]: [],
    submitting: false,
    file: "", // 文件
    cover: "", // 封面图hash
    coverUrl: "", // 封面图base64
    coverData: "", // 封面图对象
  },
  computed: {
    forumsId: function() {
      var forums = this.forums;
      var arr = [];
      for(var i = 0; i < forums.length; i++) {
        arr.push(forums[i].fid);
      }
      return arr;
    }
  },
  mounted: function() {
    SelectResource = new NKC.modules.SelectResource();
    SelectForum = new NKC.modules.MoveThread();
    SelectImage = new NKC.methods.selectImage();
    if(data.rid) {
      this.getResource(data.rid);
    }
  },
  methods: {
    getSize: NKC.methods.tools.getSize,
    format: NKC.methods.format,
    removeResourceFromLibrary: removeResourceFromLibrary,
    removeForum: function(index) {
      this.forums.splice(index, 1)
    },
    // 选择文件
    sr: function() {
      var self = this;
      SelectResource.open(function(r) {
        var resource = r.resources[0];
        Promise.resolve()
          .then(function() {
            if(resource.forumsId.length) {
              return sweetQuestion("已选文件已经被添加到文库了，已输入内容将会被该文件的信息覆盖。确认要继续？")
            }
          })
          .then(function() {
            self.getResource(r.resourcesId[0]);
          })
      }, {
        countLimit: 1,
        allowedExt: ["video", "audio", "attachment"]
      });
    },
    // 选择封面
    sc: function() {
      var self = this;
      SelectResource.open(function(r) {
        var cover = r.resources[0];
        var url;
        if(cover.originId) {
          url = "/ro/" + cover.originId;
        } else {
          url = "/r/" + cover.rid;
        }
        SelectImage.show(function(data) {
          self.coverData = data;
          NKC.methods.fileToUrl(NKC.methods.blobToFile(data))
            .then(function(data) {
              self.coverUrl = data;
              SelectImage.close();
            })
        }, {
          // aspectRatio: 3/2,
          url: url
        });
      }, {
        countLimit: 1,
        allowedExt: ["picture"]
      });
    },
    // 选择专业
    sf: function() {
      var self = this;
      SelectForum.open(function(res) {
        var forums = [];
        for(var i = 0; i < res.forums.length; i++) {
          var f = res.forums[i];
          forums.push({
            fid: f.fid,
            displayName: f.fName,
            color: f.color
          });
        }
        self.forums = forums;
        SelectForum.close();
      }, {
        selectedForumsId: this.forumsId,
        hideMoveType: true
      })
    },
    // 选择本地文件
    slf: function() {
      var files = document.getElementById("localFile").files;
      if(!files.length) return;
      var file = files[0];
      if(file.size > 200*1024*1024) return sweetError("文件大小不能超过200MB");
      this.resource = {
        oname: file.name,
        size: file.size,
        toc: file.lastModified
      };
      this.file = file;
    },
    inForums: function(forum) {
      var forums = this.forums;
      var flag = false;
      for(var i = 0; i < forums.length; i++) {
        var f = forums[i];
        if(f.fid === forum.fid) {
          flag = true;
          break;
        }
      }
      return flag;
    },
    clearCover: function() {
      this.cover = "";
      this.coverUrl = "";
      this.coverData = "";
    },
    getResource: function(rid) {
      var self = this;
      nkcAPI("/r/" + rid + "/info", "GET")
        .then(function(res) {
          var resource = res.resource;
          self.resource = res.resource;
          if(resource.category) {
            // 已添加到文库
            self.cover = resource.cover;
            self.category = res.resource.category;
            self.forums = data.forum? [data.forum]:[];
            for(var i = 0; i < res.forums.length; i++) {
              var f = res.forums[i];
              if(!self.inForums(f)) self.forums.push(f);
            }
            self.name = self.resource.name || self.resource.oname;
            self.description = self.resource.description;
          } else {

          }
        })
        .catch(function(data) {
          sweetError(data);
        }
    )
    },
    submit: function() {
      var self = this;
      self.submitting = true;
      var body = {};
      var formData = new FormData();
      Promise.resolve()
        .then(function() {
          if(!self.resource) throw "请选择文件";
          if(!self.category) throw "请选择文件类型";
          if(!self.name) throw "请输入文件名称";
          if(!self.description) throw "请输入文件说明";
          if(!self.forums.length) throw "请选择专业领域";
          body.name = self.name;
          body.category = self.category;
          body.description = self.description;
          body.forumsId = [];
          for(var i = 0; i < self.forums.length; i++) {
            body.forumsId.push(self.forums[i].fid);
          }

          if(self.resource.rid) body.rid = self.resource.rid;

          if(self.coverData) {
            formData.append("cover", self.coverData);
          } else if(self.cover) {
            body.cover = self.cover;
          }


          if(!self.resource.rid) {
            // 本地上传
            var fd = new FormData();
            fd.append("file", self.file);
            return nkcUploadFile("/r", "POST", fd);
          }
        })
        .then(function(data) {
          if(data) {
            if(data.r.mediaType === "mediaPicture") throw "暂不支持将图片上传到文库";
            body.rid = data.r.rid;
          }
          formData.append("body", JSON.stringify(body));
          return nkcUploadFile("/library", "POST", formData);
        })
        .then(function() {
          // 上传成功
          self.submitting = false;
          sweetSuccess("提交成功");
        })
        .catch(function(data) {
          self.submitting = false;
          sweetError(data);
        });
    }
  }
});