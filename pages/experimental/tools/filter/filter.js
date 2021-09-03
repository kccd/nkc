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
    conditions: {
      count: 1,
      times: 1,
      logic: 'or'
    },
    markAsUnReviewed: false,
    submitting: false,
    timeNumber: 0,
  },
  computed: {
    selectedGroups() {
      const {groupsId, groups} = this;
      return groups.filter(g => groupsId.includes(g.id));
    }
  },
  methods: {
    timeout(newTime) {
      if(newTime) this.timeNumber = newTime;
      const self = this;
      if(this.timeNumber > 0) {
        this.timeNumber --;
        setTimeout(self.timeout, 1000);
      }
    },
    submit() {
      const {
        inputKeywords,
        content,
        timeLimit,
        time,
        conditions,
        markAsUnReviewed,
        selectedGroups,
      } = this;
      const body = {
        groups: selectedGroups,
        markAsUnReviewed,
        timeLimit,
        time,
      };
      if(inputKeywords) {
        body.keywords = content
          .replace(/，/ig, ',')
          .split(',')
          .map(keyword => keyword.trim())
          .filter(keyword => !!keyword);
        body.conditions = conditions;
      }
      const self = this;
      self.submitting = true;
      nkcAPI(`/e/tools/filter`, 'POST', body)
        .then(() => {
          self.submitting = false;
          sweetSuccess('提交成功，后台处理中');
          self.timeout(10);
        })
        .catch(err => {
          self.submitting = false;
          sweetError(err);
        });
    }
  }
});