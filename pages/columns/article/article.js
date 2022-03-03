// import AuthorCommunication from '../lib/vue/AuthorCommunication.vue'
// Object.assign(window, {showSetUp, displayAuthor})
let author = {};
$(document).ready(function(){
  author.dom = $("#moduleAuthor");
  author.vm = new Vue({
	  el: "#vueMountPoint",
    components:{
      // 'author-communication':AuthorCommunication
    },
	  data: {
      contract: ""
	  },
    // template:"<float-user-panel ref='floatUserPane'></float-user-panel>",
    mounted(){
    },
    methods:{
    }
  });
  // author.app = new Vue({
	//   el: "#moduleAuthorApp",
	//   data: {
	// 	  contract: ""
	//   }
  // });
})
// function displayAuthor(contractStr) {
//   var contract = NKC.methods.strToObj(contractStr);
//   author.app.contract = contract;
//   // author.vm.contract = contract
//   author.dom.modal("show");

// }

