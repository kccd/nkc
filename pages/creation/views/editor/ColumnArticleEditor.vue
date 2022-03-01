<template lang="pug">
  .column-creation
    .m-b-1
      bread-crumb(:list="navList")
    .standard-max-container
      article-editor(ref="articleEditor" :configs="formConfigs" time="60000" source="column")
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
      formConfigs: {
        cover: true,
        title: true,
        keywords: true,
        keywordsEN: true,
        abstract: true,
        abstractEN: true,
        origin: true,
        selectCategory: true,
        authorInfos: true,
      },
      navList: [
        {
          name: '内容创作',
        },
        {
          name: '专栏创作',
          page: 'columnArticleEditor'
        }
      ]
    }),
  }
</script>
