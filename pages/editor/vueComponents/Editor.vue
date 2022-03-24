<template lang="pug">
.editor
  .col-xs-12.col-md-9.box-shadow-panel.m-b-2
    div
      //- 1.data中需要 type  thread.comment thread.title thread.comment thread.url forum.url forum.titl post.t 
      //- 2.notice editorSettings.onEditNotes
      article-title(
        ref="title",
        :data="pageData",
        :notice="pageState.editorSettings && pageState.editorSettings.onEditNotes || ''"
        
      )
      //- @content-change="contentChange"
      //- 1. @content-change 编辑器内容改变触发 2. c 编辑器内容  newPost
      article-content(
        ref="content",
        :c="pageData.post && pageData.post.c",
        @content-change="contentChange"
      ) 
      .m-b-2(v-if='!["newPost", "modifyThread", "modifyPost"].includes(pageData.type)')
        //- 1. @selected-forumids 选择的主分类后id给提交组件 2. data 包含 threadCategories minorForumCount mainForums 
        classification(
          ref="classification",
          :data="pageData",
          @selected-forumids="selectedForumIds",
          
        )
      .m-b-2(v-if="!hideType.includes(pageData.type)")
        //- 1.value 封面图值
        cover(
          ref="cover",
          :value="pageData.post && pageData.post.cover"
        )
      .m-b-2(v-if="!hideType.includes(pageData.type)")
        //- 1 abstract 中英文摘要
        abstract(
          ref="abstract",
          :abstract= " {cn:pageData.post && pageData.post.abstractCn, en:pageData.post &&pageData.post.abstractEn}"
        )
      .m-b-2(v-if="!hideType.includes(pageData.type)")
        //- 1.keywords 中英文关键字
        key-word(
          ref="keyWord",
          :keywords= "{cn:pageData.post && pageData.post.keyWordsCn, en:pageData.post && pageData.post.keyWordsEn}",
        )
      .m-b-2(v-if="!hideType.includes(pageData.type)")
        //- 1.author 作者信息
        author-info(
          ref="authorInfo",
          :author= "pageData.post &&pageData.post.authorInfos"
        )
      .m-b-2(v-if="!hideType.includes(pageData.type)")
        //- 1.original 包含最小字数和文章状态
        original(
          ref="original",
          :original="{wordLimit: pageData.originalWordLimit, state: pageData.post && pageData.post.originState}",
          
        )
      .m-b-2(v-if="!hideType.includes(pageData.type)")
        //- 1.data包含 createSurveyPermission type post.surveyId
        investigation(
          ref="investigation",
          :data="pageData" 
          
        )
      .m-b-2
        //- 1.state  
        column(
          ref="column",
          :state="{userColumn: pageState.userColumn, columnPermission: pageState.columnPermission, column:pageState.userColumn }" 
          :data="{addedToColumn: pageData.addedToColumn, toColumn: pageData.toColumn}"
        )
  .col-xs-12.col-md-3.box-shadow-panel 
    div
      //- 1.notice 温馨提示的内容  2.data 中只需要post therad type forum allowedAnonymousForumsId havePermissionToSendAnonymousPost threadCategories
      //- 3.@ready-data 提交 和 保存时用于获取数据并提交 4.@remove-editor 提交后移除编辑器
      modify-submit(
        ref="submit",
        :notice="pageState.editorSettings && pageState.editorSettings.notes" 
        :data="pageData"
        @ready-data="readyData",
        @remove-editor="removeEditor"
      )
</template>

<script>
import ModifySubmit from "./ModifySubmit.vue";
import Title from "./Title.vue";
import Content from "./Content.vue";
import Classification from "./Classification.vue";
import Cover from "./Cover.vue";
import Abstract from "./Abstract.vue";
import KeyWord from "./KeyWord.vue";
import AuthorInfo from "./AuthorInfo.vue";
import Original from "./Original.vue";
import Investigation from "./Investigation.vue";
import Column from "./Column.vue";
import { sweetError } from "../../lib/js/sweetAlert.js";

window.reqUrl = NKC.methods.getDataById("data");

export default {
  components: {
    "modify-submit": ModifySubmit,
    "article-title": Title,
    "article-content": Content,
    classification: Classification,
    cover: Cover,
    abstract: Abstract,
    "key-word": KeyWord,
    "author-info": AuthorInfo,
    original: Original,
    investigation: Investigation,
    column: Column
  },
  data: () => ({
    hideType: ["newPost", "modifyPost"],
    pageData: {},
    pageState: {}
  }),
  props: {
    // data: {
    //   type: Object,
    //   default: () => ({})
    // },
    // state: {
    //   type: Object,
    //   default: () => ({})
    // }
  },
  created() {
    let search= this.$route?.query;
    let url = `/editor/data`;
    // 如果后台给了数据就用后台的 否则读取浏览器地址
    if (reqUrl && reqUrl.type && reqUrl.id) {
      url = `/editor/data?type=${reqUrl.type}&id=${reqUrl.id}`;
    }else if(search && search.type && search.id){
      url = `/editor/data?type=${search.type}&id=${search.id}`;
    }
    nkcAPI(url, "get")
      .then(resData => {
        this.pageData = resData;
        this.pageState = resData.state;
      })
      .catch(err => {
        sweetError(err)
      });
  },
  methods: {
    setData() {
      this.pageData = this.data;
      this.pageState = this.state;
    },
    // 控制 提交组件 是否可选匿名发表
    selectedForumIds(ids) {
      this.$refs.submit.checkAnonymous(ids);
    },
    // 移除编辑器
    removeEditor() {
      this.$refs.content.removeEditor();
    },
    // 编辑器内容改变
    contentChange(length) {
      !this.hideType.includes(this.pageData.type) &&
        this.$refs.original.contentChange(length);
    },
    // 提交和保存时获取各组件数据
    readyData(submitFn) {
      if (!submitFn) {
        console.error("submitFn is not fined");
        return;
      }
      // pageData.draftId
      // pageData.post.parentPostId;
      // 每个组件下都有一个getData返回数据
      const refs = this.$refs;
      let submitData = {};
      for (const key in refs) {
        if (refs.hasOwnProperty(key)) {
          const vue = refs[key];
          Object.assign(submitData, vue && vue.getData());
        }
      }
      // 添加 草稿id 和 parentPostId
      submitData["did"] = this.pageData.draftId;
      submitData["parentPostId"] = this.pageData.parentPostId;
      submitFn(submitData);
    }
  },
  // watch: {
  //   //  n 新值 o 旧值
  //   data: {
  //     immediate: true,
  //     handler(n) {
  //       this.pageData = n;
  //     }
  //   },
  //   state: {
  //     immediate: true,
  //     handler(n) {
  //       this.pageState = n;
  //     }
  //   }
  // }
};
</script>

<style></style>
