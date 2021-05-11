const data = NKC.methods.getDataById('data');
const moveThread = new NKC.modules.MoveThread();
const app = new Vue({
  el: '#app',
  data: {
    forum: data.forum,
    targetForum: null,
    submitting: false
  },
  methods: {
    selectForum() {
      const self = this;
      moveThread.open(data => {
        self.targetForum = data.originForums[0];
        moveThread.close();
      }, {
        hideMoveType: true,
        forumCountLimit: 1,
      })
    },
    submit() {
      const self = this;
      self.submitting = true;
      Promise.resolve()
        .then(() => {
          if(!self.targetForum) {
            throw '请选择目标专业';
          }
          return nkcAPI(`/f/${self.forum.fid}/settings/merge`, 'PUT', {targetForumId: self.targetForum.fid});
        })
        .then(() => {
          sweetSuccess('合并成功，正在前往目标专业...');
          NKC.methods.visitUrl(`/f/${self.targetForum.fid}`, false);
        })
        .catch(sweetError)
        .finally(() => {
          self.submitting = false;
        })
    }
  }
})

Object.assign(window, {
  moveThread,
  app,
});
