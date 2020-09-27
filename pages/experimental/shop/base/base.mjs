const data = NKC.methods.getDataById('data');
const appBase = new Vue({
  el: '#appBaseInfo',
  data: {
    shopSettings: data.shopSettings,
  },
  methods: {
    save() {
      nkcAPI('/e/settings/shop', 'PUT', {
        shopSettings: this.shopSettings
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    }
  }
});

