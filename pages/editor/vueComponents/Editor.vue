<template lang="pug">
.editor(v-if="show")
  .row
    .col-xs-12.col-md-9.m-b-2
      div
        //- 1.data中需要 type  thread.comment thread.title thread.comment thread.url forum.url forum.titl post.t  .clear-padding
        //- 2.notice editorSettings.onEditNotes
        template(v-if="drafts.length")
          .article-box( v-for = "draft in drafts")
            .article-box-title
              .article-box-header.des-type 草稿
              .article-box-text {{draft.t  || '未填写'}} {{ setContent(draft.c) }}
              //- .article-box-text.prompt-content {{ setContent(drafts[0].c) }}
            .article-box-option
              button.btn.btn-xs.btn-primary.m-r-05(@click="editArticle(draft._id)") 继续编辑
              button.btn.btn-xs.btn-default(@click="more") 查看更多
              .fa.fa-remove(@click="closeDraft")
        article-title(
          :o="reqUrl.o",
          ref="title",
          :data="pageData",
          :notice="(pageState.editorSettings && pageState.editorSettings.onEditNotes) || ''"
          @info-change="infoChange"
        )
        //- @content-change="contentChange"
        //- 1. @content-change 编辑器内容改变触发 2. c 编辑器内容  newPost
        article-content(
          ref="content",
          :c="pageData",
          @content-change="contentChange"
        )
        .m-b-2(
          v-if="!['newPost', 'modifyThread', 'modifyPost'].includes(pageData.type) || reqUrl.o === 'copy'"
        )
          //- 1. @selected-forumids 选择的主分类后id给提交组件 2. data 包含 threadCategories minorForumCount mainForums
          classification(
            ref="classification",
            :data="pageData",
            @selected-forumids="selectedForumIds"
            @info-change="infoChange"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.value 封面图值
          cover(ref="cover", :value="pageData.post && pageData.post.cover" @info-change="infoChange")

        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1 abstract 中英文摘要
          abstract(
            ref="abstract",
            :abstract="{ cn: pageData.post && pageData.post.abstractCn, en: pageData.post && pageData.post.abstractEn }"
            @info-change="infoChange"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.keywords 中英文关键字
          key-word(
            ref="keyWord",
            :keywords="{ cn: pageData.post && pageData.post.keyWordsCn, en: pageData.post && pageData.post.keyWordsEn }"
            @info-change="infoChange"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.author 作者信息
          author-info(
            ref="authorInfo",
            :author="pageData.post && pageData.post.authorInfos"
            @info-change="infoChange"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.original 包含最小字数和文章状态
          original(
            ref="original",
            :original="{ wordLimit: pageData.originalWordLimit, state: pageData.post && pageData.post.originState }"
            @info-change="infoChange"
          )
        .m-b-2(v-if="!hideType.includes(pageData.type)")
          //- 1.data包含 createSurveyPermission type post.surveyId
          investigation(ref="investigation", :data="pageData" @info-change="infoChange")
        .m-b-2(v-if= "!['modifyPost'].includes(pageData.type)")
          //- 1.state
          column(
            ref="column",
            :o="reqUrl.o",
            :state="{ userColumn: pageState.userColumn, columnPermission: pageState.columnPermission, column: pageState.userColumn }",
            :data="{ addedToColumn: pageData.addedToColumn, toColumn: pageData.toColumn }"
            @info-change="infoChange"
          )
    .col-xs-12.col-md-3
      //- 1.notice 温馨提示的内容  2.data 中只需要post therad type forum allowedAnonymousForumsId havePermissionToSendAnonymousPost threadCategories
      //- 3.@ready-data 提交 和 保存时用于获取数据并提交 4.@remove-editor 提交后移除编辑器
      modify-submit(
        ref="submit",
        :notice="pageState.editorSettings && pageState.editorSettings.notes",
        :data="pageData",
        :o="reqUrl.o",
        @ready-data="readyData",
        @remove-editor="removeEditor",
        @cover-change="coverChange"
        @save-draft-success="saveDraftSuccess"
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
import {getRequest, timeFormat, addUrlParam, delUrlParam} from "../../lib/js/tools";
import { debounce } from '../../lib/js/execution';
import 'url-search-params-polyfill';

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
  props: {
    reqUrl: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    drafts: [],
    // 社区内容点击继续创作传递的参数o（复制为新文章或更新已发布文章）
    // o: this.reqUrl.o,
    hideType: ["newPost", "modifyPost"],
    pageData: {},
    pageState: {},
    err: '',
    show: false,
    lockRequest: false,
    mainForums: [],
    infoSubmitDebounce: ''
  }),
  customOptions: {
    saveDraftIndex: 0
  },
  created() {
    // this.getUserDraft();
    window.addEventListener("pageshow", this.clearCache);
    this.infoSubmitDebounce = debounce(this.infoSubmit, 2000);
  },
  mounted() {
    this.getData()
  },
  computed: {
    getTitle(){
      // {forum: "新帖", newThread:"新帖", thread: "回复", newPost: "回复", post: "回复或文章"}[desType]
      return "草稿"
    }
  },
  destroyed() {
    this.clearCache && window.removeEventListener("pageshow", this.clearCache);
    this.pageData = {};
    this.pageState = {};
  },
  methods: {
    delUrlParam,
    addUrlParam,
    setContent(c) {
      return c || "未填写"
    },
    coverChange(v) {
      this.$refs.cover.setCover(v)
    },
    getUserDraft(page=0) {

      // 如果是修改评论文章或者回复 不获取草稿数据
      // , "modifyForumDeclare", "modifyForumLatestNotice"
      // if (["newPost", "modifyThread", "modifyPost"].includes(this.pageData.type)) return

      if(this.lockRequest) return;
      const {uid: stateUid} = getState();
      this.uid = stateUid;
      const self = this;
      if(!self.uid ) return;
      let url = `/u/${self.uid}/profile/draftData?page=${page}&perpage=1`;
      // 编辑器类型 newpost modifyPost modifyThread  newThread
      const editType = this.pageData.type;
      // 回复都是依据文章显示的
      if (editType === "newPost") {
        url += '&type=' + editType;
        url += "&desTypeId=" + this.pageData.thread.tid;

      } else if ("modifyPost" === editType) {

        // if (this.pageData.thread.comment) {
        //   url += '&type=modifyComment';
        //   url += "&desTypeId=" + this.pageData.thread.pid;
        // } else {
          // 修改回复 在draft表中type = post
        url += '&type=' + editType;
        url += "&desTypeId=" + this.pageData.thread.pid;

        // }
      } else if (editType === "modifyThread") {
        // 修改文章存草稿类型为post
        // desTypeId为post表的pid
        url += '&type=' + editType;
        url += "&desTypeId=" + this.pageData.thread.oc;

      } else if (editType === "newThread") {
        url += '&type=' + editType;
      } else if (editType === "modifyComment") {
        url += '&type=modifyComment';
        url += "&desTypeId=" + this.pageData.thread.pid;
      }

      nkcAPI(url, 'GET')
      .then(res => {
        self.drafts = res.drafts;
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
      if (new URLSearchParams(location.search).get('aid')) {
        // console.log(self.delUrlParam('aid'))
        history.replaceState({}, '', self.delUrlParam('aid'));
      }
      self.addUrlParam('aid', aid);
      this.getData().
        then(() => {
          this.$refs.submit.setSubmitStatus(false);
        })
      self.drafts = [];

    },
    more() {
      location.href = '/creation/community/draft'
    },
    getData(search) {
      if(!search) search = new URLSearchParams(location.search);
      let url = `/editor/data`;
      // 如果后台给了数据就用后台的 否则读取浏览器地址
      let type, id, o;
      // 链接跳转过来
      if (this.reqUrl && this.reqUrl.type && this.reqUrl.id) {
        url = `/editor/data?type=${this.reqUrl.type}&id=${this.reqUrl.id}`;
        if (this.reqUrl.o) {
          url += `&o=${this.reqUrl.o}`;
          if (this.reqUrl.type === 'redit') this.lockRequest = true;
        }
      }
      else if (search) {
        // 读取浏览器地址栏参数
        if(search.constructor.name === 'URLSearchParams'){
          id = search.get('id')
          type = search.get('type')
          o = search.get('o')
        }
        if(type && id) {
          url = `/editor/data?type=${type}&id=${id}`;
          if (o) {
            url += `&o=${this.reqUrl.o}`;
          }
        }
      }
      if(search.get('aid')){
        this.lockRequest = true;
        url = `/editor/data?type=redit&_id=${search.get('aid')}&o=update`;
      }
      return nkcAPI(url, "get")
        .then((resData) => {
          // 如果文章已经变为历史版
          if(resData.post && ['betaHistory', 'stableHistory'].includes(resData.post.type)) {
            sweetError("已经发布");
            return setTimeout(() => {
              location.href = location.pathname
            }, 2000)
          }
          // if(resData.post) {
          //   this.lockRequest = true;
          // }
          // 专业进入 需要把主分类和继续编辑得到的草稿内容合并
          if (resData.type ==='newThread' &&  resData.mainForums.length) {
            this.mainForums = resData.mainForums;
          }
          resData.mainForums = this.mainForums;
          this.pageData = resData;
          this.pageState = resData.state;
          this.show = true;
          this.getUserDraft();
        })
        .catch((err) => {
          if(err.error){
            this.err = err.error;
            this.$emit('noPermission', err);
            return sweetError(err.error);
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
    // 编辑器内容改变 通知原创组件
    contentChange(length) {
      !this.hideType.includes(this.pageData.type) &&
        this.$refs.original.contentChange(length);
      // this.$refs.submit.saveToDraftBaseDebounce("automatic");
      this.infoChange();
    },
    // 编辑器其他部分内容改变
    infoChange() {
      this.infoSubmitDebounce();
    },
    infoSubmit(){
      this.$refs.submit.saveToDraftBase("automatic");
    },
    // 保存草稿成功后执行
    saveDraftSuccess(desType) {
      this.closeDraft(desType);
      this.$refs.submit.setSubmitStatus(false);
    },
    closeDraft(desType) {
      if (this.drafts.length) {
        // 如果是编辑文章、编辑回复、编辑评论第一次进入编辑器，保存后不关闭草稿提示
        if (['modifyPost', 'modifyThread', 'modifyComment'].includes(desType)) {
          if (++this.$options.customOptions.saveDraftIndex === 2)
            this.drafts = [];
        } else if (['newPost', 'newThread', 'newComment'].includes(desType)) {
          this.drafts = [];
        } else {
          sweetError('desType类型不正确')
        }
      }
    },
    // 提交和保存时获取各组件数据
    readyData(submitFn) {
      if (!submitFn)
        throw("callback is is undefined");
      // 每个组件下都有一个getData返回数据
      const refs = this.$refs;
      let submitData = {};
      for (const key in refs) {
        if (refs.hasOwnProperty(key)) {
          const vue = refs[key];
          Object.assign(submitData, vue && vue.getData());
        }
      }
      // this.pageData.post?._id
        // 请求前一截url
      // 添加 草稿id 和 parentPostId
      submitData["did"] = this.pageData.draftId;
      submitData["_id"] = new URLSearchParams(location.search).get('aid')
        || this.pageData.post?._id;
      submitData["parentPostId"] = this.pageData.post?.parentPostId;
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
// .prompt-title {
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
//   vertical-align: bottom;
// }
// .prompt-content {
//   display: inline-block;
//   width: 66%;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
//   vertical-align: bottom;
// }
.article-box {
  margin-bottom: 5px;
  @height: 3rem;
  @padding: 1rem;
  @boxHeaderWidth: 4rem;
  @boxOptionWidth: 14rem;
  height: @height;
  line-height: @height;
  // padding-left: @boxHeaderWidth;
  padding-right: @boxOptionWidth + 0.5rem;
  width: 100%;
  background-color: #d9edf7;
  position: relative;
  border: 1px solid #c6e5ff;
  .article-box-title {
    .hideText(@line: 1);
  }
  .article-box-header{
    color: @primary;
    font-size: 1.2rem;
    font-weight: 700;
    display: inline-block;
    // position: absolute;
    // top: 0;
    // left: 0;
    height: @height;
    line-height: @height;
    width: @boxHeaderWidth;
    text-align: center;
    margin-right: 10px;
  }
  .article-box-text{
    font-size: 1.3rem;
    display: inline;
    margin-right: 0.8rem;
    // .hideText(@line: 1);
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
