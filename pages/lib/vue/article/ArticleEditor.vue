<template lang="pug">
  .article-editor
    .m-b-1
      .article-box(v-if="articles.length !== 0")
        .close.fa.fa-remove(@click="close")
        span 当前专栏存在草稿,点击编辑继续编辑草稿
        .article-list(v-for="article of articles")
          .article-info
            span.article-name(v-if="article.document.title") {{article.document.title}}
            span.article-name(v-else) 未知
            span.article-time {{timeFormat(article.toc)}}
          .article-do(@click="editArticle(article._id)")
            span 继续编辑
        .article-more(@click="more") 查看更多
      document-editor(ref="documentEditor" :configs="formConfigs" @ready='editorReady' @content-change="watchContentChange")
    .m-b-1
      button.btn.btn-primary.m-r-05(@click="publish") 发布
      button.btn.btn-default.m-r-05(@click="saveArticle") 保存
      .checkbox
        .editor-auto-save(v-if="autoSaveInfo")
          .fa.fa-check-circle &nbsp;{{autoSaveInfo}}
</template>

<style lang="less">
  .article-editor {
    .article-box {
      padding: 1rem;
      width: 100%;
      background-color: #fcf8e3;
      position: relative;
      .article-list {
        .article-info {
          display: inline-block;
          width: 70%;
          text-align: right;
          .article-name {
            float: left;
            font-size: 1.2rem;
            color: #a94442;
          }
          .article-time {
            font-size: 1.2rem;
          }
        }
        .article-do {
          float: right;
          cursor: pointer;
          display: inline-block;
          span {
            &:hover {
              color: #a94442;
            }
          }
        }
      }
    }
    .article-more {
      cursor: pointer;
      margin-top: 1rem;
      font-size: 1.2rem;
      color: #428bca;
      font-style: italic;
    }
    .checkbox {
      display: inline-block;
    }
  }
</style>

<script>
import DocumentEditor from "../DocumentEditor";
import {getRequest, timeFormat} from "../../js/tools";
import {nkcAPI} from "../../js/netAPI";
import {checkString} from "../../js/checkData";
import {getLength} from "../../js/checkData";
import {getDataById} from "../../js/dataConversion";
const data = getDataById('data');
export default {
  props:['time'],
  data: () => ({
    ready: false,
    articleId: null,
    columnId: data.column.userColumn._id,
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
    coverFile : null,
    oldCoverFile: null,
    cover: null,
    autoSaveInfo: '',//草稿保存信息
    article: {
      title: '',
      content: '',
      keywords: '',
      keywordsEN: '',
      abstract: '',
      abstractEN: '',
      originState: '',
      selectCategory: [],
      authorInfos: [],
    },
    lockPost: false,
    // 是否允许触发contentChange
    contentChangeEventFlag: false,
    articles: [], //当前专栏正在编辑的文章
  }),
  components: {
    "document-editor": DocumentEditor,
  },
  computed: {
    type() {
      return this.articleId?'modify':'create';
    },
    // 关键词字数
    keywordsLength() {
      return this.article.keyWordsEn.length + this.article.keyWordsCn.length;
    },
    // 摘要的字节数
    abstractCnLength: function() {
      return this.getLength(this.abstractCn);
    },
    abstractEnLength: function() {
      return this.getLength(this.abstractEn);
    },
  },
  mounted() {
    this.autoSaveToDraft();
  },
  methods: {
    getRequest: getRequest,
    timeFormat: timeFormat,
    checkString: checkString,
    getLength: getLength,
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
      if(!mid) {
        if(self.columnId) {
          mid = self.columnId;
        } else {
          return;
        }
      };
      if(this.articleId) aid = this.articleId;
      let url = `/creation/articles/editor?mid=${mid}`;
      if(aid) url = `/creation/articles/editor?aid=${aid}&mid=${mid}`
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
              authorInfos,
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
              authorInfos,
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
        self.articleId = articleId;
        url = url + `&aid=${aid}`;
        window.history.replaceState(null, null, url);
        this.initData()
          .then(() => {
            self.articles = [];
          });
      } else {
        return;
      }
    },
    //自动保存草稿 保存成功无提示
    autoSaveToDraft() {
      const self = this;
      //是否开启自动保存功能 不传入time关闭自动保存功能
      if(!self.time) return;
      const {aid, mid} = self.getRequest();
      //当地址栏不存在aid和mid时不需要保存
      setTimeout(function() {
        if(!aid || !mid) {
          return self.autoSaveToDraft();
        };
        self.post('save')
        .then(() => {
          return self.autoSaveToDraft();
        })
        .catch(err => {
          sweetError(err);
          return self.autoSaveToDraft();
        });
      }, self.time);
    },
    //草稿保存成功
    saveDraftInfo(info) {
      if(!info) return;
      this.autoSaveInfo = info;
    },
    //关闭草稿列表
    close() {
      this.articles = [];
    },
    //查看更多草稿
    more() {
      window.location.href = '/creation/column/draft';
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
      this.$refs.documentEditor.setSavedStatus('saving');
      const formData = new FormData();
      const {
        coverFile,
        articleId = this.getRequest().aid,
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
        selectCategory = [],
        authorInfos = []
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
        selectCategory,
        authorInfos
      };
      if(articleId) {
        formData.append('articleId', articleId);
      } else {
        console.log('articleId不存在', articleId, type);
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
          self.$refs.documentEditor.setSavedStatus('succeeded');
          const {articleId, articleCover} = data;
          self.articleId = articleId;
          //改变地址栏参数
          let url = window.location.href;
          const {aid} = self.getRequest();
          if(!aid) {
            url = url + `&aid=${articleId}`;
            window.history.replaceState(null, null, url);
          }
          return self.resetCovetFile(articleCover);
        })
        .then(() => {
          if(type === 'publish') {
            //移除编辑器默认事件
            self.$refs.documentEditor.removeNoticeEvent();
            //跳转到专栏也买你
            window.location.href = `/m/${columnId}`;
          } else if(type === 'save') {
            //草稿保存成功显示报讯成功信息
            const time = new Date();
            self.saveDraftInfo('草稿已保存 ' + self.timeFormat(time));
          }
          self.lockPost = false;
          return;
        })
        .catch(err => {
          self.$refs.documentEditor.setSavedStatus('filed');
          self.lockPost = false;
          let info = '';
          if(type === 'save') {
            info = '草稿保存失败： ';
          }
          sweetError(info + (err.error || err));
          return err;
        })
    },
    //重置封面图
    resetCovetFile(cover) {
      this.cover = cover;
      this.coverFile = null;
      this.$refs.documentEditor.resetCover(cover);
    },
    // 检测作者信息
    checkAuthorInfos: function() {
      let self = this;
      let checkAuthorInfos = this.checkAuthorInfos;
      for(let i = 0; i < checkAuthorInfos.length; i++) {
        let info = checkAuthorInfos[i];
        this.checkString(info.name, {
          name: "作者姓名",
          minLength: 1,
          maxLength: 100
        });
        this.checkString(info.kcid, {
          name: self.websiteUserId,
          minLength: 0,
          maxLength: 100
        });
        this.checkString(info.agency, {
          name: "机构名称",
          minLength: 0,
          maxLength: 100
        });
        this.checkString(info.agencyAdd, {
          name: "机构地址",
          minLength: 0,
          maxLength: 100
        });
        if(!info.isContract) continue;
        // 检测邮箱
        this.checkEmail(info.contractObj.contractEmail);
        this.checkString(info.contractObj.contractEmail, {
          name: "通信邮箱",
          minLength: 1,
          maxLength: 200
        });
        this.checkString(info.contractObj.contractTel, {
          name: "通信电话",
          minLength: 0,
          maxLength: 100
        });
        this.checkString(info.contractObj.contractAdd, {
          name: "通信地址",
          minLength: 0,
          maxLength: 200
        });
        this.checkString(info.contractObj.contractCode, {
          name: "通信邮编",
          minLength: 0,
          maxLength: 100
        });
      }
    },
    //检测标题
    checkTitle() {
      if (this.article.title.length < 3) throw new Error('标题不能少于3个字');
      if (this.article.title.length > 100) throw new Error('标题不能超过100个字');
    },
    //检测内容
    checkContent() {
      let contentText = $(this.article.content).text();
      if(contentText.length > 100000) {
        throw new Error('内容不能超过10万字');
      }
      if(contentText.length < 2) {
        throw new Error('内容不能少于2个字');
      }
    },
    // 检测关键词
    checkKeywords() {
      if(this.article.keywordsLength > 50) throw "关键词数量超出限制"
    },
    // 检测摘要
    checkAbstract: function() {
      this.checkString(this.article.abstractCn, {
        name: "中文摘要",
        minLength: 0,
        maxLength: 1000
      });
      this.checkString(this.article.abstractEn, {
        name: "英文摘要",
        minLength: 0,
        maxLength: 1000
      });
    },
    //表单验证
    checkPost() {

    },
    //发布文章
    publish() {
      //表单验证
      this.checkPost()
      //检测是否勾选文章专栏分类
      if(!this.article.title) return sweetWarning('请输入文章标题');
      if(!this.article.selectCategory
        || (this.article.selectCategory.selectedMainCategoriesId.length === 0
          && this.article.selectCategory.selectedMinorCategoriesId.length === 0)) return sweetWarning('请选择文章专栏分类');
      this.post('publish');
    },
    //保存文章 有提示保存成功
    saveArticle() {
      this.post('save')
      .then(() => {
        sweetSuccess('保存成功');
      });
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
        selectCategory,
        authorInfos,
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
        selectCategory,
        authorInfos
      };
      this.modifyArticle();
    },
  }
}
</script>
