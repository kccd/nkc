<template>
  <iframe id="inlineFrameExample"
    title="展示社区内容相关子项"
    importance="high"
    width="800"
    height="800"
    :src="currentShowUrl">
  </iframe>
</template>
<script>
  export default {
    data(){
      return {
        myArticleUrl: '/u/92837/profile/thread?quote=creationCenter',
        myReplyUrl: '/u/92837/profile/post?quote=creationCenter',
        myDraftsUrl: '/u/92837/profile/draft?quote=creationCenter',
        myNotesUrl: '/u/92837/profile/note?quote=creationCenter',
        currentShowUrl : '',
      }
    },
    created(){
      const map = {
        communityThreads: this.myArticleUrl,
        communityPosts: this.myReplyUrl,
        communityDrafts: this.myDraftsUrl,
        communityNotes: this.myNotesUrl
      }
      this.currentShowUrl = map[this.$route.name]
    },
    mounted(){
      this.$nextTick(()=>{
        const iframe = document.querySelector('iframe');
        if(iframe.attachEvent){
          iframe.attachEvent('onload', ()=>{
            iframe.onload = ()=>{
                iframe.style.height = 0+'px';

                var iDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                var height = iDoc.documentElement.clientHeight || iDoc.body.clientHeight;
                
                iframe.style.height = height + 'px';
            }           
          })
        }else{
          iframe.onload = ()=>{
                iframe.style.height = 0+'px';

                var iDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                var height = iDoc.documentElement.clientHeight || iDoc.body.clientHeight;
                
                iframe.style.height = height + 'px';
          }
        }
      })
    }
  }
</script>

<style scoped>
iframe {
    border: none;
    width: 100%;
    height: 100%;
}
</style>