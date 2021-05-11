const data = NKC.methods.getDataById('data');

const forums = [];

const levels = [];

const func = (arr, level = 1) => {
  const index = levels.indexOf(level);
  if(index === -1) levels.push(level);
  for(const f of arr) {
    f.level = level;
    forums.push(f);
    if(f.childForums && f.childForums.length) {
      func(f.childForums, level + 1);
    }
  }
};

func(data.forums);

window.app = new Vue({
  el: '#app',
  data: {
    levels,
    selectedLevels: levels,
    selectedReviewForumCert: data.forumSettings.reviewNewForumCert || [],
    selectedNewForumCert: data.forumSettings.openNewForumCert || [],
    selectedNewForumGrade: data.forumSettings.openNewForumGrade || [],
    selectedRelationship: data.forumSettings.openNewForumRelationship,
    forumName: '',
    forums,
    forumSettings: data.forumSettings,
    forumCategories: data.forumCategories,
    reviewNewForumCerts: data.certs.roles,
    reviewNewForumGrades: data.certs.grades,
    reviewNewForumGuide: data.forumSettings.reviewNewForumGuide,
    founderGuide: data.forumSettings.founderGuide,
    updating: false,
  },
  mounted() {
    setTimeout(() => {
      floatForumPanel.initPanel();
    }, 500)
  },
  computed: {
    listTypeCount() {
      const {forums} = this;
      const type = {
        abstract: 0,
        brief: 0,
        minimalist: 0
      };
      for(const f of forums) {
        type[f.threadListStyle.type] ++;
      }
      return type;
    },
    coverCount() {
      const {forums} = this;
      const type = {
        left: 0,
        right: 0,
        "null": 0
      };
      for(const f of forums) {
        type[f.threadListStyle.cover] ++;
      }
      return type;
    }
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    updateForums() {
      const self = this;
      sweetQuestion(`确定要刷新所有专业信息？`)
        .then(() => {
          self.updating = true;
          return nkcAPI(`/e/settings/forum`, 'POST');
        })
        .then(() => {
          sweetSuccess(`刷新成功`);
          self.updating = false;
        })
        .catch(err => {
          sweetError(err);
          self.updating = false;
        });
    },
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
      const {
        forumCategories,
        forumSettings,
        selectedReviewForumCert,
        reviewNewForumGuide,
        founderGuide,
        selectedNewForumCert,
        selectedNewForumGrade,
        selectedRelationship
      } = this;
      const {recycle, archive} = forumSettings;
      const {checkString} = NKC.methods.checkData;
      const forumsInfo = this.getForumsInfo();
      Promise.resolve()
        .then(() => {
          if(!recycle) throw '请输入回收站专业ID';
          if(!archive) throw '请输入归档专业ID';
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

          return nkcAPI('/e/settings/forum', 'PUT', {
            forumsInfo,
            categories: forumCategories,
            recycle,
            archive,
            selectedReviewForumCert,
            reviewNewForumGuide,
            founderGuide,
            selectedNewForumCert,
            selectedNewForumGrade,
            selectedRelationship
          });
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
    },
    getInput() {
      const input = document.getElementsByTagName('input');
      const results = {
        style: [],
        allStyle: [],
        cover: [],
        allCover: [],
        order: []
      };
      for(let i = 0; i < input.length; i++) {
        const dom = $(input[i]);
        const name = dom.attr('data-name');
        if(name === 'forumThreadList') {
          results.style.push(dom);
        } else if(name === 'forumCover') {
          results.cover.push(dom);
        } else if(name === 'allThreadList') {
          results.allStyle.push(dom);
        } else if(name === 'allCover') {
          results.allCover.push(dom);
        } else if(name === 'forumOrder') {
          results.order.push(dom);
        }
      }
      return results;
    },
    selectAllThreadListStyle(t) {
      const {forums} = this;
      for(const f of forums) {
        f.threadListStyle.type = t;
      }
    },
    selectAllCover(t) {
      const {forums} = this;
      for(const f of forums) {
        f.threadListStyle.cover = t;
      }
    },
    getForumsInfo() {
      const {forums} = this;
      const results = [];
      for(const forum of forums) {
        results.push({
          fid: forum.fid,
          threadListStyle: {
            type: forum.threadListStyle.type,
            cover: forum.threadListStyle.cover,
          },
          order: forum.order
        });
      }
      return results;
    },
  }
});

window.func = func;
