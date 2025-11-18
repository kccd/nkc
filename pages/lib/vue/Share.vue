<template lang="pug">
  .share-panel-icons
    .share-panel-icon(v-for='p in platforms' @click='share(p.type)')
      img(:src="getUrl('defaultFile', p.type + '.png')")
    .share-panel-icon(@click="share('copy')" ref="clipboardButton")
      .fa.fa-link
    canvas(ref="weChatCanvas" v-show='showQR')
</template>
<style lang="less" scoped>
  .share-panel-icons{
    text-align: center;
    .share-panel-header{
      text-align: left;
    }
    .share-panel-icon{
      height: 3rem;
      width: 3rem;
      display: inline-block;
      margin: 0 0.5rem;
      cursor: pointer;
      line-height: 3rem;
      text-align: center;
      background-color: #f4f4f4;
      border-radius: 50%;
      img{
        width: 50%;
        height: 50%;
      }
    }
  }
</style>
<script>
import {nkcAPI} from "../js/netAPI";
import {sweetError} from "../js/sweetAlert";
import {screenTopAlert, screenTopWarning} from "../js/topAlert";
import {fixUrl} from "../js/url";
import {getUrl} from "../js/tools";
import ClipboardJS from "../../../public/clipboard/clipboard.min";

export default {
  props: ['type', 'id'],
  data: () => ({
    content: {
      title: '',
      cover: '',
      desc: '',
      url: '',
    },
    loaded: false,
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
    usedClipboardButton: null,
  }),
  computed: {
    panelTitle() {
      return this.title || this.defaultTitle;
    },
    shareUrl() {
      return window.location.origin + this.content.url;
    }
  },
  methods: {
    getUrl,
    setShareInfo(type, id) {
      const self = this;
      return nkcAPI(`/s`, 'POST', {
        type,
        id
      })
        .then((res) => {
          const {shareContent} = res;
          self.content.title = shareContent.title;
          self.content.cover = shareContent.cover;
          self.content.desc = shareContent.desc;
          self.content.url = shareContent.url;
        })
    },
    share(type) {
      let newWindow = null;
      const self = this;
      if(['QQ', 'qzone', 'weibo'].includes(type)) {
        newWindow = window.open();
      }
      return Promise.resolve()
        .then(() => {
          if(!self.loaded) {
            return self.setShareInfo(self.type, self.id)
              .then(() => {
                return self.renderQR();
              });
          }
        })
        .then(() => {
          if(type === 'wechat') {
            return self.showQR = !self.showQR;
          }
          const {url, title, desc, cover} = self.content;
          const fixedUrl = fixUrl(url);
          const fixedCover = fixUrl(cover);
          if(type === 'copy') {
            if(self.usedClipboardButton !== self.$refs.clipboardButton) {
              self.clipboard = new ClipboardJS(self.$refs.clipboardButton, {
                text: function(trigger) {
                  return fixedUrl;
                }
              });
              self.clipboard.on('success', function() {
                screenTopAlert("链接已复制到粘贴板");
              });
              self.usedClipboardButton = self.$refs.clipboardButton;
              self.$refs.clipboardButton.click();
            }
            return;
          }
          if(type === 'QQ') {
            newWindow.location = `http://connect.qq.com/widget/shareqq/index.html?url=${fixedUrl}&title=${title}&pics=${fixedCover}&summary=${desc}`;
          } else if(type === 'qzone') {
            newWindow.location=`https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${fixedUrl}&title=${title}&pics=${fixedCover}&summary=${desc}`;
          } else {
            newWindow.location=`http://v.t.sina.com.cn/share/share.php?url=${fixedUrl}&title=${title}&pic=${fixedCover}`;
          }
        })
        .catch(err => {
          newWindow.close();
          sweetError(err)
        });
    },
    renderQR() {
      const {url} = this.content;
      const fixedUrl = fixUrl(url);
      QRCode.toCanvas(this.$refs.weChatCanvas, fixedUrl, (err) => {
        if(err) screenTopWarning(err.message || err.toString())
      })
    }
  }
}
</script>
