import DocumentEditor from "../lib/vue/DocumentEditor";
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
      }
    }
  },
  components: {
    "document-editor": DocumentEditor
  },
  mounted() {
  },
  methods: {
    //发布文章
    publish() {
    },
    //保存文章
    saveArticle() {
    }
  }
});
