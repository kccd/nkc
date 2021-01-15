const data = NKC.methods.getDataById('data');
const fid = data.fid;
const wordGroupInfo = data.wordGroupInfo;
const useGroup = data.useGroup;
const app = new Vue({
  el: '#app',
  data: {
    keywordReview: {
      wordGroupInfo,
      selectedGroup: useGroup || [],
    }
  },
  methods: {
    submit() {
      const { keywordReview } = this;
      return nkcAPI(`/f/${fid}/settings/review`, "PUT", {
        newUseWordGroup: keywordReview.selectedGroup
      })
      .then(() => sweetAlert("保存成功"))
      .catch(sweetError);
    }
  }
})
