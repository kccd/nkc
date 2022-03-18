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
import Column from "./vueComponents/Column.vue"

window.state = NKC.methods.getDataById("state");
  console.log(state)

  window.data = NKC.methods.getDataById("data");
  console.log(data)
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
    "column": Column
 
  },
  data: ()=>({
    pageData: window.data, 
    pageState: window.state
  }),
  created(){
  
  },
  methods: {
    removeEditor(){
      console.log('1231');
      this.$refs.content.removeEditor()
    },
    contentChange(length){
      // if(length >= this.pageData.originalWordLimit){
        this.$refs.original.contentChange(length)
      // }
    },
    readyData(submitFn){
      if(!submitFn){
        console.error('callback is not fined');
        return
      };
      // pageData.draftId
      // pageData.post.parentPostId;

      const refs =this.$refs;
      let submitData= {};
      for (const key in refs) {
        if (refs.hasOwnProperty(key)) {
          const vue = refs[key];
          Object.assign( submitData, vue.getData()) 
        }
      }
      // 添加 草稿id 和 parentPostId
      submitData["did"] = this.pageData.draftId;
      submitData["parentPostId"] = this.pageData.parentPostId;
      console.log(submitData,'data')
      submitFn(submitData)
    }
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





// $(function() {

//   window.data = NKC.methods.getDataById("data");

//   if(window.data?.threadCategories){
//     for(const c of window.data.threadCategories) {
//       c.selectedNode = null;
//       if(c.defaultNode === 'none') continue;
//       if(c.defaultNode === 'default') {
//         c.selectedNode = c.defaultNode;
//       } else {
//         const nodeId = Number(c.defaultNode);
//         if(isNaN(nodeId)) continue;
//         for(const node of c.nodes) {
//           if(node._id !== nodeId) continue;
//           c.selectedNode = node;
//         }
//       }
//     }
//   }
  

//   window.data.threadCategories.map(c => c.selectedNode = null);

//   // NKC.methods.ueditor.initDownloadEvent(editor);
//   // 实例化专栏模块，如果不存在构造函数则用户没有权限转发。
//   // 在提交数据前，读取专栏分类的时候，注意判断是否存在实例PostToColumn。
//   if(NKC.modules.SelectColumnCategories) {
//     window.PostToColumn = new NKC.modules.SelectColumnCategories();
//   }
// });


// NKC.methods.selectedDraft = function(draft) {
//   PostInfo.insertDraft(draft);
// }

Object.assign(window, {
  // initVueApp,
  // resetBodyPaddingTop,
  // hideButton,
  // mediaInsertUE,
  // saveUEContentToLocal,
  // setLocalContentToUE,
  // appUpdateVideo,
  // appUpdateImage,
  // EditorReady
});
