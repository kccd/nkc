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
              v-if="file.type === 'picture'"
              data-global-click="viewImages"
              :data-global-data="renderObjToStr(index,number)"
              )
              img(:src="file.url")
            .moment-file-video(
              v-for="file, order in history.filesData"
              v-if="file.type !== 'picture'"
              )
              video(:src="file.sources[file.sources.length - 1].url" :poster="file.coverUrl" controls='controls')
</template>

<style lang="less" scoped>
</style>

<script>
import {objToStr } from '../../js/dataConversion';
import { nkcAPI } from '../../js/netAPI';
import { visitUrl } from '../../js/pageSwitch';
import { sweetError, sweetQuestion,} from '../../js/sweetAlert';
  export default {
    props: ['histories','mid'],
    components: {
    },
    data: () => ({
    }),
    mounted() {
    },
    methods: {
      momentBack(e) {
        const {_id}=e;
        const self=this;
        sweetQuestion("确定要执行当前操作？")
        .then(() => {
          // 访问api调用回滚接口，刷新页面
          nkcAPI(`/api/v1/editor/moment/${self.mid}`,'POST',{
              isBack:true,
              documentId:_id
            }).then((res)=>{
              if(res.data.backSuccess){
                self.refresh();
              }
            }).catch(err=>{
              sweetError(err, 'err');
            });
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
      }
    }
  }
</script>
