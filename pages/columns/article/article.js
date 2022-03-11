// import AuthorCommunication from '../lib/vue/AuthorCommunication.vue'
// Object.assign(window, {showSetUp, displayAuthor})
import {getDataById} from "../../lib/js/dataConversion";
const data = getDataById('data');
let author = {};
$(document).ready(function(){
  author.dom = $("#moduleAuthor");
  // author.vm = new Vue({
	//   el: "#vueMountPoint",
  //   components:{
  //     // 'author-communication':AuthorCommunication
  //   },
	//   data: {
  //     contract: ""
	//   },
  //   // template:"<float-user-panel ref='floatUserPane'></float-user-panel>",
  //   mounted(){
  //   },
  //   methods:{
  //   }
  // });
  // author.app = new Vue({
	//   el: "#moduleAuthorApp",
	//   data: {
	// 	  contract: ""
	//   }
  // });
  new Promise(function(resolve, reject) {
    if(NKC.configs.isApp) {
      setTimeout(function() {
        resolve();
      }, 300)
    } else {
      resolve();
    }
  })
    .then(function() {
      if(NKC.methods.autoHideCommentContent) {
        // 内容折叠
        NKC.methods.autoHideCommentContent();
      }
    })
    .catch(function(data) {
      console.error(data);
    });
})
const article = data.article;
function deleteArticle() {
  const {document} = article;
  const {_id} = document;
  NKC.methods.disabledDocuments(_id);
}
// function displayAuthor(contractStr) {
//   var contract = NKC.methods.strToObj(contractStr);
//   author.app.contract = contract;
//   // author.vm.contract = contract
//   author.dom.modal("show");

// }
Object.assign(window, {
  deleteArticle,
})
