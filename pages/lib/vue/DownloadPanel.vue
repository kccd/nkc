<template lang="pug">
  .module-dialog-body
    .module-dialog-header
      .module-dialog-title(ref="draggableHandle") 文件下载
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .draggable-panel-loading.p-t-2.p-b-3.text-center(v-if='loading') 加载中...
      .draggable-panel-loading.p-t-1.p-b-3.text-center(v-else-if='errorInfo')
        .text-center.m-b-1.text-danger {{errorInfo}}
        button.btn.btn-default.btn-md.btn-sm.m-r-05(@click='reload') 重新加载
        button.btn.btn-default.btn-md.btn-sm.m-r-05(@click='toLogin') 登录
        button.btn.btn-default.btn-md.btn-sm.m-r-05(@click='toRegister') 注册
      .draggable-panel-content(v-else-if='resource')
        .download-panel
          .m-b-1.bg-warning.text-warning.p-a-05.bg-border.download-warning(v-if='downloadWarning') {{downloadWarning}}
          .file-base-info.m-b-1
            .file-name.m-b-05 文件名称：
              strong {{resource.defaultFile.name}}
            .file-size.m-b-05 下载次数：{{resource.hits}}
            .file-user.m-b-05 上传用户：
              img.user-avatar(:src='getUrl("userAvatar", uploader.avatar)')
              a(:href='getUrl("userHome", uploader.uid)' target="_blank") {{uploader.username}}
            .m-b-05(v-if='resource.isFileExist')
              .file-score.m-b-05 所需积分：
                span(v-if='needScore') {{costScores}}，{{holdScores}}
                span(v-else-if='freeReason === "self"') 用户自己上传的资源下载免费
                span(v-else-if='freeReason === "setting"') 下载当前附件免费
                span(v-else) {{description}}
              .m-b-05(v-if='!needScore || enough')
                .m-b-05.file-links(v-if='links.length')
                  span 下载地址：
                  a.file-link(v-for='l in links' @click='visitUrl(l)') {{l.name}}
              .m-b-05.bg-danger.p-a-05.text-center.bg-border.text-danger(v-else)
                | 积分不足，
                a(href='/account/finance/recharge' target='_blank') 去充值
            div.bg-danger.p-a-05.text-center.bg-border.text-danger(v-else) 文件已丢失
          .m-b-1.bg-info.text-info.p-a-05.bg-border.download-warning(v-if='downloadTime') 你在&nbsp;
            strong {{downloadTime}}
            | &nbsp;下载过当前文件。
          .download-count-limit(v-if="fileCountLimitInfo")
            hr
            download-file-limit(:data="fileCountLimitInfo")

</template>
<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body {
  display: none;
  font-size: 1.2rem;
  position: fixed;
  width: 40rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 0;

  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    padding-right: 3rem;
    .module-dialog-close {
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }

    .module-dialog-title {
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }

  .module-dialog-content {
    .download-panel{
      padding: 0.5rem;
    }
    .user-avatar{
      height: 1.4rem;
      width: 1.4rem;
      border-radius: 50%;
      margin-right: 0.3rem;
    }
    .file-links{
      .file-link{
        margin-right: 0.5rem;
        text-decoration: underline;
        cursor: pointer;
        display: inline-block;
      }
    }
  }
}
</style>
<script>
import {RNDownloadFile} from '../js/reactNative'
import {getState} from '../js/state';
import {getUrl, timeFormat} from '../js/tools';
import {DraggableElement} from '../js/draggable';
import DownloadFileLimit from './DownloadFileLimit';
import {toLogin} from "../js/account";

export default {
  components: {
    'download-file-limit': DownloadFileLimit,
  },
  data: function (){
    return {
      loading: true,
      error: false,
      errorInfo: '',
      rid: '',
      resource: null,
      fileCountLimitInfo: [],
      userScores: [],
      downloadTime: '',
      needScore: false, // 是否需要积分
      freeReason: 'settings',
      description: '',
      enough: false,
      uploader: null,
      freeTime: 0, // 租期，超过后需重新支付
      downloadWarning: ''
    }
  },
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
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
  methods: {
    getUrl: getUrl,
    timeFormat: timeFormat,
    toLogin() {
      toLogin('login');
    },
    toRegister() {
      toLogin('register');
    },
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      this.draggableElement.setPositionCenter()

    },
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
          const {isApp} = getState();
          if(isApp) {
            RNDownloadFile(resource.oname, url);
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
      this.errorInfo = '';
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
            downloadLog
          } = res;
          this.downloadTime = downloadLog? this.timeFormat(downloadLog.toc): '';
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
          this.errorInfo = err.error || err.message || err;
        })
    },
    open(rid) {
      this.draggableElement.show();
      this.rid = rid;
      this.loading = true;
      this.getResourceInfo();
    },
    close() {
      this.draggableElement.hide();
    },
  }
}
</script>
