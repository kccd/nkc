const data = NKC.methods.getDataById("data");
const app = new Vue({
  el: '#app',
  data: {
    content: '',
    tUid: data.tUid,
    submitted: false,
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    submit() {
      const {content, checkString, tUid} = this;
      const self = this;
      Promise.resolve()
        .then(() => {
          checkString(content, {
            name: '验证信息',
            min: 0,
            max: 1000
          });
          return nkcAPI(`/u/${tUid}/friends`, 'POST', {
            description: content
          })
            .then(() => {
              NKC.methods.appToast('发送成功');
              self.submitted = true;
            })
            .catch(NKC.methods.appToast)
        })
    }
  }
})

window.app = app;
