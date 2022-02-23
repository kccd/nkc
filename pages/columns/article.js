import FloatUserPanel from '../lib/vue/FloatUserPanel.vue'
Object.assign(window, {showSetUp, displayAuthor})
let author = {};
$(document).ready(function(){
  author.dom = $("#moduleAuthor");
  const vm = new Vue({
	  el: "#vueMountPoint",
    components:{'float-user-panel': FloatUserPanel},
	  data: {
		  
	  },
    // template:"<float-user-panel ref='floatUserPane'></float-user-panel>",
    mounted(){
      this.$refs.floatUserPane.initPanel()
    }
  });
})
function displayAuthor(contractStr) {
  // var contract = NKC.methods.strToObj(contractStr);
  author.dom.modal("show");
  // author.app.contract = contract;
}
function showSetUp(){
  if($('.set-up').attr('class') === 'set-up'){
    $('.set-up')[0].classList.add('set-up-active')
  }else{
    $('.set-up')[0].classList.remove('set-up-active')
  }
}
