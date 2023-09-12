const { getDataById } = require('../../../lib/js/dataConversion');

// const data = NKC.methods.getDataById('data');
const data = getDataById('data');
// getDataById
const app = new Vue({
  el: '#app',
  data: {
    settings: data.verificationSettings,
    types: data.verificationTypes,
  },
  methods: {
    save() {
      // 选中禁止 清空类型
      if (!this.settings.login.enabled && this.settings.login.type != '') {
        this.settings.login.type = '';
      }
      if (
        !this.settings.register.enabled &&
        this.settings.register.type != ''
      ) {
        this.settings.register.type = '';
      }

      nkcAPI('/e/settings/verification', 'PUT', {
        verificationSettings: this.settings,
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    },
  },
});
