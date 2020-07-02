const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    forumName: '',
    forums: data.forums,
    forumSettings: data.forumSettings,
  },
  mounted() {
    setTimeout(() => {
      floatForumPanel.initPanel();
    }, 500)
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    move(index, direction) {
      if(
        (index === 0 && direction === 'lefe') ||
        (index + 1 === this.forums.length && direction === 'right')
      ) return;
      const forum = this.forums[index];
      let _index;
      if(direction === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }
      const _forum = this.forums[_index];
      this.forums[_index] = forum;
      Vue.set(this.forums, index, _forum);
    },
    save() {
      const fidArr = this.forums.map(f => f.fid);
      nkcAPI('/e/settings/forum', 'PATCH', {fidArr})
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    },
    addForum() {
      const forumName = this.forumName;
      Promise.resolve()
        .then(() => {
          if(!forumName) throw '专业名称不能为空';
          return sweetQuestion(`确定要创建专业「${forumName}」吗？`);
        })
        .then(() => {
          return nkcAPI('/f', 'POST', {displayName: forumName})
        })
        .then(data => {
          sweetSuccess('创建成功，正在前往专业设置');
          setTimeout(() => {
            NKC.methods.visitUrl(`/f/${data.forum.fid}/settings`);
          }, 2000);
        })
        .catch(sweetError);
    }
  }
})

