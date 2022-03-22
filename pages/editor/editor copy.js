/* 编辑器 2019-9-11

* 对于编辑器而言，编辑类型总共只有以下5中情况：
*   newThread: 发表新文章
*   newPost: 发表新回复
*   modifyThread: 修改文章内容
*   modifyPost: 修改回复内容
*   modifyForumDeclare: 编辑专业说明
*
* 保存草稿的类型如下：
*   forum: 发表新文章的草稿
*   thread: 发表新回复的草稿
*   post: 编辑回复或文章的草稿
*   forumDeclare: 编辑专业说明的草稿
*
* */
import { sweetError } from "../lib/js/sweetAlert.js";

import { nkcAPI } from "../lib/js/netAPI";
import ModifySubmit from "./vueComponents/ModifySubmit.vue";
import Title from "./vueComponents/Title.vue";
import Content from "./vueComponents/Content.vue";
import Classification from "./vueComponents/Classification.vue";
import Cover from "./vueComponents/Cover.vue";
import Abstract from "./vueComponents/Abstract.vue";
import KeyWord from "./vueComponents/KeyWord.vue";
import AuthorInfo from "./vueComponents/AuthorInfo.vue";
import Original from "./vueComponents/Original.vue";
import Investigation from "./vueComponents/Investigation.vue";
import Column from "./vueComponents/Column.vue";
window.nkcAPI = nkcAPI;
window.state = NKC.methods.getDataById("state");
window.data = NKC.methods.getDataById("data");
if (window.data?.threadCategories) {
  for (const c of window.data.threadCategories) {
    c.selectedNode = null;
    if (c.defaultNode === "none") continue;
    if (c.defaultNode === "default") {
      c.selectedNode = c.defaultNode;
    } else {
      const nodeId = Number(c.defaultNode);
      if (isNaN(nodeId)) continue;
      for (const node of c.nodes) {
        if (node._id !== nodeId) continue;
        c.selectedNode = node;
      }
    }
  }
}
new Vue({
  el: "#app-publish-article",
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
    pageData: window.data,
    pageState: window.state,
    forumIds: []
  }),
  created() {
  },
  methods: {
    // 控制 提交组件 是否可选匿名发表
    selectedForumIds(ids){
      this.$refs.submit.checkAnonymous(ids)
    },
    // 移除编辑器
    removeEditor() {
      this.$refs.content.removeEditor();
    },
    // 编辑器内容改变
    contentChange(length) {
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
          Object.assign(submitData, vue.getData());
        }
      }
      // 添加 草稿id 和 parentPostId
      submitData["did"] = this.pageData.draftId;
      submitData["parentPostId"] = this.pageData.parentPostId;
      submitFn(submitData);
    }
  }
});
