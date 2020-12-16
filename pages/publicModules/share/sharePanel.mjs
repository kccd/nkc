class SharePanel extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleSharePanel`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        shareType: '',
        shareId: '',
        url: '',
        cover: '',
        title: '',
        description: '',
        platforms: [
          {
            type: 'wechat',
          },
          {
            type: 'QQ',
          },
          {
            type: 'qzone',
          },
          {
            type: 'weibo'
          }
        ],
        showQR: false,
        clipboard: null,
      },
      computed: {

      },
      mounted() {

      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open(options = {}) {
          self.showPanel();
          const {shareType, shareId} = options;
          self.app.shareType = shareType;
          self.app.shareId = shareId;
          const url = `/s?type=${shareType}&id=${shareId}`;
          nkcAPI(url, 'GET')
            .then(data => {
              const {url, cover, title, description} = data.result;
              self.app.url = window.location.origin + url;
              self.app.cover = cover;
              self.app.title = title;
              self.app.description = description;
              self.app.loading = false;
              const qr = $('.wechat-container.qrcode-canvas');
              qr.attr('data-init', 'false');
              setTimeout(() => {
                NKC.methods.initQrcodeCanvas();
              }, 500);
            })
            .catch(sweetError);
        },
        close() {
          this.showQR = false;
          self.app.loading = true;
          self.hidePanel();
        },
        share(type) {
          if(type === 'wechat') {
            return this.showQR = !this.showQR;
          }
          const {url, title, description, cover} = this;
          if(type === 'copy') {
            if(this.clipboard) return;
            this.clipboard = new ClipboardJS('#sharePanelButton', {
              text: function(trigger) {
                return self.app.url;
              }
            });
            return this.clipboard.on('success', function() {
              screenTopAlert("链接已复制到粘贴板");
            });
          }
          const newWindow = window.open();
          const pic = window.location.origin + cover;
          if(type === 'QQ') {
            newWindow.location = `http://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&pics=${pic}&summary=${description}`;
          } else if(type === 'qzone') {
            newWindow.location=`https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${title}&pics=${pic}&summary=${description}`;
          } else {
            newWindow.location=`http://v.t.sina.com.cn/share/share.php?url=${url}&title=${title}&pic=${pic}`;
          }
        }
      }
    })
  }
  open(props, options) {
    this.app.open(props, options);
  }
}
const sharePanel = new SharePanel();

NKC.methods.initSharePanel = () => {
  const shareDom = $('[data-type="share"]');
  for(let i = 0; i < shareDom.length; i++) {
    const dom = shareDom.eq(i);
    const init = dom.attr(`data-init`);
    if(init === 'true') continue;
    dom.on('click', () => {
      const shareType = dom.attr('data-share-type');
      const shareId = dom.attr('data-share-id');
      sharePanel.open({
        shareType,
        shareId,
      });
    })
  }
};

$(function() {
  NKC.methods.initSharePanel();
});
