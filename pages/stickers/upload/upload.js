const SelectImage = new NKC.methods.selectImage();
window.app = new Vue({
  el: "#app",
  data: {
    type: "multiple", // multiple、single
    name: "",
    description: "",
    cover: "",
    coverData: "",
    share: false,
    stickers: [],
    error: "",
    uploading: false
  },
  computed: {
    disableButton() {
      let disable = true;
      for(const s of this.stickers) {
        if(s.status !== "uploaded") disable = false;
      }
      return disable;
    },
  },
  methods: {
    getSize: NKC.methods.getSize,
    selectLocalFile() {
      $("#uploadInput").click();
    },
    selectedLocalFile() {
      const input = $("#uploadInput")[0];
      const files = input.files;
      for(let file of files) {
        this.addSticker(file);
      }
    },
    addSticker(file){
      const self = this;
      this.getStickerByFile(file)
        .then(s => {
          self.stickers.push(s);
        })
    },
    getStickerByFile(file, filename) {
      const self = this;
      return new Promise((resolve, reject) => {
        const sticker = {
          file,
          progress: 0,
          error: "",
          status: "unUploaded",
          name: filename || file.name || (Date.now() + ".png")
        };
        NKC.methods.fileToUrl(file)
          .then(url => {
            sticker.url = url;
            resolve(sticker);
          });
      });
    },
    removeFormArr(arr, index) {
      arr.splice(index, 1);
    },
    cropImage(sticker) {
      const index = this.stickers.indexOf(sticker);
      const self = this;
      SelectImage.show(data => {
        const file = NKC.methods.blobToFile(data);
        self.getStickerByFile(file, sticker.file.name)
          .then(s => {
            Vue.set(self.stickers, index, s);
            SelectImage.close();
          })
      }, {
        url: sticker.url,
        aspectRatio: 1
      })
    },
    upload(arr, index) {
      const self = this;
      if(!arr.length || index >= arr.length || !arr[index]) {
        return self.uploading = false;
      }
      const sticker = arr[index];
      self.uploading = true;
      Promise.resolve()
        .then(() => {
          sticker.status = "uploading";
          var formData = new FormData();
          formData.append("file", sticker.file);
          formData.append("type", "sticker");
          formData.append("fileName", sticker.name);
          if(self.share) {
            formData.append("share", "true");
          }
          return nkcUploadFile("/r", "POST", formData, function(e, progress) {
            sticker.progress = progress;
          });
        })
        .then(() => {
          sticker.status = "uploaded";
          self.upload(arr, index + 1);
        })
        .catch((data) => {
          sticker.error = data.error || data;
          sticker.status = "unUploaded";
          self.upload(arr, index + 1);
        })
    },
    submit() {
      const self = this;
      let {stickers} = self;
      stickers = stickers.filter(s => s.status !== "uploaded");
      this.upload(stickers, 0);
    }
  }
});