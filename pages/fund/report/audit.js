const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    form: data.form,
    passed: true,
    content: '',
    number: data.number,
  },
  methods: {
    submit() {
      const {passed, content, number, form} = this;
      return Promise.resolve()
        .then(() => {
          if(!passed && !content) {
            throw new Error(`审核意见不能为空`);
          }
          return nkcAPI(`/fund/a/${form._id}/report/audit`, 'POST', {
            c: content,
            number,
            support: passed,
          })
        })
        .then(() => {
          sweetSuccess('提交成功');
          NKC.methods.visitUrl(`/fund/a/${data.form._id}`);
        })
        .catch(sweetError);
    }
  }
});