const data = NKC.methods.getDataById('data');
const fid = data.fid;
const app = new Vue({
  el: '#app',
  data: {
    roles: data.roles,
    grades: data.grades,
    wordGroupInfo: data.wordGroupInfo,
    settings: data.forumReviewSettings,
  },
  methods: {
    submit() {
      const {
        settings
      } = this;
      return nkcAPI(`/f/${fid}/settings/review`, "PUT", {
        settings
      })
      .then(() => sweetAlert("保存成功"))
      .catch(sweetError);
    }
  }
})

Object.assign(window, {
  fid,
  app,
});
