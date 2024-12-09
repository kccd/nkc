<template lang="pug">
  div(
    v-if="filesData && filesData.length > 0"
    :data-file-count="fileCount"
    :class=" isZoneDetail ? 'moment-files-detail' : 'moment-files' "
    )
    .moment-file(
      v-for="(fileData, index) in filesData"
      :style="fileData.fileContainerStyle"
      :class="fileData.fileContainerClass"
      )
      .moment-file-container(v-if=" fileData.type === types.video && (filesData.length===1 || isZoneDetail) ")
        video-player(:file="fileData")
      .moment-file-container(
        v-else="fileData.type === types.picture"
        :style="`${fileData.pictureContainerStyle}`"
        :class="fileData.pictureContainerClass"
        @click="viewMedias(index)"
        v-long-press="() => longPress(index)"
        )
        img(
          :class="{'lazyload': true}"
          :data-src=" fileData.type === types.picture ? (isZoneDetail? fileData.url: fileData.urlMD) : fileData.coverUrl"
          :alt="fileData.filename"
          :title="fileData.filename"
          :data-count="filesData.length > 1? 'more-than-one' : 'only-one'"
          :data-direction="fileData.height > fileData.width? 'ver': 'hor'"
          )
        .play-icon(v-if="fileData.type === types.video")
          play-one(size="24" theme="filled")
        //span.fa.fa-play-circle-o(v-if="fileData.type === types.video " class='play-icon')
</template>

<style lang="less" scoped>
.moment-files {
  font-size: 0;
  @maxHeight: 30rem;
  @maxWidth: 100%;
  @margin: 1%;
  .moment-file {
    font-size: 0;
    overflow: hidden;
    cursor: pointer;
    display: inline-block;
    width: (@maxWidth - 3 * @margin) / 3;
    margin: 0 @margin @margin 0;
    &.fix-size {
      position: relative;
    }
    .moment-file-container {
      background-size: cover;
      background-position: center;
      padding-top: 100%;
      position: relative;
      background-color: #eee;
      &.fix-size {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      img {
        &[data-count="more-than-one"] {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          &[data-direction='ver'] {
            width: 100%;
          }
          &[data-direction='hor'] {
            height: 100%;
          }
        }
        &[data-count="only-one"]{
          max-width: 100%;
          top: 0;
          left: 0;
          filter: alpha(opacity=0);
          z-index: 10;
        }
      }
      .play-icon {
        color: #ffffff;
        position: absolute;
        height: 3.2rem;
        width: 3.2rem;
        background-color: rgba(0, 179, 255, 0.9);;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: color 0.2s;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
      }
      &:hover {
        .play-icon {
          background-color: rgba(0, 179, 255, 1);;
        }
      }
    }
    // .moment-video-container{
    //   .videoImg{
    //     width: (@maxWidth - 3 * @margin) / 3;
    //   }
    // }
  }
  &[data-file-count='1'] {
    .moment-file {
      width: @maxWidth - @margin;
      .moment-file-container {
        padding: 0;
        display: block;
        width: 100%;
        // max-height: 200rem;

        img {
          position: relative;
          max-width: 100%;
        }
      }
    }
  }

  &[data-file-count='2'],
  &[data-file-count='4'] {
    .moment-file {
      width: (@maxWidth - 2 * @margin) / 2;
    }
  }
}
.moment-files-detail {
  font-size: 0;
  .moment-file {
    font-size: 0;
    overflow: hidden;
    cursor: pointer;
    margin: 1% auto;
    padding: 0;
    display: block;
    width: 100%;
    .moment-file-container {
      background-size: contain;
      background-position: left center;
      background-repeat: no-repeat;
      width: 100%;
      position: relative;
      img {
        position: relative;
        max-width: 100%;
        display: block;
        top: 0;
        left: 0;
        z-index: 10;
      }
      .play-icon {
        font-size: 3rem;
        color: rgba(0, 179, 255, 0.8);
        position: absolute;
        top: 10rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: color 0.2s;
        display: inline-block;
      }
      &:hover {
        .play-icon {
          color: #00b3ff;
          font-size: 3.5rem;
        }
      }
    }
  }
}
</style>

<script>
import { openImageViewer } from '../../js/imageViewer';
import { RNViewVideo } from '../../js/reactNative';
import { longPressImage } from '../../js/reactNative';
import { getState } from '../../js/state';
import VideoPlayer from '../VideoPlayer';
import {PlayOne} from '@icon-park/vue'
const { isApp } = getState();
export default {
  /*
   * prop {[Object]} data
   *   @param {String} rid 资源ID
   *   @param {String} type 资源类型 video, picture
   *   @param {String} filename 文件名
   *   @param {Boolean} disabled 资源是否被屏蔽
   *   @param {Boolean} lost 资源是否已丢失
   *   图片特有
   *   @param {Number} height 高度
   *   @param {Number} width 宽度
   *   视频特有
   *   @param {String} coverUrl 视频封面（类型为图片时为空）
   *   @param {Boolean} visitorAccess 游客是否有权限直接查看视频
   *   @param {String} mask 视频遮罩内容
   *   @param {[Object]} sources
   *     @param {String} url 视频链接
   *     @param {String} height 视频分辨率 480p、720p、1080p
   *       @param {Number} dataSize 视频大小
   *
   * */
  props: ['data'],
  components: {
    'video-player': VideoPlayer,
    'play-one': PlayOne,
  },
  data: () => ({
    types: {
      picture: 'picture',
      video: 'video',
    },
    isApp,
  }),
  computed: {
    fileCount() {
      return this.data.length;
    },
    filesData() {
      const { data, types } = this;
      const filesData = [];
      if (data) {
        // console.log(data);

        for (const file of data) {
          const fileData = JSON.parse(JSON.stringify(file));
          fileData.fileContainerStyle = '';
          fileData.fileContainerClass = '';

          fileData.pictureContainerStyle = '';
          fileData.pictureContainerClass = '';

          fileData.videoContainerStyle = '';
          fileData.videoContainerClass = '';

          // 设置图片容器的上层容器
          if (
            fileData.type === types.picture &&
            fileData.length === 1 &&
            file.height &&
            file.width
          ) {
            const fileContainerPaddingTop =
              (fileData.height * 100) / fileData.width;
            fileData.fileContainerStyle = `padding-top: ${fileContainerPaddingTop}%`;
            fileData.fileContainerClass = `fix-size`;
            fileData.pictureContainerClass = 'fix-size';
          }

          // if(fileData.type === types.picture) {
          //   fileData.pictureContainerStyle = `background-image: url(${fileData.url})`;
          // }

          filesData.push(fileData);
        }
      }
      if (filesData.length === 1) {
        filesData.forEach((item) => {
          if (item?.type === types.picture && !this.isZoneDetail) {
            let tempStyle = item.pictureContainerStyle;
            item.pictureContainerStyle =
              'max-height: 36rem;background-size: contain;background-position: left;background-color:transparent;background-repeat: no-repeat;' +
              tempStyle;
          }
        });
      }
      return filesData;
    },
    isZoneDetail() {
      return this.$route && this.$route.name === 'MomentDetail';
    },
  },
  methods: {
    viewMedias(index) {
      const { filesData } = this;
      let readyFiles = [];
      // 需要判断是否在RN中打开
      if (isApp) {
        // 判断点击的类型是视频还是还是图片，暂时处理==》视频：过滤所有的图片；图片：过滤掉所有的视频
        const clickType = filesData[index]?.type;
        const clickRid = filesData[index]?.rid;
        let tempArray = [];
        if (clickType === 'video') {
          readyFiles = filesData.filter((item) => item.type === 'video');
          if (readyFiles.length === 0) return;
          const $index = readyFiles.findIndex((item) => item.rid === clickRid);
          RNViewVideo(readyFiles,$index);
          // window.RootApp.$refs.preview.setData(true, $index , readyFiles);
          // window.RootApp.$refs.preview.init($index);
        } else if (clickType === 'picture') {
          tempArray = filesData.filter((item) => item.type === 'picture');
          for (const fileItem of tempArray) {
            readyFiles.push({
              ...fileItem,
              url: fileItem.urlLG || fileItem.url,
              name: fileItem.filename,
            });
          }
          if (readyFiles.length === 0) return;
          openImageViewer(
            readyFiles,
            readyFiles.findIndex((item) => item.rid === clickRid),
          );
        }
      } else {
        for (const fileData of filesData) {
          if (fileData.type === 'video') {
            readyFiles.push({ ...fileData });
          } else if (fileData.type === 'picture') {
            readyFiles.push({
              ...fileData,
              url: fileData.urlLG || fileData.url,
            });
          }
        }
        if (readyFiles.length === 0) return;
        window.RootApp.$refs.preview.setData(true, index, readyFiles);
        window.RootApp.$refs.preview.init(index);
      }
    },
    longPress(index){
      const { filesData, isZoneDetail } = this;
      if(isApp && isZoneDetail){
        const clickType = filesData[index]?.type;
        if(clickType === 'picture' ){
          longPressImage({images:[{url:filesData[index].url,name:filesData[index].filename }],index:0});
        }

      }
    }
  },
};
</script>
