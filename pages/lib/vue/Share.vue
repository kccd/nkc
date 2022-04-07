<template lang="pug">
  .share-box.m-b-1
    .panel-header 分享链接
    .share(v-if="!getState.app")
      .share-icon(@click="shareToOther(shareType, 'qq', shareTitle, shareId, shareDescription, shareAvatar)" title="分享给QQ好友")
        img(src='/default/QQ.png')
      .share-icon(@click="shareToOther(shareType, 'qzone', shareTitle, shareId, shareDescription, shareAvatar)" title="分享到QQ空间")
        img(src='/default/qzone.png')
      .share-icon(@click="shareToOther(shareType, 'weibo', shareTitle, shareId, shareDescription, shareAvatar)" title="分享到微博")
        img(src='/default/weibo.png')
      .share-icon(@click="shareShowWeChat()" title="分享到微信")
        img(src='/default/weChat.png')
      .share-icon(title="点击复制分享链接" @click="copyUrl")
        #shareLinkButton
          .fa.fa-link
      .weChat-image
        canvas.qrcode-canvas
</template>
<style lang="less" scoped>
.share-box{
  padding: 15px;
  transition: box-shadow 300ms;
}
.share{
  padding: 0;
  font-size: 0;
  text-align: center;
}
.share-icon{
  width: 3rem;
  height: 3rem;
  line-height: 3rem;
  display: inline-block;
  margin-right: 1px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.1);
}
.share-icon>*{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  height: 3rem;
  width: 100%;
  padding: 7px;
  transition: top 200ms;
}
.share-icon>*:hover{
  top: -20%
}
.share-icon>div{
  line-height: 3rem;
  text-align: center;
}
.share .fa{
  font-size: 1.6rem;
  color: #777;
}
.weChat-image{
  text-align: center;
  margin-top: 1rem;
  display: none;
}
</style>
<script>
import {getState} from "../js/state";
import {screenTopAlert} from "../js/topAlert";
export default {
  props: ['shareType', 'shareTitle', 'share-id', 'share-description', 'share-avatar'],
  data: () => ({
  }),
  mounted() {
    this.initQrcodeCanvas();
  },
  computed: {
    description() {
      const {shareDescription} = this;
      const reg = /[\n\r]/ig;
      const description = (shareDescription || '').replace(reg, '');
      return description;
    }
  },
  methods: {
    getState: getState,
    copyUrl() {
      const copyTest = window.location.href;
      const input = document.createElement('input');
      input.value = copyTest;
      document.body.appendChild(input);
      input.select();
      document.execCommand('Copy');
      input.className = 'oInput';
      input.style.display = 'none';
      screenTopAlert('复制成功');
    },
    initQrcodeCanvas() {
      const toCanvas = function(dom) {
        const url = dom.getAttribute('data-url');
        let path = dom.getAttribute("data-path");
        let origin = dom.getAttribute("data-origin");
        if (!origin) origin = window.location.origin;
        if (!path) path = window.location.pathname;
        QRCode.toCanvas(dom, url ? url : (origin + path), {
          margin: 1,
          width: 114,
          color: {
            dark: "#333333"
          }
        }, function (err, url) {
          if (err) {
            console.log(err);
            screenTopWarning(err);
          } else {
            dom.setAttribute('data-init', 'true');
          }
        });
      }
      const qrcodeCanvas = document.getElementsByClassName("qrcode-canvas");
      for (let i = 0; i < qrcodeCanvas.length; i++) {
        const dom = qrcodeCanvas[i];
        const init = dom.getAttribute("data-init");
        if (init === 'true') continue;
        toCanvas(dom);
      }
    },
    //分享到微信
    shareShowWeChat() {
      $(".weChat-image").toggle();
    },
    //分享到其他
    shareToOther(shareType, type, title, pid, description, avatar) {
      const origin = window.location.origin;
      var lk = origin +'/default/logo3.png';
      if(shareType === "column") {
        lk = origin + "/a/" + avatar
      } else if(shareType === "user") {
        lk = origin + NKC.methods.tools.getUrl('userAvatar', pid)
      }
      const newLink = window.open();
      const str = window.location.origin + window.location.pathname;
      if(str){
        const para = {
          'str': str,
          'type': shareType,
          targetId: pid // 与type类型对应的Id
        };
        nkcAPI('/s', "POST", para)
          .then(function(data) {
            let newUrl = data.newUrl;
            if(data.newUrl.indexOf('http') !== 0) {
              newUrl = origin + newUrl;
            }
            if(type === "qq") {
              newLink.location='http://connect.qq.com/widget/shareqq/index.html?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+description;
            }
            if(type === "qzone") {
              newLink.location='https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+newUrl+'&title='+title+'&pics='+lk+'&summary='+description;
            }
            if(type === "weibo") {
              newLink.location='http://v.t.sina.com.cn/share/share.php?url='+newUrl+'&title='+title+'&pic='+lk;
            }
          })
          .catch(function(data) {
            screenTopWarning(data || data.error);
          })
      }
    }
  }
}
</script>
