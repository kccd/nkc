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


import {nkcAPI} from "../lib/js/netAPI";
import ModifySubmit from "./vueComponents/ModifySubmit.vue";
// import ModifyNotice from "./vueComponents/ModifyNotice.vue";
import Title from "./vueComponents/Title.vue";
import Content from "./vueComponents/Content.vue";
import Classification from "./vueComponents/Classification.vue";
import Cover from "./vueComponents/Cover.vue";
import Abstract from "./vueComponents/Abstract.vue";
import KeyWord from "./vueComponents/KeyWord.vue";
import AuthorInfo from "./vueComponents/AuthorInfo.vue";
import Original from "./vueComponents/Original.vue";
import Investigation from "./vueComponents/Investigation.vue" 


window.state = NKC.methods.getDataById("state");
  console.log(state)

  window.data = NKC.methods.getDataById("data");
  console.log(data)
new Vue({
  el: '#app-publish-article',
  components: {
    "modify-submit": ModifySubmit,
    // "modify-notice": ModifyNotice,
    "article-title": Title,
    "article-content": Content,
    "classification": Classification,
    "cover": Cover,
    "abstract": Abstract,
    "key-word": KeyWord,
    "author-info": AuthorInfo,
    "original": Original,
    "investigation": Investigation,

 
  },
  data: ()=>({
    pageData: window.data, 
    pageState: window.state
  }),
  created(){
    console.log(window.data)
  },
  getTitle(title){
    this.title = title
  },
  getData(submitFn){

    submitFn()
  }
})


window.editor = undefined;
window.PostInfo = undefined;
window.PostButton = undefined;
window.FloatPostButton = undefined;
window.PostToColumn = undefined;
window.PostSurvey = undefined;
window.ForumSelector = undefined;
window.CommonModal = undefined;
// 标志：编辑器是否已初始化
let EditorReady = false;
window.data = undefined;
// import Editor from "../lib/vue/Editor";
// import {getEditorConfigs} from "../lib/js/editor";
// import ImageSelector from "../lib/vue/ImageSelector";
// import ResourceSelector from "../lib/vue/ResourceSelector";
// import {blobToFile, fileToBase64} from "../lib/js/file";





$(function() {

  window.data = NKC.methods.getDataById("data");

  if(window.data?.threadCategories){
    for(const c of window.data.threadCategories) {
      c.selectedNode = null;
      if(c.defaultNode === 'none') continue;
      if(c.defaultNode === 'default') {
        c.selectedNode = c.defaultNode;
      } else {
        const nodeId = Number(c.defaultNode);
        if(isNaN(nodeId)) continue;
        for(const node of c.nodes) {
          if(node._id !== nodeId) continue;
          c.selectedNode = node;
        }
      }
    }
  }
  

  window.data.threadCategories.map(c => c.selectedNode = null);

  // NKC.methods.ueditor.initDownloadEvent(editor);
  // 实例化专栏模块，如果不存在构造函数则用户没有权限转发。
  // 在提交数据前，读取专栏分类的时候，注意判断是否存在实例PostToColumn。
  if(NKC.modules.SelectColumnCategories) {
    window.PostToColumn = new NKC.modules.SelectColumnCategories();
  }
  // 实例化投票模块
  // 获取数据时需判断实例是否存在
  if(NKC.modules.SurveyEdit && $("#moduleSurveyEdit").length) {

    window.PostSurvey = new NKC.modules.SurveyEdit();
    PostSurvey.app.disabled = true;
    PostSurvey.init({surveyId: data.post?.surveyId || ""});
    if(data.type !== "newThread") {
      hideButton();
    }
    if(data.post && data.post.surveyId) {
      disabledSurveyForm();
    }
  }
  // window.editor = editor;
});


// NKC.methods.selectedDraft = function(draft) {
//   PostInfo.insertDraft(draft);
// }
function disabledSurveyForm() {
  if(!PostSurvey) return;
  let button = $("#disabledSurveyButton");
  if(PostSurvey.app.disabled) {
    button.text("取消").removeClass("btn-success").addClass("btn-danger");
  } else {
    button.text("创建").removeClass("btn-danger").addClass("btn-success");
  }
  console.log(PostSurvey.app);
  PostSurvey.app.disabled = !PostSurvey.app.disabled;
}
Object.assign(window, {
  // initVueApp,
  // resetBodyPaddingTop,
  disabledSurveyForm,
  // hideButton,
  // mediaInsertUE,
  // saveUEContentToLocal,
  // setLocalContentToUE,
  // appUpdateVideo,
  // appUpdateImage,
  // EditorReady
});
