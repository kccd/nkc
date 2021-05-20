window.selectImage = undefined;
var data = NKC.methods.getDataById("data");
var reg = /^(http|https):\/\//i;
for(var i = 0; i < data.column.links.length; i++) {
  var link = data.column.links[i];
  if(!link.links) {
    link.links = [];
  }
}
var app = new Vue({
  el: "#app",
  data: {
    avatar: "",
    banner: "",
    avatarUrl: NKC.methods.tools.getUrl('columnAvatar', data.column.avatar),
    bannerUrl: NKC.methods.tools.getUrl('columnBanner', data.column.banner),

    column: data.column,

    info: "",
    error: ""
  },
  mounted: function() {
    window.selectImage = new NKC.methods.selectImage();
    NKC.methods.initSelectColor(function(hex, id) {
      app.column[id] = hex;
    });
  },
  methods: {
    contactAdmin: function() {
      nkcAPI("/m/" + this.column._id + "/contact", "POST", {})
        .then(function() {
          screenTopAlert("通知成功，请等待专栏管理员处理");
        })
        .catch(function(data) {
          screenTopWarning(data);
        })
    },
    replaceImageUrl: function(str) {
      str = str.replace(/!\[.*?]\(.*?\)/ig, "");
      return str.replace(/\[.*?]\(.*?\)/ig, "");
    },
    changed: function(arr, index, childIndex) {
      if(index === undefined) {
        return this.column.notice = this.replaceImageUrl(arr);
      }
      var item = arr[index];
      if(item.url) {
        if(childIndex !== undefined) {
          var childItem = item.links[childIndex];
          if(!reg.test(childItem.url)) {
            childItem.url = "http://" + childItem.url;
          }
        } else {
          if(!reg.test(item.url)) {
            item.url = "http://" + item.url;
          }
        }
      } else {
        item.content = this.replaceImageUrl(item.content);
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
      var self = this;
      var formData = new FormData();
      return Promise.resolve()
        .then(function() {
          if(!column.name) throw new Error('请输入专栏名');
          if(!column.abbr) throw new Error('请输入专栏简介');
          if(self.avatar) formData.append('avatar', self.avatar);
          if(self.banner) formData.append('banner', self.banner);
          if(column.notice) formData.append('notice', column.notice);
          formData.append("links", JSON.stringify(column.links));
          formData.append("otherLinks", JSON.stringify(column.otherLinks));
          formData.append("name", column.name);
          formData.append("abbr", column.abbr);
          formData.append("description", column.description);
          formData.append("navCategory", column.navCategory);
          formData.append("perpage", column.perpage);
          formData.append("hideDefaultCategory", column.hideDefaultCategory);
          if(column.color) formData.append("color", column.color);
          if(column.listColor) formData.append("listColor", column.listColor);
          if(column.toolColor) formData.append("toolColor", column.toolColor);
          for(var i = 0; i < column.blocks.length; i++) {
            var block = column.blocks[i];
            if(!block.name) throw new Error("自定义内容标题不能为空");
            if(!block.content) throw new Error("自定义内容不能为空");
            block.show = !!block.show;
          }
          formData.append("blocks", JSON.stringify(column.blocks));
          return uploadFilePromise("/m/" + self.column._id, formData, function(e, a) {
            if(a === 100) {
              app.info = "处理中，请稍候";
            } else {
              app.info = "提交中..." + a + '%';
            }
          }, "PUT")
        })
        .then(function() {
          app.info = '';
          sweetSuccess('提交成功');
        })
        .catch(function(data) {
          app.info = '';
          sweetError(data);
        })
    },
    addLink: function(otherLink) {
      if(otherLink === "otherLinks") {
        this.column.otherLinks.push({
          name: "",
          url: ""
        });
      } else {
        this.column.links.push({
          name: "",
          url: "",
          links: []
        });
      }
    },
    addChildLink: function(index) {
      var link = this.column.links[index];
      if(!link.links) link.links = [];
      link.links.push({
        name: "",
        url: ""
      });
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
    moveChildLink: function(type, parentIndex, index) {
      var links = app.column.links[parentIndex].links;
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
    removeChildLink: function(parentIndex, index) {
      this.column.links[parentIndex].links.splice(index, 1);
    },
    removeLink: function(index, otherLinks) {
      var links;
      if(otherLinks) {
        links = this.column.otherLinks;
      } else {
        links = this.column.links;
      }
      if(links[index].links && links[index].links.length > 0){
        return sweetError("该链接下存在子链接，无法删除");
      }
      links.splice(index, 1);
    },
    addBlock: function() {
      if(this.column.blocks.length >= 5) return;
      this.column.blocks.push({
        name: "",
        content: "",
        show: true
      });
    },
    moveBlock: function(index, type) {
      var otherBlock;
      if(type === "up") {
        if(index === 0) return;
        otherBlock = this.column.blocks[index-1];
        this.column.blocks[index-1] = this.column.blocks[index];
      } else {
        if((index+1) === this.column.blocks.length) return;
        otherBlock = this.column.blocks[index + 1];
        this.column.blocks[index + 1] = this.column.blocks[index];
      }
      Vue.set(this.column.blocks, index, otherBlock);
    },
    deleteBlock: function(index) {
      Vue.delete(this.column.blocks, index);
    },
    replacePerpage: function() {
      var perpage = this.column.perpage;
      perpage = parseInt(perpage);
      if(isNaN(perpage) || perpage <= 0) perpage = 1;
      this.column.perpage = perpage;
    }
  }
});
