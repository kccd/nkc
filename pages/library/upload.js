var SelectResource;
var data = NKC.methods.getDataById("data");
var forum = data.forum;
var app = new Vue({
  el: "#app",
  data: {
    resource: "",
    cover: "",
    name: "",
    description: "",
    category: "",
    labels: [],
    forums: data.forum? [data.forum]: [],
    submitting: false
  },
  mounted: function() {
    SelectResource = new NKC.modules.SelectResource();
  },
  methods: {
    getSize: NKC.methods.tools.getSize,
    format: NKC.methods.format,
    removeForum: function(r) {

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
    sf: function() {

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
    getResource: function(rid) {
      var self = this;
      nkcAPI("/r/" + rid + "/info", "GET")
        .then(function(res) {
          self.resource = res.resource;
          self.cover = res.cover;
          self.category = res.resource.category;
          self.forums = data.forum? [data.forum]:[];
          for(var i = 0; i < res.forums.length; i++) {
            var f = res.forums[i];
            if(!self.inForums(f)) self.forums.push(f);
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
          if(!self.forums.length) throw "请选择文库";
          body.name = self.name;
          body.category = self.category;
          body.description = self.description;
          body.forumsId = [];
          for(var i = 0; i < self.forums.length; i++) {
            body.forumsId.push(self.forums[i].fid);
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