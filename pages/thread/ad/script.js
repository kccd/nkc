var data = NKC.methods.getDataById("data");
window.SelectImage = undefined;
var app = new Vue({
  el: "#app",
  data: {
    title: data.thread.title,
    resourcesId: data.thread.resourcesId,
    tid: data.thread.tid,
    postsResourcesId: data.thread.postsResourcesId,
    firstPostCover: data.thread.firstPostCover,
    topType: "movable",
    coverFixed: "",
    coverMovable: "",
    coverFixedData: "",
    coverMovableData: ""
  },
  mounted: function() {
    window.SelectImage = new NKC.methods.selectImage();
  },
  computed: {
    coverData: function() {
      if(this.topType === "movable") {
        return this.coverMovableData
      } else {
        return this.coverFixedData
      }
    },
    cover: function() {
      if(this.topType === "movable") {
        return this.coverMovable
      } else {
        return this.coverFixed
      }
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectFile: function(type, rid) {
      var self = this;
      var options = {};
      if(type === "online") {
        options.url = "/r/" + rid;
      } else if(type === "cover") {
        options.url = this.getUrl("postCover", rid);
      }
      if(this.topType === "movable") {
        options.aspectRatio = 800/336;
      } else {
        options.aspectRatio = 400/253;
      }
      SelectImage.show(function(data) {
        self.setCover(data);
        SelectImage.close();
      }, options)
    },
    setCover: function(data) {
      var self = this;
      if(self.topType === "movable") {
        self.coverMovable = data;
        NKC.methods.fileToUrl(data)
          .then(function(url) {
            self.coverMovableData = url;
          })
      } else {
        self.coverFixed = data;
        NKC.methods.fileToUrl(data)
          .then(function(url) {
            self.coverFixedData = url;
          })
      }
    },
    checkString: NKC.methods.checkData.checkString,
    submit: function() {
      var self = this;
      Promise.resolve()
        .then(function() {
          self.checkString(self.title, {
            name: "标题",
            minLength: 1,
            maxLength: 2000
          });
          if(!self.cover) throw "请选择封面图";
          var formData = new FormData();
          formData.append("cover", self.cover, 'cover.png');
          formData.append("title", self.title);
          formData.append("topType", self.topType);
          return nkcUploadFile("/t/" + self.tid + "/ad", "POST", formData)
        })
        .then(function() {
          sweetSuccess("文章已推送到首页");
        })
        .catch(sweetError);
    }
  }
});

window.app = app;