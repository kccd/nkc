<template lang="pug">
  div.article-common.col-xs-12.col-md-9
    user-note(ref="userNote")
</template>


<script>
import UserNote from "../../../../lib/vue/note/UserNote";
export default {
  components:{
    "user-note": UserNote
  },
  data: () => ({
  }),
  methods:{
  }
}
</script>
<style scoped>
.article-common{
  padding: 0!important;
}
</style>
