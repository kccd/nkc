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
    normalPictureWatermarkData: '',
    normalPictureWatermarkFile: '',
    smallPictureWatermarkData: '',
    smallPictureWatermarkFile: '',
    normalVideoWatermarkData: '',
    normalVideoWatermarkFile: '',
    smallVideoWatermarkData: '',
    smallVideoWatermarkFile: '',
  },
  computed: {
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    getWatermark(val, type, status) {
      return this.getUrl(val, type, status) + '&date=' + Date.now();
    },
    resetFile() {
      this.normalPictureWatermarkData = '';
      this.normalPictureWatermarkFile = '';
      this.smallPictureWatermarkData = '';
      this.smallPictureWatermarkFile = '';
      this.normalVideoWatermarkData = '';
      this.normalVideoWatermarkFile = '';
      this.smallVideoWatermarkData = '';
      this.smallVideoWatermarkFile = '';
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
    //选择图片水印图片
    selectedPictureWatermark(c = 'normal') {
      const input = this.$refs[`${c}PictureWatermarkInput`];
      const files = input.files;
      if(!files || !files.length) return;
      const file = files[0];
      const self = this;
      NKC.methods.fileToUrl(file)
        .then(data => {
          self[`${c}PictureWatermarkData`] = data;
          self[`${c}PictureWatermarkFile`] = file;
        })
    },
    //选择视频水印图片
    selectedVideoWatermark(c = 'normal') {
      const input = this.$refs[`${c}VideoWatermarkInput`];
      const files = input.files;
      if(!files || !files.length) return;
      const file = files[0];
      const self = this;
      NKC.methods.fileToUrl(file)
        .then(data => {
          self[`${c}VideoWatermarkData`] = data;
          self[`${c}VideoWatermarkFile`] = file;
        })
    },
    // 新增一条视频码率控制配置
    addVideoVBRControlConfig() {
      this.us.videoVBRControl.configs.push({
        type: "width",
        from: 0,
        to: 0,
        bv: 1.16
      });
    },
    // 删除一条视频码率控制配置
    deleteVideoVBRControlConfig(index) {
      this.us.videoVBRControl.configs.splice(index, 1);
    },
    submit: function() {
      const us = JSON.parse(JSON.stringify(this.us));
      const {extensionLimit} = us;
      const {normalPictureWatermarkFile, smallPictureWatermarkFile, normalVideoWatermarkFile, smallVideoWatermarkFile} = this;
      const self = this;
      const normalPictureWatermarkInput = this.$refs.normalPictureWatermarkInput;
      const normalVideoWatermarkInput = this.$refs.normalVideoWatermarkInput;
      const smallPictureWatermarkInput = this.$refs.smallPictureWatermarkInput;
      const smallVideoWatermarkInput = this.$refs.smallVideoWatermarkInput;
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

      // 校验视频码率控制的配置是否合法
      let {ret, err} = verifyVideoVBRControlConfig(us.videoVBRControl);
      if(!ret) {
        return sweetError(err);
      }

      const formData = new FormData();
      return Promise.resolve()
        .then(() => {
          formData.append('uploadSettings', JSON.stringify(us));
          if(normalPictureWatermarkFile) {
            formData.append('normalPictureWatermark', normalPictureWatermarkFile);
          }
          if(smallPictureWatermarkFile) {
            formData.append('smallPictureWatermark', smallPictureWatermarkFile);
          }
          if(normalVideoWatermarkFile) {
            formData.append('normalVideoWatermark', normalVideoWatermarkFile);
          }
          if(smallVideoWatermarkFile) {
            formData.append('smallVideoWatermark', smallVideoWatermarkFile);
          }
          console.log('formData', formData);
          return nkcUploadFile('/e/settings/upload', 'PUT', formData);
        })
        .then(data => {
          console.log(formData);
          sweetSuccess('保存成功');
          normalPictureWatermarkInput.value = null;
          normalVideoWatermarkInput.value = null;
          smallPictureWatermarkInput.value = null;
          smallVideoWatermarkInput.value = null;
          self.resetFile();
        })
        .catch(sweetError);
    }
  }
});




// 校验视频码率控制的配置是否合法
function verifyVideoVBRControlConfig(data) {
  let {configs} = data;
  for(let config of configs) {
    if(config.from < 0 || config.to < 0 || config.bv < 0) {
      return {ret: false, err: "视频尺寸范围和平均码率均不能小于0"};
    }
    if(config.from >= config.to) {
      return {ret: false, err: `${config.from} 到 ${config.to}不是一个合理的范围`};
    }
    for(let sample of configs) {
      if(config === sample) continue;
      if(config.type !== sample.type) continue;
      if(isOverlap({start: config.from, end: config.to}, {start: sample.from, end: sample.to})) {
        return {ret: false, err: "视频尺寸范围存在重叠部分"};
      }
    }
  }
  return {ret: true};
}

// 判断两个区间是否有重叠(反证)(区间包括开始不包括结尾)
function isOverlap(a, b) {
  if(a.start === a.end || b.start === b.end) return false;
  // a 在 b 前面或者 a 在 b 后面
  if(a.end <= b.start || a.start >= b.end) return false;
  return true;
}

Object.assign(window, {
  extensionLimit,
  verifyVideoVBRControlConfig,
  isOverlap,
});
