<template lang="pug">
  .column-creation.standard-fluid-max-container
    //.m-b-1
      bread-crumb(:list="navList")
    template(v-if="column.userColumn")
      article-editor(ref="articleEditor" :configs="formConfigs" time="60000" source="column")
    template(v-else)
      .no-column
        span 您还未开通专栏，点击&nbsp;
        a(href="/column") 这里
        span &nbsp;去开通专栏。

</template>
<style scoped>
.no-column {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bolder;
}
</style>
<script>
  import ArticleEditor from "../../../../lib/vue/article/ArticleEditor";
  import {getDataById} from "../../../../lib/js/dataConversion";
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
      column: data.column,
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
