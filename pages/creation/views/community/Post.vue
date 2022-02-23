<template lang="pug">
  <community-content  :iframeUrl="iframeUrl"></community-content>
</template>


<script>
import CommunityContent from '../../components/CommunityContent.vue'
import  {getState} from '../../../lib/js/state.js'

export default {
  components:{
    "community-content": CommunityContent
  },
  data: () => ({
    iframeUrl:'',
    uid:''
  }),
  created(){
    const user = getState();
    this.uid = user.uid;
    this.iframeUrl = `/u/${user.uid}/profile/post?type=hidden`
  }
}
</script>