const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: "#app",
  data: {
    pForums: data.pForums
  },
  methods: {
    timeFormat: NKC.methods.tools.timeFormat,
    getUrl: NKC.methods.tools.getUrl,
    agree(f) {
      this.post(f, true);
    },
    disagree(f) {
      this.post(f, false);
    },
    post(f, agree) {
      nkcAPI('/nkc/applyForum', 'POST', {
        pfid: f.pfid,
        agree: !!agree,
      })
        .then((data) => {
          f.review = data.review;
          sweetSuccess('执行成功');
        })
        .catch(sweetError)
    }
  },
  mounted() {
    floatUserPanel.initPanel();
  }
});
