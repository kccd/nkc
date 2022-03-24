<template lang="pug">
  div.article-common.col-xs-12.col-md-9(style="disply:none" ref='block')
    <community-content  :iframeUrl="iframeUrl" @closeLoading="closeLoading"></community-content>
    Loading(v-show='show')
</template>


<script>
import Loading from '../../../../lib/vue/Loading'

import CommunityContent from '../../../components/CommunityContent.vue'
import  {getState} from '../../../../lib/js/state.js'

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
    this.iframeUrl = `/u/${user.uid}/profile/post?type=hidden`
  },
  mounted(){
  },
  methods:{
    showLoading(status){
      this.show = status
    },
    closeLoading(){
      this.showLoading(false)
      this.$refs.block.style.display = 'block'
    }
  }
}
</script>
<style scoped>
.article-common{
  padding: 0!important;
}
</style>
