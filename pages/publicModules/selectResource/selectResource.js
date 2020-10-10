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
      isApp: NKC.configs.isApp && NKC.configs.platform === 'reactNative',
      uid: "",
      user: "",
      pageType: "list", // list: 资源列表, uploader: 上传
      category: "all", // all: 全部，unused: 未使用, used: 已使用, upload: 正在上传的文件
      resourceType: "", // all, picture, video, audio, attachment
      quota: 16,
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
      croppingPicture: false,
      isTouchEmit: false,
      sizeLimit: null,
    },
    mounted: function() {

    },
    computed: {
      fileSizeLimit: function() {
        var sizeLimit = this.sizeLimit;
        if(!sizeLimit) return '';
        var arr = [];
        arr = arr.concat(sizeLimit.others);
        arr.push({
          ext: '其他',
          size: sizeLimit.default
        });
        var str = '文件大小限制\n', sweetStr = '';
        for(var i = 0; i < arr.length; i++) {
          var a = arr[i];
          if(i > 0) str += '\n';
          str += a.ext.toUpperCase() + '：' + this.getSize(a.size * 1024, 1);
        }
        return str;
      },
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
      getUrl: NKC.methods.tools.getUrl,
      getSize: NKC.methods.tools.getSize,
      checkFileSize: function(filename, size) {
        var sizeLimit = this.sizeLimit;
        if(!sizeLimit) return;
        var ext = filename.split('.');
        ext = ext.pop().toLowerCase();
        var limit;
        for(var i = 0; i < sizeLimit.others.length; i++) {
          var s = sizeLimit.others[i];
          if(s.ext.toLowerCase() === ext) {
            limit = s;
            break;
          }
        }
        if(!limit) limit = {
          ext: ext,
          size: sizeLimit.default
        };
        var _limitSize = limit.size * 1024;
        if(size > _limitSize) throw ext.toUpperCase() + '文件大小不能超过' + this.getSize(_limitSize, 1);
      },
      showFileSizeLimit: function() {
        asyncSweetCustom(this.fileSizeLimit.replace(/\n/ig, '<br>'));
      },
      cancelCropPicture: function() {
        this.resetCropper();
        this.changePageType("list");
      },
      rotate: function(type) {
        if(type === "left") {
          self.cropper.rotate(-90);
        } else {
          self.cropper.rotate(90);
        }
      },
      resetCropper: function() {
        if(self.cropper && self.cropper.destroy) {
          self.cropper.destroy();
        }
      },
      editImage: function(r) {
        this.croppingPicture = false;
        this.changePageType("editPicture");
        setTimeout(function(){
          self.app.resetCropper();
          var $image = $('#moduleSelectResourceEdit');

          $image.cropper({
            viewMode: 1
          });

          self.cropper = $image.data('cropper');
          var src = "";
          if(r.originId) {
            src = "/ro/" + r.originId;
          } else {
            src ="/r/" + r.rid;
          }
          self.cropper.replace(src);
        }, 10);
      },
      cropPicture: function() {
        self.app.croppingPicture = true;
        setTimeout(function() {
          try{
            self.cropper.getCroppedCanvas().toBlob(function(blob) {
              var file = NKC.methods.blobToFile(blob, Date.now() + ".jpg");
              self.app.uploadSelectFile(file);
              self.app.changePageType("list");
              self.app.resetCropper();
            }, "image/jpeg");
          } catch(err) {
            console.log(err);
            self.app.croppingPicture = false;
            sweetError(err);
          }
        }, 10);
      },
      readyPaste: function() {
        var self = this;
        var dom = $("#pasteContent");
        dom.off("paste");
        dom.one("paste", function(e) {
          var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
          var files = clipboardData.items || [];
          var _files = [];
          for(var i = 0; i < files.length; i ++) {
            var file = files[i].getAsFile();
            if(!file) continue;
            _files.push(file);
          }
          if(!_files.length) return;
          self.uploadSelectFile(_files);

          /*var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
          var files = [].slice.call(clipboardData.files);
          if(files.length <= 0) return;
          self.uploadSelectFile(files);*/
        });
      },
      pasteContent: function() {
        // alert(this);
      },
      initModule: function() {
        var height = "43.5rem";
        /*var height = "41.5rem";
        if(this.allowedExt.length !== 1) {
          height = "43.5rem";
        }*/
        self.dom.css({
          height: height
        });
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
        this.resetCropper();
        setTimeout(function() {
          self.app.selectedResources = [];
          self.app.resourceType = "all";
          self.app.category = "all";
        }, 500);
      },
      open: function(callback, options) {
        this.resetDomPosition();
        this.resetCropper();
        self.callback = callback;
        options = options || {};
        self.app.countLimit = options.countLimit || 50;
        self.app.allowedExt = options.allowedExt || ["all", "audio", "video", "attachment", "picture"];
        if(options.resourceType) {
          self.app.resourceType = options.resourceType;
        } else {
          self.app.resourceType = self.app.allowedExt[0];
        }
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
        var url = "/me/media?quota="+this.quota+"&skip="+skip+"&type=" + this.resourceType + "&c=" + this.category + "&t=" + Date.now();
        nkcAPI(url, "GET")
          .then(function(data) {
            self.app.sizeLimit = data.sizeLimit;
            self.app.paging = data.paging;
            self.app.pageNumber = self.app.paging.page + 1;
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
        if(this.files.length >= 20) sweetInfo("最多仅允许20个文件同时上传，请稍后再试。");
        var input = document.getElementById("moduleSelectResourceInput");
        if(input) input.click();
      },
      removeFile: function(index) {
        this.files.splice(index, 1);
      },
      startUpload: function(f) {
        f.error = "";
        this.selectCategory("upload");
        var fileId = null;
        return Promise.resolve()
          .then(function() {
            // if(f.data.size>200*1024*1024) throw "文件大小不能超过200MB";
            self.app.checkFileSize(f.data.name, f.data.size);
            if(f.status === "uploading") throw "文件正在上传...";
            if(f.status === "uploaded") throw "文件已上传成功！";
            f.status = "uploading";
            // 获取文件md5
            return NKC.methods.getFileMD5(f.data)
          })
          .then(function(md5) {
            // 将md5发送到后端检测文件是否已上传
            var formData = new FormData();
            formData.append("type", "checkMD5");
            formData.append("fileName", f.name);
            formData.append("md5", md5);
            fileId = md5;
            return nkcUploadFile("/r", "POST", formData);
          })
          .then(function(data) {
            if(!data.uploaded) {
              // 后端找不到相同md5的文件（仅针对附件），则将本地文件上传
              var formData = new FormData();
              formData.append("file", f.data, f.data.name || (Date.now() + '.png'));
              return nkcUploadFile("/r", "POST", formData, function(e, progress) {
                f.progress = progress;
              }, 60 * 60 * 1000);
            }
          })
          .then(function() {
            f.status = "uploaded";
            var index = self.app.files.indexOf(f);
            self.app.files.splice(index, 1);
          })
          .catch(function(data) {
            f.status = "unUpload";
            f.progress = 0;
            f.error = data.error || data;
            console.log(data);
            screenTopWarning(data.error || data);
          })
      },
      newFile: function(file) {
        return {
          name: file.name,
          ext: file.type.slice(0, 5) === "image"?"picture": "file",
          size: NKC.methods.getSize(file.size, 1),
          data: file,
          error: /*file.size >  200*1024*1024?"文件大小不能超过200MB":*/ "",
          progress: 0,
          status: "unUpload"
        }
      },
      uploadSelectFile: function(f) {
        var self = this;
        if(f.constructor === Array) {
          // 这个数组中文件的顺序和用户选择的顺序相反，即先选的靠后，后选的靠前
          f.forEach(function(file) {
            self.files.push(self.newFile(file));
          });
        } else {
          f = this.newFile(f);
          this.files.unshift(f);
        }
        // return console.log(self.files);
        function uploadFileSeries() {
          var file;
          for(var i = 0; i < self.files.length; i++) {
            var f = self.files[i];
            if(f.status !== 'unUpload' || f.error) continue;
            file = f;
            break;
          }
          // var file = self.files[0];
          if(!file) return Promise.resolve();
          return self.startUpload(file)
            .then(new Promise(function(resolve, _) {
              console.log("【上传成功】", file.name);
              setTimeout(resolve, 1000);
            }))
            .then(function() {
              return uploadFileSeries();
            })
        }
        // var promise = this.startUpload(f);
        return uploadFileSeries()
          .then(function() {
            console.log("【全部上传完成】");
            if(self.category === "upload" && !self.files.length) {
              setTimeout(function() {
                self.category = "all";
                self.getResources(0);
              }, 500)
            }
          })
      },
      // 用户已选择待上传的文件
      selectedFiles: function() {
        var self = this;
        var input = $("#moduleSelectResourceInput")[0];
        // 这个数组中文件的顺序和用户选择的顺序相反，即先选的靠后，后选的靠前
        var files = [].slice.call(input.files);
        input.value = "";
        if(files.length <= 0) return;
        self.uploadSelectFile(files);
      },
      changePageType: function(pageType) {
        var self = this;
        this.pageType = pageType;
        if(pageType === "list") {
          this.crash();
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
      fastSelectResource: function(r) {
        if(this.fastSelect) {
          self.callback(r);
        } else {
          this.selectResource(r);
        }
      },
      selectResource: function(r) {
        var index = this.getIndex(this.selectedResources, r);
        if(index !== -1) {
          this.selectedResources.splice(index, 1);
        } else {
          if(this.selectedResources.length >= this.countLimit) return;
          this.selectedResources.push(r);
        }
      },
      selectResourceType: function(t) {
        this.resourceType = t;
        this.getResources(0);
      },
      takePicture: function() {
        NKC.methods.rn.emit("takePictureAndUpload", {}, function(data) {
          self.app.crash();
        });
      },
      takeVideo: function() {
        NKC.methods.rn.emit("takeVideoAndUpload", {}, function(data) {
          self.app.crash();
        });
      },
      recordAudio: function() {
        NKC.methods.rn.emit("recordAudioAndUpload", {}, function(data) {
          self.app.crash();
        });
      },
      // 预览大图
      /* viewPicture: function(e, resource) {
        // console.log(e);
        if(this.isTouchEmit) return;
        if(resource.mediaType !== "mediaPicture") return;
        clearTimeout(timer);
        var rid = resource.rid;
        $("#moduleSelectResourceViewPicture").css({
          display: "block",
          height: $(window).height(),
          backgroundImage: "url(/r/"+ rid +")"
        })
      },
      closePicture: function() {
        // console.log(9879879);
        var self = this;
        timer = setTimeout(function() {
          $("#moduleSelectResourceViewPicture").css({
            display: "none"
          });
        }, 400);
      },
      onTouch: function() {
        this.isTouchEmit = true;
      } */
    }
  });

  // 拖动上传
  var $dragDom = self.dom.find("#pasteContent");
  var originText = "";
  $dragDom.on({
    dragenter: function(e) {
      e.stopPropagation();
      e.preventDefault();
      originText = $dragDom.text();
      $dragDom.text("松开鼠标上传文件")
    },
    dragleave: function(e) {
      e.stopPropagation();
      e.preventDefault();
      $dragDom.text(originText);
    },
    dragover: function(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    drop: function(e) {
      e.preventDefault();
      e.stopPropagation();
      $dragDom.text(originText);
      var files = [].slice.call(e.originalEvent.dataTransfer.files);
      if(!files.length) return;
      self.app.uploadSelectFile(files);
    }
  });

  // var timer;

  // 监听socket发过来文件转换完成的消息，收到时刷新一下资源列表
  socket.on("message", function(data) {
    if(data.state === "fileProcessFinish") {
      // console.log("文件处理完成");
      // self.app.category = "all";
      self.app.getResources(0);
    }
  })

  // 监听文件处理失败信息
  socket.on("message", function(data) {
    if(data.state === "fileProcessFailed") {
      sweetError("文件处理失败\n" + data.err);
      // self.app.category = "all";
      self.app.getResources(0);
    }
  })

  self.open = self.app.open;
  self.close = self.app.close;
};
