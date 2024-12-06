<template lang="pug">
  .article-editor
    .m-b-1
      .article-box(v-if="articles.length > 0")
        .article-box-header 草稿
        .article-box-text {{articles[0].document.title || '未命名'}}
        .article-box-option
          button.btn.btn-xs.btn-primary.m-r-05(@click="editArticle(articles[0]._id)") 继续编辑
          button.btn.btn-xs.btn-default(@click="more") 查看更多
          .fa.fa-remove(@click="close")
      //-.article-box(v-if="articles.length !== 0")
        .close.fa.fa-remove(@click="close")
        span 当前{{source === 'column'?'专栏':'空间'}}存在草稿,点击编辑继续编辑草稿
        .article-list(v-for="article of articles")
          .article-info
            span.article-name(v-if="article.document.title") {{article.document.title}}
            span.article-name(v-else) 未知
            span.article-time {{timeFormat(article.toc)}}
          .article-do(@click="editArticle(article._id)")
            span 继续编辑
        .article-more(@click="more") 查看更多
      document-editor(ref="documentEditor" :configs="configs" @ready='editorReady' @content-change="watchContentChange" :l="article.l")
      // 多维分类
      .form-group(v-if="tcId && (articleStatus === 'default' || !articleStatus)" )
        .m-b-2
          .editor-header 多维分类
          editor-categories(
            :tc-id="tcId"
            @outSelectedCategoriesId="outSelectedCategoriesId"
            ref="editorCategoriesRef"
          )
      //只有article的状态为default或者不存在article时才会显示专栏文章分类
      div(v-if="configs.selectCategory && (articleStatus === 'default' || !articleStatus)")
        .selected-column(v-if="column")
          .selected-column-avatar
            img(:src="column.avatar")
          .selected-column-name {{column.name}}
            .fa.fa-remove(@click="removeColumn")
        button.btn.btn-default.btn-sm( @click="selectColumn" ) {{column? "重新选择专栏": "选择投稿专栏"}}
      .form-group(v-if="column && configs.selectCategory")
        .m-b-2
          .editor-header 专栏文章分类
          select-column-categories(ref="selectColumnCategories" @change="categoryChange" :column-id="columnId" :categoryPermission="categoryPermission")
      //.form-group(v-if="(articleStatus === 'default' || !articleStatus) && column && configs.selectCategory && column.userColumn && !column.addedToColumn")
        .m-b-2
          .editor-header 专栏文章分类
          select-column-categories(ref="selectColumnCategories" @change="categoryChange" :column-id="columnId")
    //.editor-thread-category-warning.bg-warning.text-warning.p-a-05.bg-border.m-b-05 提示：文章发布后所有人可见。
    .m-b-05
      .checkbox
        label
          input(type="checkbox" value="true" v-model="checkProtocol")
          span 我已阅读并同意遵守与本次发表相关的全部协议。
          a(href="/protocol" target="_blank") 查看协议
    .m-b-05
      .checkbox 
        .editor-auto-save
          .fa.fa-exclamation-circle &nbsp; 文章发布后对所有人可见。
    .m-b-1
      button.btn.btn-primary.m-r-05(@click="publish" :disabled="lockPost || !articleId || !checkProtocol") 发布
      button.btn.btn-default.m-r-05(@click="saveArticle" :disabled="!articleId || lockPost") 保存
      button.btn.btn-default.m-r-05(@click="preview" :disabled="!articleId") 预览
      button.btn.btn-default.m-r-05(@click="history" :disabled="!articleId") 历史
      .checkbox
        .editor-auto-save(v-if="autoSaveInfo")
          .fa.fa-check-circle &nbsp;{{autoSaveInfo}}
    select-column(ref="selectColumn")
</template>

<style lang="less">
  @import "../../../publicModules/base";
  .article-editor {
    .article-box {
      @height: 3rem;
      @padding: 1rem;
      @boxHeaderWidth: 4rem;
      @boxOptionWidth: 14rem;
      height: @height;
      line-height: @height;
      padding-left: @boxHeaderWidth;
      padding-right: @boxOptionWidth + 0.5rem;
      width: 100%;
      background-color: #d9edf7;
      position: relative;
      border: 1px solid #c6e5ff;
      .article-box-header{
        color: @primary;
        font-size: 1.2rem;
        font-weight: 700;
        position: absolute;
        top: 0;
        left: 0;
        height: @height;
        line-height: @height;
        width: @boxHeaderWidth;
        text-align: center;
      }
      .article-box-text{
        font-size: 1.3rem;
        .hideText(@line: 1);
      }
      .article-box-option{
        position: absolute;
        top: 0;
        right: 0;
        height: @height;
        line-height: @height;
        width: @boxOptionWidth;
        text-align: right;
        .fa{
          height: @height;
          cursor: pointer;
          line-height: @height;
          width: @height;
          text-align: center;
        }
      }

      /*.article-list {
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
      }*/
    }
    .article-more {
      cursor: pointer;
      margin-top: 1rem;
      font-size: 1.2rem;
      color: #428bca;
      font-style: italic;
    }
    .selected-column{
      font-size: 0;
      display: inline-block;
      margin: 0 0.5rem 0.5rem 0;
      vertical-align: top;
    }
    .selected-column-avatar img{
      height: 2.5rem;
      width: 2.5rem;
      border-radius: 3px 0 0 3px;
    }
    .selected-column-avatar{
      display: inline-block;
      vertical-align: top;
    }
    .selected-column-name{
      vertical-align: top;
      display: inline-block;
      height: 2.5rem;
      line-height: 2.5rem;
      padding: 0 2.5rem 0 0.5rem;
      border-radius: 0 3px 3px 0;
      font-size: 1.2rem;
      background-color: #999;
      color: #fff;
      position: relative;
    }
    .selected-column-name .fa{
      cursor: pointer;
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      width: 2.5rem;
      line-height: 2.5rem;
      text-align: center;
    }
  }
  .editor-header{
    font-size: 1.25rem;
    margin: 0.3rem 0;
    color: #555;
    font-weight: 700;
  }
</style>

<script>
import DocumentEditor from "../DocumentEditor";
import selectColumnCategories from "../selectColumnCategories";
import {getRequest, timeFormat, addUrlParam} from "../../js/tools";
import {nkcAPI} from "../../js/netAPI";
import {checkString} from "../../js/checkData";
import {getLength} from "../../js/checkData";
import {getColumnInfo} from "../../js/column";
import {getState} from "../../js/state";
import { getUrl } from '../../js/tools'
import {visitUrl} from "../../js/pageSwitch";
import {immediateDebounce} from "../../js/execution";
import EditorCategories from "../publicVue/moveThreadOrArticle/EditorCategories";
import SelectColumn from "../../../editor/vueComponents/SelectColumn"
import { sweetError } from "../../js/sweetAlert";


export default {
  props:['time', 'source', 'configs'],
  data: () => ({
    ready: false,
    articleId: null,
    // articleCategories:[],//全部的独立文章分类
    tcId: null, //已选的多维分类
    columnId: null,
    column: null,
    coverFile : null,
    oldCoverFile: null,
    cover: null,
    articleStatus: null, //文章当前状态
    autoSaveInfo: '',//草稿保存信息
    selectCategory: '', //文章专栏分类
    checkProtocol:false,
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
      l:'',
    },
    lockPost: false,
    // 是否具有添加专栏文章分类的权限
    categoryPermission:false,
    // 是否允许触发contentChange
    contentChangeEventFlag: false,
    articles: [], //当前专栏正在编辑的文章
    setInterval: null,
    setTimeout: null,
    types: {
      create: 'create',
      modify: 'modify',
      publish: 'publish',
      save: 'save',
      autoSave: 'autoSave'
    }
  }),
  components: {
    "document-editor": DocumentEditor,
    'select-column-categories': selectColumnCategories,
    'editor-categories': EditorCategories,
    'select-column': SelectColumn,
  },
  computed: {
    type() {
      return this.articleId? this.types.modify: this.types.create;
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
    this.initId();
    this.initData();
    // this.getColumn();
    // 此功能严重怀疑没有按照编辑的渲染的顺序进行
    // this.initAutoSaveToDraft();
    
  },
  destroyed() {
    clearInterval(this.setInterval);
  },
  methods: {
    getRequest: getRequest,
    timeFormat: timeFormat,
    addUrlParam: addUrlParam,
    checkString: checkString,
    getLength: getLength,
    preview(){
      const url = getUrl('documentPreview', "article", this.articleId);
      visitUrl(url,true)
    },
    history(){
      const url = getUrl('documentHistory', "article", this.articleId);
      visitUrl(url,true)
    },
    getColumn() {
      const self = this;
      if(!getState().uid) return;
      getColumnInfo()
        .then(res => {
          self.column = res;
          self.columnId = res.userColumn?res.userColumn._id: null
        })
    },
    //专栏分类发生改变
    categoryChange() {
      this.selectCategory = this.getSelectCategory();
    },
    //获取选中你的文章专栏分类
    getSelectCategory() {
      return this.$refs.selectColumnCategories.getStatus();
    },
    //编辑器准备完毕的回调
    editorReady() {
     //直接调用方法进行塞入内容==>需要确认l的前提下调用
     if(this.getRequest().aid){
      this.setContent(this.article);
      this.initAutoSaveToDraft();
     }
    },
    setContent(data) {
      this.$refs.documentEditor.initDocumentForm(data);
    },
    initId() {
      if(this.source === 'column') {
        const {mid, aid} = this.getRequest();
        if(mid) {
          this.columnId = mid;
        }
        if(aid) {
          this.articleId = aid;
        }
      } else if(this.source === 'zone') {
        const {aid} = this.getRequest();
        if(aid) this.articleId = aid;
      }
    },
    //根据articleId或者mid获取编辑器中的数据
    initData() {
      const self = this;
      if(!self.source) return sweetError('文章来源source未知');
      let mid, aid, url = '/creation/articles/editor', query = `?source=${self.source}`;
      const urlSource = self.getRequest().source;
      if(!urlSource) {
        self.addUrlParam('source', self.source);
      }
      if(self.source === 'column') {
        mid = this.getRequest().mid;
        aid = this.getRequest().aid;
        // if(!mid) {
        //   if(self.columnId) {
        //     mid = self.columnId;
        //     self.addUrlParam('mid', mid);
        //   } else {
        //     return;
        //   }
        // }
        // query = query + `&mid=${mid}`;
        if(mid){
          query = query + `&mid=${mid}`;
        }
        if(aid) {
          query = query + `&aid=${aid}`;
        }
      } else if(self.source === 'zone') {
        aid = this.getRequest().aid;
        if(aid) query = query + `&aid=${aid}`;
      }
      return nkcAPI(url + query, 'GET')
        .then(data => {
          self.articleId = data.articleId;
          if(self.type === self.types.create){
            self.tcId = data.articleCategoryTree.map(item=>Number(item.defaultNode)).filter(Boolean);
          }else {
            self.tcId = data.editorInfo.article && data.editorInfo.article.tcId || [];
          }
          if(!data.editorInfo.document) self.contentChangeEventFlag = true;
          if(data.editorInfo.article) {
            //获取文章的发表状态
            self.articleStatus = data.editorInfo.article.status;
          }
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
              l='',
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
              l
            };
            // 这里需要利用回调进行初始化编辑器中的值
            // self.setContent(self.article);
          } else if(data.editorInfo.articles) {
            //存在正在编辑中的专栏文章
            self.articles = data.editorInfo.articles;
            //对于新建文章有草稿的情况下
            self.article.l = data.editorInfo.articles[0]?.l || 'json';
          }
          if(data.targetColumn){
            self.columnId = data.targetColumn._id;
            self.column = data.targetColumn;
            self.column.avatar = getUrl('userAvatar', data.targetColumn.avatar);
          }
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //继续编辑草稿
    editArticle(aid) {
      const self = this;
      if(!aid) return;
      //改变地址栏参数
      let url = window.location.href;
      let {aid: articleId, mid} = self.getRequest();
      if(self.source === 'column') {
        //专栏编辑器
        if(!mid) url = url + `?mid=${self.columnId}`;
        if(!articleId) {
          self.articleId = aid;
        } else {
          return;
        }
      } else if (self.source === 'zone') {
        //空间编辑器
        if(mid) sweetError('空间编辑器不存在mid');
      }
      self.addUrlParam('aid', aid);
      const tempL = self.article.l || 'json';
      self.initData()
        .then(() => {
          if(tempL===self.article.l){
            self.setContent(self.article);
            self.initAutoSaveToDraft();
          }
          self.articles = [];
        });
    },
    //修改历史记录地址
    reviseHistory(url) {
      if(!url) return;
      window.history.replaceState(null, null, url);
    },
    //保存草稿成功提示
    saveToDraftSuccess() {
      let time = new Date();
      this.autoSaveInfo = "草稿已保存 " + timeFormat(time);
    },
    initAutoSaveToDraft() {
      const self = this;
      self.setInterval = setTimeout(() => {
        self.autoSaveToDraft()
          .then(() => {
            self.initAutoSaveToDraft();
          })
          .catch(err => {
            self.initAutoSaveToDraft();
          })

      }, 60000)
    },
    //自动保存草稿 保存成功无提示
    autoSaveToDraft() {
      const self = this;
      return Promise.resolve()
        .then(() => {
          if(self.articleId) {
            return self.post(self.types.autoSave)
              .then(() => {
                self.saveToDraftSuccess();
              }).catch(sweetError)
          }
        })
    },
    //关闭草稿列表
    close() {
      this.articles = [];
    },
    //查看更多草稿
    more() {
      let url;
      if(this.source === 'column') {
        url = '/creation/column/draft'
      } else if(this.source === 'zone') {
        url = '/creation/zone/draft';
      }
      window.location.href = url;
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
      //未传入类型时返回
      if(!type) return;
      //床发布时清除当前修改的定时修改任务
      if(type === this.types.publish) clearTimeout(this.setTimeout);
      if(this.lockPost && type !== this.types.publish) return;
      this.lockPost = true;
      // this.$refs.documentEditor.setSavedStatus('saving');
      const formData = new FormData();
      const {
        coverFile,
        articleId = this.getRequest().aid,
        columnId,
        cover,
        source,
        selectCategory = [],
        tcId = [],
      } = this;
      const {
        title = '',
        content = '',
        keywords = '',
        keywordsEN = '',
        abstract = '',
        abstractEN = '',
        origin = '',
        authorInfos = [],
        l = 'json',
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
        authorInfos,
        l
      };
      if(articleId) {
        formData.append('articleId', articleId);
      }
      if(tcId) {
        formData.append('_tcId', JSON.stringify(tcId));
      }
      if(selectCategory) {
        formData.append('selectCategory', selectCategory);
      }
      if(columnId && source === 'column') {
        formData.append('sid', columnId);
      }
      if(source) {
        formData.append('source', source);
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
      let url = '/creation/articles/editor';
      return nkcUploadFile(url, 'POST', formData)
        .then(data => {
          self.oldCoverFile = self.coverFile;
          self.coverFile = null;
          // self.$refs.documentEditor.setSavedStatus('succeeded');
          const {articleId, articleCover} = data;
          self.articleId = articleId;
          //改变地址栏参数
          const {aid} = self.getRequest();
          if(!aid) {
            self.addUrlParam('aid', articleId);
          }
          self.resetCovetFile(articleCover);
          return data;
        })
        .then(res => {
          if(type === self.types.publish) {
            //移除编辑器默认事件
            self.$refs.documentEditor.removeNoticeEvent();
            if(res.articleUrl) {
              window.location.href = res.articleUrl;
            }
            self.articleId = null;
          } else if(type === self.types.save || type === self.types.autoSave) {
            //草稿保存成功显示报讯成功信息
            self.saveToDraftSuccess();
          }
          self.lockPost = false;
          return;
        })
        .catch(err => {
          // self.$refs.documentEditor.setSavedStatus('filed');
          self.lockPost = false;
          let info = '';
          if(type === self.types.save || type === self.types.autoSave) {
            info = '草稿保存失败： ';
          }
          err.error = info + err.error;
          // sweetError(info + (err.error || err));
          throw(err);
          // return err;
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
      if (this.article.title.length < 3){
        throw ('标题不能少于4个字')
      }
      else if (this.article.title.length > 100) {
        throw ('标题不能超过100个字')
      }
    },
    //检测内容
    checkContent() {
      let contentText = this.article.content;
      if(contentText.length > 100000) {
        throw ('内容不能超过10万字');
      }
      if(contentText.length < 2) {
        throw ('内容不能少于2个字');
      }
    },
    // 检测关键词
    checkKeywords() {
      if(this.article.keywordsLength > 50) sweetError("关键词数量超出限制");
    },
    // 检测摘要
    checkAbstract: function() {
      this.checkString(this.article.abstract, {
        name: "中文摘要",
        minLength: 0,
        maxLength: 1000
      });
      this.checkString(this.article.abstractEN, {
        name: "英文摘要",
        minLength: 0,
        maxLength: 1000
      });
    },
    //表单验证
    checkPost() {
      try {
        this.checkTitle();
        this.checkContent();
      } catch (error) {
        throw error
      }
    },
    //发布文章 需要进行表单验证
    async publish () {
      //表单验证
      try {
        this.checkPost();
      }catch (error){
       return  sweetError(error)
      }
      //检测是否勾选文章专栏分类
      if(!this.article.title) return sweetWarning('请输入文章标题');
      // if(this.articleStatus === 'default' && this.source === 'column' && !this.selectCategory
      //   || (this.selectCategory && this.selectCategory.selectedMainCategoriesId
      //     && this.selectCategory.selectedMainCategoriesId.length === 0)) return sweetWarning('请选择文章专栏分类');
      this.post(this.types.publish).catch(sweetError);
    },
    //保存文章 有提示保存成功
    saveArticle() {
      this.post(this.types.save)
      .then(() => {
        sweetSuccess('保存成功');
        
      }).catch(sweetError);
    },
    //修改文章内容，在没有内容变化两秒后再提交内容
    modifyArticle: immediateDebounce(function () {
      this.post(this.type).catch(sweetError);
    }, 2000),
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
        authorInfos,
        l,
      } = data;
      this.coverFile = coverFile;
      this.cover = cover;
      this.article = {
        title,
        content,
        keywords,
        keywordsEN,
        abstract,
        abstractEN,
        origin: originState,
        authorInfos,
        l,
      };
      this.modifyArticle();
    },
    // 选择多维分类时
    outSelectedCategoriesId(data){
      this.tcId = data;
      if(this.type.create === this.types.create){
        this.post(this.types.autoSave).catch(sweetError)
      }
    },
    selectColumn(){
      const self =this;
      this.$refs.selectColumn.open(
        function(data) {
          self.columnId = data.columns[0]._id;
          self.column = data.columns[0];
          self.column.avatar = getUrl('userAvatar', data.columns[0].avatar);
          self.categoryPermission = data.columns[0].categoryPermission;
        },
        {
          showColumnCategories:false,
        }
      );
    },
    removeColumn(){
      this.column=null;
      this.columnId=null;
    }
  }
}
</script>
