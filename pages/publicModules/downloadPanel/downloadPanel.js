class DownloadPanel extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleDownloadPanel`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        error: false,
        rid: '',
        resource: null,
        fileCountLimitInfo: [],
        userScores: [],
        needScore: false, // 是否需要积分
        freeReason: 'settings',
        description: '',
        enough: false,
        uploader: null,
        freeTime: 0, // 租期，超过后需重新支付
        downloadWarning: ''
      },
      computed: {
        costScores() {
          const {userScores, needScore} = this;
          let str = '';
          if(!needScore) return str;
          const arr = [];
          for(const us of userScores) {
            const {addNumber, name, unit} = us;
            if(addNumber === 0) continue;
            arr.push(`${name} ${addNumber * -1 / 100} ${unit}`);
          }
          return str + arr.join('、');
        },
        holdScores() {
          const {userScores, needScore} = this;
          let str = '你当前剩余';
          if(!needScore) return str;
          const arr = [];
          for(const us of userScores) {
            const {addNumber, name, unit, number} = us;
            if(addNumber === 0) continue;
            arr.push(`${name} ${number / 100} ${unit}`);
          }
          return str + arr.join('、');
        },
        links() {
          const {mediaType, rid, videoSize, fileSize} = this.resource;
          const arr = [];
          if(mediaType === 'mediaVideo') {
            for(const vs of videoSize) {
              const {height, dataSize, size} = vs;
              arr.push({
                url: this.getUrl('resourceDownload', rid, size),
                name: `${height}p(${dataSize})`
              });
            }
          } else {
            arr.push({
              url: this.getUrl('resourceDownload', rid),
              name: `点击下载(${fileSize})`
            })
          }
          return arr;
        }
      },
      mounted() {

      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        visitUrl({name, url}) {
          url = url + `&time=${Date.now()}`
          const {needScore, rid, resource} = this;
          return Promise.resolve()
            .then(() => {
              if(needScore) {
                return nkcAPI(`/r/${rid}/pay?time=${Date.now()}`, 'POST', {})
              }
            })
            .then(() => {
              if(NKC.configs.isApp) {
                NKC.methods.rn.downloadFile(resource.oname, url);
              } else {
                window.location.href = url;
              }
              const self = this;
              setTimeout(() => {
                self.getResourceInfo();
              }, 1000);
            })
            .catch(sweetError);
        },
        reload() {
          this.loading = true;
          this.error = false;
          this.getResourceInfo();
        },
        getResourceInfo() {
          const {rid} = this;
          nkcAPI(`/r/${rid}/detail`, 'GET', {})
            .then(res => {
              const {
                needScore,
                freeReason,
                description,
                userScores,
                enough,
                resource,
                uploader,
                fileCountLimitInfo,
                downloadWarning,
                freeTime,
              } = res;
              this.resource = resource;
              this.needScore = needScore;
              this.uploader = uploader;
              this.freeReason = freeReason;
              this.description = description;
              this.userScores = userScores;
              this.enough = enough;
              this.fileCountLimitInfo = fileCountLimitInfo;
              this.freeTime = freeTime;
              this.downloadWarning = downloadWarning;
              this.loading = false;
            })
            .catch(err => {
              console.log(err);
              this.loading = false;
              this.error = true;
              sweetError(err);
            })
        },
        open(rid) {
          this.rid = rid;
          this.loading = true;
          self.showPanel();
          this.getResourceInfo();
        },
        close() {
          self.hidePanel();
        },
      }
    })
  }
  open(props, options) {
    this.app.open(props, options);
  }
}

(() => {
  NKC.modules.DownloadPanel = DownloadPanel;
  NKC.instance.downloadPanel = new NKC.modules.DownloadPanel();
  document.addEventListener('click', (e) => {
    const element = $(e.target);
    const type = element.attr('data-type');
    const rid = element.attr('data-id');
    if(type !== 'downloadPanel' || !rid) return;
    NKC.instance.downloadPanel.open(rid);
    e.preventDefault();
  });
})();