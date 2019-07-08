var selectImage;
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
    selectImage = new NKC.methods.selectImage();
    NKC.methods.initSelectColor(function(hex) {
      app.column.color = hex;
    });
  },
  methods: {
    selectedBanner: function(data) {
      this.banner = data;
      fileToUrl(data)
        .then(function(url) {
          app.bannerUrl = url;
          selectImage.close();
        })
    },
    selectedAvatar: function(data) {
      this.avatar = data;
      fileToUrl(data)
        .then(function(url) {
          app.avatarUrl = url;
          selectImage.close();
        })
    },
    selectBanner: function() {
      selectImage.show(function(data){
        app.selectedBanner(data);
      }, {
        aspectRatio: 4,
      });
    },
    selectAvatar: function() {
      selectImage.show(function(data){
        app.selectedAvatar(data);
      }, {
        aspectRatio: 1,
      });
    },
    submit: function() {
      this.error = "";
      this.info = "";
      var column = this.column;
      if(!column.name) return this.error = "请输入专栏名";
      if(!column.abbr) return this.error = "请输入专栏简介";
      // if(!column.description) return this.error = "请输入专栏介绍";
      var formData = new FormData();
      if(this.avatar) {
        formData.append("avatar", this.avatar);
      }
      if(this.banner) {
        formData.append("banner", this.banner);
      }
      if(column.notice) {
        formData.append("notice", column.notice);
      }
      formData.append("links", JSON.stringify(column.links));
      formData.append("otherLinks", JSON.stringify(column.otherLinks));
      formData.append("name", column.name);
      formData.append("abbr", column.abbr);
      formData.append("description", column.description);
      if(column.color) formData.append("color", column.color);
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
    },
    addLink: function(otherLink) {
      if(otherLink) {
        this.column.otherLinks.push({
          name: "",
          url: ""
        });
      } else {
        this.column.links.push({
          name: "",
          url: ""
        });
      }
    },
    moveLink: function(type, index, otherLinks) {
      var links = [];
      if(otherLinks) {
        links = app.column.otherLinks;
      } else {
        links = app.column.links;
      }
      if(type === "up") {
        if(index === 0) return;
        var lastLink = links[index-1];
        Vue.set(links, index-1, links[index]);
        Vue.set(links, index, lastLink);
      } else if(type === "down") {
        if((index + 1) === links.length) return;
        var nextLink = links[index+1];
        Vue.set(links, index+1, links[index]);
        Vue.set(links, index, nextLink);
      }
    },
    removeLink: function(index, otherLinks) {
      if(otherLinks) {
        this.column.otherLinks.splice(index, 1);
      } else {
        this.column.links.splice(index, 1);
      }
    }
  }
});