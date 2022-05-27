<template lang="pug">
.editor(v-if="show")
  .row
    .col-xs-12.col-md-9.m-b-2
      div
        //- 1.data中需要 type  thread.comment thread.title thread.comment thread.url forum.url forum.titl post.t  .clear-padding
        //- 2.notice editorSettings.onEditNotes
        .article-box(v-if="drafts.length > 0")
          .article-box-header 草稿
          .article-box-text {{drafts[0].t || '未命名'}}
          .article-box-option
            button.btn.btn-xs.btn-primary.m-r-05(@click="editArticle(drafts[0]._id)") 继续编辑
            button.btn.btn-xs.btn-default(@click="more") 查看更多
            .fa.fa-remove(@click="close")
        article-title(
          :o="o",
          ref="title",
          :data="pageData",
          :notice="(pageState.editorSettings && pageState.editorSettings.onEditNotes) || ''"
        )
        //- @content-change="contentChange"
        //- 1. @content-change 编辑器内容改变触发 2. c 编辑器内容  newPost
        article-content(
          ref="content",
          :c="pageData.post && pageData.post.c",
          @content-change="contentChange"
        ) 
        .m-b-2(
          v-if="!['newPost', 'modifyThread', 'modifyPost'].includes(pageData.type) || o === 'copy'"
        )
          //- 1. @selected-forumids 选择的主分类后id给提交组件 2. data 包含 threadCategories minorForumCount mainForums 
          classification(
            ref="classification",
            :data="pageData",
            @selected-forumids="selectedForumIds"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.value 封面图值
          cover(ref="cover", :value="pageData.post && pageData.post.cover")
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1 abstract 中英文摘要
          abstract(
            ref="abstract",
            :abstract="{ cn: pageData.post && pageData.post.abstractCn, en: pageData.post && pageData.post.abstractEn }"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.keywords 中英文关键字
          key-word(
            ref="keyWord",
            :keywords="{ cn: pageData.post && pageData.post.keyWordsCn, en: pageData.post && pageData.post.keyWordsEn }"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.author 作者信息
          author-info(
            ref="authorInfo",
            :author="pageData.post && pageData.post.authorInfos"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.original 包含最小字数和文章状态
          original(
            ref="original",
            :original="{ wordLimit: pageData.originalWordLimit, state: pageData.post && pageData.post.originState }"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.data包含 createSurveyPermission type post.surveyId
          investigation(ref="investigation", :data="pageData")
        .m-b-2(v-if= "!['modifyPost'].includes(pageData.type)")
          //- 1.state  
          column(
            ref="column",
            :o="o",
            :state="{ userColumn: pageState.userColumn, columnPermission: pageState.columnPermission, column: pageState.userColumn }",
            :data="{ addedToColumn: pageData.addedToColumn, toColumn: pageData.toColumn }"
          )
    .col-xs-12.col-md-3
      //- 1.notice 温馨提示的内容  2.data 中只需要post therad type forum allowedAnonymousForumsId havePermissionToSendAnonymousPost threadCategories
      //- 3.@ready-data 提交 和 保存时用于获取数据并提交 4.@remove-editor 提交后移除编辑器
      modify-submit(
        ref="submit",
        :notice="pageState.editorSettings && pageState.editorSettings.notes",
        :data="pageData",
        :o="o",
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
import {getState} from "../../lib/js/state";
import {getRequest, timeFormat, addUrlParam} from "../../lib/js/tools";

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
    column: Column,
  },
  data: () => ({
    drafts: [],
    // 社区内容点击继续创作传递的参数o（复制为新文章或更新已发布文章）
    o: reqUrl.o,
    hideType: ["newPost", "modifyPost"],
    pageData: {},
    pageState: {},
    err: '',
    show: false,
    lockRequest: false
  }),
  watch: {
    // "$route.query": {
    //   immediate: true,
    //   handler(n){
    //     console.log('11')
    //     this.getData(n)
    //   }
    // }
  },
  created() {
    this.getData()
    this.getUserDraft();
    window.addEventListener("pageshow", this.clearCache);
  },
  destroyed() {
    this.clearCache && window.removeEventListener("pageshow", this.clearCache);
    this.pageData = {};
    this.pageState = {};
  },
  methods: {
    addUrlParam,
    getUserDraft(page=0) {
      if(this.lockRequest) return
      const {uid: stateUid} = getState();
      this.uid = stateUid;
      const self = this;
      // if(this.$route.query.aid) return;
      if(!self.uid) return;
      let url = `/u/${self.uid}/profile/draftData?page=${page}&perpage=1`;
      nkcAPI(url, 'GET')
      .then(res => {
        self.drafts = res.drafts;
        // self.paging = res.paging;
      })
      .catch(err => {
        sweetError(err);
      })
    },
    //继续编辑草稿
    editArticle(aid) {
      const self = this;
      if(!aid) {sweetError("id不存在"); return};
      //改变地址栏参数
      self.addUrlParam('aid', aid);
      this.getData()
      self.drafts = [];
    },
    close() {
      this.drafts = [];
    },
    more() {
      // this.$router.replace({
      //   path: '/creation/community/draft'
      // });
      location.href = '/creation/community/draft'
    },
    getData(search) {
      if(!search) search = new URLSearchParams(location.search);
      let url = `/editor/data`;
      // 如果后台给了数据就用后台的 否则读取浏览器地址
      if (reqUrl && reqUrl.type && reqUrl.id) {
        url = `/editor/data?type=${reqUrl.type}&id=${reqUrl.id}&o=${reqUrl.o}`;
      } else if (search) {
        let type, id, o, aid;
        // 读取浏览器地址栏参数
        if(search.constructor.name === 'URLSearchParams'){
          id = search.getAll('id')[0]
          type = search.getAll('type')[0]
          o = search.getAll('o')[0]
          aid = search.getAll('aid')[0]

          // 为对象时
        }else{
          type = search.type;
          id = search.id;
          o = search.o;
          aid = search.aid
          url = `/editor/data?type=${type}&id=${id}&o=${o}`;
        }
        if(aid){
          url = `/editor/data?type=redit&_id=${aid}&o=update`;
          this.lockRequest = true;
        }
      }
      nkcAPI(url, "get")
        .then((resData) => {
          this.pageData = resData;
          this.pageState = resData.state;
          this.show = true;
        })
        .catch((err) => {
          if(err.error){
            this.err = err.error;
            this.$emit('noPermission', err);
            sweetError(err.error);
          }
        });
    },
    // 设置编辑器标题、内容
    setValue(title, content){
      this.$refs.title.setTitle(title);
      this.$refs.content.setContent(content);
    },
    clearCache(event) {
      if (
        event.persisted ||
        (window.performance && window.performance.navigation.type === 2)
      ) 
      {
        reload()
      }
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
      this.$refs.submit.saveToDraftBaseDebounce("automatic")
    },
    // 提交和保存时获取各组件数据
    readyData(submitFn) {
      if (!submitFn) {
        console.error("submitFn is not fined");
        return;
      }
      // 每个组件下都有一个getData返回数据
      const refs = this.$refs;
      let submitData = {};
      for (const key in refs) {
        if (refs.hasOwnProperty(key)) {
          const vue = refs[key];
          // console.log(vue && vue.getData(),'vue')
          Object.assign(submitData, vue && vue.getData());
        }
      }
      // 添加 草稿id 和 parentPostId
      submitData["did"] = this.pageData.draftId;
      submitData["_id"] = this.pageData.post?._id;
      submitData["parentPostId"] = this.pageData.parentPostId;
      submitFn(submitData);
    },
  },
};
</script>

<style>
.edui-default .edui-editor-toolbarboxouter {
  background-color: white !important;
}
</style>
<style scoped lang="less">
@import "../../publicModules/base";

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
}
@media (max-width: 992px) {
  .col-xs-12 {
    width: 100%;
    float: left;
    position: relative;
    min-height: 1px;
}
}
@media (min-width: 992px) {
  .col-md-3 {
    width: 25%;
    float: left;
  }
  .col-md-9 {
    width: 75%;
    float: left;
  }
}

.row:before{
    display: table;
    content: " ";
}
.row::after{
  display: table;
  content: " ";
}
*{
  box-sizing: border-box;
}
*:before, *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}
*::after{
  clear: both
}
.m-b-2 {
    margin-bottom: 2rem;
}
.row {
    margin-right: -15px;
    margin-left: -15px;
}

.col-md-9 {
  position: relative;
  min-height: 1px;
  padding-right: 15px;
  padding-left: 15px;
}
/* .clear-padding{
  padding: 0;
}
.clear-marginLR{
  margin-left: 0;
  margin-right: 0;
} */
</style>
