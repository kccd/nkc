<template lang="pug">
  .moment-files(
    v-if="filesData.length > 0"
    :data-file-type="fileType"
    :data-file-count="fileCount"
    )
    .moment-file(
      v-for="(fileData, index) in filesData"
      :style="fileData.fileContainerStyle"
      :class="fileData.fileContainerClass"
      )
      .moment-file-container(
        v-if="fileType === types.picture"
        :style="fileData.pictureContainerStyle"
        :class="fileData.pictureContainerClass"
        )
        img(
          @click="viewPictures(index)"
          :src="fileData.url"
          :alt="fileData.filename"
          :title="fileData.filename"
          )
      .moment-file-container(v-else)
        video-player(:file="fileData")


</template>

<style lang="less" scoped>
  .moment-files{
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
      &.fix-size{
        position: relative;
      }
      .moment-file-container {
        background-size: cover;
        background-position: center;
        padding-top: 100%;
        position: relative;
        background-color: #eee;
        &.fix-size{
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        img {
          position: absolute;
          //min-height: 100%;
          min-width: 100%;
          display: block;
          top: 0;
          left: 0;
          opacity: 0;
          filter: alpha(opacity=0);
          z-index: 10;
        }
      }
    }
    &[data-file-count="1"] {
      .moment-file {
        width: @maxWidth - @margin;
        .moment-file-container {
          padding: 0;
          display: block;
          width: 100%;

          img {
            position: relative;
            max-width: 100%;
          }
        }
      }

    }

    &[data-file-count="2"], &[data-file-count="4"] {
      .moment-file {
        width: (@maxWidth - 2 * @margin) / 2;
      }
    }
  }
</style>

<script>
  import VideoPlayer from '../VideoPlayer';
  import {openImageViewer} from "../../js/imageViewer";

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
      'video-player': VideoPlayer
    },
    data: () => ({
      types: {
        picture: 'picture',
        video: 'video'
      }
    }),
    computed: {
      fileCount() {
        return this.data.length;
      },
      fileType() {
        return this.data.length > 0? this.data[0].type: '';
      },
      filesData() {
        const {data, types} = this;
        const filesData = [];
        for(const file of data) {
          const fileData = JSON.parse(JSON.stringify(file));

          fileData.fileContainerStyle = '';
          fileData.fileContainerClass = '';

          fileData.pictureContainerStyle = '';
          fileData.pictureContainerClass = '';

          fileData.videoContainerStyle = '';
          fileData.videoContainerClass = '';

          // 设置图片容器的上层容器
          if(
            fileData.type === types.picture &&
            fileData.length === 1 &&
            file.height &&
            file.width
          ) {
            const fileContainerPaddingTop = fileData.height * 100 / fileData.width;
            fileData.fileContainerStyle = `padding-top: ${fileContainerPaddingTop}%`;
            fileData.fileContainerClass = `fix-size`;
            fileData.pictureContainerClass = 'fix-size';
          }

          if(fileData.type === types.picture) {
            fileData.pictureContainerStyle = `background-image: url(${fileData.url})`;
          }

          filesData.push(fileData);
        }
        return filesData
      }
    },
    methods: {
      viewPictures(index) {
        const {filesData} = this;
        const images = [];
        for(const fileData of filesData) {
          if(fileData.type !== 'picture') continue;
          images.push({
            url: fileData.urlLG || fileData.url,
            name: fileData.filename
          });
        }
        if(images.length === 0) return;
        openImageViewer(images, index);
      },
    }
  }
</script>
