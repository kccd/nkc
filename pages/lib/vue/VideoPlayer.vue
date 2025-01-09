<template lang="pug">
  .video-player
    div(style="position: fixed; left: 0; top:0; z-index: 1000;")
      download-panel(ref="downloadPanel")
    div(v-if="file")
      .video-mask(v-if="showMask")
        .video-mask-container
          .video-mask-content {{maskContent}}
          .video-mask-buttons(v-if="noPermission")
            button 登录
            button 注册
          .video-mask-buttons(v-else)
            button(@click="openDownloadPanel")
              .fa.fa-cloud-download
              span 点击下载
            button(@click="play")
              .fa.fa-play-circle
              span 预览
      .video-mask(v-if="!showMask && showAPP " style="background-color: transparent;" @click="viewVideoForApp")
        .video-mask-container     
      video.plyr-dom(
        ref='videoDom'
        :data-poster="file.coverUrl"
        :data-plyr-title="file.filename"
        )
        source(
          v-for="source in file.sources"
          :src="source.url"
          :size="source.height"
          :data-size="source.dataSize"
          )
</template>
<style lang="less">
.video-player {
  position: relative;
  .video-mask {
    font-size: 1.2rem;
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    display: table;
    padding: 0 1rem;
    .video-mask-container {
      display: table-cell;
      vertical-align: middle;
      width: 100%;
      .video-mask-content {
        color: #fff;
        margin-bottom: 1rem;
        text-align: center;
      }
      .video-mask-buttons {
        text-align: center;
        & > * {
          margin-right: 0.5rem;
          border: none;
          margin-bottom: 0.5rem;
          cursor: pointer;
          font-size: 1.2rem;
          border-radius: 2px;
          display: inline-block;
          color: #fff;
          background-color: rgba(0, 179, 255, 0.7);
          height: 2.4rem;
          line-height: 2.4rem;
          padding: 0 0.5rem;
          .fa {
            margin-right: 0.3rem;
          }
          text-decoration: none;
          &:hover {
            text-decoration: none;
            opacity: 0.8;
          }
          &:active {
            text-decoration: none;
          }
        }
      }
    }
  }
  video {
    width: 100%;
  }
}
</style>
<script>
import '../../../public/external_pkgs/plyr/plyr.css';
import '../../../public/external_pkgs/plyr/plyr.polyfilled.min.js';
import Plyr from '../../../public/external_pkgs/plyr/plyr.min.js';
import { getState } from '../js/state';
import DownloadPanel from '../vue/DownloadPanel';
const state = getState();
export default {
  /*
   * prop {Object} video
   *   @param {String} rid 资源ID
   *   @param {String} filename 文件名
   *   @param {String} coverUrl 视频封面（类型为图片时为空）
   *   @param {Boolean} visitorAccess 游客是否有权限直接查看视频
   *   @param {String} mask 视频遮罩内容
   *   @param {[Object]} sources
   *     @param {String} url 视频链接
   *     @param {String} height 视频分辨率 480p、720p、1080p
   *     @param {Number} dataSize 视频大小
   * */
  props: ['file', 'ratio'],
  components: {
    'download-panel': DownloadPanel,
  },
  data: () => ({
    player: null,
    isVisitor: !state.uid,
    maskRemoved: false,
    visitorMask: '视频暂不能访问，请登录试试',
    showAPP: state.isApp && state.appVersionCode >= 5,
  }),
  computed: {
    // 当前用户是否有权限观看视频
    noPermission() {
      const { isVisitor, file } = this;
      const { visitorAccess } = file;
      return isVisitor && !visitorAccess;
    },
    // 是否显示遮罩
    showMask() {
      const { noPermission, maskRemoved } = this;
      const { mask } = this.file;
      return !maskRemoved && (noPermission || !!mask);
    },
    // 遮罩内容
    maskContent() {
      const { noPermission, file, visitorMask } = this;
      const { mask = '' } = file;
      return noPermission ? visitorMask : mask;
    },
  },
  updated() {
    this.initPlayer();
  },
  mounted() {
    this.initPlayer();
  },
  methods: {
    initPlayer() {
      this.player = new Plyr(this.$refs.videoDom, {
        ratio: this.ratio ? this.ratio : '4:3',
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        settings: ['quality', 'speed'],
        quality: { default: 480, options: [1080, 720, 480] },
        blankVideo: '/external_pkgs/plyr/blank.mp4',
        autopause: true,
      });
    },
    hideMask() {
      this.maskRemoved = true;
    },
    play() {
      if (state.isApp && state.appVersionCode >= 5) {
        window.RootApp.viewVideoForApp(this.file.rid);
      } else {
        this.hideMask();
        this.player.play();
      }
    },
    openDownloadPanel() {
      this.$refs.downloadPanel.open(this.file.rid);
    },
    viewVideoForApp() {
      window.RootApp.viewVideoForApp(this.file.rid);
    },
  },
};
</script>
