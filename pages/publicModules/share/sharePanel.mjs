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
        ]
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
              setTimeout(() => {
                console.log()
                NKC.methods.initQrcodeCanvas();
              }, 2000);

            })
            .catch(sweetError);
        },
        close() {
          self.hidePanel();
        },
        share(type) {

        }
      }
    })
  }
  open(props, options) {
    this.app.open(props, options);
  }
}


$(function() {
  const sharePanel = new SharePanel();
  const shareDom = $('[data-type="share"]');
  for(let i = 0; i < shareDom.length; i++) {
    const dom = shareDom.eq(i);
    dom.on('click', () => {
      const shareType = dom.attr('data-share-type');
      const shareId = dom.attr('data-share-id');
      sharePanel.open({
        shareType,
        shareId,
      });
    })
  }
  sharePanel.open({
    shareType: 'post',
    shareId: '888055'
  })
});


