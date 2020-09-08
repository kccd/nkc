class ForumSelector extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleForumSelector`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        // 专业数组
        forums: [],
        forumCategories: [],
        subscribeForumsId: [],
        selectedForumCategory: '',
        selectedParentForum: '',
        selectedForum: '',
        selectedThreadType: '',

        showThreadTypes: false,
      },
      computed: {
        forumData() {
          const {forumCategories, forums} = this;
          const results = [];
          const forumsObj = [];
          for(const f of forums) {
             if(!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
            forumsObj[f.categoryId].push(f);
          }
          for(const c of forumCategories) {
            const f = forumsObj[c._id];
            if(!f) continue;
            c.forums = f;
            results.push(c);
          }
          return results;
        },
        subscribeForums() {
          const {forums, subscribeForumsId} = this;
          if(!subscribeForumsId.length) return [];
          const results = [];
          for(const f of forums) {
            for(const cf of f.childForums) {
              if(!subscribeForumsId.includes(cf.fid)) continue;
              results.push(cf);
            }
          }
          return results;
        }
      },
      mounted() {

      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open() {
          this.resetSelector();
          self.showPanel();
          nkcAPI('/f?t=selector', 'GET')
            .then(data => {
              self.app.loading = false;
              self.app.initForums(data);
              console.log(data);
            })

            // .catch(sweetError)
        },
        close() {
          self.hidePanel();
        },
        selectForumCategory(c) {
          this.selectedForumCategory = c;
          this.selectedForum = '';
          this.selectedParentForum = '';
          this.selectedThreadType = '';
        },
        initForums(data) {
          const {forumCategories, forums, subscribeForumsId} = data;
          const forumsObj = [];
          for(const f of forums) {
            if(!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
            forumsObj[f.categoryId].push(f);
          }
          for(const c of forumCategories) {
            c.forums = forumsObj[c._id] || [];
          }
          this.forums = forums;
          this.forumCategories = forumCategories;
          this.subscribeForumsId = subscribeForumsId;
          this.selectedForumCategory = forumCategories[0];
        },
        selectParentForum(pf) {
          this.selectedParentForum = pf;
          this.selectedForum = '';
          this.selectedThreadType = '';
          if(this.selectedParentForum.childForums.length === 1) {
            this.selectForum(this.selectedParentForum.childForums[0]);
          } else if(this.selectedParentForum.childForums.length === 0) {
            this.selectForum(this.selectedParentForum);
          }
        },
        selectForum(f) {
          this.selectedThreadType = '';
          if(this.selectedForum === f) {
            this.selectedForum = '';
          } else {
            this.selectedForum = f;
            if(f.threadTypes.length === 0) {
              this.selectThreadType('none');
            }
          }
        },
        selectThreadType(tt) {
          if(this.selectedThreadType === tt) {
            this.selectedThreadType = ''
          } else {
            this.selectedThreadType = tt;
          }
        },
        next() {
          this.showThreadTypes = true;
        },
        previous() {
          this.showThreadTypes = false;
          this.selectedThreadType = '';
        },
        resetSelector() {
          this.selectedForum = '';
          this.selectedParentForum = '';
          this.selectedThreadType = '';
          this.showThreadTypes = false;
        },
        submit() {
          const {selectedForum, selectedThreadType} = this;
          if(!selectedForum) return sweetError(`请选择专业`);
          if(!selectedThreadType) return sweetError(`请选择文章分类`);
          return {
            fid: selectedForum.fid,
            cid: selectedThreadType === 'none'? '': selectedThreadType.cid
          };
        }
      }
    })
  }
  open(props) {
    this.app.open(props);
  }
}
NKC.modules.ForumSelector = ForumSelector;
