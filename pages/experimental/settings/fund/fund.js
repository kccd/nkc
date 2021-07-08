const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#app',
  data: {
    fundSettings: data.fundSettings
  },
  methods: {
    save() {
      const {fundSettings} = this;
      nkcAPI(`/e/settings/fund`, 'PUT', {fundSettings})
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    }
  }
});