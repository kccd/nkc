const data = NKC.methods.getDataById("data");
const app = new Vue({
  el: "#app",
  data: {
    stickerSettings: data.stickerSettings
  },
  methods: {
    submit() {
      const {stickerSettings} = this;
      nkcAPI("/e/settings/sticker", "PUT", {
        stickerSettings
      })
      .then(() => {
        sweetSuccess("保存成功");
      })
      .catch(sweetError);
    }
  }
});
