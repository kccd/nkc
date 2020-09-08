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
        // 专业树状结构
        forumTree: [],
        forumCategories: [],
        selectedForumCategory: ''
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
        }
      },
      mounted() {

      },
      methods: {
        open() {
          self.showPanel();
          nkcAPI('/f', 'GET')
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
        },
        initForums(data) {
          const {forumCategories, forums} = data;
          const forumsObj = [];
          for(const f of forums) {
            if(!forumsObj[f.categoryId]) forumsObj[f.categoryId] = [];
            forumsObj[f.categoryId].push(f);
            const cf = [];
            this.getForumChildForums(cf, f.childrenForums);
            f.cf = cf;
          }
          for(const c of forumCategories) {
            c.forums = forumsObj[c._id] || [];
          }
          this.forums = forums;
          this.forumCategories = forumCategories;
          this.selectedForumCategory = forumCategories[0];
        },
        getForumChildForums(results, arr) {
          for(const ff of arr) {
            if(!ff.childrenForums || ff.childrenForums.length === 0) {
              results.push(ff);
            } else {
              this.getForumChildForums(results, ff.childrenForums);
            }
          }
        }
      }
    })
  }
  open(props) {
    this.app.open(props);
  }
}
NKC.modules.ForumSelector = ForumSelector;
