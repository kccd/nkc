<template>
  <iframe id="inlineFrameExample"
    title="展示社区内容相关子项"
    importance="high"
    width="800"
    height="800"
    :src="iframeUrl">
    <div class="loading" v-show="loadingShow">
      <i class="fa fa-spinner loading-icon" aria-hidden="true"></i> 
    </div>
  </iframe>
</template>
<script>
  export default {
    props:{
      iframeUrl:{
        require:true,
        type:String
      },
      loading:{
        default:false,
        type:Boolean
      }
    },
    data(){
      return {
        // myArticleUrl: '/u/92837/profile/thread?quote=creationCenter',
        // myReplyUrl: '/u/92837/profile/post?quote=creationCenter',
        // myDraftsUrl: '/u/92837/profile/draft?quote=creationCenter',
        // myNotesUrl: '/u/92837/profile/note?quote=creationCenter',
        // currentShowUrl : '',
      }
    },
    created(){
      // const map = {
      //   communityThreads: this.myArticleUrl,
      //   communityPosts: this.myReplyUrl,
      //   communityDrafts: this.myDraftsUrl,
      //   communityNotes: this.myNotesUrl
      // }
      // this.currentShowUrl = map[this.$route.name]
    },
    mounted(){
      this.$nextTick(()=>{
        const iframe = document.querySelector('iframe');
        iframe.style.height = 0+'px';
        if(iframe.attachEvent){
          iframe.attachEvent('onload', ()=>{
            iframe.onload = ()=>{
                
                var iDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                var height = iDoc.documentElement.clientHeight || iDoc.body.clientHeight;
                
                iframe.style.height = height + 'px';
                // iframe.classList.remove('hidden')
                // iframe.classList.add('show')
            }           
          })
        }else{
          iframe.onload = ()=>{
                // iframe.style.height = 0+'px';

                var iDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                var height = iDoc.documentElement.clientHeight || iDoc.body.clientHeight;
                
                iframe.style.height = height + 'px';
                // iframe.classList.remove('hidden')
                // iframe.classList.add('show')
          }
        }
      })
    },
    methods:{
      showLoading(status){
        this.loadingShow = status
      }
    }
  }
</script>

<style scoped>
.loading{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.loading-icon{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  font-size: 48px;
}
iframe {
    border: none;
    width: 100%;
}
.hidden {
  /* visibility:hidden */
  opacity: 0;
  /* display: none; */
}
.show {
  opacity: 1;
  /* display: block; */
  /* visibility: visible; */
} 

</style>