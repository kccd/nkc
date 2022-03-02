<template lang="pug">
  //- div(style="position:relative;min-height:39rem")
  div.article-common.col-xs-12.col-md-9(style="height:39rem")
    <community-content :iframeUrl="iframeUrl" @closeLoading="closeLoading"></community-content>
    Loading(v-show='show')
</template>


<script>
import CommunityContent from '../../components/CommunityContent.vue'
import  {getState} from '../../../lib/js/state.js'
import Loading from '../../../lib/vue/Loading'
export default {
  components:{
    "community-content": CommunityContent,
    Loading
  },
  data: () => ({
    iframeUrl:'',
    uid:'',
    show:false
  }),
  created(){
    this.showLoading(true)
    const user = getState();
    this.uid = user.uid;
    this.iframeUrl = `/u/${user.uid}/profile/thread?type=hidden`
  },
  mounted(){
    
  },
  methods:{
    showLoading(status){
      this.show = status
    },
    closeLoading(){
      this.showLoading(false)
    }
  }
}
</script>
