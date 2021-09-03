const {form} = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    form,
    content: '',
    passed: true
  },
  methods: {
    submit() {
      const {form, content, passed} = this;
      return Promise.resolve()
        .then(() => {
          if(!passed && !content) throw new Error(`请填写理由`);
          return nkcAPI(`/fund/a/${form._id}/complete/audit`, 'POST', {
            c: content,
            passed
          });
        })
        .then(() => {
          NKC.methods.visitUrl(`/fund/a/${form._id}`);
        })
        .catch(sweetError);
    }
  }
})