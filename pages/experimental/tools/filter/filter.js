const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    groups: data.groups,
    groupsId: [],
    inputKeywords: false,
    content: '',
    timeLimit: 'all', // all, custom
    time: [null, null],
    condition: {
      count: 1,
      times: 1,
      logic: 'or'
    },
    markAsUnReviewed: false,
    submitting: false,
  },
  methods: {
    submit() {
      const {
        groupsId,
        inputKeywords,
        content,
        timeLimit,
        time,
        condition,
        markAsUnReviewed,
      } = this;
      const body = {
        groupsId,
        markAsUnReviewed,
        timeLimit,
        time
      };
      if(inputKeywords) {
        body.keywords = content
          .replace(/，/ig, ',')
          .split(',')
          .map(keyword => keyword.trim())
          .filter(keyword => !!keyword);
        body.condition = condition;
      }
      const self = this;
      self.submitting = true;
      nkcAPI(`/e/tools/filter`, 'POST', body)
        .then(() => {
          self.submitting = false;
          sweetSuccess('提交成功，后台处理中');
        })
        .catch(err => {
          self.submitting = false;
          sweetError(err);
        });
    }
  }
});