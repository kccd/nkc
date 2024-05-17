<template lang="pug">
  .moment-files(
    v-if="filesData && filesData.length > 0"
    :data-file-count="fileCount"
    )
    .moment-file(
      v-for="(fileData, index) in filesData"
      :style="fileData.fileContainerStyle"
      :class="fileData.fileContainerClass"
      )
      .moment-file-container(v-if="fileData.type === types.video && filesData.length===1 ")
        video-player(:file="fileData")
      .moment-file-container(
        v-else="fileData.type === types.picture"
        :style=" `background-image: url(${fileData.url || fileData.coverUrl});${fileData.pictureContainerStyle}` "
        :class="fileData.pictureContainerClass"
        @click="viewMedias(index)"
        )
        img(
          :src=" fileData.type === types.picture ? fileData.url : fileData.coverUrl"
          :alt="fileData.filename"
          :title="fileData.filename"
          )
        span.fa.fa-play-circle-o(v-if="fileData.type === types.video " class='play-icon')
    preview-model(ref="preview")
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
        .play-icon{
          font-size: 3rem;
          color:rgba(0, 179, 255, 0.8);
          position: absolute;
          top: 10rem;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: color 0.2s;
          display: inline-block;
        }
        &:hover{
          .play-icon{
            color: #00b3ff;
            font-size: 3.5rem;
          }
        }
      }
      // .moment-video-container{
      //   .videoImg{
      //     width: (@maxWidth - 3 * @margin) / 3;
      //   }
      // }
    }
    &[data-file-count="1"] {
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

    &[data-file-count="2"], &[data-file-count="4"] {
      .moment-file {
        width: (@maxWidth - 2 * @margin) / 2;
      }
    }
  }
</style>

<script>
  import VideoPlayer from '../VideoPlayer';
import PreviewModel from './PreviewModel';

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
      'preview-model': PreviewModel,
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
      filesData() {
        const {data, types} = this;
        const filesData = [];
        if(data){
          
          // console.log(data);
            
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

            // if(fileData.type === types.picture) {
            //   fileData.pictureContainerStyle = `background-image: url(${fileData.url})`;
            // }

            filesData.push(fileData);
          }
        }
        if(filesData.length===1){
          filesData.forEach(item=>{
           if(item?.type === types.picture && !this.isZoneDetail){
            let tempStyle = item.pictureContainerStyle;
            item.pictureContainerStyle =  'max-height: 36rem;background-size: contain;background-position: left;background-color:transparent;background-repeat: no-repeat;' + tempStyle;
           }
          });
        }
        return filesData
      },
      isZoneDetail(){
        return this.$route&&this.$route.name==='MomentDetail';
      }
    },
    methods: {
      viewMedias(index){
        const {filesData} = this;
        const readyFiles = [];
        for(const fileData of filesData) {
          if(fileData.type === 'video'){
            readyFiles.push({...fileData,});
          }else if(fileData.type === 'picture'){
            readyFiles.push({...fileData,url:fileData.urlLG || fileData.url});
          }
        }
        if(readyFiles.length === 0) return;
        this.$refs.preview.setData(true,index,readyFiles);
        this.$refs.preview.init(index);
      }
    }
  }
</script>
