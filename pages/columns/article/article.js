// import AuthorCommunication from '../lib/vue/AuthorCommunication.vue'
// Object.assign(window, {showSetUp, displayAuthor})
import {getDataById} from "../../lib/js/dataConversion";
const data = getDataById('data');
import {nkcAPI} from "../../lib/js/netAPI";
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
//文章审核通过
function reviewArticle() {
  const {document} = article;
  const {_id} = document;
  if(!_id) return sweetError('未找到文章，请刷新后重试');
  nkcAPI('/review', 'PUT', {
    pass: true,
    docId: _id,
    type: 'document'
  })
    .then(res => {
      sweetSuccess('操作成功');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    })
    .catch(err => {
      sweetError(err);
    })
}

//禁用或删除
function disabledArticles() {
  deleteArticle();
}

//文章解封
function unblock() {
  const {document, _id} = article;
  if(!_id) return;
  nkcAPI(`/article/${_id}/unblock`, 'POST', {
  })
    .then(res => {
      screenTopAlert('已解除屏蔽');
    })
    .catch(err => {
      sweetError(err);
    })
}

//收藏文章
function collectArticle() {
  const {_id} = article;
  
}

Object.assign(window, {
  deleteArticle,
  reviewArticle,
  disabledArticles,
  unblock,
  collectArticle
})
