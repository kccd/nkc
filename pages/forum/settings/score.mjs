const data = NKC.methods.getDataById('data');

data.forumScoreOperations.map(s => {
  for(const scoreType of data.scoresType) {
    const oldValue = s[scoreType];
    s[`_${scoreType}`] = oldValue === undefined? 0: oldValue / 100;
  }
});
const app = new Vue({
  el: '#app',
  data: {
    forumAvailableScoreOperations: data.forumAvailableScoreOperations,
    forumScoreOperations: data.forumScoreOperations,
    scores: data.scores,
    scoresType: data.scoresType,
    forum: data.forum,
  },
  methods: {
    checkNumber: NKC.methods.checkData.checkNumber,
    addScoreOperation() {
      const scoreOperation = {
        type: '',
        cycle: 'day',
        count: 0,
      };
      for(const scoreType of this.scoresType) {
        scoreOperation['_' + scoreType] = 0;
      }
      this.forumScoreOperations.push(scoreOperation);
    },
    removeScoreOperation(index) {
      this.forumScoreOperations.splice(index, 1);
    },
    save() {
      let {
        forumScoreOperations,
        checkNumber,
        scoresType,
        forum,
      } = this;
      forumScoreOperations = JSON.parse(JSON.stringify(forumScoreOperations));
      Promise.resolve()
        .then(() => {
          for(const scoreOperation of forumScoreOperations) {
            for(const scoreType of scoresType) {
              const oldValue = scoreOperation[`_${scoreType}`];
              checkNumber(oldValue, {
                name: '积分策略中加减的积分值',
                fractionDigits: 2
              });
              scoreOperation[scoreType] = parseInt(oldValue * 100);
              delete scoreOperation[`_${scoreType}`];
            }
          }
          return nkcAPI(`/f/${forum.fid}/settings/score`, 'PUT', {
            forumScoreOperations
          });
        })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    }
  }
});
