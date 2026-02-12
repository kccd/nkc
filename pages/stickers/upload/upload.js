import { uploadResourceAsChunks } from '../../lib/js/resource';
const SelectImage = new window.NKC.methods.selectImage();

window.app = new window.Vue({
  el: '#app',
  data: {
    type: 'multiple', // multiple、single
    name: '',
    description: '',
    cover: '',
    coverData: '',
    share: false,
    stickers: [],
    error: '',
    uploading: false,
  },
  computed: {
    disableButton() {
      let disable = true;
      for (const s of this.stickers) {
        if (s.status !== 'uploaded') {
          disable = false;
        }
      }
      return disable;
    },
  },
  methods: {
    getSize: window.NKC.methods.getSize,
    selectLocalFile() {
      window.$('#uploadInput').click();
    },
    selectedLocalFile() {
      const input = window.$('#uploadInput')[0];
      const files = input.files;
      for (let file of files) {
        this.addSticker(file);
      }
    },
    addSticker(file) {
      const self = this;
      this.getStickerByFile(file).then((s) => {
        self.stickers.push(s);
      });
    },
    getStickerByFile(file, filename) {
      const self = this;
      return new Promise((resolve, reject) => {
        const sticker = {
          file,
          progress: 0,
          error: '',
          status: 'unUploaded',
          name: filename || file.name || Date.now() + '.png',
        };
        window.NKC.methods.fileToUrl(file).then((url) => {
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
      SelectImage.show(
        (data) => {
          const file = window.NKC.methods.blobToFile(data);
          self.getStickerByFile(file, sticker.file.name).then((s) => {
            window.Vue.set(self.stickers, index, s);
            SelectImage.close();
          });
        },
        {
          url: sticker.url,
          aspectRatio: 1,
        },
      );
    },
    upload(arr, index) {
      const self = this;
      if (!arr.length || index >= arr.length || !arr[index]) {
        return (self.uploading = false);
      }
      const sticker = arr[index];
      self.uploading = true;
      Promise.resolve()
        .then(() => {
          sticker.status = 'uploading';

          return uploadResourceAsChunks({
            file: sticker.file,
            type: 'sticker',
            filename: sticker.name,
            share: self.share,
            onProgress: (props) => {
              if (props.type === 'uploading') {
                sticker.progress = props.progress;
              }
            },
          });
        })
        .then(() => {
          sticker.status = 'uploaded';
          self.upload(arr, index + 1);
        })
        .catch((data) => {
          sticker.error = data.error || data;
          sticker.status = 'unUploaded';
          self.upload(arr, index + 1);
        });
    },
    submit() {
      const self = this;
      let { stickers } = self;
      stickers = stickers.filter((s) => s.status !== 'uploaded');
      this.upload(stickers, 0);
    },
  },
});
