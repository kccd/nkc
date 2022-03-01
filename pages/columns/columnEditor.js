import ArticleEditor from "../lib/vue/article/ArticleEditor";
const columnEditor = new Vue({
  el: '#columnEditor',
  data: () => {
    return {
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
    }
  },
  components: {
    "article-editor": ArticleEditor
  },
  mounted() {
  },
  computed: {
  },
  methods: {
  }
});
