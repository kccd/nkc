var app = new Vue({
  el: "#app",
  data: {
    error: "",
    info: "",

    avatar: "",
    banner: "",
    avatarUrl: "",
    bannerUrl: "",

    column: {
      name: "",
      abbr: "",
      description: ""
    }

  },
  mounted: function() {
    moduleCrop.init(this.selectedImage);
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
      fileToUrl(data)
        .then(function(url) {
          app.bannerUrl = url;
        })
    },
    selectedAvatar: function(data) {
      this.avatar = data;
       fileToUrl(data)
        .then(function(url) {
          app.avatarUrl = url;
        })
    },
    selectBanner: function() {
      moduleCrop.show({
        aspectRatio: 4,
        name: "banner"
      });
    },
    selectAvatar: function() {
      moduleCrop.show({
        aspectRatio: 1,
        name: "avatar"
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
      uploadFilePromise("/column", formData, function(e, a) {
        app.info = "提交中..." + a;
      })
        .then(function(data) {
          window.location.href = "/m/" + data.column._id;
        })
        .catch(function(data) {
          app.info = "";
          app.error = data.error || data;
        })
    }
  }
});