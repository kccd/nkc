let data = NKC.methods.getDataById("data");
let dialog = new NKC.modules.ReviewForumInfo();

new Vue({
  el: "#app",
  data: {
    pForums: data.pForums || []
  },
  methods: {
    // 打开详细信息的模态框
    review(index) {
      let forum = this.pForums[index];
      dialog.open(forum);
    },
    // 点击uid复制
    copyUID({target}) {
      let textNode = target.childNodes[0];
      let range = document.createRange();
      range.setStart(textNode, 1);
      range.setEnd(textNode, textNode.textContent.length - 1);
      let selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
    },
    timeFormat: NKC.methods.timeFormat
  }
});