const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    shareSettings: data.shareSettings
  },
  methods: {
    submit() {
      const {shareSettings} = this;
      return nkcAPI(`/e/settings/share`, 'PUT', {
        shareSettings
      })
        .then(() => {
          sweetSuccess(`提交成功`);
        })
        .catch(sweetError);
    }
  }
});