const data = NKC.methods.getDataById("data");
const app = new Vue({
  el: "#app",
  data: {
    editorSettings: data.editorSettings
  },
  methods: {
    submit() {
      nkcAPI("/e/settings/editor", "PUT", {
        editorSettings: this.editorSettings
      })
      .then(() => {
        sweetSuccess("保存成功");
      })
      .catch(sweetError);
    }
  }
});
