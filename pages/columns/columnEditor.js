import DocumentEditor from "../lib/vue/DocumentEditor";
import {getDataById} from "../lib/js/dataConversion";
import {getRequest, timeFormat} from "../lib/js/tools";
import {nkcAPI} from "../lib/js/netAPI";
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
      cover: null,
      article: {
        title: '',
        content: '',
        keywords: '',
        keywordsEN: '',
        abstract: '',
        abstractEN: '',
        originState: '',
        selectCategory: '',
      },
      lockPost: false,
      // 是否允许触发contentChange
      contentChangeEventFlag: false,
      articles: [], //当前专栏正在编辑的文章
    }
  },
  components: {
    "document-editor": DocumentEditor,
  },
  mounted() {
  },
  computed: {
    type() {
      return this.articleId?'modify':'create';
    }
  },
  methods: {
    getRequest: getRequest,
    timeFormat: timeFormat,
    //编辑器准备完毕
    editorReady() {
      this.initId();
      this.initData();
    },
    setContent(data) {
      this.$refs.documentEditor.initDocumentForm(data);
    },
    initId() {
      const {mid, aid} = this.getRequest();
      if(mid) {
        this.columnId = mid;
      }
      if(aid) {
        this.articleId = aid;
      }
    },
    //根据articleId或者mid获取编辑器中的数据
    initData() {
      const self = this;
      let {mid, aid} = this.getRequest();
      if(!mid) return;
      if(this.articleId) aid = this.articleId;
      let url = `/creation/article?mid=${mid}`;
      if(aid) url = `/creation/article?aid=${aid}&mid=${mid}`
      return nkcAPI(url, 'GET')
      .then(data => {
        self.articleId = data.articleId;
        if(!data.editorInfo.document) self.contentChangeEventFlag = true;
        if(data.editorInfo.document) {
          //当存在aid时直接获取对应article内容，并填入编辑器中
          const {
            title,
            content,
            cover,
            keywords,
            keywordsEN,
            abstract,
            abstractEN,
            origin,
          } = data.editorInfo.document;
          self.cover = cover;
          self.article = {
            title,
            cover,
            content,
            keywords,
            keywordsEN,
            abstract,
            abstractEN,
            origin,
          };
          self.setContent(self.article);
        } else if(data.editorInfo.articles) {
          //存在正在编辑中的内容
          self.articles = data.editorInfo.articles;
        }
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //继续编辑草稿
    editArticle(aid) {
      const self = this;
      //改变地址栏参数
      let url = window.location.href;
      const {aid: articleId} = self.getRequest();
      if(!articleId) {
        url = url + `&aid=${aid}`;
        window.history.pushState(null, null, url);
        this.initData()
          .then(() => {
            self.articles = [];
          });
      } else {
        return;
      }
    },
    //关闭草稿列表
    close() {
      this.articles = [];
    },
    //查看更多草稿
    more() {
     window.location.href = '';
    },
    //在编辑器中写入数据库
    initDocumentForm() {
      const {article} = this;
      const {
        title,
        content,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        originState,
        selectCategory
      } = article;
      const {cover} = this;
      this.$refs.documentEditor.initDocumentForm({
        title,
        content,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        originState,
        selectCategory
      });
    },
    //发布文章
    post(type) {
      if(!type) return;
      if(this.lockPost) return;
      this.lockPost = true;
      const formData = new FormData();
      const {
        coverFile,
        articleId,
        columnId,
        cover
      } = this;
      const {
        title = '',
        content = '',
        keywords = '',
        keywordsEN = '',
        abstract = '',
        abstractEN = '',
        origin = '',
        selectCategory = ''
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
        selectCategory
      };
      if(articleId) {
        formData.append('articleId', articleId);
      }
      if(selectCategory) {
        formData.append('selectCategory', selectCategory);
      }
      if(columnId) {
        formData.append('sid', columnId);
      }
      formData.append('source', 'column');
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
      let url = '/creation/articles/editor';
      return nkcUploadFile(url, 'POST', formData)
        .then(data => {
          self.oldCoverFile = self.coverFile;
          self.coverFile = null;
          const {articleId, articleCover} = data;
          self.articleId = articleId;
          //改变地址栏参数
          let url = window.location.href;
          const {aid} = self.getRequest();
          if(!aid) {
            url = url + `&aid=${articleId}`;
            window.history.pushState(null, null, url);
          }
          return self.resetCovetFile(articleCover);
        })
        .then(() => {
          if(type === 'publish') {
            //移除编辑器默认事件
            self.$refs.documentEditor.removeNoticeEvent();
            //跳转到专栏也买你
            window.location.href = `/m/${columnId}`;
          }
          if(type === 'save') {
            sweetSuccess('保存成功');
          }
          self.lockPost = false;
          return;
        })
        .catch(err => {
          self.lockPost = false;
          sweetError(err);
        })
    },
    //重置封面图
    resetCovetFile(cover) {
      this.cover = cover;
      this.coverFile = null;
      this.$refs.documentEditor.resetCover(cover);
    },
    //发布文章
    publish() {
      //弹框选择文章专栏分类
      this.$refs.selectCategory.open();
      this.post('publish');
    },
    //保存文章
    saveArticle() {
      this.post('save');
    },
    modifyArticle() {
      const self = this;
      this.post(self.type)
    },
    //当编辑器中的内容发生变化时
    watchContentChange(data) {
      if(!this.contentChangeEventFlag) {
        this.contentChangeEventFlag = true;
        return;
      }
      if(this.articles.length !== 0) this.articles = [];
      const {
        title,
        content,
        coverFile,
        cover,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        originState,
        selectCategory
      } = data;
      this.coverFile = coverFile;
      this.article = {
        title,
        content,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin: originState,
        selectCategory
      };
      this.modifyArticle();
    },
  }
});
