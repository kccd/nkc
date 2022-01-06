<template lang="pug">
  .module-dialog-body
    download-panel(ref="downloadPanel")
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title(v-if="!resource.type || resource.type === 'file'") 文件详情
      .module-dialog-title(v-else) 文件夹详情
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content(v-if="loading").text-center
      .m-t-5.m-b-5 加载中...
    .module-dialog-content(v-else)
      .r-info-top
        .r-info-cover
          div
            img(:src="getUrl('resourceCover', resource.rid)" v-if="resource && (resource.mediaType !== 'mediaAttachment' && resource.mediaType !== 'mediaAudio')")
            img(:src="getUrl('fileCover', 'folder')" v-else-if="resource.type === 'folder'")
            img(:src="getUrl('fileCover', resource.ext)" v-else)
        .r-info-content
          .r-info-title {{resource.name || resource.oname}}
          .r-info-author
            img(:src="getUrl('userAvatar', resource.resourceUser?resource.resourceUser.avatar: resource.user.avatar, 'sm')")
            a.pointer(@click="visitUrl('/u/' + (resource.rUid || resource.uid), true)") {{resource.resourceUser?resource.resourceUser.username: resource.user.username}}
            span &nbsp;{{resource.type==='folder'?"创建": "上传"}}于 {{format(resource.tlm || resource.toc)}}
          .r-info-size(v-if="resource.type !== 'folder'")
            | 格式：
            span.m-r-1 {{(resource.ext || "未知").toUpperCase()}}
            |大小：
            span {{getSize(resource.size)}}
          .r-info-size(v-if="path")
            div(v-if="typeof path === 'string'") 目录：
              span {{path}}
            div(v-else)
              div(v-for="(p, i) in path") 文库目录{{i+1}}：
                span {{p}}
        .r-info-d {{resource.description || "暂无简介"}}
        .r-info-bottom.text-right(v-if="resource.type !== 'folder'")
          a.m-r-05.btn.btn-default.btn-sm(:href="getUrl('previewPDF', resource.rid)" v-if="resource.ext === 'pdf'" target="_blank") 预览
          a.m-r-05.pointer.btn.btn-success.btn-sm(@click="downloadFile()")
            .fa.fa-cloud-download &nbsp;
            | 点击下载
            span(v-if="resource.hits || (resource.resource && resource.resource.hits)") &nbsp;{{resource.hits ||resource.resource.hits}}
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body {
  display: none;
  position: fixed;
  width: 40rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;

  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;

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
    padding: 0 1rem;
    margin: 1.25rem;
    .r-info-top {
      .r-info-cover {
        display: table-cell;
        div {
          width: 6rem;
          height: 6rem;
          position: relative;
          border: 1px solid #ddd;
          margin-right: 1rem;
          img {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            max-height: 100%;
            max-width: 100%;
          }
        }
      }
      .r-info-content {
        display: table-cell;
        vertical-align: top;
        width: 100%;
        .r-info-title {
          font-size: 1.3rem;
          word-break: break-all;
          font-weight: 700;
        }
        .r-info-author {
          margin-top: 0.5rem;
          img {
            height: 1.4rem;
            width: 1.4rem;
            border-radius: 50%;
            margin-top: -2px;
            margin-right: 2px;
          }
        }
        .r-info-size {
          margin-top: 0.4rem;
          span {
            color: #e85a71;
          }
        }
      }
      .r-info-d {
        background-color: #f4f4f4;
        margin-top: 0.5rem;
        padding: 0.5rem;
        border-radius: 3px;
        word-break: break-all;
        width: 100%;
      }
      .r-info-bottom {
        margin-top: 1rem;
      }
    }
  }
}
</style>

<script>
import {getUrl, getSize, timeFormat} from '../js/tools';
import {DraggableElement} from "../js/draggable";
import {nkcAPI} from '../js/netAPI';
import {visitUrl} from '../js/pageSwitch';
import DownloadPanel from "./DownloadPanel";
export default {
  data: function (){
    return {
      show: false,
      type: "",
      loading: true,
      forums: [],
      resource: "",
      path: "",
      uid: NKC.configs.uid || "",
      modifyAllResource: false
    }
  },
  components: {
    'download-panel': DownloadPanel,
  },
  mounted() {
    this.initDraggableElement();
  },
  computed: {
  },
  methods: {
    getUrl: getUrl,
    visitUrl: visitUrl,
    format: timeFormat,
    getSize: getSize,
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
    },
    getResource: function(rid) {
      const self = this;
      self.type = "resource";
      nkcAPI("/r/" + rid + "/info", "GET")
        .then(function(data) {
          delete data.resource.type;
          self.loading = false;
          self.resource = data.resource;
          self.forums = data.forums;
          self.path = data.path;
          self.modifyAllResource = !!data.modifyAllResource;
        })
        .catch(function(data) {
          sweetError(data);
        });
    },
    getLibrary: function(lid) {
      const self = this;
      self.type = "library";
      nkcAPI("/library/" + lid + "?info=true&path=true", "GET")
        .then(function(data) {
          self.loading = false;
          self.path = data.path;
          self.resource = data.library;
        })
        .catch(function(data) {
          sweetError(data);
        })
    },
    open: function(options) {
      options = options || {};
      this.draggableElement.show();
      this.show = true;
      if(options.lid) {
        this.getLibrary(options.lid);
      } else if(options.rid) {
        this.getResource(options.rid);
      }

    },
    close: function() {
      this.draggableElement.hide();
      this.loading = true;
      this.show = false;
    },
    //直接下载文件
    download: function(rid) {
      const fileName = this.resource.oname;
      nkcAPI("/r/"+rid+"/pay", "POST")
        .then(function() {
          const downloader = document.createElement("a");
          downloader.setAttribute("download", fileName);
          downloader.href = "/r/" + rid;
          downloader.target = "_blank";
          downloader.click();
        })
        .catch(sweetError);
    },
    //积分下载文件
    downloadFile() {
      this.$refs.downloadPanel.open(this.resource.rid);
    }
  }
}
</script>
