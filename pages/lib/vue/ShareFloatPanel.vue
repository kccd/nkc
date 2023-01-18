<template lang="pug">
  .float-share-panel
    .float-share-panel-header
      .float-share-panel-header-title(ref="draggableHandle") {{panelTitle}}
      .float-share-panel-header-button(@click="close")
        .fa.fa-remove
    .float-share-panel-container(v-if="loading")
      .p-t-2.p-b-2.text-center 加载中...
    .float-share-panel-container(v-else)
      .float-share-panel-body
        .float-share-panel-cover(:style="`background-image:url(${content.cover})`")
        .float-share-panel-content
          .float-share-panel-title {{content.title}}
          .float-share-panel-desc {{content.desc}}
          .float-share-panel-url {{shareUrl}}
      hr.float-share-panel-hr
      .float-share-panel-icons
        .float-share-panel-icon(v-for='p in platforms' @click='share(p.type)')
          img(:src="getUrl('defaultFile', p.type + '.png')")
        .float-share-panel-icon(@click="share('copy')" ref="clipboardButton")
          .fa.fa-link
        canvas(ref="weChatCanvas" v-show='showQR')
</template>

<style lang="less" scoped>
  @import '../../publicModules/base';
  .float-share-panel{
    display: none;
    width: 30rem;
    position: fixed;
    background-color: #fff;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    border: 1px solid #f0f0f0;
    .float-share-panel-header{
      cursor: move;
      @buttonSize: 3rem;
      height: @buttonSize;
      line-height: @buttonSize;
      background-color: #dadada;
      padding-left: 1rem;
      position: relative;
      padding-right: @buttonSize;
      .float-share-panel-header-button{
        height: @buttonSize;
        width: @buttonSize;
        line-height: @buttonSize;
        text-align: center;
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        &:hover{
          background-color: red;
          color: #fff;
        }
      }
    }
    .float-share-panel-container{
      padding: 0.8rem;
      .float-share-panel-body{
        @coverHeight: 5rem;
        @coverWidth: 6rem;
        position: relative;
        padding-left: @coverWidth + 0.5rem;
        .float-share-panel-cover{
          height: @coverHeight;
          width: @coverWidth;
          border-radius: 3px;
          background-position: center;
          background-size: cover;
          position: absolute;
          top: 0;
          left: 0;
        }
        .float-share-panel-content{
          .float-share-panel-title{
            font-size: 1.3rem;
            height: 1.8rem;
            word-break: break-word;
            overflow: hidden;
            .hideText(@line: 1);
            margin-bottom: 0.2rem;
          }
          .float-share-panel-desc{
            font-size: 1rem;
            max-height: 1.3rem;
            margin-bottom: 0.2rem;
            word-break: break-word;
            overflow: hidden;
            .hideText(@line: 1);
            color: #616161;
          }
          .float-share-panel-url{
            word-break: break-word;
            overflow: hidden;
            font-style: oblique;
            color: #616161;
            .hideText(@line: 1);
          }
        }
      }
      .float-share-panel-hr{
        margin: 1rem 0;
      }
      .float-share-panel-icons{
        text-align: center;
        .float-share-panel-icon{
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
    }

  }
</style>

<script>
  import {DraggableElement} from "../js/draggable";
  import {nkcAPI} from "../js/netAPI";
  import {sweetError} from "../js/sweetAlert";
  import {screenTopAlert, screenTopWarning} from "../js/topAlert";
  import {fixUrl} from "../js/url";
  import {getUrl} from "../js/tools";
  import ClipboardJS from "../../../public/clipboard/clipboard.min";
  import QRCode from 'qrcode/build/qrcode.min';

  export default {
    data: () => ({
      title: '',
      content: {
        title: '',
        cover: '',
        desc: '',
        url: '',
      },
      type: '',
      id: '',
      loading: true,
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
      defaultTitle: '分享',
      showQR: false,
      clipboard: null,
      usedClipboardButton: null,
    }),
    mounted() {
      this.initDraggableElement();
    },
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
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
        this.draggableElement.setPositionCenter();
      },
      destroyDraggableElement() {
        this.draggableElement.destroy();
      },
      setShareInfo(type, id) {
        const self = this;
        return nkcAPI(`/s`, 'POST', {
          type,
          id
        })
          .then((res) => {
            const {shareContent} = res;
            self.type = type;
            self.id = id;
            self.content.title = shareContent.title;
            self.content.cover = shareContent.cover;
            self.content.desc = shareContent.desc;
            self.content.url = shareContent.url;
          })
      },
      share(type) {
        if(type === 'wechat') {
          return this.showQR = !this.showQR;
        }
        const {url, title, desc, cover} = this.content;
        const fixedUrl = fixUrl(url);
        const fixedCover = fixUrl(cover);
        if(type === 'copy') {
          if(this.usedClipboardButton !== this.$refs.clipboardButton) {
            this.clipboard = new ClipboardJS(this.$refs.clipboardButton, {
              text: function(trigger) {
                return fixedUrl;
              }
            });
            this.clipboard.on('success', function() {
              screenTopAlert("链接已复制到粘贴板");
            });
            this.usedClipboardButton = this.$refs.clipboardButton;
            this.$refs.clipboardButton.click();
          }
          return;
        }
        const newWindow = window.open();
        if(type === 'QQ') {
          newWindow.location = `http://connect.qq.com/widget/shareqq/index.html?url=${fixedUrl}&title=${title}&pics=${fixedCover}&summary=${desc}`;
        } else if(type === 'qzone') {
          newWindow.location=`https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${fixedUrl}&title=${title}&pics=${fixedCover}&summary=${desc}`;
        } else {
          newWindow.location=`http://v.t.sina.com.cn/share/share.php?url=${fixedUrl}&title=${title}&pic=${fixedCover}`;
        }
      },
      renderQR() {
        const {url} = this.content;
        const fixedUrl = fixUrl(url);
        QRCode.toCanvas(this.$refs.weChatCanvas, fixedUrl, (err) => {
          if(err) screenTopWarning(err.message || err.toString())
        })
      },
      showPanel() {
        this.draggableElement.show();
      },
      close() {
        this.draggableElement.hide();
      },
      open(type, id) {
        const self = this;
        self.loading = true;
        this.draggableElement.show();
        return this.setShareInfo(type, id)
          .then(() => {
            self.loading = false;
          })
          .then(() => {
            self.renderQR();
          })
          .catch(sweetError);
      }
    }
  }
</script>
