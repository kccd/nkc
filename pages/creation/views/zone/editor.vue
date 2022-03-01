<template lang="pug">
  .zone-article-editor
    .m-b-1
      bread-crumb(:list="navList")
    zone-article-editor(ref="zoneArticleEditor")
</template>

<script>
import ZoneArticleEditor from "../editor/ZoneEditor/ZoneArticleEditor";
export default {
  components: {
    "zone-article-editor": ZoneArticleEditor
  },
  data: () => ({
    navList: [
      {
        name: '内容管理',
      },
      {
        name: '空间内容',
        page: 'zoneArticle'
      }
    ]
    })
}
</script>
