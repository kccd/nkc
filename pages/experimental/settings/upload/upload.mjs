var data = NKC.methods.getDataById("data");
const {extensionLimit} = data.uploadSettings;
extensionLimit._defaultWhitelist = extensionLimit.defaultWhitelist.join(', ');
extensionLimit._defaultBlacklist = extensionLimit.defaultBlacklist.join(', ');
extensionLimit.others.map(o => {
  o._blacklist = o.blacklist.join(', ');
  o._whitelist = o.whitelist.join(', ');
});
data.uploadSettings.watermark.buyNoWatermark /= 100;
window.app = new Vue({
  el: "#app",
  data: {
    us: data.uploadSettings,
    certList: data.certList,
    normalWatermarkData: '',
    normalWatermarkFile: '',
    smallWatermarkData: '',
    smallWatermarkFile: '',
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    resetFile() {
      this.normalWatermarkData = '';
      this.normalWatermarkFile = '';
      this.smallWatermarkData = '';
      this.smallWatermarkFile = '';
    },
    addSizeLimit() {
      this.us.sizeLimit.others.push({
        ext: '',
        size: 0
      });
    },
    addCountLimit() {
      this.us.countLimit.others.push({
        type: '',
        count: 0
      })
    },
    addExtensionLimit() {
      this.us.extensionLimit.others.push({
        type: '',
        using: 'blacklist',
        blacklist: [],
        whitelist: [],
        _blacklist: '',
        _whitelist: ''
      })
    },
    removeFromArr(arr, index) {
      arr.splice(index, 1)
    },
    selectedWatermark(c = 'normal') {
      const input = this.$refs[`${c}WatermarkInput`];
      const files = input.files;
      if(!files || !files.length) return;
      const file = files[0];
      const self = this;
      NKC.methods.fileToUrl(file)
        .then(data => {
          self[`${c}WatermarkData`] = data;
          self[`${c}WatermarkFile`] = file;
        })
    },
    submit: function() {
      const us = JSON.parse(JSON.stringify(this.us));
      const {extensionLimit} = us;
      const {normalWatermarkFile, smallWatermarkFile} = this;
      const self = this;
      const normalWatermarkInput = this.$refs.normalWatermarkInput;
      const smallWatermarkInput = this.$refs.smallWatermarkInput;
      extensionLimit.defaultBlacklist = extensionLimit._defaultBlacklist.split(',').map(e => e.trim());
      extensionLimit.defaultWhitelist = extensionLimit._defaultWhitelist.split(',').map(e => e.trim());
      extensionLimit.others.map(o => {
        o.blacklist = o._blacklist.split(',').map(e => e.trim());
        o.whitelist = o._whitelist.split(',').map(e => e.trim());
        delete o._blacklist;
        delete o._whitelist;
      });
      // 积分乘以100用于存储
      us.watermark.buyNoWatermark *= 100;

      const formData = new FormData();
      return Promise.resolve()
        .then(() => {
          formData.append('uploadSettings', JSON.stringify(us));
          if(normalWatermarkFile) {
            formData.append('normalWatermark', normalWatermarkFile);
          }
          if(smallWatermarkFile) {
            formData.append('smallWatermark', smallWatermarkFile);
          }
          return nkcUploadFile('/e/settings/upload', 'PUT', formData);
        })
        .then(data => {
          sweetSuccess('保存成功');
          normalWatermarkInput.value = null;
          smallWatermarkInput.value = null;
          const {normalAttachId, smallAttachId} = data.uploadSettings.watermark;
          self.us.watermark.normalAttachId = normalAttachId;
          self.us.watermark.smallAttachId = smallAttachId;
          self.resetFile();
        })
        .catch(sweetError);
    }
  }
});

