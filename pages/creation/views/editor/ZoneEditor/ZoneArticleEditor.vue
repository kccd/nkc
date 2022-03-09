<template lang="pug">
  .zone-moment-editor
    //- .standard-max-container
    article-editor(ref="articleEditor" time="60000" source="zone" :configs="configs")
</template>

<script>
import ArticleEditor from "../../../../lib/vue/article/ArticleEditor";
export default {
  components: {
    "article-editor": ArticleEditor
  },
  data: () => ({
    configs: {
      cover: true,
      title: true,
      keywords: true,
      keywordsEN: true,
      abstract: true,
      abstractEN: true,
      origin: true,
      authorInfos: true,
    },
  })
}
</script>
