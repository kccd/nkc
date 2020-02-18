NKC.modules.SelectSticker = function() {
  var self = this;
  self.dom = $("#moduleSelectSticker");
  self.app = new Vue({
    el: "#moduleSelectStickerApp",
    data: {
      type: "own",
      pageNumber: "",
      perpage: 20,
      sharePerpage: 24,
      emoji: [],
      share: false,
      localStickers: [],
      stickers: [],
      paging: {}
    },
    mounted: function () {
    
    },
    methods: {
      getUrl: NKC.methods.tools.getUrl,
      initModule() {
        var height = "43.5rem";
        self.dom.css({
          height: height
        });
        self.dom.draggable({
          scroll: false,
          handle: ".module-ss-title",
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
          dom.css("left", (width - dom.width())*0.5 -  40);
        }
      },
      selectType(type) {
        this.type = type;
        if(["own", "share"].includes(type)) {
          this.getStickers();
        }
      },
      changePage(type) {
        const paging = this.paging;
        if(paging.buttonValue.length <= 1) return;
        if(type === "last" && paging.page === 0) return;
        if(type === "next" && paging.page + 1 === paging.pageCount) return;
        const count = type === "last"? -1: 1;
        this.getStickers(paging.page + count);
      },
      getStickers(page = 0) {
        const {type} = this;
        if(!["own", "share"].includes(type)) return;
        let url = `/sticker?page=${page}&c=own&reviewed=true&perpage=${this.perpage}`;
        if(type === "share") {
          url = `/stickers?page=${page}&perpage=${this.sharePerpage}`;
        }        
        nkcAPI(url, "GET")
          .then(data => {
            self.app.stickers = data.stickers;
            self.app.paging = data.paging;
            if(data.emoji) {
              self.app.emoji = data.emoji;
            }
          })
          .catch(sweetError);
      },
      fastSelectPage() {
        const pageNumber = this.pageNumber - 1;
        const paging = this.paging;
        if(!paging || !paging.buttonValue.length) return;
        const lastNumber = paging.buttonValue[paging.buttonValue.length - 1].num;
        if(pageNumber < 0 || lastNumber < pageNumber) return sweetInfo("输入的页数超出范围");
        this.getStickers(pageNumber);
      },
      selectSticker(sticker) {
        self.callback({
          type: "sticker",
          data: sticker
        });
      },
      selectEmoji(emoji) {
        self.callback({
          type: "emoji",
          data: emoji
        });
      },
      addLocalFile(file) {
        this.fileToSticker(file)
          .then(sticker => {
            self.app.localStickers.push(sticker);
            self.app.uploadLocalSticker(sticker);
          })
      },
      fileToSticker(file) {
        return new Promise((resolve, reject) => {
          const sticker = {file};
          sticker.status = "unUploaded";
          sticker.progress = 0;
          NKC.methods.fileToUrl(file)
            .then(base64 => {
              sticker.url = base64;
              resolve(sticker);
            })
            .catch(reject);
        });
        
      },
      selectedLocalFile() {
        const input = $("#moduleSelectStickerInput");
        const files = input[0].files;
        for(let i = 0; i < files.length; i ++) {
          const file = files[i];
          self.app.addLocalFile(file);
        }
      },
      selectLocalFile() {
        $("#moduleSelectStickerInput").click();
      },
      uploadLocalSticker(sticker) {
        Promise.resolve()
          .then(() => {
            sticker.status = "uploading";
            const formData = new FormData();
            formData.append("file", sticker.file);
            formData.append("type", "sticker");
            formData.append("fileName", sticker.file.name);
            if(self.app.share) {
              formData.append("share", "true");
            }
            return nkcUploadFile("/r", "POST", formData, function(e, progress) {
              sticker.progress = progress;
            });
          })
          .then(() => {
            sticker.status = "uploaded";
            self.app.localStickers.splice(self.app.localStickers.indexOf(sticker), 1);
            if(!self.app.localStickers.length) self.app.selectType("own");
          })
          .catch((data) => {
            screenTopWarning(data.error || data);
            sticker.error = data.error || data;
            sticker.status = "unUploaded";
          });
      },
      restartUpload(s) {
        this.uploadLocalSticker(s);
      },
      open(callback, options) {
        self.callback = callback;
        this.resetDomPosition();
        this.initModule();
        self.dom.show();
        this.getStickers();
      },
      close() {
        self.dom.hide();
      }
    }
  });
  self.open = self.app.open;
  self.close = self.app.close;
};