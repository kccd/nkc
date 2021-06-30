window.selectImage = undefined;
var app = new Vue({
  el: "#app",
  data: {
    error: "",
    info: "",

    avatar: "",
    banner: "",
    avatarUrl: "",
    bannerUrl: "",

    submitting: false,

    column: {
      name: "",
      abbr: "",
      description: ""
    },

    checked: false,

  },
  mounted: function() {
    window.selectImage = new NKC.methods.selectImage();
  },
  methods: {
    selectedImage: function(data, name) {
      if(name === "avatar") {
        this.selectedAvatar(data);
      } else {
        this.selectedBanner(data);
      }
    },
    selectedBanner: function(data) {
      this.banner = data;
      NKC.methods.fileToUrl(data)
        .then(function(url) {
          app.bannerUrl = url;
          selectImage.close();
        })
    },
    selectedAvatar: function(data) {
      this.avatar = data;
       NKC.methods.fileToUrl(data)
        .then(function(url) {
          app.avatarUrl = url;
          selectImage.close();
        })
    },
    selectBanner: function() {
      selectImage.show(function(data){
        app.selectedBanner(data);
      }, {
        aspectRatio: 6.4
      });
    },
    selectAvatar: function() {
      selectImage.show(function(data){
        app.selectedAvatar(data);
      }, {
        aspectRatio: 1
      });
    },
    submit: function() {
      this.error = "";
      this.info = "";
      var column = this.column;
      if(!this.avatar) return this.error = "请选择专栏Logo";
      if(!this.banner) return this.error = "请选择专栏Banner";
      if(!column.name) return this.error = "请输入专栏名";
      if(!column.abbr) return this.error = "请输入专栏简介";
      // if(!column.description) return this.error = "请输入专栏介绍";
      var formData = new FormData();
      formData.append("avatar", this.avatar);
      formData.append("banner", this.banner);
      formData.append("name", column.name);
      formData.append("abbr", column.abbr);
      formData.append("description", column.description);
      this.submitting = true;
      const _this = this;
      uploadFilePromise("/column", formData, function(e, a) {
        if(a === 100) {
          app.info = "处理中，请稍候...";
        } else {
          app.info = "提交中..." + a + "%";
        }
      })
        .then(function(data) {
          NKC.methods.visitUrl("/m/" + data.column._id);
          _this.submitting = false;
        })
        .catch(function(data) {
          app.info = "";
          app.error = data.error || data;
          _this.submitting = false;
        })
    }
  }
});