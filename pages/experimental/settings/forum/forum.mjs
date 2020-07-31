const data = NKC.methods.getDataById('data');

const app = new Vue({
  el: '#app',
  data: {
    forumName: '',
    forums: data.forums,
    forumSettings: data.forumSettings,
    forumCategories: data.forumCategories,
  },
  mounted() {
    setTimeout(() => {
      floatForumPanel.initPanel();
    }, 500)
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    move(index, arr, direction) {
      if(
        (index === 0 && direction === 'left') ||
        (index + 1 === arr.length && direction === 'right')
      ) return;
      const forum = arr[index];
      let _index;
      if(direction === 'left') {
        _index = index - 1;
      } else {
        _index = index + 1;
      }
      const _forum = arr[_index];
      arr[_index] = forum;
      Vue.set(arr, index, _forum);
    },
    save() {
      const fidArr = this.forums.map(f => f.fid);
      const {forumCategories, forumSettings} = this;
      const {recycle} = forumSettings;
      const {checkString} = NKC.methods.checkData;
      Promise.resolve()
        .then(() => {
          if(!recycle) throw '请输入回收站专业ID';
          for(const fc of forumCategories) {
            checkString(fc.name, {
              name: '分类名',
              minLength: 1,
              maxLength: 20
            });
            checkString(fc.description, {
              name: '分类介绍',
              minLength: 0,
              maxLength: 100
            });
          }

          return nkcAPI('/e/settings/forum', 'PUT', {fidArr, categories: forumCategories, recycle});
        })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    },
    addForum() {
      const forumName = this.forumName;
      const self = this;
      Promise.resolve()
        .then(() => {
          if(!forumName) throw '专业名称不能为空';
          return sweetQuestion(`确定要创建专业「${forumName}」吗？`);
        })
        .then(() => {
          return nkcAPI('/f', 'POST', {displayName: forumName})
        })
        .then(data => {
          sweetSuccess('创建成功');
          // self.forums = data.forums;
        })
        .catch(sweetError);
    },
    addForumCategory() {
      this.forumCategories.push({
        name: '',
        description: '',
        displayStyle: 'simple'
      });
    },
    remove(index, arr) {
      arr.splice(index, 1);
    }
  }
});
