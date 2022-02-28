<template lang="pug">
  .container-fluid
    article-editor(ref="articleEditor")
</template>
<script>
  import ArticleEditor from "../../../lib/vue/article/ArticleEditor";
  import {getDataById} from "../../../lib/js/dataConversion";
  const data = getDataById('data');
  export default {
    components: {
      'article-editor': ArticleEditor
    },
    data: () => ({

    }),
  }
</script>
