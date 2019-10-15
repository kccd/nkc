var SelectResource;
var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    resource: "",
    cover: "",
    name: "",
    description: "",
    category: "",
    labels: [],
    libraries: [data.library],
    submitting: false
  },
  mounted: function() {
    SelectResource = new NKC.modules.SelectResource();
  },
  methods: {
    getSize: NKC.methods.tools.getSize,
    format: NKC.methods.format,
    removeLibrary: function(r) {

    },
    // 选择文件
    sr: function() {
      var self = this;
      SelectResource.open(function(r) {
        self.getResource(r.resourcesId[0]);
      }, {
        countLimit: 1
      });
    },
    // 选择封面
    sc: function() {
      var self = this;
      SelectResource.open(function(r) {
        self.cover = r.resources[0];
      }, {
        countLimit: 1,
        allowedExt: ["picture"]
      });
    },
    // 选择文库
    sl: function() {

    },
    inLibraries: function(library) {
      var libraries = this.libraries;
      var flag = false;
      for(var i = 0; i < libraries.length; i++) {
        var l = libraries[i];
        if(l._id === library._id) {
          flag = true;
          break;
        }
      }
      return flag;
    },
    getResource: function(rid) {
      var self = this;
      nkcAPI("/r/" + rid + "/info", "GET")
        .then(function(res) {
          self.resource = res.resource;
          self.cover = res.cover;
          self.category = res.resource.category;
          self.libraries = [data.library];
          for(var i = 0; i < res.libraries.length; i++) {
            var l = res.libraries[i];
            if(!self.inLibraries(l)) self.libraries.push(l);
          }
          self.name = self.resource.name || self.resource.oname;
          self.description = self.resource.description;
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
      Promise.resolve()
        .then(function() {
          if(!self.resource) throw "请选择文件";
          if(!self.category) throw "请选择文件类型";
          if(!self.name) throw "请输入文件名称";
          if(!self.description) throw "请输入文件说明";
          if(!self.libraries.length) throw "请选择文库";
          body.name = self.name;
          body.category = self.category;
          body.description = self.description;
          body.librariesId = [];
          for(var i = 0; i < self.libraries.length; i++) {
            body.librariesId.push(self.libraries[i]._id);
          }
          if(self.cover) {
            body.cover = self.cover.rid;
          }
          return nkcAPI("/r/" + self.resource.rid + "/info", "PATCH", body);
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