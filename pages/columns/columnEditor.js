import DocumentEditor from "../lib/vue/DocumentEditor";
import {getDataById} from "../lib/js/dataConversion";
import {getRequest} from "../lib/js/tools";
const data = getDataById('data');
const columnEditor = new Vue({
  el: '#columnEditor',
  data: () => {
    return {
      column: data.column,
      formConfigs: {
        cover: true,
        title: true,
        keywords: true,
        keywordsEN: true,
        abstract: true,
        abstractEN: true,
        origin: true,
        selectCategory: true,
      },
      coverFile : null,
      oldCoverFile: null,
      article: {
        title: '',
        content: '',
        cover: '',
        keywords: '',
        keywordsEN: '',
        abstract: '',
        abstractEN: '',
        origin: '',
        selectCategory: '',
      },
      lockPost: false,
      // 是否允许触发contentChange
      contentChangeEventFlag: false,
    }
  },
  components: {
    "document-editor": DocumentEditor
  },
  mounted() {
    this.initId();
    this.initData();
  },
  computed: {
    type() {
      return this.articleId?'modify':'create';
    }
  },
  methods: {
    getRequest: getRequest,
    initId() {
    },
    //根据articleId获取编辑器中的数据
    initData() {
      const self = this;
      const {mid, articleId} = this.getRequest();
      nkcAPI('', 'GET')
        .then()
        .catch()
    },
    //在编辑器中写入数据库
    initDocumentForm() {
      const {article} = this;
      const {
        title,
        content,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin,
        selectCategory
      } = article;
      this.$refs.documentEditor.initDocumentForm({
        title,
        content,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin,
        selectCategory
      });
    },
    //发布文章
    post(type) {
      if(!type) return;
      if(this.lockPost) return;
      const self = this;
      const formData = new FormData();
      const {
        coverFile,
        articleId,
        columnId
      } = this;
      const {
        title = '',
        content = '',
        cover = '',
        keywords = '',
        keywordsEN = '',
        abstract = '',
        abstractEN = '',
        origin = '',
      } = this.article;
      const article = {
        title,
        content,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin,
      };
      if(articleId) {
        formData.append('articleId', articleId);
      }
      if(coverFile) {
        formData.append('coverFile', coverFile);
      }
      if(article) {
        formData.append('article', article);
      }
    },
    //发布文章
    publish() {
    },
    //保存文章
    saveArticle() {
    },
    //当编辑器中的内容发生变化时
    watchContentChange(data) {
      if(!this.contentChangeEventFlag) {
        this.contentChangeEventFlag = true;
        return;
      }
      const {
        title,
        content,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin,
        selectCategory
      } = data;
      this.article.title = {
        title,
        content,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin,
        selectCategory
      };
    },
  }
});
