<template lang="pug">
  .share(v-if="!getState.app")
    .share-icon(@click="shareToOther(shareType, 'qq', shareTitle, shareId, shareDescription, shareAvatar)" title="分享给QQ好友")
      img(src='/default/QQ.png')
    .share-icon(@click="shareToOther(shareType, 'qzone', shareTitle, shareId, shareDescription, shareAvatar)" title="分享到QQ空间")
      img(src='/default/qzone.png')
    .share-icon(@click="shareToOther(shareType, 'weibo', shareTitle, shareId, shareDescription, shareAvatar)" title="分享到微博")
      img(src='/default/weibo.png')
    .share-icon(@click="shareShowWeChat()" title="分享到微信")
      img(src='/default/weChat.png')
    .share-icon(title="点击复制分享链接")
      #shareLinkButton
        .fa.fa-link
    .weChat-image
      canvas.qrcode-canvas
</template>
<style lang="less">
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
import {ClipboardJS} from "../../../public/clipboard/clipboard.min";
export default {
  props: ['shareType', 'shareTitle', 'share-id', 'share-description', 'share-avatar'],
  data: () => ({
  }),
  mounted() {
    this.initClipboard();
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
    //实例化复制组件
    initClipboard() {
      // var clipboard = new ClipboardJS('#shareLinkButton', {
      //   text: function(trigger) {
      //     return window.location.origin + window.location.pathname;
      //   }
      // });
      // if(!window.clipboardLoaded) {
      //   clipboard.on('success', function() {
      //     screenTopAlert("链接已复制到粘贴板");
      //   });
      //   window.clipboardLoaded = true;
      // }
    },
    //分享到微信
    shareShowWeChat() {
      $(".weChat-image").toggle();
    },
    //分享到其他
    shareToOther(shareType, type, title, pid, description, avatar) {
      var origin = window.location.origin;
      var lk = origin +'/default/logo3.png';
      if(shareType === "column") {
        lk = origin + "/a/" + avatar
      } else if(shareType === "user") {
        lk = origin + NKC.methods.tools.getUrl('userAvatar', pid)
      }
      var newLink = window.open();
      var str = window.location.origin + window.location.pathname;
      if(str){
        var para = {
          'str': str,
          'type': shareType,
          targetId: pid // 与type类型对应的Id
        };
        nkcAPI('/s', "POST", para)
          .then(function(data) {
            var newUrl = data.newUrl;
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
