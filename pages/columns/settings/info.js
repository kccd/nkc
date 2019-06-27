var data = getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    avatar: "",
    banner: "",
    avatarUrl: "/m/" + data.column._id + "/avatar",
    bannerUrl: "/m/" + data.column._id + "/banner",

    column: data.column,

    info: "",
    error: ""
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
      if(!column.name) return this.error = "请输入专栏名";
      if(!column.abbr) return this.error = "请输入专栏简介";
      if(!column.description) return this.error = "请输入专栏介绍";
      var formData = new FormData();
      if(this.avatar) {
        formData.append("avatar", this.avatar);
      }
      if(this.banner) {
        formData.append("banner", this.banner);
      }
      formData.append("name", column.name);
      formData.append("abbr", column.abbr);
      formData.append("description", column.description);
      uploadFilePromise("/m/" + this.column._id, formData, function(e, a) {
        app.info = "提交中..." + a;
      }, "PATCH")
        .then(function() {
          app.info = "提交成功";
        })
        .catch(function(data) {
          app.info = "";
          app.error = data.error || data;
        })
    }
  }
});