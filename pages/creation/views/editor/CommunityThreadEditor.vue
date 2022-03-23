<template lang="pug">
  .standard-max-container
    .community-thread-editor 社区创作
    editor(ref='editor' :data="pageData", 
    :state="pageState")
</template>

<script>
import Editor from "../../../editor/vueComponents/Editor";
export default {
  data: () => ({
    pageData: {},
    pageState: {}
  }),
  created() {
    let queryObject= this.$route.query
    let url = `/editor/data`;
    if (queryObject.type && queryObject.id) {
      url = `/editor/data?type=${queryObject.type}&id=${queryObject.id}`;
    }
    nkcAPI(url, "get").then(resData => {
      this.pageData = resData;
      this.pageState = resData.state;
    });
  },
  components: {
    editor: Editor
  }
};
</script>
