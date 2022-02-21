import DocumentEditor from "../lib/vue/DocumentEditor";
import {getDataById} from "../lib/js/dataConversion";
import {getRequest} from "../lib/js/tools";
import {screenTopWarning} from "../lib/js/topAlert";
const data = getDataById('data');
const columnEditor = new Vue({
  el: '#columnEditor',
  data: () => {
    return {
      ready: false,
      articleId: null,
      column: data.column,
      columnId: null,
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
    //编辑器准备完毕
    editorReady() {
      this.ready = true;
    },
    initId() {
      const {mid, aid} = this.getRequest();
      this.columnId = mid;
      this.articleId = aid;
    },
    //根据articleId获取编辑器中的数据
    initData() {
      const self = this;
      const {mid, aid} = this.getRequest();
      nkcAPI(`/creation/column?aid`, 'GET')
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
      const selectCategory = this.$refs.documenEditor.getSelectCategory();
      if(articleId) {
        formData.append('articleId', articleId);
      }
      if(selectCategory) {
        formData.append('selectCategory', selectCategory);
      }
      if(coverFile) {
        formData.append('coverFile', coverFile, 'cover.png');
      }
      if(article) {
        formData.append('article', JSON.stringify(article));
      }
      if(type) {
        formData.append('type', type);
      }
      const self = this;
      let url = '/creation/column'
      debugger
      return nkcUploadFile(url, 'POST', formData)
        .then(data => {
          self.oldCoverFile = self.coverFile;
          self.cover = null;
          const {articleId, articleCover} = data;
          self.articleId = articleId;
          self.resetCovetFile(articleCover);
        })
        .then(() => {
          if(type === 'publish') {
            self.loading = false;
          }
          return;
        })
        .catch(err => {
          self.lockPost = false;
          sweetError(err);
        })
    },
    //重置
    resetCovetFile(cover) {
      this.cover = cover;
      this.coverFile = null;
      this.$refs.documentEditor.resetCover(cover);
    },
    //发布文章
    publish() {
    },
    //保存文章
    saveArticle() {
    },
    modifyArticle() {
      const self = this;
      this.post(this.type)
        .catch(err => {
          screenTopWarning(err);
        })
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
      this.article = {
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
