NKC.modules.SelectResource = function() {
  var self = this;
  self.dom = $("#moduleSelectResource");
  self.dom.draggable({
    scroll: false,
    handle: ".module-sr-title",
    drag: function(event, ui) {
      if(ui.position.top < 0) ui.position.top = 0;
      var height = $(window).height();
      if(ui.position.top > height - 30) ui.position.top = height - 30;
      var width = self.dom.width();
      if(ui.position.left < 100 - width) ui.position.left = 100 - width;
      var winWidth = $(window).width();
      if(ui.position.left > winWidth - 100) ui.position.left = winWidth - 100;
    }
  });
  self.app = new Vue({
    el: "#moduleSelectResourceApp",
    data: {
      uid: "",
      user: "",
      pageType: "list", // list: 资源列表, uploader: 上传
      category: "all", // all: 全部，unused: 未使用, used: 已使用
      resourceType: "", // all, picture, video, audio, attachment
      quota: 20,
      paging: {},
      pageNumber: "",
      resources: [],
      allowedExt: [],
      countLimit: 10,
      selectedResources: [],
      loading: true,
      fastSelect: false,
      pictureExt: ['swf', 'jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'],
      files: [],
    },
    mounted: function() {

    },
    computed: {
      show: function() {
        var obj = {};
        var allowedExt = this.allowedExt;
        if(allowedExt.indexOf("audio") !== -1) {
          obj.audio = true;
        }
        if(allowedExt.indexOf("video") !== -1) {
          obj.video = true;
        }
        if(allowedExt.indexOf("picture") !== -1) {
          obj.picture = true;
        }
        if(allowedExt.indexOf("attachment") !== -1) {
          obj.attachment = true;
        }
        if(
          allowedExt.indexOf("all") !== -1 ||
          (obj.audio && obj.video && obj.picture && obj.attachment)
        ) {
          obj.all = true;
        }
        return obj
      },
      windowWidth: function() {
        return $(window).width();
      },
      windowHeight: function() {
        return $(window).height();
      },
      screenType: function() {
        return this.windowWidth < 700? "sm": "md";
      },
      selectedResourcesId: function() {
        var arr = [];
        var selectedResources = this.selectedResources;
        for(var i = 0; i < selectedResources.length; i++) {
          var r = selectedResources[i];
          if(arr.indexOf(r.rid) === -1) {
            arr.push(r.rid);
          }
        }
        return arr;
      }
    },
    methods: {
      initModule: function() {
        self.dom.draggable({
          scroll: false,
          handle: ".module-sr-title",
          drag: function(event, ui) {
            if(ui.position.top < 0) ui.position.top = 0;
            var height = $(window).height();
            if(ui.position.top > height - 30) ui.position.top = height - 30;
            var width = self.dom.width();
            if(ui.position.left < 100 - width) ui.position.left = 100 - width;
            var winWidth = $(window).width();
            if(ui.position.left > winWidth - 100) ui.position.left = winWidth - 100;
          }
        });
      },
      destroyModule: function() {
        self.dom.draggable("destroy");
      },
      resetDomPosition: function() {
        var dom = self.dom;
        var width = $(window).width();
        var height = $(window).height();
        if(width < 700) {
          // 小屏幕
          dom.css({
            "width": width * 0.8,
            "top": 0,
            "right": 0
          });
        } else {
          // 宽屏
          dom.css("left", (width - dom.width())*0.5);
        }
      },
      close: function() {
        self.dom.hide();
        this.destroyModule();
        setTimeout(function() {
          self.app.selectedResources = [];
          self.app.resourceType = "all";
        }, 500);
      },
      open: function(callback, options) {
        this.resetDomPosition();
        self.callback = callback;
        options = options || {};
        self.app.countLimit = options.countLimit || 10;
        self.app.allowedExt = options.allowedExt || ["all", "audio", "video", "attachment", "picture"];
        self.app.resourceType = self.app.allowedExt[0];
        self.app.pageType = options.pageType || "list";
        self.app.fastSelect = options.fastSelect || false;
        self.app.getResources(0);
        this.initModule();
        self.dom.show();
      },
      selectCategory: function(c) {
        this.category = c;
        this.getResources(0);
      },
      getResources: function(skip) {
        var url = "/me/media?quota="+this.quota+"&skip="+skip+"&type=" + this.resourceType + "&c=" + this.category;
        nkcAPI(url, "GET")
          .then(function(data) {
            self.app.paging = data.paging;
            self.app.pageNumber = self.app.paging.page + 1;
            for(var i = 0; i < data.resources.length; i++) {
              var resource = data.resources[i];
              var ext = resource.ext;
              if(ext === "mp4") {
                resource.fileType = "video";
              } else if(ext === "mp3") {
                resource.fileType = "audio";
              } else if(self.app.pictureExt.indexOf(ext) !== -1) {
                resource.fileType = "picture";
              } else {
                resource.fileType = "attachment";
              }
            }
            self.app.resources = data.resources;
            self.app.loading = false;
          })
          .catch(function(data) {
            sweetError(data);
          })
      },
      changePage: function(type) {
        var paging = this.paging;
        if(paging.buttonValue.length <= 1) return;
        if(type === "last" && paging.page === 0) return;
        if(type === "next" && paging.page + 1 === paging.pageCount) return;
        var count = type === "last"? -1: 1;
        this.getResources(paging.page + count);
      },
      clickInput: function() {
        var input = document.getElementById("moduleSelectResourceInput");
        if(input) input.click();
      },
      removeFile: function(index) {
        this.files.splice(index, 1);
      },
      startUpload: function(f) {
        f.error = "";
        if(f.data.size>200*1024*1024) return f.error = "文件大小不能超过200MB";
        if(f.status === "uploading") return sweetWarning("文件正在上传...");
        if(f.status === "uploaded") return sweetWarning("文件已上传成功！");
        var formData = new FormData();
        formData.append("file", f.data);
        f.status = "uploading";
        nkcUploadFile("/r", "POST", formData, function(e, progress) {
          f.progress = progress;
        })
          .then(function() {
            f.status = "uploaded";
          })
          .catch(function(data) {
            f.status = "unUpload";
            f.progress = "0%";
            f.error = data.error || data;
          })
        // 上传文件
      },
      newFile: function(file) {
        return {
          name: file.name,
          ext: file.type.slice(0, 5) === "image"?"picture": "file",
          size: NKC.methods.getSize(file.size),
          data: file,
          error: file.size >  200*1024*1024?"文件大小不能超过200MB":"",
          progress: 0,
          status: "unUpload"
        }
      },
      // 用户已选择待上传的文件
      selectedFiles: function() {
        var input = document.getElementById("moduleSelectResourceInput");
        if(!input) return;
        var files = input.files;
        if(files.length <= 0) return;
        for(var i = 0; i < files.length; i++) {
          var f = files[i];
          f = this.newFile(f);
          this.files.unshift(f);
          this.startUpload(f);
        }
        input.value = "";
      },
      changePageType: function(pageType) {
        var self = this;
        this.pageType = pageType;
        if(pageType === "list") {
          this.crash();
        } else {
          if(!this.files.length) {
            setTimeout(function() {
              self.clickInput();
            }, 50);
          }
        }
      },
      crash: function() {
        var paging = this.paging;
        this.getResources(paging.page);
      },
      done: function() {
        var selectedResources = this.selectedResources;
        var selectedResourcesId = this.selectedResourcesId;
        self.callback({
          resources: selectedResources,
          resourcesId: selectedResourcesId
        });
        self.close();
      },
      fastSelectPage: function() {
        var pageNumber = this.pageNumber - 1;
        var paging = this.paging;
        if(!paging || !paging.buttonValue.length) return;
        var lastNumber = paging.buttonValue[paging.buttonValue.length - 1].num;
        if(pageNumber < 0 || lastNumber < pageNumber) return sweetInfo("输入的页数超出范围");
        this.getResources(pageNumber);
      },
      getIndex: function(arr, r) {
        var index = -1;
        for(var i = 0; i < arr.length; i++) {
          if(arr[i].rid === r.rid) {
            index = i;
            break;
          }
        }
        return index;
      },
      visitUrl: function(url) {
        NKC.methods.visitUrl(url, true);
      },
      removeSelectedResource: function(index) {
        this.selectedResources.splice(index, 1);
      },
      selectResource: function(r) {
        if(this.fastSelect) {
          self.callback(r);
        } else {
          var index = this.getIndex(this.selectedResources, r);
          if(index !== -1) {
            this.selectedResources.splice(index, 1);
          } else {
            if(this.selectedResources.length >= this.countLimit) return;
            this.selectedResources.push(r);
          }
        }
      },
      selectResourceType: function(t) {
        this.resourceType = t;
        this.getResources(0);
      },
    }
  });
  self.open = self.app.open;
  self.close = self.app.close;
};