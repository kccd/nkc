const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#app',
  data: {
    settings: data.verificationSettings,
    types: data.verificationTypes,
  },
  methods: {
    save() {
      nkcAPI('/e/settings/verification', 'PUT', {
        verificationSettings: this.settings
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError)
    }
  }
});
