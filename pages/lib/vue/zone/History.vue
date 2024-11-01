<template lang="pug">
    .history-container
      .moment-history-item.box-shadow.m-b-1(v-for="history,index in histories" :key="index")
        .box-shadow-header {{history.time}}
        .moment-content
          .text-content
            h5.text-info 文本内容：
            .text-action(v-if="index!==0")
              button.text-back(@click="momentBack(history)" ) 回滚
              //button.text-delete 删除
          div(v-html="history.contentDiff")
        .moment-files
          h5
            span.text-info=`图片/视频：`
            span {{ history.filesData.length === 0? '无': ''}}
          .moment-file-container
            .moment-file-picture(
              v-for="file, number in history.filesData"
              :key="number"
              @click="viewMedias(history.filesData,number)"
              )
              img(:src=" file.type === 'picture' ? file.url : file.coverUrl"
                :alt="file.filename"
                :title="file.filename")
              .fa.fa-play-circle-o(v-if=" file.type==='video' " class='play-icon')
            //-.moment-file-video(
              v-for="file, order in history.filesData"
              v-if="file.type !== 'picture'"
              )
              video(:src="file.sources[file.sources.length - 1].url" :poster="file.coverUrl" controls='controls')
</template>

<style lang="less" scoped>
.moment-file-picture{
  .play-icon{
  font-size: 3rem;
  color:rgba(255, 255, 255, 0.8);
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
</style>

<script>
import {objToStr } from '../../js/dataConversion';
import { openImageViewer } from '../../js/imageViewer';
import { nkcAPI } from '../../js/netAPI';
import { visitUrl } from '../../js/pageSwitch';
import { getState } from '../../js/state';
import { sweetError, sweetQuestion,} from '../../js/sweetAlert';
import PreviewModel from './PreviewModel';
const { isApp } = getState();
  export default {
    props: ['histories','mid'],
    components: {
    },
    data: () => ({
    }),
    components: {
      'preview-model': PreviewModel,
    },
    mounted() {
    },
    methods: {
      momentBack(e) {
        const {_id}=e;
        const self=this;
        sweetQuestion("确定要执行当前操作？")
        .then(() => {
          // 访问api调用回滚接口，刷新页面
          return nkcAPI(`/api/v1/zone/moment/${self.mid}/rollback`,'POST',{
            documentId:_id
          });
        })
        .then((res)=>{
          if(res.data.backSuccess){
            self.refresh();
          }
        })
        .catch(sweetError);


      },
      refresh(){
        visitUrl(`${window.location.pathname}${window.location.search}`);
      },
      renderObjToStr(index,number){
        const self=this;
        return objToStr({images: self.histories[index].filesData.map(file=>{
          return {url: file.url,  name: file.filename};
        }),index: number});
      },
      viewMedias(filesData = [], index) {
        let readyFiles = [];
        if (isApp) {
          // 判断点击的类型是视频还是还是图片，暂时处理==》视频：过滤所有的图片；图片：过滤掉所有的视频
          const clickType = filesData[index]?.type;
          const clickRid = filesData[index]?.rid;
          let tempArray = [];
          if (clickType === 'video') {
            readyFiles = filesData.filter((item) => item.type === 'video');
            if (readyFiles.length === 0) return;
            const $index = readyFiles.findIndex((item) => item.rid === clickRid);
            window.RootApp.$refs.preview.setData(true, $index, readyFiles);
            window.RootApp.$refs.preview.init($index);
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
              readyFiles.push({ ...fileData, });
            } else if (fileData.type === 'picture') {
              readyFiles.push({ ...fileData, url: fileData.urlLG || fileData.url });
            }
          }
          if (readyFiles.length === 0) return;
          window.RootApp.$refs.preview.setData(true, index, readyFiles);
          window.RootApp.$refs.preview.init(index);
        }

      }
    }
  }
</script>
