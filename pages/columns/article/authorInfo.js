Object.assign(window, {
  displayAuthor
})
let author = {};
$(document).ready(() => {
  author.dom = $("#moduleAuthor");
  author.app = new Vue({
    el: "#moduleAuthorApp",
    data: {
      contract: "",
      // show:false,
    },
    methods: {
      isShow() {
        this.show = !this.show
      }
    }
  });
});

function displayAuthor(contractStr) {
  var contract = NKC.methods.strToObj(contractStr);
  author.app.contract = contract;
  // app.isShow()
  // author.vm.contract = contract
  author.dom.modal("show");

}