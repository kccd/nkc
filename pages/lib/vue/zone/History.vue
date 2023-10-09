<template lang="pug">
    .history-container
      .moment-history-item.box-shadow.m-b-1(v-for="history,index in histories" :key="index")
        .box-shadow-header {{history.time}}
        .moment-content 
          .text-content 
            h5.text-info 文本内容：
            .text-action(v-if="index!==0")
              button.text-back(@click="momentBack(history)" v-show="!lockBack") 回滚
              button.text-back(@click="momentBack(history)" v-show="lockBack" disabled) 回滚
              //button.text-delete 删除
          div(v-html="history.contentDiff")
        .moment-files
          h5
            span.text-info=`图片/视频：`
            span {{ history.filesData.length === 0? '无': ''}}
          .moment-file-container
            .moment-file-picture(
              v-for="file, index in history.filesData"
              v-if="file.type === 'picture'"
              data-global-click="viewImages"
              :data-global-data="{'url': file.url,'name': file.filename,}"
              )
              img(src="file.url")
            .moment-file-video(
              v-for="file, index in history.filesData"
              v-if="file.type !== 'picture'"
            )
              video(:src="file.sources[file.sources.length - 1].url" :poster="file.coverUrl" controls='controls')
</template>

<style lang="less" scoped>
</style>

<script>
import { nkcAPI } from '../../js/netAPI';
import { visitUrl } from '../../js/pageSwitch';
import { sweetSuccess } from '../../js/sweetAlert';
  export default {
    props: ['histories','mid'],
    components: {
    },
    data: () => ({
      // images:[],
      lockBack:false
    }),
    mounted() {
    },
    methods: {
      momentBack(e) {
        const {_id}=e;
        // console.log('1111',e,this.mid);
        this.lockBack=true;
        // 访问api调用回滚接口，刷新页面
        nkcAPI(`/api/v1/editor/moment/${this.mid}`,'POST',{
            // content,
            // resourcesId
            isBack:true,
            documentId:_id
          }).then((res)=>{
            if(res.data.backSuccess){
              this.refresh();
            }
          }).catch(err=>{
            sweetError(err, 'err');
            this.lockBack=false;
          });
        // sweetSuccess('会滚成功');

        
      },
      refresh(){
        visitUrl(`${window.location.pathname}${window.location.search}`);
      }
    }
  }
</script>
