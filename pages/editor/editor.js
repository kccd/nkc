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

import Editor from "./vueComponents/Editor.vue";
new Vue({
  el: "#app-publish-article",
  data: {
    reqUrl: NKC.methods.getDataById("data")
  },
  components: {
    editor: Editor
  },
});